import { attribute, db, entityDefinition, workspaceMember } from "@chat-ops/db";
import { TRPCError } from "@trpc/server";
import { and, asc, eq } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure, router } from "../index";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function requireWorkspaceAccess(
  workspaceId: string,
  userId: string,
  allowedRoles: ("owner" | "admin" | "member" | "viewer")[]
) {
  const member = await db.query.workspaceMember.findFirst({
    where: and(
      eq(workspaceMember.workspaceId, workspaceId),
      eq(workspaceMember.userId, userId)
    ),
  });
  if (!(member && allowedRoles.includes(member.role))) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You do not have permission to perform this action",
    });
  }
  return member.role;
}

async function getEntityWithWorkspace(entityId: string) {
  const entity = await db.query.entityDefinition.findFirst({
    where: eq(entityDefinition.id, entityId),
  });
  if (!entity) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Entity not found" });
  }
  return entity;
}

const attributeTypeSchema = z.enum([
  "short-text",
  "long-text",
  "number",
  "select",
  "multi-select",
  "checkbox",
  "date",
  "url",
]);

const selectOptionSchema = z.object({
  value: z.string().min(1),
  label: z.string().min(1),
  color: z.string().optional(),
});

const attributeConfigSchema = z
  .object({
    min: z.number().optional(),
    max: z.number().optional(),
    step: z.number().optional(),
    options: z.array(selectOptionSchema).optional(),
  })
  .optional();

export const entityRouter = router({
  list: protectedProcedure
    .input(z.object({ workspaceId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      await requireWorkspaceAccess(input.workspaceId, ctx.session.user.id, [
        "owner",
        "admin",
        "member",
        "viewer",
      ]);
      return db.query.entityDefinition.findMany({
        where: eq(entityDefinition.workspaceId, input.workspaceId),
        with: { attributes: { orderBy: [asc(attribute.order)] } },
      });
    }),

  getById: protectedProcedure
    .input(z.object({ entityId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const entity = await getEntityWithWorkspace(input.entityId);
      await requireWorkspaceAccess(entity.workspaceId, ctx.session.user.id, [
        "owner",
        "admin",
        "member",
        "viewer",
      ]);
      return db.query.entityDefinition.findFirst({
        where: eq(entityDefinition.id, input.entityId),
        with: { attributes: { orderBy: [asc(attribute.order)] } },
      });
    }),

  getBySlug: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string().uuid(),
        slug: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      await requireWorkspaceAccess(input.workspaceId, ctx.session.user.id, [
        "owner",
        "admin",
        "member",
        "viewer",
      ]);
      const entity = await db.query.entityDefinition.findFirst({
        where: and(
          eq(entityDefinition.workspaceId, input.workspaceId),
          eq(entityDefinition.slug, input.slug)
        ),
        with: { attributes: { orderBy: [asc(attribute.order)] } },
      });
      if (!entity) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Entity not found" });
      }
      return entity;
    }),

  create: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string().uuid(),
        singularName: z.string().min(1).max(100),
        pluralName: z.string().min(1).max(100),
        description: z.string().max(500).optional(),
        icon: z.string().max(50).optional(),
        color: z.string().max(50).optional(),
        attributes: z
          .array(
            z.object({
              name: z.string().min(1).max(100),
              description: z.string().max(500).optional(),
              type: attributeTypeSchema,
              isRequired: z.boolean().default(false),
              isUnique: z.boolean().default(false),
              defaultValue: z.unknown().optional(),
              config: attributeConfigSchema,
            })
          )
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await requireWorkspaceAccess(input.workspaceId, ctx.session.user.id, [
        "owner",
        "admin",
        "member",
      ]);

      let slug = generateSlug(input.singularName);
      let counter = 1;
      while (
        await db.query.entityDefinition.findFirst({
          where: and(
            eq(entityDefinition.workspaceId, input.workspaceId),
            eq(entityDefinition.slug, slug)
          ),
        })
      ) {
        slug = `${generateSlug(input.singularName)}-${counter}`;
        counter++;
      }

      const [newEntity] = await db
        .insert(entityDefinition)
        .values({
          workspaceId: input.workspaceId,
          slug,
          singularName: input.singularName,
          pluralName: input.pluralName,
          description: input.description,
          icon: input.icon,
          color: input.color,
        })
        .returning();

      if (!newEntity) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create entity",
        });
      }

      // Create default "name" system attribute
      await db.insert(attribute).values({
        entityDefinitionId: newEntity.id,
        slug: "name",
        name: "Name",
        type: "short-text",
        isRequired: true,
        isUnique: false,
        isSystem: true,
        order: 0,
      });

      // Create additional attributes if provided
      if (input.attributes?.length) {
        const attributeValues = input.attributes.map((attr, index) => ({
          entityDefinitionId: newEntity.id,
          slug: generateSlug(attr.name),
          name: attr.name,
          description: attr.description,
          type: attr.type,
          isRequired: attr.isRequired,
          isUnique: attr.isUnique,
          isSystem: false,
          defaultValue: attr.defaultValue,
          order: index + 1,
          config: attr.config,
        }));
        await db.insert(attribute).values(attributeValues);
      }

      return db.query.entityDefinition.findFirst({
        where: eq(entityDefinition.id, newEntity.id),
        with: { attributes: { orderBy: [asc(attribute.order)] } },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        entityId: z.string().uuid(),
        singularName: z.string().min(1).max(100).optional(),
        pluralName: z.string().min(1).max(100).optional(),
        description: z.string().max(500).optional(),
        icon: z.string().max(50).optional(),
        color: z.string().max(50).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const entity = await getEntityWithWorkspace(input.entityId);
      await requireWorkspaceAccess(entity.workspaceId, ctx.session.user.id, [
        "owner",
        "admin",
        "member",
      ]);

      const [updated] = await db
        .update(entityDefinition)
        .set({
          ...(input.singularName && { singularName: input.singularName }),
          ...(input.pluralName && { pluralName: input.pluralName }),
          ...(input.description !== undefined && {
            description: input.description,
          }),
          ...(input.icon !== undefined && { icon: input.icon }),
          ...(input.color !== undefined && { color: input.color }),
        })
        .where(eq(entityDefinition.id, input.entityId))
        .returning();

      return updated;
    }),

  delete: protectedProcedure
    .input(z.object({ entityId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const entity = await getEntityWithWorkspace(input.entityId);
      await requireWorkspaceAccess(entity.workspaceId, ctx.session.user.id, [
        "owner",
        "admin",
      ]);
      await db
        .delete(entityDefinition)
        .where(eq(entityDefinition.id, input.entityId));
      return { success: true };
    }),

  addAttribute: protectedProcedure
    .input(
      z.object({
        entityDefinitionId: z.string().uuid(),
        name: z.string().min(1).max(100),
        description: z.string().max(500).optional(),
        type: attributeTypeSchema,
        isRequired: z.boolean().default(false),
        isUnique: z.boolean().default(false),
        defaultValue: z.unknown().optional(),
        config: attributeConfigSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const entity = await getEntityWithWorkspace(input.entityDefinitionId);
      await requireWorkspaceAccess(entity.workspaceId, ctx.session.user.id, [
        "owner",
        "admin",
        "member",
      ]);

      const existingAttrs = await db.query.attribute.findMany({
        where: eq(attribute.entityDefinitionId, input.entityDefinitionId),
      });
      const maxOrder = Math.max(0, ...existingAttrs.map((a) => a.order));

      let slug = generateSlug(input.name);
      let counter = 1;
      while (existingAttrs.some((a) => a.slug === slug)) {
        slug = `${generateSlug(input.name)}-${counter}`;
        counter++;
      }

      const [newAttr] = await db
        .insert(attribute)
        .values({
          entityDefinitionId: input.entityDefinitionId,
          slug,
          name: input.name,
          description: input.description,
          type: input.type,
          isRequired: input.isRequired,
          isUnique: input.isUnique,
          isSystem: false,
          defaultValue: input.defaultValue,
          order: maxOrder + 1,
          config: input.config,
        })
        .returning();

      return newAttr;
    }),

  updateAttribute: protectedProcedure
    .input(
      z.object({
        attributeId: z.string().uuid(),
        name: z.string().min(1).max(100).optional(),
        description: z.string().max(500).optional(),
        type: attributeTypeSchema.optional(),
        isRequired: z.boolean().optional(),
        isUnique: z.boolean().optional(),
        defaultValue: z.unknown().optional(),
        config: attributeConfigSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const attr = await db.query.attribute.findFirst({
        where: eq(attribute.id, input.attributeId),
      });
      if (!attr) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Attribute not found",
        });
      }
      if (attr.isSystem) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot modify system attribute",
        });
      }

      const entity = await getEntityWithWorkspace(attr.entityDefinitionId);
      await requireWorkspaceAccess(entity.workspaceId, ctx.session.user.id, [
        "owner",
        "admin",
        "member",
      ]);

      const [updated] = await db
        .update(attribute)
        .set({
          ...(input.name && { name: input.name }),
          ...(input.description !== undefined && {
            description: input.description,
          }),
          ...(input.type && { type: input.type }),
          ...(input.isRequired !== undefined && {
            isRequired: input.isRequired,
          }),
          ...(input.isUnique !== undefined && { isUnique: input.isUnique }),
          ...(input.defaultValue !== undefined && {
            defaultValue: input.defaultValue,
          }),
          ...(input.config !== undefined && { config: input.config }),
        })
        .where(eq(attribute.id, input.attributeId))
        .returning();

      return updated;
    }),

  deleteAttribute: protectedProcedure
    .input(z.object({ attributeId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const attr = await db.query.attribute.findFirst({
        where: eq(attribute.id, input.attributeId),
      });
      if (!attr) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Attribute not found",
        });
      }
      if (attr.isSystem) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot delete system attribute",
        });
      }

      const entity = await getEntityWithWorkspace(attr.entityDefinitionId);
      await requireWorkspaceAccess(entity.workspaceId, ctx.session.user.id, [
        "owner",
        "admin",
        "member",
      ]);

      await db.delete(attribute).where(eq(attribute.id, input.attributeId));
      return { success: true };
    }),

  reorderAttributes: protectedProcedure
    .input(
      z.object({
        entityDefinitionId: z.string().uuid(),
        orderedIds: z.array(z.string().uuid()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const entity = await getEntityWithWorkspace(input.entityDefinitionId);
      await requireWorkspaceAccess(entity.workspaceId, ctx.session.user.id, [
        "owner",
        "admin",
        "member",
      ]);

      await Promise.all(
        input.orderedIds.map((id, index) =>
          db.update(attribute).set({ order: index }).where(eq(attribute.id, id))
        )
      );

      return db.query.attribute.findMany({
        where: eq(attribute.entityDefinitionId, input.entityDefinitionId),
        orderBy: [asc(attribute.order)],
      });
    }),
});

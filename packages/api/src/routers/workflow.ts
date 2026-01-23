import {
  db,
  member,
  stageAttribute,
  stageDefinition,
  workflowDefinition,
} from "@chat-ops/db";
import { TRPCError } from "@trpc/server";
import { and, asc, eq } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure, router } from "../index";

function generateSlug(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  if (!slug) {
    const charCodeSlug = name
      .split("")
      .map((c) => c.charCodeAt(0).toString(36))
      .join("")
      .slice(0, 20);
    return `attr-${charCodeSlug}`;
  }

  return slug;
}

async function requireOrganizationAccess(
  organizationId: string,
  userId: string,
  allowedRoles: ("owner" | "admin" | "member")[]
) {
  const orgMember = await db.query.member.findFirst({
    where: and(
      eq(member.organizationId, organizationId),
      eq(member.userId, userId)
    ),
  });
  if (
    !(
      orgMember &&
      allowedRoles.includes(orgMember.role as "owner" | "admin" | "member")
    )
  ) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You do not have permission to perform this action",
    });
  }
  return orgMember.role;
}

async function getWorkflowWithOrganization(workflowId: string) {
  const workflow = await db.query.workflowDefinition.findFirst({
    where: eq(workflowDefinition.id, workflowId),
  });
  if (!workflow) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Workflow not found" });
  }
  return workflow;
}

async function getStageWithWorkflow(stageId: string) {
  const stage = await db.query.stageDefinition.findFirst({
    where: eq(stageDefinition.id, stageId),
    with: { workflowDefinition: true },
  });
  if (!stage) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Stage not found" });
  }
  return stage;
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
  "relation",
  "relation-multi",
  "file",
]);

const stageAttributeIoSchema = z.enum(["input", "output"]);

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
    targetEntityId: z.string().uuid().optional(),
    targetEntitySlug: z.string().optional(),
  })
  .optional();

const workflowStatusSchema = z.enum(["draft", "active", "archived"]);

export const workflowRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        organizationId: z.string(),
        status: workflowStatusSchema.optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      await requireOrganizationAccess(
        input.organizationId,
        ctx.session.user.id,
        ["owner", "admin", "member"]
      );

      const conditions = [
        eq(workflowDefinition.organizationId, input.organizationId),
      ];
      if (input.status) {
        conditions.push(eq(workflowDefinition.status, input.status));
      }

      return db.query.workflowDefinition.findMany({
        where: and(...conditions),
        with: {
          stages: {
            orderBy: [asc(stageDefinition.order)],
            with: {
              attributes: {
                orderBy: [asc(stageAttribute.order)],
              },
            },
          },
        },
      });
    }),

  getById: protectedProcedure
    .input(z.object({ workflowId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const workflow = await getWorkflowWithOrganization(input.workflowId);
      await requireOrganizationAccess(
        workflow.organizationId,
        ctx.session.user.id,
        ["owner", "admin", "member"]
      );
      return db.query.workflowDefinition.findFirst({
        where: eq(workflowDefinition.id, input.workflowId),
        with: {
          stages: {
            orderBy: [asc(stageDefinition.order)],
            with: {
              attributes: {
                orderBy: [asc(stageAttribute.order)],
              },
            },
          },
          triggerEntity: true,
        },
      });
    }),

  create: protectedProcedure
    .input(
      z.object({
        organizationId: z.string(),
        name: z.string().min(1).max(100),
        description: z.string().max(500).optional(),
        triggerEntityId: z.string().uuid().optional(),
        icon: z.string().max(50).optional(),
        color: z.string().max(50).optional(),
        status: workflowStatusSchema.default("draft"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await requireOrganizationAccess(
        input.organizationId,
        ctx.session.user.id,
        ["owner", "admin", "member"]
      );

      const [newWorkflow] = await db
        .insert(workflowDefinition)
        .values({
          organizationId: input.organizationId,
          name: input.name,
          description: input.description,
          triggerEntityId: input.triggerEntityId,
          icon: input.icon,
          color: input.color,
          status: input.status,
        })
        .returning();

      if (!newWorkflow) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create workflow",
        });
      }

      return db.query.workflowDefinition.findFirst({
        where: eq(workflowDefinition.id, newWorkflow.id),
        with: {
          stages: {
            orderBy: [asc(stageDefinition.order)],
            with: {
              attributes: {
                orderBy: [asc(stageAttribute.order)],
              },
            },
          },
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        workflowId: z.string().uuid(),
        name: z.string().min(1).max(100).optional(),
        description: z.string().max(500).optional(),
        triggerEntityId: z.string().uuid().nullable().optional(),
        icon: z.string().max(50).optional(),
        color: z.string().max(50).optional(),
        status: workflowStatusSchema.optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const workflow = await getWorkflowWithOrganization(input.workflowId);
      await requireOrganizationAccess(
        workflow.organizationId,
        ctx.session.user.id,
        ["owner", "admin", "member"]
      );

      const [updated] = await db
        .update(workflowDefinition)
        .set({
          ...(input.name && { name: input.name }),
          ...(input.description !== undefined && {
            description: input.description,
          }),
          ...(input.triggerEntityId !== undefined && {
            triggerEntityId: input.triggerEntityId,
          }),
          ...(input.icon !== undefined && { icon: input.icon }),
          ...(input.color !== undefined && { color: input.color }),
          ...(input.status && { status: input.status }),
        })
        .where(eq(workflowDefinition.id, input.workflowId))
        .returning();

      return updated;
    }),

  delete: protectedProcedure
    .input(z.object({ workflowId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const workflow = await getWorkflowWithOrganization(input.workflowId);
      await requireOrganizationAccess(
        workflow.organizationId,
        ctx.session.user.id,
        ["owner", "admin"]
      );
      await db
        .delete(workflowDefinition)
        .where(eq(workflowDefinition.id, input.workflowId));
      return { success: true };
    }),

  // Stage operations
  addStage: protectedProcedure
    .input(
      z.object({
        workflowDefinitionId: z.string().uuid(),
        name: z.string().min(1).max(100),
        description: z.string().max(500).optional(),
        instructions: z.string().max(2000).optional(),
        target: z.string().max(500).optional(),
        icon: z.string().max(50).optional(),
        color: z.string().max(50).optional(),
        isInitial: z.boolean().default(false),
        isFinal: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const workflow = await getWorkflowWithOrganization(
        input.workflowDefinitionId
      );
      await requireOrganizationAccess(
        workflow.organizationId,
        ctx.session.user.id,
        ["owner", "admin", "member"]
      );

      const existingStages = await db.query.stageDefinition.findMany({
        where: eq(
          stageDefinition.workflowDefinitionId,
          input.workflowDefinitionId
        ),
      });
      const maxOrder = Math.max(0, ...existingStages.map((s) => s.order));

      // If this is set as initial, unset other initial stages
      if (input.isInitial) {
        await db
          .update(stageDefinition)
          .set({ isInitial: false })
          .where(
            eq(stageDefinition.workflowDefinitionId, input.workflowDefinitionId)
          );
      }

      const [newStage] = await db
        .insert(stageDefinition)
        .values({
          workflowDefinitionId: input.workflowDefinitionId,
          name: input.name,
          description: input.description,
          instructions: input.instructions,
          target: input.target,
          icon: input.icon,
          color: input.color,
          isInitial: input.isInitial,
          isFinal: input.isFinal,
          order: maxOrder + 1,
        })
        .returning();

      return newStage;
    }),

  updateStage: protectedProcedure
    .input(
      z.object({
        stageId: z.string().uuid(),
        name: z.string().min(1).max(100).optional(),
        description: z.string().max(500).optional(),
        instructions: z.string().max(2000).optional(),
        target: z.string().max(500).optional(),
        icon: z.string().max(50).optional(),
        color: z.string().max(50).optional(),
        isInitial: z.boolean().optional(),
        isFinal: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const stage = await getStageWithWorkflow(input.stageId);
      await requireOrganizationAccess(
        stage.workflowDefinition.organizationId,
        ctx.session.user.id,
        ["owner", "admin", "member"]
      );

      // If setting as initial, unset other initial stages
      if (input.isInitial) {
        await db
          .update(stageDefinition)
          .set({ isInitial: false })
          .where(
            eq(stageDefinition.workflowDefinitionId, stage.workflowDefinitionId)
          );
      }

      const [updated] = await db
        .update(stageDefinition)
        .set({
          ...(input.name && { name: input.name }),
          ...(input.description !== undefined && {
            description: input.description,
          }),
          ...(input.instructions !== undefined && {
            instructions: input.instructions,
          }),
          ...(input.target !== undefined && { target: input.target }),
          ...(input.icon !== undefined && { icon: input.icon }),
          ...(input.color !== undefined && { color: input.color }),
          ...(input.isInitial !== undefined && { isInitial: input.isInitial }),
          ...(input.isFinal !== undefined && { isFinal: input.isFinal }),
        })
        .where(eq(stageDefinition.id, input.stageId))
        .returning();

      return updated;
    }),

  deleteStage: protectedProcedure
    .input(z.object({ stageId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const stage = await getStageWithWorkflow(input.stageId);
      await requireOrganizationAccess(
        stage.workflowDefinition.organizationId,
        ctx.session.user.id,
        ["owner", "admin"]
      );
      await db
        .delete(stageDefinition)
        .where(eq(stageDefinition.id, input.stageId));
      return { success: true };
    }),

  reorderStages: protectedProcedure
    .input(
      z.object({
        workflowDefinitionId: z.string().uuid(),
        orderedIds: z.array(z.string().uuid()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const workflow = await getWorkflowWithOrganization(
        input.workflowDefinitionId
      );
      await requireOrganizationAccess(
        workflow.organizationId,
        ctx.session.user.id,
        ["owner", "admin", "member"]
      );

      await Promise.all(
        input.orderedIds.map((id, index) =>
          db
            .update(stageDefinition)
            .set({ order: index })
            .where(eq(stageDefinition.id, id))
        )
      );

      return db.query.stageDefinition.findMany({
        where: eq(
          stageDefinition.workflowDefinitionId,
          input.workflowDefinitionId
        ),
        orderBy: [asc(stageDefinition.order)],
        with: {
          attributes: {
            orderBy: [asc(stageAttribute.order)],
          },
        },
      });
    }),

  // Stage attribute operations
  addStageAttribute: protectedProcedure
    .input(
      z.object({
        stageDefinitionId: z.string().uuid(),
        name: z.string().min(1).max(100),
        description: z.string().max(500).optional(),
        type: attributeTypeSchema,
        io: stageAttributeIoSchema.default("output"),
        isRequired: z.boolean().default(false),
        isUnique: z.boolean().default(false),
        defaultValue: z.unknown().optional(),
        config: attributeConfigSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const stage = await getStageWithWorkflow(input.stageDefinitionId);
      await requireOrganizationAccess(
        stage.workflowDefinition.organizationId,
        ctx.session.user.id,
        ["owner", "admin", "member"]
      );

      const existingAttrs = await db.query.stageAttribute.findMany({
        where: eq(stageAttribute.stageDefinitionId, input.stageDefinitionId),
      });
      const maxOrder = Math.max(0, ...existingAttrs.map((a) => a.order));

      let slug = generateSlug(input.name);
      let counter = 1;
      while (existingAttrs.some((a) => a.slug === slug)) {
        slug = `${generateSlug(input.name)}-${counter}`;
        counter += 1;
      }

      const [newAttr] = await db
        .insert(stageAttribute)
        .values({
          stageDefinitionId: input.stageDefinitionId,
          slug,
          name: input.name,
          description: input.description,
          type: input.type,
          io: input.io,
          isRequired: input.isRequired,
          isUnique: input.isUnique,
          defaultValue: input.defaultValue,
          order: maxOrder + 1,
          config: input.config,
        })
        .returning();

      return newAttr;
    }),

  updateStageAttribute: protectedProcedure
    .input(
      z.object({
        attributeId: z.string().uuid(),
        name: z.string().min(1).max(100).optional(),
        description: z.string().max(500).optional(),
        type: attributeTypeSchema.optional(),
        io: stageAttributeIoSchema.optional(),
        isRequired: z.boolean().optional(),
        isUnique: z.boolean().optional(),
        defaultValue: z.unknown().optional(),
        config: attributeConfigSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const attr = await db.query.stageAttribute.findFirst({
        where: eq(stageAttribute.id, input.attributeId),
        with: {
          stageDefinition: {
            with: { workflowDefinition: true },
          },
        },
      });
      if (!attr) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Attribute not found",
        });
      }

      await requireOrganizationAccess(
        attr.stageDefinition.workflowDefinition.organizationId,
        ctx.session.user.id,
        ["owner", "admin", "member"]
      );

      const [updated] = await db
        .update(stageAttribute)
        .set({
          ...(input.name && { name: input.name }),
          ...(input.description !== undefined && {
            description: input.description,
          }),
          ...(input.type && { type: input.type }),
          ...(input.io && { io: input.io }),
          ...(input.isRequired !== undefined && {
            isRequired: input.isRequired,
          }),
          ...(input.isUnique !== undefined && { isUnique: input.isUnique }),
          ...(input.defaultValue !== undefined && {
            defaultValue: input.defaultValue,
          }),
          ...(input.config !== undefined && { config: input.config }),
        })
        .where(eq(stageAttribute.id, input.attributeId))
        .returning();

      return updated;
    }),

  deleteStageAttribute: protectedProcedure
    .input(z.object({ attributeId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const attr = await db.query.stageAttribute.findFirst({
        where: eq(stageAttribute.id, input.attributeId),
        with: {
          stageDefinition: {
            with: { workflowDefinition: true },
          },
        },
      });
      if (!attr) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Attribute not found",
        });
      }

      await requireOrganizationAccess(
        attr.stageDefinition.workflowDefinition.organizationId,
        ctx.session.user.id,
        ["owner", "admin"]
      );

      await db
        .delete(stageAttribute)
        .where(eq(stageAttribute.id, input.attributeId));
      return { success: true };
    }),

  reorderStageAttributes: protectedProcedure
    .input(
      z.object({
        stageDefinitionId: z.string().uuid(),
        orderedIds: z.array(z.string().uuid()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const stage = await getStageWithWorkflow(input.stageDefinitionId);
      await requireOrganizationAccess(
        stage.workflowDefinition.organizationId,
        ctx.session.user.id,
        ["owner", "admin", "member"]
      );

      await Promise.all(
        input.orderedIds.map((id, index) =>
          db
            .update(stageAttribute)
            .set({ order: index })
            .where(eq(stageAttribute.id, id))
        )
      );

      return db.query.stageAttribute.findMany({
        where: eq(stageAttribute.stageDefinitionId, input.stageDefinitionId),
        orderBy: [asc(stageAttribute.order)],
      });
    }),
});

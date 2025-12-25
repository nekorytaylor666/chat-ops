import {
  db,
  entityDefinition,
  entityRecord,
  workspaceMember,
} from "@chat-ops/db";
import { TRPCError } from "@trpc/server";
import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure, router } from "../index";

async function requireWorkspaceAccessForEntity(
  entityDefinitionId: string,
  userId: string,
  allowedRoles: ("owner" | "admin" | "member" | "viewer")[]
) {
  const entity = await db.query.entityDefinition.findFirst({
    where: eq(entityDefinition.id, entityDefinitionId),
  });
  if (!entity) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Entity not found" });
  }

  const member = await db.query.workspaceMember.findFirst({
    where: and(
      eq(workspaceMember.workspaceId, entity.workspaceId),
      eq(workspaceMember.userId, userId)
    ),
  });
  if (!(member && allowedRoles.includes(member.role))) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You do not have permission to perform this action",
    });
  }
  return { entity, role: member.role };
}

async function getRecordWithAccess(
  recordId: string,
  userId: string,
  allowedRoles: ("owner" | "admin" | "member" | "viewer")[]
) {
  const record = await db.query.entityRecord.findFirst({
    where: eq(entityRecord.id, recordId),
  });
  if (!record) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Record not found" });
  }

  await requireWorkspaceAccessForEntity(
    record.entityDefinitionId,
    userId,
    allowedRoles
  );
  return record;
}

export const recordRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        entityDefinitionId: z.string().uuid(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        sortField: z.string().optional(),
        sortOrder: z.enum(["asc", "desc"]).default("desc"),
      })
    )
    .query(async ({ ctx, input }) => {
      await requireWorkspaceAccessForEntity(
        input.entityDefinitionId,
        ctx.session.user.id,
        ["owner", "admin", "member", "viewer"]
      );

      const orderBy =
        input.sortOrder === "asc"
          ? [asc(entityRecord.createdAt)]
          : [desc(entityRecord.createdAt)];

      const records = await db.query.entityRecord.findMany({
        where: eq(entityRecord.entityDefinitionId, input.entityDefinitionId),
        limit: input.limit,
        offset: input.offset,
        orderBy,
      });

      return records;
    }),

  getById: protectedProcedure
    .input(z.object({ recordId: z.string().uuid() }))
    .query(async ({ ctx, input }) =>
      getRecordWithAccess(input.recordId, ctx.session.user.id, [
        "owner",
        "admin",
        "member",
        "viewer",
      ])
    ),

  create: protectedProcedure
    .input(
      z.object({
        entityDefinitionId: z.string().uuid(),
        values: z.record(z.string(), z.unknown()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await requireWorkspaceAccessForEntity(
        input.entityDefinitionId,
        ctx.session.user.id,
        ["owner", "admin", "member"]
      );

      const [newRecord] = await db
        .insert(entityRecord)
        .values({
          entityDefinitionId: input.entityDefinitionId,
          values: input.values as Record<string, unknown>,
        })
        .returning();

      if (!newRecord) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create record",
        });
      }

      return newRecord;
    }),

  update: protectedProcedure
    .input(
      z.object({
        recordId: z.string().uuid(),
        values: z.record(z.string(), z.unknown()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const record = await getRecordWithAccess(
        input.recordId,
        ctx.session.user.id,
        ["owner", "admin", "member"]
      );

      const [updated] = await db
        .update(entityRecord)
        .set({
          values: {
            ...record.values,
            ...(input.values as Record<string, unknown>),
          },
        })
        .where(eq(entityRecord.id, input.recordId))
        .returning();

      if (!updated) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update record",
        });
      }

      return updated;
    }),

  delete: protectedProcedure
    .input(z.object({ recordId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await getRecordWithAccess(input.recordId, ctx.session.user.id, [
        "owner",
        "admin",
        "member",
      ]);

      await db.delete(entityRecord).where(eq(entityRecord.id, input.recordId));
      return { success: true };
    }),

  bulkDelete: protectedProcedure
    .input(
      z.object({
        recordIds: z.array(z.string().uuid()).min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const firstRecordId = input.recordIds[0];
      if (!firstRecordId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No records provided",
        });
      }

      // Verify access for all records by checking first one
      const firstRecord = await db.query.entityRecord.findFirst({
        where: eq(entityRecord.id, firstRecordId),
      });
      if (!firstRecord) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Record not found" });
      }

      await requireWorkspaceAccessForEntity(
        firstRecord.entityDefinitionId,
        ctx.session.user.id,
        ["owner", "admin", "member"]
      );

      await db
        .delete(entityRecord)
        .where(inArray(entityRecord.id, input.recordIds));

      return { success: true, deletedCount: input.recordIds.length };
    }),
});

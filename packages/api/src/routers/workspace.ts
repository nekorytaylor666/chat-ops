import {
  db,
  workspace,
  workspaceMember,
  type workspaceRoleEnum,
} from "@chat-ops/db";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure, router } from "../index";

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

async function getMemberRole(workspaceId: string, userId: string) {
  const member = await db.query.workspaceMember.findFirst({
    where: and(
      eq(workspaceMember.workspaceId, workspaceId),
      eq(workspaceMember.userId, userId)
    ),
  });
  return member?.role ?? null;
}

async function requireRole(
  workspaceId: string,
  userId: string,
  allowedRoles: (typeof workspaceRoleEnum.enumValues)[number][]
) {
  const role = await getMemberRole(workspaceId, userId);
  if (!(role && allowedRoles.includes(role))) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You do not have permission to perform this action",
    });
  }
  return role;
}

export const workspaceRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const memberships = await db.query.workspaceMember.findMany({
      where: eq(workspaceMember.userId, userId),
      with: { workspace: true },
    });
    return memberships.map((m) => ({ ...m.workspace, role: m.role }));
  }),

  getById: protectedProcedure
    .input(z.object({ workspaceId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      await requireRole(input.workspaceId, ctx.session.user.id, [
        "owner",
        "admin",
        "member",
        "viewer",
      ]);
      const ws = await db.query.workspace.findFirst({
        where: eq(workspace.id, input.workspaceId),
        with: { members: true },
      });
      if (!ws) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Workspace not found",
        });
      }
      return ws;
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        slug: z.string().min(1).max(100).regex(slugRegex),
        description: z.string().max(500).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await db.query.workspace.findFirst({
        where: eq(workspace.slug, input.slug),
      });
      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Workspace slug already exists",
        });
      }

      const [newWorkspace] = await db
        .insert(workspace)
        .values({
          name: input.name,
          slug: input.slug,
          description: input.description,
        })
        .returning();

      if (!newWorkspace) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create workspace",
        });
      }

      await db.insert(workspaceMember).values({
        workspaceId: newWorkspace.id,
        userId: ctx.session.user.id,
        role: "owner",
      });

      return newWorkspace;
    }),

  update: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string().uuid(),
        name: z.string().min(1).max(100).optional(),
        slug: z.string().min(1).max(100).regex(slugRegex).optional(),
        description: z.string().max(500).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await requireRole(input.workspaceId, ctx.session.user.id, [
        "owner",
        "admin",
      ]);

      if (input.slug) {
        const existing = await db.query.workspace.findFirst({
          where: and(
            eq(workspace.slug, input.slug),
            eq(workspace.id, input.workspaceId)
          ),
        });
        if (existing && existing.id !== input.workspaceId) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Workspace slug already exists",
          });
        }
      }

      const [updated] = await db
        .update(workspace)
        .set({
          ...(input.name && { name: input.name }),
          ...(input.slug && { slug: input.slug }),
          ...(input.description !== undefined && {
            description: input.description,
          }),
        })
        .where(eq(workspace.id, input.workspaceId))
        .returning();

      return updated;
    }),

  delete: protectedProcedure
    .input(z.object({ workspaceId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await requireRole(input.workspaceId, ctx.session.user.id, ["owner"]);
      await db.delete(workspace).where(eq(workspace.id, input.workspaceId));
      return { success: true };
    }),

  listMembers: protectedProcedure
    .input(z.object({ workspaceId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      await requireRole(input.workspaceId, ctx.session.user.id, [
        "owner",
        "admin",
        "member",
        "viewer",
      ]);
      return db.query.workspaceMember.findMany({
        where: eq(workspaceMember.workspaceId, input.workspaceId),
        with: { user: true },
      });
    }),

  addMember: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string().uuid(),
        userId: z.string(),
        role: z.enum(["admin", "member", "viewer"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await requireRole(input.workspaceId, ctx.session.user.id, [
        "owner",
        "admin",
      ]);

      const existing = await db.query.workspaceMember.findFirst({
        where: and(
          eq(workspaceMember.workspaceId, input.workspaceId),
          eq(workspaceMember.userId, input.userId)
        ),
      });
      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User is already a member",
        });
      }

      const [member] = await db
        .insert(workspaceMember)
        .values({
          workspaceId: input.workspaceId,
          userId: input.userId,
          role: input.role,
        })
        .returning();

      return member;
    }),

  updateMemberRole: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string().uuid(),
        userId: z.string(),
        role: z.enum(["admin", "member", "viewer"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await requireRole(input.workspaceId, ctx.session.user.id, ["owner"]);

      const targetMember = await db.query.workspaceMember.findFirst({
        where: and(
          eq(workspaceMember.workspaceId, input.workspaceId),
          eq(workspaceMember.userId, input.userId)
        ),
      });
      if (!targetMember) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Member not found" });
      }
      if (targetMember.role === "owner") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot change owner role",
        });
      }

      const [updated] = await db
        .update(workspaceMember)
        .set({ role: input.role })
        .where(eq(workspaceMember.id, targetMember.id))
        .returning();

      return updated;
    }),

  removeMember: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string().uuid(),
        userId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await requireRole(input.workspaceId, ctx.session.user.id, [
        "owner",
        "admin",
      ]);

      const targetMember = await db.query.workspaceMember.findFirst({
        where: and(
          eq(workspaceMember.workspaceId, input.workspaceId),
          eq(workspaceMember.userId, input.userId)
        ),
      });
      if (!targetMember) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Member not found" });
      }
      if (targetMember.role === "owner") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot remove workspace owner",
        });
      }

      await db
        .delete(workspaceMember)
        .where(eq(workspaceMember.id, targetMember.id));

      return { success: true };
    }),
});

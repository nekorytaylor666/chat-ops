import {
  db,
  deal,
  member,
  stageDefinition,
  stageHistory,
  stageInstance,
  workflowDefinition,
} from "@chat-ops/db";
import { TRPCError } from "@trpc/server";
import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure, router } from "../index";

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

async function getDealWithOrganization(dealId: string) {
  const dealRecord = await db.query.deal.findFirst({
    where: eq(deal.id, dealId),
  });
  if (!dealRecord) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Deal not found" });
  }
  return dealRecord;
}

const dealStatusSchema = z.enum(["open", "won", "lost"]);

type StageInstanceWithDefinition = {
  id: string;
  status: string;
  values: Record<string, unknown> | null;
  stageDefinition: {
    id: string;
    name: string;
    order: number;
    attributes: {
      id: string;
      slug: string;
      name: string;
      type: string;
      io: string | null;
    }[];
  } | null;
};

/**
 * Computes inherited data from completed previous stages.
 * Returns a map of stage names to their output attribute values.
 */
function computeInheritedData(
  stageInstances: StageInstanceWithDefinition[],
  currentStageOrder: number
): Record<string, Record<string, unknown>> {
  const inheritedData: Record<string, Record<string, unknown>> = {};

  // Filter to completed stages before the current stage (by order)
  const completedPreviousStages = stageInstances
    .filter((si) => {
      const order = si.stageDefinition?.order ?? 0;
      return si.status === "completed" && order < currentStageOrder;
    })
    .sort((a, b) => {
      const orderA = a.stageDefinition?.order ?? 0;
      const orderB = b.stageDefinition?.order ?? 0;
      return orderA - orderB;
    });

  for (const stageInst of completedPreviousStages) {
    const stageName = stageInst.stageDefinition?.name ?? "Unknown Stage";
    const stageValues = stageInst.values ?? {};
    const outputAttributes =
      stageInst.stageDefinition?.attributes.filter(
        (attr) => attr.io === "output" || attr.io === null
      ) ?? [];

    const stageData: Record<string, unknown> = {};
    for (const attr of outputAttributes) {
      if (stageValues[attr.slug] !== undefined) {
        stageData[attr.slug] = stageValues[attr.slug];
      }
    }

    if (Object.keys(stageData).length > 0) {
      inheritedData[stageName] = stageData;
    }
  }

  return inheritedData;
}

export const dealRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        organizationId: z.string(),
        workflowDefinitionId: z.string().uuid().optional(),
        status: dealStatusSchema.optional(),
        ownerId: z.string().uuid().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        sortField: z.string().optional(),
        sortOrder: z.enum(["asc", "desc"]).default("desc"),
      })
    )
    .query(async ({ ctx, input }) => {
      await requireOrganizationAccess(
        input.organizationId,
        ctx.session.user.id,
        ["owner", "admin", "member"]
      );

      const conditions = [eq(deal.organizationId, input.organizationId)];
      if (input.workflowDefinitionId) {
        conditions.push(
          eq(deal.workflowDefinitionId, input.workflowDefinitionId)
        );
      }
      if (input.status) {
        conditions.push(eq(deal.status, input.status));
      }
      if (input.ownerId) {
        conditions.push(eq(deal.ownerId, input.ownerId));
      }

      const orderBy =
        input.sortOrder === "asc"
          ? [asc(deal.createdAt)]
          : [desc(deal.createdAt)];

      return db.query.deal.findMany({
        where: and(...conditions),
        limit: input.limit,
        offset: input.offset,
        orderBy,
        with: {
          workflowDefinition: true,
          currentStage: {
            with: {
              stageDefinition: true,
            },
          },
          owner: true,
        },
      });
    }),

  getById: protectedProcedure
    .input(z.object({ dealId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const dealRecord = await getDealWithOrganization(input.dealId);
      await requireOrganizationAccess(
        dealRecord.organizationId,
        ctx.session.user.id,
        ["owner", "admin", "member"]
      );

      const result = await db.query.deal.findFirst({
        where: eq(deal.id, input.dealId),
        with: {
          workflowDefinition: {
            with: {
              stages: {
                orderBy: [asc(stageDefinition.order)],
                with: {
                  attributes: true,
                },
              },
            },
          },
          stageInstances: {
            with: {
              stageDefinition: {
                with: {
                  attributes: true,
                },
              },
            },
          },
          currentStage: {
            with: {
              stageDefinition: {
                with: {
                  attributes: true,
                },
              },
            },
          },
          owner: true,
          triggerRecord: true,
        },
      });

      if (!result) {
        return null;
      }

      // Compute inherited data for each stage instance
      const stageInstancesWithInheritedData = result.stageInstances.map(
        (si) => {
          const currentOrder = si.stageDefinition?.order ?? 0;
          const inheritedData = computeInheritedData(
            result.stageInstances as StageInstanceWithDefinition[],
            currentOrder
          );
          return {
            ...si,
            inheritedData,
          };
        }
      );

      return {
        ...result,
        stageInstances: stageInstancesWithInheritedData,
      };
    }),

  getStageContext: protectedProcedure
    .input(
      z.object({
        dealId: z.string().uuid(),
        stageInstanceId: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      const dealRecord = await getDealWithOrganization(input.dealId);
      await requireOrganizationAccess(
        dealRecord.organizationId,
        ctx.session.user.id,
        ["owner", "admin", "member"]
      );

      // Fetch the deal with all stage instances and their attributes
      const dealWithStages = await db.query.deal.findFirst({
        where: eq(deal.id, input.dealId),
        with: {
          stageInstances: {
            with: {
              stageDefinition: {
                with: {
                  attributes: true,
                },
              },
            },
          },
        },
      });

      if (!dealWithStages) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Deal not found" });
      }

      // Find the requested stage instance
      const currentStageInstance = dealWithStages.stageInstances.find(
        (si) => si.id === input.stageInstanceId
      );

      if (!currentStageInstance) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Stage instance not found",
        });
      }

      const currentOrder = currentStageInstance.stageDefinition?.order ?? 0;

      // Compute inherited data
      const inheritedData = computeInheritedData(
        dealWithStages.stageInstances as StageInstanceWithDefinition[],
        currentOrder
      );

      // Get previous stages with their attribute definitions (for reference)
      const previousStages = dealWithStages.stageInstances
        .filter((si) => {
          const order = si.stageDefinition?.order ?? 0;
          return si.status === "completed" && order < currentOrder;
        })
        .sort((a, b) => {
          const orderA = a.stageDefinition?.order ?? 0;
          const orderB = b.stageDefinition?.order ?? 0;
          return orderA - orderB;
        })
        .map((si) => ({
          id: si.id,
          name: si.stageDefinition?.name ?? "Unknown Stage",
          order: si.stageDefinition?.order ?? 0,
          values: si.values ?? {},
          attributes:
            si.stageDefinition?.attributes
              .filter((attr) => attr.io === "output" || attr.io === null)
              .map((attr) => ({
                id: attr.id,
                slug: attr.slug,
                name: attr.name,
                type: attr.type,
              })) ?? [],
        }));

      return {
        stageInstance: {
          id: currentStageInstance.id,
          name: currentStageInstance.stageDefinition?.name ?? "Unknown Stage",
          order: currentOrder,
          values: currentStageInstance.values ?? {},
          attributes:
            currentStageInstance.stageDefinition?.attributes.map((attr) => ({
              id: attr.id,
              slug: attr.slug,
              name: attr.name,
              type: attr.type,
              io: attr.io,
              isRequired: attr.isRequired,
            })) ?? [],
        },
        inheritedData,
        previousStages,
      };
    }),

  create: protectedProcedure
    .input(
      z.object({
        organizationId: z.string(),
        workflowDefinitionId: z.string().uuid(),
        name: z.string().min(1).max(200),
        triggerRecordId: z.string().uuid().optional(),
        ownerId: z.string().uuid().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await requireOrganizationAccess(
        input.organizationId,
        ctx.session.user.id,
        ["owner", "admin", "member"]
      );

      // Verify workflow exists and belongs to organization
      const workflow = await db.query.workflowDefinition.findFirst({
        where: and(
          eq(workflowDefinition.id, input.workflowDefinitionId),
          eq(workflowDefinition.organizationId, input.organizationId)
        ),
        with: {
          stages: {
            orderBy: [asc(stageDefinition.order)],
          },
        },
      });

      if (!workflow) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Workflow not found",
        });
      }

      // Create the deal
      const [newDeal] = await db
        .insert(deal)
        .values({
          organizationId: input.organizationId,
          workflowDefinitionId: input.workflowDefinitionId,
          name: input.name,
          triggerRecordId: input.triggerRecordId,
          ownerId: input.ownerId || ctx.session.user.id,
          status: "open",
        })
        .returning();

      if (!newDeal) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create deal",
        });
      }

      // Create stage instances for all stages
      const stageInstances = await Promise.all(
        workflow.stages.map(async (stage) => {
          const isInitialStage = stage.isInitial;
          const [instance] = await db
            .insert(stageInstance)
            .values({
              dealId: newDeal.id,
              stageDefinitionId: stage.id,
              status: isInitialStage ? "active" : "pending",
              enteredAt: isInitialStage ? new Date() : null,
              values: {},
            })
            .returning();
          return instance;
        })
      );

      // Set initial stage as current
      const initialStage = stageInstances.find((si) => si?.status === "active");
      if (initialStage) {
        await db
          .update(deal)
          .set({ currentStageId: initialStage.id })
          .where(eq(deal.id, newDeal.id));

        // Record history
        await db.insert(stageHistory).values({
          dealId: newDeal.id,
          stageInstanceId: initialStage.id,
          action: "entered",
          performedBy: ctx.session.user.id,
          metadata: { automated: true, reason: "deal_created" },
        });
      }

      return db.query.deal.findFirst({
        where: eq(deal.id, newDeal.id),
        with: {
          workflowDefinition: true,
          stageInstances: {
            with: {
              stageDefinition: true,
            },
          },
          currentStage: {
            with: {
              stageDefinition: true,
            },
          },
          owner: true,
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        dealId: z.string().uuid(),
        name: z.string().min(1).max(200).optional(),
        ownerId: z.string().uuid().nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const dealRecord = await getDealWithOrganization(input.dealId);
      await requireOrganizationAccess(
        dealRecord.organizationId,
        ctx.session.user.id,
        ["owner", "admin", "member"]
      );

      const [updated] = await db
        .update(deal)
        .set({
          ...(input.name && { name: input.name }),
          ...(input.ownerId !== undefined && { ownerId: input.ownerId }),
        })
        .where(eq(deal.id, input.dealId))
        .returning();

      return updated;
    }),

  delete: protectedProcedure
    .input(z.object({ dealId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const dealRecord = await getDealWithOrganization(input.dealId);
      await requireOrganizationAccess(
        dealRecord.organizationId,
        ctx.session.user.id,
        ["owner", "admin"]
      );

      await db.delete(deal).where(eq(deal.id, input.dealId));
      return { success: true };
    }),

  moveToStage: protectedProcedure
    .input(
      z.object({
        dealId: z.string().uuid(),
        targetStageDefinitionId: z.string().uuid(),
        completeCurrentStage: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const dealRecord = await db.query.deal.findFirst({
        where: eq(deal.id, input.dealId),
        with: {
          currentStage: true,
          stageInstances: true,
        },
      });

      if (!dealRecord) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Deal not found" });
      }

      await requireOrganizationAccess(
        dealRecord.organizationId,
        ctx.session.user.id,
        ["owner", "admin", "member"]
      );

      // Find the target stage instance
      const targetStageInstance = dealRecord.stageInstances.find(
        (si) => si.stageDefinitionId === input.targetStageDefinitionId
      );

      if (!targetStageInstance) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Target stage not found in this deal",
        });
      }

      const now = new Date();

      // Complete current stage if requested
      if (input.completeCurrentStage && dealRecord.currentStage) {
        await db
          .update(stageInstance)
          .set({
            status: "completed",
            completedAt: now,
            completedBy: ctx.session.user.id,
          })
          .where(eq(stageInstance.id, dealRecord.currentStage.id));

        await db.insert(stageHistory).values({
          dealId: input.dealId,
          stageInstanceId: dealRecord.currentStage.id,
          action: "completed",
          performedBy: ctx.session.user.id,
          metadata: {
            values: dealRecord.currentStage.values,
          },
        });
      }

      // Activate target stage
      await db
        .update(stageInstance)
        .set({
          status: "active",
          enteredAt: now,
        })
        .where(eq(stageInstance.id, targetStageInstance.id));

      // Update deal's current stage
      await db
        .update(deal)
        .set({ currentStageId: targetStageInstance.id })
        .where(eq(deal.id, input.dealId));

      // Record history
      await db.insert(stageHistory).values({
        dealId: input.dealId,
        stageInstanceId: targetStageInstance.id,
        action: "entered",
        performedBy: ctx.session.user.id,
      });

      return db.query.deal.findFirst({
        where: eq(deal.id, input.dealId),
        with: {
          stageInstances: {
            with: {
              stageDefinition: true,
            },
          },
          currentStage: {
            with: {
              stageDefinition: true,
            },
          },
        },
      });
    }),

  updateStageValues: protectedProcedure
    .input(
      z.object({
        stageInstanceId: z.string().uuid(),
        values: z.record(z.string(), z.unknown()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const instance = await db.query.stageInstance.findFirst({
        where: eq(stageInstance.id, input.stageInstanceId),
        with: {
          deal: true,
        },
      });

      if (!instance) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Stage instance not found",
        });
      }

      await requireOrganizationAccess(
        instance.deal.organizationId,
        ctx.session.user.id,
        ["owner", "admin", "member"]
      );

      const currentValues = (instance.values || {}) as Record<string, unknown>;
      const [updated] = await db
        .update(stageInstance)
        .set({
          values: {
            ...currentValues,
            ...(input.values as Record<string, unknown>),
          },
        })
        .where(eq(stageInstance.id, input.stageInstanceId))
        .returning();

      return updated;
    }),

  complete: protectedProcedure
    .input(
      z.object({
        dealId: z.string().uuid(),
        status: z.enum(["won", "lost"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const dealRecord = await db.query.deal.findFirst({
        where: eq(deal.id, input.dealId),
        with: {
          currentStage: true,
        },
      });

      if (!dealRecord) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Deal not found" });
      }

      await requireOrganizationAccess(
        dealRecord.organizationId,
        ctx.session.user.id,
        ["owner", "admin", "member"]
      );

      const now = new Date();

      // Complete current stage
      if (dealRecord.currentStage) {
        await db
          .update(stageInstance)
          .set({
            status: "completed",
            completedAt: now,
            completedBy: ctx.session.user.id,
          })
          .where(eq(stageInstance.id, dealRecord.currentStage.id));

        await db.insert(stageHistory).values({
          dealId: input.dealId,
          stageInstanceId: dealRecord.currentStage.id,
          action: "completed",
          performedBy: ctx.session.user.id,
          metadata: {
            dealStatus: input.status,
            values: dealRecord.currentStage.values,
          },
        });
      }

      // Update deal status
      const [updated] = await db
        .update(deal)
        .set({
          status: input.status,
          closedAt: now,
        })
        .where(eq(deal.id, input.dealId))
        .returning();

      return updated;
    }),

  getHistory: protectedProcedure
    .input(z.object({ dealId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const dealRecord = await getDealWithOrganization(input.dealId);
      await requireOrganizationAccess(
        dealRecord.organizationId,
        ctx.session.user.id,
        ["owner", "admin", "member"]
      );

      return db.query.stageHistory.findMany({
        where: eq(stageHistory.dealId, input.dealId),
        orderBy: [desc(stageHistory.performedAt)],
        with: {
          stageInstance: {
            with: {
              stageDefinition: true,
            },
          },
          performedByUser: true,
        },
      });
    }),

  bulkDelete: protectedProcedure
    .input(
      z.object({
        dealIds: z.array(z.string().uuid()).min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const firstDealId = input.dealIds[0];
      if (!firstDealId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No deals provided",
        });
      }

      const firstDeal = await getDealWithOrganization(firstDealId);
      await requireOrganizationAccess(
        firstDeal.organizationId,
        ctx.session.user.id,
        ["owner", "admin"]
      );

      await db.delete(deal).where(inArray(deal.id, input.dealIds));

      return { success: true, deletedCount: input.dealIds.length };
    }),
});

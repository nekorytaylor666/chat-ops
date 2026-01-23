import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useOrganizationContext } from "@/contexts/workspace-context";
import type { Deal } from "@/types/workflow";
import { useTRPC } from "@/utils/trpc";

export function useCreateDeal() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { organizationId } = useOrganizationContext();

  return useMutation(
    trpc.deal.create.mutationOptions({
      onMutate: async (newDeal) => {
        await queryClient.cancelQueries({
          queryKey: trpc.deal.list.queryKey({
            organizationId: organizationId ?? "",
          }),
        });

        const previousDeals = queryClient.getQueryData<Deal[]>(
          trpc.deal.list.queryKey({ organizationId: organizationId ?? "" })
        );

        const optimisticDeal: Deal = {
          id: `temp-${Date.now()}`,
          organizationId: organizationId ?? "",
          workflowDefinitionId: newDeal.workflowDefinitionId,
          name: newDeal.name,
          triggerRecordId: newDeal.triggerRecordId ?? null,
          currentStageId: null,
          status: "open",
          ownerId: newDeal.ownerId ?? null,
          createdAt: new Date(),
          updatedAt: new Date(),
          closedAt: null,
          workflowDefinition: null as unknown as Deal["workflowDefinition"],
          currentStage: null,
          owner: null,
        };

        queryClient.setQueryData<Deal[]>(
          trpc.deal.list.queryKey({ organizationId: organizationId ?? "" }),
          (old) => [optimisticDeal, ...(old ?? [])]
        );

        return { previousDeals };
      },
      onError: (_err, _newDeal, context) => {
        if (context?.previousDeals) {
          queryClient.setQueryData(
            trpc.deal.list.queryKey({ organizationId: organizationId ?? "" }),
            context.previousDeals
          );
        }
        toast.error("Failed to create deal");
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.deal.list.queryKey({
            organizationId: organizationId ?? "",
          }),
        });
      },
    })
  );
}

export function useUpdateDeal() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { organizationId } = useOrganizationContext();

  return useMutation(
    trpc.deal.update.mutationOptions({
      onMutate: async (updates) => {
        await queryClient.cancelQueries({
          queryKey: trpc.deal.list.queryKey({
            organizationId: organizationId ?? "",
          }),
        });

        const previousDeals = queryClient.getQueryData<Deal[]>(
          trpc.deal.list.queryKey({ organizationId: organizationId ?? "" })
        );

        queryClient.setQueryData<Deal[]>(
          trpc.deal.list.queryKey({ organizationId: organizationId ?? "" }),
          (old) =>
            old?.map((deal) =>
              deal.id === updates.dealId
                ? { ...deal, ...updates, updatedAt: new Date() }
                : deal
            )
        );

        return { previousDeals };
      },
      onError: (_err, _updates, context) => {
        if (context?.previousDeals) {
          queryClient.setQueryData(
            trpc.deal.list.queryKey({ organizationId: organizationId ?? "" }),
            context.previousDeals
          );
        }
        toast.error("Failed to update deal");
      },
      onSettled: (_data, _error, variables) => {
        queryClient.invalidateQueries({
          queryKey: trpc.deal.list.queryKey({
            organizationId: organizationId ?? "",
          }),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.deal.getById.queryKey({
            dealId: variables.dealId,
          }),
        });
      },
    })
  );
}

export function useDeleteDeal() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { organizationId } = useOrganizationContext();

  return useMutation(
    trpc.deal.delete.mutationOptions({
      onMutate: async ({ dealId }) => {
        await queryClient.cancelQueries({
          queryKey: trpc.deal.list.queryKey({
            organizationId: organizationId ?? "",
          }),
        });

        const previousDeals = queryClient.getQueryData<Deal[]>(
          trpc.deal.list.queryKey({ organizationId: organizationId ?? "" })
        );

        queryClient.setQueryData<Deal[]>(
          trpc.deal.list.queryKey({ organizationId: organizationId ?? "" }),
          (old) => old?.filter((deal) => deal.id !== dealId)
        );

        return { previousDeals };
      },
      onError: (_err, _variables, context) => {
        if (context?.previousDeals) {
          queryClient.setQueryData(
            trpc.deal.list.queryKey({ organizationId: organizationId ?? "" }),
            context.previousDeals
          );
        }
        toast.error("Failed to delete deal");
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.deal.list.queryKey({
            organizationId: organizationId ?? "",
          }),
        });
      },
    })
  );
}

export function useBulkDeleteDeals() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { organizationId } = useOrganizationContext();

  return useMutation(
    trpc.deal.bulkDelete.mutationOptions({
      onMutate: async ({ dealIds }) => {
        await queryClient.cancelQueries({
          queryKey: trpc.deal.list.queryKey({
            organizationId: organizationId ?? "",
          }),
        });

        const previousDeals = queryClient.getQueryData<Deal[]>(
          trpc.deal.list.queryKey({ organizationId: organizationId ?? "" })
        );

        queryClient.setQueryData<Deal[]>(
          trpc.deal.list.queryKey({ organizationId: organizationId ?? "" }),
          (old) => old?.filter((deal) => !dealIds.includes(deal.id))
        );

        return { previousDeals };
      },
      onError: (_err, _variables, context) => {
        if (context?.previousDeals) {
          queryClient.setQueryData(
            trpc.deal.list.queryKey({ organizationId: organizationId ?? "" }),
            context.previousDeals
          );
        }
        toast.error("Failed to delete deals");
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.deal.list.queryKey({
            organizationId: organizationId ?? "",
          }),
        });
      },
    })
  );
}

export function useMoveToStage() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { organizationId } = useOrganizationContext();

  return useMutation(
    trpc.deal.moveToStage.mutationOptions({
      onSuccess: () => {
        toast.success("Deal moved to new stage");
      },
      onError: () => {
        toast.error("Failed to move deal");
      },
      onSettled: (_data, _error, variables) => {
        queryClient.invalidateQueries({
          queryKey: trpc.deal.list.queryKey({
            organizationId: organizationId ?? "",
          }),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.deal.getById.queryKey({
            dealId: variables.dealId,
          }),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.deal.getHistory.queryKey({
            dealId: variables.dealId,
          }),
        });
      },
    })
  );
}

export function useUpdateStageValues() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.deal.updateStageValues.mutationOptions({
      onError: () => {
        toast.error("Failed to update stage values");
      },
      onSettled: (_data, _error) => {
        // Invalidate deal queries - we don't have dealId here directly
        // but the component using this should handle invalidation
        queryClient.invalidateQueries({
          predicate: (query) =>
            query.queryKey[0] === "deal" && query.queryKey[1] === "getById",
        });
      },
    })
  );
}

export function useCompleteDeal() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { organizationId } = useOrganizationContext();

  return useMutation(
    trpc.deal.complete.mutationOptions({
      onMutate: async ({ dealId, status }) => {
        await queryClient.cancelQueries({
          queryKey: trpc.deal.list.queryKey({
            organizationId: organizationId ?? "",
          }),
        });

        const previousDeals = queryClient.getQueryData<Deal[]>(
          trpc.deal.list.queryKey({ organizationId: organizationId ?? "" })
        );

        queryClient.setQueryData<Deal[]>(
          trpc.deal.list.queryKey({ organizationId: organizationId ?? "" }),
          (old) =>
            old?.map((deal) =>
              deal.id === dealId
                ? {
                    ...deal,
                    status,
                    closedAt: new Date(),
                    updatedAt: new Date(),
                  }
                : deal
            )
        );

        return { previousDeals };
      },
      onSuccess: (_data, variables) => {
        toast.success(
          `Deal marked as ${variables.status === "won" ? "won" : "lost"}`
        );
      },
      onError: (_err, _variables, context) => {
        if (context?.previousDeals) {
          queryClient.setQueryData(
            trpc.deal.list.queryKey({ organizationId: organizationId ?? "" }),
            context.previousDeals
          );
        }
        toast.error("Failed to complete deal");
      },
      onSettled: (_data, _error, variables) => {
        queryClient.invalidateQueries({
          queryKey: trpc.deal.list.queryKey({
            organizationId: organizationId ?? "",
          }),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.deal.getById.queryKey({
            dealId: variables.dealId,
          }),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.deal.getHistory.queryKey({
            dealId: variables.dealId,
          }),
        });
      },
    })
  );
}

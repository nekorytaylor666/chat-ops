import { useQuery } from "@tanstack/react-query";
import { useOrganizationContext } from "@/contexts/workspace-context";
import type { DealStatus } from "@/types/workflow";
import { useTRPC } from "@/utils/trpc";

type UseDealsOptions = {
  workflowDefinitionId?: string;
  status?: DealStatus;
  ownerId?: string;
  limit?: number;
  offset?: number;
  sortField?: string;
  sortOrder?: "asc" | "desc";
  enabled?: boolean;
};

export function useDeals(options: UseDealsOptions = {}) {
  const trpc = useTRPC();
  const { organizationId } = useOrganizationContext();
  const {
    workflowDefinitionId,
    status,
    ownerId,
    limit = 50,
    offset = 0,
    sortField,
    sortOrder = "desc",
    enabled = true,
  } = options;

  return useQuery(
    trpc.deal.list.queryOptions(
      {
        organizationId: organizationId ?? "",
        workflowDefinitionId,
        status,
        ownerId,
        limit,
        offset,
        sortField,
        sortOrder,
      },
      { enabled: enabled && Boolean(organizationId) }
    )
  );
}

export function useDeal(dealId: string) {
  const trpc = useTRPC();

  return useQuery(
    trpc.deal.getById.queryOptions({ dealId }, { enabled: Boolean(dealId) })
  );
}

export function useDealHistory(dealId: string) {
  const trpc = useTRPC();

  return useQuery(
    trpc.deal.getHistory.queryOptions({ dealId }, { enabled: Boolean(dealId) })
  );
}

export function useStageContext(dealId: string, stageInstanceId: string) {
  const trpc = useTRPC();

  return useQuery(
    trpc.deal.getStageContext.queryOptions(
      { dealId, stageInstanceId },
      { enabled: Boolean(dealId) && Boolean(stageInstanceId) }
    )
  );
}

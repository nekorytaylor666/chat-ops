import { useMemo } from "react";
import { useDeal, useDeals } from "@/hooks/use-deals";
import { getDealById, getStageById, mockDeals } from "@/lib/chat-mock-data";
import {
  type ApiDealWithDetails,
  type ApiListDeal,
  findStageInDeal,
  transformDealToChat,
  transformListDealsToChat,
} from "@/lib/deal-adapters";
import { FEATURE_FLAGS } from "@/lib/feature-flags";
import type { Deal, Stage } from "@/types/chat";

type UseChatDealsOptions = {
  search?: string;
};

type UseChatDealsReturn = {
  deals: Deal[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
};

/**
 * Hook for fetching and filtering deals for the chat sidebar
 * Supports search filtering by deal name and client name
 */
export function useChatDeals(
  options: UseChatDealsOptions = {}
): UseChatDealsReturn {
  const { search = "" } = options;

  const {
    data: apiDeals,
    isLoading,
    isError,
    error,
  } = useDeals({
    enabled: !FEATURE_FLAGS.USE_MOCK_DEALS,
  });

  const deals = useMemo(() => {
    let dealList: Deal[];

    if (FEATURE_FLAGS.USE_MOCK_DEALS) {
      dealList = mockDeals;
    } else {
      dealList = apiDeals
        ? transformListDealsToChat(apiDeals as ApiListDeal[])
        : [];
    }

    // Apply search filter
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      dealList = dealList.filter(
        (deal) =>
          deal.name.toLowerCase().includes(searchLower) ||
          deal.clientName.toLowerCase().includes(searchLower)
      );
    }

    return dealList;
  }, [apiDeals, search]);

  return {
    deals,
    isLoading: FEATURE_FLAGS.USE_MOCK_DEALS ? false : isLoading,
    isError: FEATURE_FLAGS.USE_MOCK_DEALS ? false : isError,
    error: FEATURE_FLAGS.USE_MOCK_DEALS ? null : (error as Error | null),
  };
}

type UseChatDealReturn = {
  deal: Deal | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
};

/**
 * Hook for fetching a single deal with all its stages
 */
export function useChatDeal(dealId: string): UseChatDealReturn {
  const {
    data: apiDeal,
    isLoading,
    isError,
    error,
  } = useDeal(FEATURE_FLAGS.USE_MOCK_DEALS ? "" : dealId);

  const deal = useMemo(() => {
    if (FEATURE_FLAGS.USE_MOCK_DEALS) {
      return getDealById(dealId) ?? null;
    }

    if (!apiDeal) {
      return null;
    }

    return transformDealToChat(apiDeal as ApiDealWithDetails);
  }, [apiDeal, dealId]);

  return {
    deal,
    isLoading: FEATURE_FLAGS.USE_MOCK_DEALS ? false : isLoading,
    isError: FEATURE_FLAGS.USE_MOCK_DEALS ? false : isError,
    error: FEATURE_FLAGS.USE_MOCK_DEALS ? null : (error as Error | null),
  };
}

type UseChatStageReturn = {
  deal: Deal | null;
  stage: Stage | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
};

/**
 * Hook for fetching a deal with a specific stage
 * Used by the route component to display chat for a specific stage
 */
export function useChatStage(
  dealId: string,
  stageId: string
): UseChatStageReturn {
  const { deal, isLoading, isError, error } = useChatDeal(dealId);

  const stage = useMemo(() => {
    if (FEATURE_FLAGS.USE_MOCK_DEALS) {
      return getStageById(dealId, stageId) ?? null;
    }

    if (!deal) {
      return null;
    }

    return findStageInDeal(deal, stageId) ?? null;
  }, [deal, dealId, stageId]);

  return {
    deal,
    stage,
    isLoading,
    isError,
    error,
  };
}

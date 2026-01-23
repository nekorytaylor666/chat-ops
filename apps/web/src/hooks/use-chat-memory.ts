import { useMemo } from "react";
import { getDealLevelMemory, getMemoryForStage } from "@/lib/chat-mock-data";
import { FEATURE_FLAGS } from "@/lib/feature-flags";
import type { MemoryItem } from "@/types/chat";

type UseChatMemoryReturn = {
  dealMemory: MemoryItem[];
  stageMemory: MemoryItem[];
  pinnedItems: MemoryItem[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
};

/**
 * Hook for fetching memory items for a deal and optionally a specific stage
 * Currently returns mock data until memory API is implemented
 */
export function useChatMemory(
  dealId: string,
  stageId?: string
): UseChatMemoryReturn {
  const { dealMemory, stageMemory, pinnedItems } = useMemo(() => {
    if (FEATURE_FLAGS.USE_MOCK_MEMORY) {
      const dealItems = getDealLevelMemory(dealId);
      const stageItems = stageId ? getMemoryForStage(dealId, stageId) : [];

      const allItems = [...dealItems, ...stageItems];
      const pinned = allItems.filter((m) => m.isPinned);

      return {
        dealMemory: dealItems.filter((m) => !m.isPinned),
        stageMemory: stageItems.filter((m) => !m.isPinned),
        pinnedItems: pinned,
      };
    }

    // TODO: Replace with real API call when memory endpoint is available
    // const { data } = useMemory(dealId, stageId);
    // return processMemoryData(data);
    return {
      dealMemory: [],
      stageMemory: [],
      pinnedItems: [],
    };
  }, [dealId, stageId]);

  return {
    dealMemory,
    stageMemory,
    pinnedItems,
    isLoading: false, // Will be connected to API loading state later
    isError: false,
    error: null,
  };
}

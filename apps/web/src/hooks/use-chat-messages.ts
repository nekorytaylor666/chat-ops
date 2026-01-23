import { useMemo } from "react";
import { getMessagesUpToStage } from "@/lib/chat-mock-data";
import { FEATURE_FLAGS } from "@/lib/feature-flags";
import type { Message } from "@/types/chat";

type UseChatMessagesReturn = {
  messages: Message[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
};

/**
 * Hook for fetching messages for a specific stage
 * Includes messages from all previous stages up to and including the current one
 * Currently returns mock data until messages API is implemented
 */
export function useChatMessages(
  dealId: string,
  stageId: string
): UseChatMessagesReturn {
  const messages = useMemo(() => {
    if (FEATURE_FLAGS.USE_MOCK_MESSAGES) {
      return getMessagesUpToStage(dealId, stageId);
    }

    // TODO: Replace with real API call when messages endpoint is available
    // const { data } = useMessages(dealId, stageId);
    // return data ?? [];
    return [];
  }, [dealId, stageId]);

  return {
    messages,
    isLoading: false, // Will be connected to API loading state later
    isError: false,
    error: null,
  };
}

import type { Deal as ChatDeal, Stage, StageStatus } from "@/types/chat";

/**
 * API types based on what deal.list and deal.getById return
 * These match the shape of data returned from the tRPC router
 */

type ApiStageDefinition = {
  id: string;
  name: string;
  target?: string | null;
  order: number;
};

type ApiStageInstance = {
  id: string;
  dealId: string;
  stageDefinitionId: string;
  status: string;
  values: unknown;
  stageDefinition?: ApiStageDefinition | null;
};

type ApiOwner = {
  id: string;
  name?: string | null;
  email?: string | null;
};

type ApiTriggerRecord = {
  id: string;
  values?: Record<string, unknown>;
};

// Base deal from list endpoint (without stageInstances)
type ApiListDeal = {
  id: string;
  name: string;
  status: string;
  currentStageId?: string | null;
  owner?: ApiOwner | null;
  currentStage?: ApiStageInstance | null;
};

// Full deal from getById endpoint (with stageInstances)
type ApiDealWithDetails = ApiListDeal & {
  stageInstances?: ApiStageInstance[];
  triggerRecord?: ApiTriggerRecord | null;
};

/**
 * Maps API StageInstanceStatus to UI StageStatus
 * - "skipped" maps to "completed" since UI doesn't have a skipped state
 */
function mapStageStatus(apiStatus: string): StageStatus {
  if (apiStatus === "skipped") {
    return "completed";
  }
  if (
    apiStatus === "pending" ||
    apiStatus === "active" ||
    apiStatus === "completed"
  ) {
    return apiStatus;
  }
  return "pending";
}

/**
 * Extracts client name from deal relationships
 * Priority: triggerRecord.values.name > owner.name > "Unknown Client"
 */
function extractClientName(deal: {
  triggerRecord?: ApiTriggerRecord | null;
  owner?: ApiOwner | null;
}): string {
  if (
    deal.triggerRecord?.values?.name &&
    typeof deal.triggerRecord.values.name === "string"
  ) {
    return deal.triggerRecord.values.name;
  }

  if (deal.owner?.name) {
    return deal.owner.name;
  }

  return "Unknown Client";
}

/**
 * Transforms an API StageInstance to UI Stage
 */
export function transformStageInstance(
  stageInstance: ApiStageInstance,
  dealId: string
): Stage {
  const stageDefinition = stageInstance.stageDefinition;

  return {
    id: stageInstance.id,
    dealId,
    name: stageDefinition?.name ?? "Unknown Stage",
    target: stageDefinition?.target ?? "",
    status: mapStageStatus(stageInstance.status),
    order: stageDefinition?.order ?? 0,
    unreadCount: 0,
  };
}

/**
 * Transforms an API list deal (without stageInstances) to UI Deal
 * Used for sidebar list - stages will be empty until expanded
 */
export function transformListDealToChat(deal: ApiListDeal): ChatDeal {
  return {
    id: deal.id,
    name: deal.name,
    clientName: extractClientName(deal),
    stages: [], // List endpoint doesn't include stages - lazy loaded when expanded
    currentStageId: deal.currentStageId ?? "",
    unreadCount: 0,
  };
}

/**
 * Transforms an API DealWithDetails (with stageInstances) to UI Deal
 * Used for full deal view with all stages
 */
export function transformDealToChat(deal: ApiDealWithDetails): ChatDeal {
  const stageInstances = deal.stageInstances ?? [];

  // Sort stages by their definition order
  const sortedStages = [...stageInstances].sort((a, b) => {
    const orderA = a.stageDefinition?.order ?? 0;
    const orderB = b.stageDefinition?.order ?? 0;
    return orderA - orderB;
  });

  const stages = sortedStages.map((si) => transformStageInstance(si, deal.id));

  // Calculate total unread count (0 for now)
  const unreadCount = stages.reduce((sum, stage) => sum + stage.unreadCount, 0);

  return {
    id: deal.id,
    name: deal.name,
    clientName: extractClientName(deal),
    stages,
    currentStageId: deal.currentStageId ?? stages[0]?.id ?? "",
    unreadCount,
  };
}

/**
 * Transforms a list of API list deals to UI deals
 */
export function transformListDealsToChat(deals: ApiListDeal[]): ChatDeal[] {
  return deals.map(transformListDealToChat);
}

/**
 * Finds a specific stage in a transformed deal
 */
export function findStageInDeal(
  deal: ChatDeal,
  stageId: string
): Stage | undefined {
  return deal.stages.find((s) => s.id === stageId);
}

// Re-export types for use in hooks
export type { ApiListDeal, ApiDealWithDetails };

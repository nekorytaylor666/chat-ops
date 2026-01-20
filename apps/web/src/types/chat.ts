export type StageStatus = "completed" | "active" | "pending";

export type Stage = {
  id: string;
  dealId: string;
  name: string;
  target: string;
  status: StageStatus;
  order: number;
  unreadCount: number;
};

export type Deal = {
  id: string;
  name: string;
  clientName: string;
  stages: Stage[];
  currentStageId: string;
  unreadCount: number;
};

export type Message = {
  id: string;
  stageId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  timestamp: Date;
  isAI?: boolean;
};

export type MemoryType =
  | "client"
  | "budget"
  | "preference"
  | "timeline"
  | "requirement";

export type MemoryItem = {
  id: string;
  dealId: string;
  stageId?: string;
  type: MemoryType;
  label: string;
  value: string;
  isPinned: boolean;
  isNew: boolean;
};

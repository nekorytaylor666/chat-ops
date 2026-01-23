import type { useTRPC } from "@/utils/trpc";

// Type inference from tRPC router responses
export type Workflow = NonNullable<
  Awaited<
    ReturnType<
      ReturnType<typeof useTRPC>["workflow"]["list"]["queryOptions"]
    >["queryFn"]
  >
>[number];

export type WorkflowWithDetails = NonNullable<
  Awaited<
    ReturnType<
      ReturnType<typeof useTRPC>["workflow"]["getById"]["queryOptions"]
    >["queryFn"]
  >
>;

export type StageDefinition = Workflow["stages"][number];

export type StageAttribute = StageDefinition["attributes"][number];

export type Deal = NonNullable<
  Awaited<
    ReturnType<
      ReturnType<typeof useTRPC>["deal"]["list"]["queryOptions"]
    >["queryFn"]
  >
>[number];

export type DealWithDetails = NonNullable<
  Awaited<
    ReturnType<
      ReturnType<typeof useTRPC>["deal"]["getById"]["queryOptions"]
    >["queryFn"]
  >
>;

export type StageInstance = NonNullable<
  DealWithDetails["stageInstances"]
>[number];

export type DealHistory = Awaited<
  ReturnType<
    ReturnType<typeof useTRPC>["deal"]["getHistory"]["queryOptions"]
  >["queryFn"]
>[number];

// Status types
export type WorkflowStatus = "draft" | "active" | "archived";
export type DealStatus = "open" | "won" | "lost";
export type StageInstanceStatus =
  | "pending"
  | "active"
  | "completed"
  | "skipped";
export type StageHistoryAction =
  | "entered"
  | "completed"
  | "skipped"
  | "reverted";

// Attribute types (shared with entity attributes)
export type AttributeType =
  | "short-text"
  | "long-text"
  | "number"
  | "select"
  | "multi-select"
  | "checkbox"
  | "date"
  | "url"
  | "relation"
  | "relation-multi"
  | "file";

export type StageAttributeIo = "input" | "output";

export type SelectOption = {
  value: string;
  label: string;
  color?: string;
};

export type AttributeConfig = {
  min?: number;
  max?: number;
  step?: number;
  options?: SelectOption[];
  targetEntityId?: string;
  targetEntitySlug?: string;
};

// Inherited Data Types

/** Map of stage names to their output attribute values */
export type InheritedData = Record<string, Record<string, unknown>>;

/** Previous stage info with attribute definitions */
export type PreviousStageInfo = {
  id: string;
  name: string;
  order: number;
  values: Record<string, unknown>;
  attributes: {
    id: string;
    slug: string;
    name: string;
    type: string;
  }[];
};

/** Stage context response from getStageContext endpoint */
export type StageContext = NonNullable<
  Awaited<
    ReturnType<
      ReturnType<typeof useTRPC>["deal"]["getStageContext"]["queryOptions"]
    >["queryFn"]
  >
>;

/** Stage instance with inherited data */
export type StageInstanceWithInheritedData = StageInstance & {
  inheritedData: InheritedData;
};

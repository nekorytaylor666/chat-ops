import type { CellSelectOption } from "./data-grid";

// Attribute type variants - aligned with existing CellOpts from data-grid.ts
export type AttributeType =
  | "short-text"
  | "long-text"
  | "number"
  | "select"
  | "multi-select"
  | "checkbox"
  | "date"
  | "url";

// Type-specific configurations
export interface NumberAttributeConfig {
  min?: number;
  max?: number;
  step?: number;
}

export interface SelectAttributeConfig {
  options: CellSelectOption[];
}

export interface MultiSelectAttributeConfig {
  options: CellSelectOption[];
}

export type AttributeConfig =
  | NumberAttributeConfig
  | SelectAttributeConfig
  | MultiSelectAttributeConfig;

// Base attribute definition
export interface AttributeDefinition {
  id: string;
  slug: string;
  name: string;
  description?: string;
  type: AttributeType;
  isRequired: boolean;
  isUnique: boolean;
  isSystem: boolean;
  defaultValue?: unknown;
  order: number;
  config?: AttributeConfig;
}

// Entity definition
export interface EntityDefinition {
  id: string;
  slug: string;
  singularName: string;
  pluralName: string;
  description?: string;
  icon?: string;
  color?: string;
  attributes: AttributeDefinition[];
  createdAt: string;
  updatedAt: string;
}

// For creating new entities
export type CreateEntityInput = Omit<
  EntityDefinition,
  "id" | "createdAt" | "updatedAt" | "attributes"
> & {
  attributes?: CreateAttributeInput[];
};

// For creating new attributes
export type CreateAttributeInput = Omit<
  AttributeDefinition,
  "id" | "slug" | "isSystem" | "order"
>;

// For updating entities
export type UpdateEntityInput = Partial<
  Omit<EntityDefinition, "id" | "createdAt" | "updatedAt" | "attributes">
>;

// For updating attributes
export type UpdateAttributeInput = Partial<
  Omit<AttributeDefinition, "id" | "isSystem" | "order">
>;

// Entity store state
export interface EntityStoreState {
  entities: EntityDefinition[];
  version: number;
}

// Attribute type metadata for UI
export const ATTRIBUTE_TYPE_META: Record<
  AttributeType,
  { label: string; icon: string }
> = {
  "short-text": { label: "Text", icon: "Type" },
  "long-text": { label: "Long Text", icon: "AlignLeft" },
  number: { label: "Number", icon: "Hash" },
  select: { label: "Select", icon: "ChevronDown" },
  "multi-select": { label: "Multi-select", icon: "List" },
  checkbox: { label: "Checkbox", icon: "CheckSquare" },
  date: { label: "Date", icon: "Calendar" },
  url: { label: "URL", icon: "Link" },
};

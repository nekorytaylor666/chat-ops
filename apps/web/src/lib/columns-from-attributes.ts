import type { ColumnDef } from "@tanstack/react-table";
import { getFilterFn } from "@/lib/data-grid-filters";
import type { CellOpts, CellSelectOption } from "@/types/data-grid";

interface AttributeConfig {
  options?: Array<{ label: string; value: string; color?: string }>;
  min?: number;
  max?: number;
  step?: number;
  targetEntityId?: string;
  targetEntitySlug?: string;
}

interface Attribute {
  id: string;
  slug: string;
  name: string;
  type:
    | "short-text"
    | "long-text"
    | "number"
    | "select"
    | "multi-select"
    | "checkbox"
    | "date"
    | "url"
    | "relation"
    | "relation-multi";
  config?: AttributeConfig | unknown;
}

function parseConfig(config: unknown): AttributeConfig {
  if (!config || typeof config !== "object") {
    return {};
  }
  const c = config as Record<string, unknown>;
  return {
    options: Array.isArray(c.options)
      ? (c.options as AttributeConfig["options"])
      : undefined,
    min: typeof c.min === "number" ? c.min : undefined,
    max: typeof c.max === "number" ? c.max : undefined,
    step: typeof c.step === "number" ? c.step : undefined,
    targetEntityId:
      typeof c.targetEntityId === "string" ? c.targetEntityId : undefined,
    targetEntitySlug:
      typeof c.targetEntitySlug === "string" ? c.targetEntitySlug : undefined,
  };
}

interface RecordData {
  id: string;
  values: Record<string, unknown>;
  [key: string]: unknown;
}

function getColumnSize(type: Attribute["type"]): number {
  switch (type) {
    case "long-text":
      return 300;
    case "url":
      return 200;
    case "relation":
      return 180;
    case "relation-multi":
      return 220;
    case "date":
      return 140;
    case "checkbox":
      return 100;
    case "select":
    case "multi-select":
      return 160;
    case "number":
      return 120;
    default:
      return 180;
  }
}

function getCellMeta(attribute: Attribute, entitySlug?: string): CellOpts {
  const config = parseConfig(attribute.config);

  // Use record-link variant for the "name" attribute if entitySlug is provided
  if (attribute.slug === "name" && entitySlug) {
    return { variant: "record-link", entitySlug };
  }

  switch (attribute.type) {
    case "short-text":
      return { variant: "short-text" };
    case "long-text":
      return { variant: "long-text" };
    case "number":
      return {
        variant: "number",
        min: config.min,
        max: config.max,
        step: config.step,
      };
    case "select":
      return {
        variant: "select",
        options: (config.options ?? []) as CellSelectOption[],
      };
    case "multi-select":
      return {
        variant: "multi-select",
        options: (config.options ?? []) as CellSelectOption[],
      };
    case "checkbox":
      return { variant: "checkbox" };
    case "date":
      return { variant: "date" };
    case "url":
      return { variant: "url" };
    case "relation":
      return {
        variant: "relation",
        targetEntityId: config.targetEntityId ?? "",
        targetEntitySlug: config.targetEntitySlug ?? "",
      };
    case "relation-multi":
      return {
        variant: "relation-multi",
        targetEntityId: config.targetEntityId ?? "",
        targetEntitySlug: config.targetEntitySlug ?? "",
      };
    default:
      return { variant: "short-text" };
  }
}

export function generateColumnsFromAttributes(
  attributes: Attribute[],
  entitySlug?: string
): ColumnDef<RecordData>[] {
  const filterFn = getFilterFn<RecordData>();

  return attributes
    .slice()
    .sort((a, b) => {
      const aOrder =
        "order" in a ? (a as Attribute & { order: number }).order : 0;
      const bOrder =
        "order" in b ? (b as Attribute & { order: number }).order : 0;
      return aOrder - bOrder;
    })
    .map((attribute) => {
      // Use slug as the key, with fallback to id for edge cases
      const columnKey = attribute.slug || attribute.id;
      return {
        // Read from top-level property where data grid updates are applied
        accessorFn: (row: RecordData) => row[columnKey],
        id: columnKey,
        header: attribute.name,
        size: getColumnSize(attribute.type),
        meta: {
          label: attribute.name,
          cell: getCellMeta(attribute, entitySlug),
        },
        filterFn,
      };
    });
}

export const ADD_COLUMN_ID = "add-column";

export function getAddColumnDef<TData>(): ColumnDef<TData> {
  return {
    id: ADD_COLUMN_ID,
    header: "add-column",
    size: 140,
    enableHiding: false,
    enableSorting: false,
    enableResizing: false,
    enablePinning: false,
  };
}

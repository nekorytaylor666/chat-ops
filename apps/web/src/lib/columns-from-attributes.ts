import type { ColumnDef } from "@tanstack/react-table";
import { getFilterFn } from "@/lib/data-grid-filters";
import type { CellOpts, CellSelectOption } from "@/types/data-grid";

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
    | "url";
  config?: {
    options?: Array<{ label: string; value: string; color?: string }>;
    min?: number;
    max?: number;
    step?: number;
  } | null;
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

function getCellMeta(attribute: Attribute): CellOpts {
  switch (attribute.type) {
    case "short-text":
      return { variant: "short-text" };
    case "long-text":
      return { variant: "long-text" };
    case "number":
      return {
        variant: "number",
        min: attribute.config?.min,
        max: attribute.config?.max,
        step: attribute.config?.step,
      };
    case "select":
      return {
        variant: "select",
        options: (attribute.config?.options ?? []) as CellSelectOption[],
      };
    case "multi-select":
      return {
        variant: "multi-select",
        options: (attribute.config?.options ?? []) as CellSelectOption[],
      };
    case "checkbox":
      return { variant: "checkbox" };
    case "date":
      return { variant: "date" };
    case "url":
      return { variant: "url" };
    default:
      return { variant: "short-text" };
  }
}

export function generateColumnsFromAttributes(
  attributes: Attribute[]
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
    .map((attribute) => ({
      accessorFn: (row: RecordData) => row.values[attribute.slug],
      id: attribute.slug,
      header: attribute.name,
      size: getColumnSize(attribute.type),
      meta: {
        label: attribute.name,
        cell: getCellMeta(attribute),
      },
      filterFn,
    }));
}

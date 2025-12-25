"use client";

import type { Table } from "@tanstack/react-table";
import { Building2, ChevronDown, Settings2 } from "lucide-react";
import * as React from "react";

import { DataGridFilterMenu } from "@/components/data-grid/data-grid-filter-menu";
import { DataGridSortMenu } from "@/components/data-grid/data-grid-sort-menu";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface EntityGridHeaderProps<TData> {
  table: Table<TData>;
  entityName?: string;
  entityIcon?: React.ElementType;
  entityCount?: number;
  views?: Array<{ id: string; name: string }>;
  activeViewId?: string;
  onViewChange?: (viewId: string) => void;
  onViewSettings?: () => void;
  className?: string;
  children?: React.ReactNode;
  /** When true, only shows the view settings row (sort/filter) */
  compact?: boolean;
}

export function EntityGridHeader<TData>({
  table,
  entityName = "Items",
  entityIcon: EntityIcon = Building2,
  entityCount,
  views,
  activeViewId,
  onViewChange,
  onViewSettings,
  className,
  children,
  compact = false,
}: EntityGridHeaderProps<TData>) {
  const sorting = table.getState().sorting;
  const columnFilters = table.getState().columnFilters;

  const sortedByLabel = React.useMemo(() => {
    if (sorting.length === 0) return null;

    const firstSort = sorting[0];
    if (!firstSort) return null;

    const column = table.getColumn(firstSort.id);
    const label = column?.columnDef.meta?.label ?? firstSort.id;
    const direction = firstSort.desc ? "desc" : "asc";

    return `${label} (${direction})`;
  }, [sorting, table]);

  const activeView = views?.find((v) => v.id === activeViewId);

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2 py-2", className)}>
        <DataGridSortMenu table={table} />
        <DataGridFilterMenu
          disabled={
            columnFilters.length === 0 &&
            !table.getAllColumns().some((c) => c.getCanFilter())
          }
          table={table}
        />
        {sortedByLabel && (
          <span className="text-muted-foreground text-sm">
            Sorted by: <span className="text-foreground">{sortedByLabel}</span>
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-3 py-3", className)}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-md bg-muted">
            <EntityIcon className="size-4 text-muted-foreground" />
          </div>
          <h1 className="font-semibold text-lg">{entityName}</h1>
          {entityCount !== undefined && (
            <span className="text-muted-foreground text-sm">
              ({entityCount.toLocaleString()})
            </span>
          )}
        </div>
        {children}
      </div>

      <div className="flex items-center gap-2">
        {views && views.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="font-normal" size="sm" variant="outline">
                {activeView?.name ?? `All ${entityName}`}
                <ChevronDown className="text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {views.map((view) => (
                <DropdownMenuItem
                  key={view.id}
                  onClick={() => onViewChange?.(view.id)}
                >
                  {view.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {onViewSettings && (
          <Button
            className="font-normal"
            onClick={onViewSettings}
            size="sm"
            variant="ghost"
          >
            <Settings2 className="text-muted-foreground" />
            View settings
          </Button>
        )}

        {sortedByLabel && (
          <span className="text-muted-foreground text-sm">
            Sorted by: <span className="text-foreground">{sortedByLabel}</span>
          </span>
        )}

        <div className="ms-auto flex items-center gap-2">
          <DataGridSortMenu align="end" table={table} />
          <DataGridFilterMenu
            align="end"
            disabled={
              columnFilters.length === 0 &&
              !table.getAllColumns().some((c) => c.getCanFilter())
            }
            table={table}
          />
        </div>
      </div>
    </div>
  );
}

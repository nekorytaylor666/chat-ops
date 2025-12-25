"use client";

import type { ColumnDef } from "@tanstack/react-table";
import * as React from "react";

import { DataGrid } from "@/components/data-grid/data-grid";
import { DataGridKeyboardShortcuts } from "@/components/data-grid/data-grid-keyboard-shortcuts";
import { getDataGridSelectColumn } from "@/components/data-grid/data-grid-select-column";
import { EntityGridHeader } from "@/components/entity-grid/entity-grid-header";
import { useDataGrid } from "@/hooks/use-data-grid";
import { cn } from "@/lib/utils";
import type {
  CellPosition,
  FileCellData,
  RowHeightValue,
  UpdateCell,
} from "@/types/data-grid";

interface EntityGridProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  onDataChange?: (data: TData[]) => void;
  onRowAdd?: (
    event?: React.MouseEvent<HTMLDivElement>
  ) => Partial<CellPosition> | Promise<Partial<CellPosition> | null> | null;
  onRowsDelete?: (rows: TData[], rowIndices: number[]) => void | Promise<void>;
  onPaste?: (updates: Array<UpdateCell>) => void | Promise<void>;
  onFilesUpload?: (params: {
    files: File[];
    rowIndex: number;
    columnId: string;
  }) => Promise<FileCellData[]>;
  onFilesDelete?: (params: {
    fileIds: string[];
    rowIndex: number;
    columnId: string;
  }) => void | Promise<void>;
  getRowId?: (row: TData) => string;

  // Optional features
  enableSearch?: boolean;
  enablePaste?: boolean;
  enableColumnSelection?: boolean;
  readOnly?: boolean;
  height?: number;
  stretchColumns?: boolean;
  autoFocus?: boolean | Partial<CellPosition>;
  rowHeight?: RowHeightValue;
  onRowHeightChange?: (rowHeight: RowHeightValue) => void;

  // Header props
  entityName?: string;
  entityIcon?: React.ElementType;
  entityCount?: number;
  showHeader?: boolean;
  /** When true, only shows the view settings row (sort/filter) */
  compactHeader?: boolean;
  views?: Array<{ id: string; name: string }>;
  activeViewId?: string;
  onViewChange?: (viewId: string) => void;
  onViewSettings?: () => void;
  headerActions?: React.ReactNode;

  className?: string;
}

export function EntityGrid<TData>({
  data,
  columns: columnsProp,
  onDataChange,
  onRowAdd,
  onRowsDelete,
  onPaste,
  onFilesUpload,
  onFilesDelete,
  getRowId,
  enableSearch = true,
  enablePaste = true,
  enableColumnSelection = false,
  readOnly = false,
  height = 600,
  stretchColumns = false,
  autoFocus = false,
  rowHeight,
  onRowHeightChange,
  entityName = "Items",
  entityIcon,
  entityCount,
  showHeader = true,
  compactHeader = false,
  views,
  activeViewId,
  onViewChange,
  onViewSettings,
  headerActions,
  className,
}: EntityGridProps<TData>) {
  // Prepend select column
  const columns = React.useMemo<ColumnDef<TData>[]>(
    () => [getDataGridSelectColumn<TData>(), ...columnsProp],
    [columnsProp]
  );

  const dataGrid = useDataGrid({
    data,
    columns,
    onDataChange,
    onRowAdd,
    onRowsDelete,
    onPaste,
    onFilesUpload,
    onFilesDelete,
    getRowId,
    enableSearch,
    enablePaste,
    enableColumnSelection,
    readOnly,
    rowHeight,
    onRowHeightChange,
    autoFocus,
  });

  const displayCount = entityCount ?? data.length;

  return (
    <div className={cn("flex flex-col", className)}>
      {showHeader && (
        <EntityGridHeader
          activeViewId={activeViewId}
          compact={compactHeader}
          entityCount={displayCount}
          entityIcon={entityIcon}
          entityName={entityName}
          onViewChange={onViewChange}
          onViewSettings={onViewSettings}
          table={dataGrid.table}
          views={views}
        >
          {headerActions}
        </EntityGridHeader>
      )}
      <DataGrid {...dataGrid} height={height} stretchColumns={stretchColumns} />
      <DataGridKeyboardShortcuts enableSearch={enableSearch} />
    </div>
  );
}

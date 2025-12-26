"use client";

import type { Table } from "@tanstack/react-table";
import {
  AlignVerticalSpaceAroundIcon,
  ChevronsDownUpIcon,
  EqualIcon,
  MinusIcon,
} from "lucide-react";
import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const rowHeights = [
  {
    label: "Короткая",
    value: "short" as const,
    icon: MinusIcon,
  },
  {
    label: "Средняя",
    value: "medium" as const,
    icon: EqualIcon,
  },
  {
    label: "Высокая",
    value: "tall" as const,
    icon: AlignVerticalSpaceAroundIcon,
  },
  {
    label: "Очень высокая",
    value: "extra-tall" as const,
    icon: ChevronsDownUpIcon,
  },
] as const;

interface DataGridRowHeightMenuProps<TData>
  extends React.ComponentProps<typeof SelectContent> {
  table: Table<TData>;
  disabled?: boolean;
}

export function DataGridRowHeightMenu<TData>({
  table,
  disabled,
  ...props
}: DataGridRowHeightMenuProps<TData>) {
  const rowHeight = table.options.meta?.rowHeight;
  const onRowHeightChange = table.options.meta?.onRowHeightChange;

  const selectedRowHeight = React.useMemo(
    () =>
      rowHeights.find((opt) => opt.value === rowHeight) ?? {
        label: "Короткая",
        value: "short" as const,
        icon: MinusIcon,
      },
    [rowHeight]
  );

  return (
    <Select
      disabled={disabled}
      onValueChange={onRowHeightChange}
      value={rowHeight}
    >
      <SelectTrigger className="[&_svg:nth-child(2)]:hidden" size="sm">
        <SelectValue placeholder="Высота строки">
          <selectedRowHeight.icon />
          {selectedRowHeight.label}
        </SelectValue>
      </SelectTrigger>
      <SelectContent {...props}>
        {rowHeights.map((option) => {
          const OptionIcon = option.icon;
          return (
            <SelectItem key={option.value} value={option.value}>
              <OptionIcon className="size-4" />
              {option.label}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}

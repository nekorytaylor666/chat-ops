"use client";

import { useDirection } from "@radix-ui/react-direction";
import type { Table } from "@tanstack/react-table";
import {
  AlignLeft,
  Calendar,
  Check,
  CheckSquare,
  ChevronRight,
  Hash,
  Link,
  Link2,
  List,
  ChevronDown as ListIcon,
  Plus,
  Type,
} from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type AttributeType =
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

const ATTRIBUTE_TYPES: {
  value: AttributeType;
  label: string;
  icon: React.ElementType;
}[] = [
  { value: "short-text", label: "Текст", icon: Type },
  { value: "long-text", label: "Длинный текст", icon: AlignLeft },
  { value: "number", label: "Число", icon: Hash },
  { value: "checkbox", label: "Чекбокс", icon: CheckSquare },
  { value: "date", label: "Дата", icon: Calendar },
  { value: "select", label: "Выбор", icon: ListIcon },
  { value: "multi-select", label: "Множественный выбор", icon: List },
  { value: "url", label: "URL", icon: Link },
  { value: "relation", label: "Связь", icon: Link2 },
  { value: "relation-multi", label: "Множественная связь", icon: Link2 },
];

interface AddColumnDropdownProps<TData>
  extends React.ComponentProps<typeof PopoverContent> {
  table: Table<TData>;
  onCreateAttribute?: (type: AttributeType) => void;
}

export function AddColumnDropdown<TData>({
  table,
  onCreateAttribute,
  className,
  ...props
}: AddColumnDropdownProps<TData>) {
  const dir = useDirection();
  const [open, setOpen] = React.useState(false);
  const [showTypeSubmenu, setShowTypeSubmenu] = React.useState(false);

  const hiddenColumns = React.useMemo(
    () =>
      table
        .getAllColumns()
        .filter(
          (column) =>
            typeof column.accessorFn !== "undefined" &&
            column.getCanHide() &&
            !column.getIsVisible()
        ),
    [table]
  );

  const handleShowColumn = (columnId: string) => {
    const column = table.getColumn(columnId);
    if (column) {
      column.toggleVisibility(true);
    }
    setOpen(false);
  };

  const handleCreateAttribute = (type: AttributeType) => {
    onCreateAttribute?.(type);
    setOpen(false);
    setShowTypeSubmenu(false);
  };

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button
          aria-label="Add column"
          className="h-full w-full justify-start gap-2 rounded-none border-0 px-3 font-normal text-muted-foreground hover:text-foreground"
          dir={dir}
          role="combobox"
          size="sm"
          variant="ghost"
        >
          <Plus className="size-4" />
          Добавить колонку
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className={cn("w-56 p-0", className)}
        dir={dir}
        {...props}
      >
        {showTypeSubmenu ? (
          <Command>
            <CommandList>
              <CommandGroup heading="Выберите тип атрибута">
                <CommandItem
                  className="text-muted-foreground"
                  onSelect={() => setShowTypeSubmenu(false)}
                >
                  <ChevronRight className="size-4 rotate-180" />
                  Назад
                </CommandItem>
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup>
                {ATTRIBUTE_TYPES.map(({ value, label, icon: Icon }) => (
                  <CommandItem
                    key={value}
                    onSelect={() => handleCreateAttribute(value)}
                  >
                    <Icon className="size-4 text-muted-foreground" />
                    {label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        ) : (
          <Command>
            <CommandInput placeholder="Поиск атрибутов..." />
            <CommandList>
              <CommandEmpty>Атрибуты не найдены.</CommandEmpty>
              {hiddenColumns.length > 0 && (
                <CommandGroup heading="Скрытые колонки">
                  {hiddenColumns.map((column) => (
                    <CommandItem
                      key={column.id}
                      onSelect={() => handleShowColumn(column.id)}
                    >
                      <span className="truncate">
                        {column.columnDef.meta?.label ?? column.id}
                      </span>
                      <Check className="ms-auto size-4 shrink-0 opacity-0" />
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              {hiddenColumns.length > 0 && <CommandSeparator />}
              <CommandGroup heading="Тип">
                <CommandItem
                  className="justify-between"
                  onSelect={() => setShowTypeSubmenu(true)}
                >
                  <span className="flex items-center gap-2">
                    <Plus className="size-4" />
                    Создать новый атрибут
                  </span>
                  <ChevronRight className="size-4" />
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        )}
      </PopoverContent>
    </Popover>
  );
}

export type { AttributeType };

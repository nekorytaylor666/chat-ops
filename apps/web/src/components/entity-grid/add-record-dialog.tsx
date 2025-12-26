"use client";

import { CalendarIcon, Check, Loader2, X } from "lucide-react";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useRelationRecords as useRelationRecordsHook } from "@/hooks/use-relation-records";
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

interface SelectOption {
  label: string;
  value: string;
  color?: string;
}

interface AttributeConfig {
  options?: SelectOption[];
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
  description?: string | null;
  type: AttributeType;
  isRequired: boolean;
  isUnique: boolean;
  isSystem: boolean;
  order: number;
  defaultValue?: unknown;
  config?: AttributeConfig | unknown;
}

interface Entity {
  id: string;
  slug: string;
  singularName: string;
  pluralName: string;
  attributes: Attribute[];
}

interface AddRecordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entity: Entity;
  onSubmit: (values: Record<string, unknown>) => void;
  isPending?: boolean;
}

function parseAttributeConfig(config: unknown): AttributeConfig {
  if (!config || typeof config !== "object") {
    return {};
  }
  const c = config as Record<string, unknown>;
  return {
    options: Array.isArray(c.options)
      ? (c.options as SelectOption[])
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

function formatDateForDisplay(value: string): string {
  if (!value) return "";
  try {
    const date = new Date(value);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return value;
  }
}

export function AddRecordDialog({
  open,
  onOpenChange,
  entity,
  onSubmit,
  isPending = false,
}: AddRecordDialogProps) {
  const [formValues, setFormValues] = React.useState<Record<string, unknown>>(
    {}
  );

  // Filter out system attributes and sort by order
  const nonSystemAttributes = React.useMemo(
    () =>
      entity.attributes
        .filter((attr) => !attr.isSystem)
        .sort((a, b) => a.order - b.order),
    [entity.attributes]
  );

  // Initialize form values when dialog opens
  React.useEffect(() => {
    if (open) {
      const initialValues: Record<string, unknown> = {};
      for (const attr of nonSystemAttributes) {
        if (attr.defaultValue !== undefined && attr.defaultValue !== null) {
          initialValues[attr.slug] = attr.defaultValue;
        } else if (attr.type === "checkbox") {
          initialValues[attr.slug] = false;
        } else if (attr.type === "multi-select") {
          initialValues[attr.slug] = [];
        }
      }
      setFormValues(initialValues);
    }
  }, [open, nonSystemAttributes]);

  const updateValue = React.useCallback((slug: string, value: unknown) => {
    setFormValues((prev) => ({ ...prev, [slug]: value }));
  }, []);

  // Check if all required fields have values
  const isValid = React.useMemo(() => {
    for (const attr of nonSystemAttributes) {
      if (attr.isRequired) {
        const value = formValues[attr.slug];
        if (value === undefined || value === null || value === "") {
          return false;
        }
        if (Array.isArray(value) && value.length === 0) {
          return false;
        }
      }
    }
    return true;
  }, [nonSystemAttributes, formValues]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || isPending) return;
    onSubmit(formValues);
  };

  const renderField = (attr: Attribute) => {
    const value = formValues[attr.slug];
    const config = parseAttributeConfig(attr.config);

    switch (attr.type) {
      case "short-text":
        return (
          <Input
            onChange={(e) => updateValue(attr.slug, e.target.value)}
            placeholder={`Введите ${attr.name.toLowerCase()}`}
            value={(value as string) ?? ""}
          />
        );

      case "long-text":
        return (
          <Textarea
            onChange={(e) => updateValue(attr.slug, e.target.value)}
            placeholder={`Введите ${attr.name.toLowerCase()}`}
            rows={3}
            value={(value as string) ?? ""}
          />
        );

      case "number":
        return (
          <Input
            max={config.max}
            min={config.min}
            onChange={(e) =>
              updateValue(
                attr.slug,
                e.target.value ? Number(e.target.value) : undefined
              )
            }
            placeholder={`Введите ${attr.name.toLowerCase()}`}
            step={config.step}
            type="number"
            value={(value as number) ?? ""}
          />
        );

      case "checkbox":
        return (
          <div className="flex items-center gap-2">
            <Checkbox
              checked={(value as boolean) ?? false}
              id={`field-${attr.slug}`}
              onCheckedChange={(checked) =>
                updateValue(attr.slug, checked === true)
              }
            />
            <label
              className="text-muted-foreground text-sm"
              htmlFor={`field-${attr.slug}`}
            >
              Включить эту опцию
            </label>
          </div>
        );

      case "date":
        return (
          <DateField
            onChange={(v) => updateValue(attr.slug, v)}
            value={(value as string) ?? ""}
          />
        );

      case "url":
        return (
          <Input
            onChange={(e) => updateValue(attr.slug, e.target.value)}
            placeholder="https://пример.com"
            type="url"
            value={(value as string) ?? ""}
          />
        );

      case "select":
        return (
          <Select
            onValueChange={(v) => updateValue(attr.slug, v)}
            value={(value as string) ?? ""}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={`Выберите ${attr.name.toLowerCase()}`}
              />
            </SelectTrigger>
            <SelectContent>
              {config.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "multi-select":
        return (
          <MultiSelectField
            onChange={(v) => updateValue(attr.slug, v)}
            options={config.options ?? []}
            placeholder={`Выберите ${attr.name.toLowerCase()}`}
            value={(value as string[]) ?? []}
          />
        );

      case "relation":
        return (
          <RelationField
            name={attr.name}
            onChange={(v) => updateValue(attr.slug, v)}
            targetEntityId={config.targetEntityId ?? ""}
            value={(value as string) ?? ""}
          />
        );

      case "relation-multi":
        return (
          <RelationMultiField
            name={attr.name}
            onChange={(v) => updateValue(attr.slug, v)}
            targetEntityId={config.targetEntityId ?? ""}
            value={(value as string[]) ?? []}
          />
        );

      default:
        return (
          <Input
            onChange={(e) => updateValue(attr.slug, e.target.value)}
            placeholder={`Введите ${attr.name.toLowerCase()}`}
            value={(value as string) ?? ""}
          />
        );
    }
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Добавить {entity.singularName}</DialogTitle>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {nonSystemAttributes.map((attr) => (
            <div className="space-y-2" key={attr.id}>
              <Label htmlFor={`field-${attr.slug}`}>
                {attr.name}
                {attr.isRequired && (
                  <span className="ml-1 text-destructive">*</span>
                )}
              </Label>
              {attr.description && (
                <p className="text-muted-foreground text-xs">
                  {attr.description}
                </p>
              )}
              {renderField(attr)}
            </div>
          ))}

          {nonSystemAttributes.length === 0 && (
            <p className="py-4 text-center text-muted-foreground text-sm">
              Для этой сущности не определены атрибуты.
            </p>
          )}

          <DialogFooter className="pt-4">
            <Button
              onClick={() => onOpenChange(false)}
              type="button"
              variant="outline"
            >
              Отмена
            </Button>
            <Button disabled={!isValid || isPending} type="submit">
              {isPending && <Loader2 className="size-4 animate-spin" />}
              Создать {entity.singularName}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Date picker field component
function DateField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const selectedDate = value ? new Date(value) : undefined;

  const onDateSelect = (date: Date | undefined) => {
    if (!date) return;
    const formattedDate = date.toISOString().split("T")[0] ?? "";
    onChange(formattedDate);
    setOpen(false);
  };

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground"
          )}
          variant="outline"
        >
          <CalendarIcon className="mr-2 size-4" />
          {value ? formatDateForDisplay(value) : "Выберите дату"}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          autoFocus
          defaultMonth={selectedDate ?? new Date()}
          mode="single"
          onSelect={onDateSelect}
          selected={selectedDate}
        />
      </PopoverContent>
    </Popover>
  );
}

// Multi-select field component
function MultiSelectField({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string[];
  onChange: (value: string[]) => void;
  options: SelectOption[];
  placeholder: string;
}) {
  const [open, setOpen] = React.useState(false);

  const toggleOption = (optionValue: string) => {
    const newValues = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue];
    onChange(newValues);
  };

  const removeOption = (optionValue: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter((v) => v !== optionValue));
  };

  const selectedLabels = value
    .map((v) => options.find((o) => o.value === v)?.label ?? v)
    .slice(0, 3);

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button
          className="h-auto min-h-9 w-full justify-start px-3 py-2 font-normal"
          variant="outline"
        >
          {value.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {selectedLabels.map((label, i) => (
                <Badge className="gap-1" key={value[i]} variant="secondary">
                  {label}
                  <X
                    className="size-3 cursor-pointer"
                    onClick={(e) => removeOption(value[i], e)}
                  />
                </Badge>
              ))}
              {value.length > 3 && (
                <Badge variant="secondary">+{value.length - 3} ещё</Badge>
              )}
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Поиск опций..." />
          <CommandList>
            <CommandEmpty>Опции не найдены.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  onSelect={() => toggleOption(option.value)}
                >
                  <div
                    className={cn(
                      "mr-2 flex size-4 items-center justify-center rounded-sm border border-primary",
                      value.includes(option.value)
                        ? "bg-primary text-primary-foreground"
                        : "opacity-50"
                    )}
                  >
                    {value.includes(option.value) && (
                      <Check className="size-3" />
                    )}
                  </div>
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// Relation field component (single relation)
function RelationField({
  value,
  onChange,
  targetEntityId,
  name,
}: {
  value: string;
  onChange: (value: string) => void;
  targetEntityId: string;
  name: string;
}) {
  const [open, setOpen] = React.useState(false);

  const { data: targetRecordsData } = useRelationRecordsHook({
    targetEntityId,
    enabled: !!targetEntityId,
  });

  const availableRecords = React.useMemo(() => {
    if (!targetRecordsData) return [];
    return targetRecordsData.map(
      (record: { id: string; values: Record<string, unknown> }) => ({
        id: record.id,
        name: (record.values?.name as string) ?? "Unnamed",
      })
    );
  }, [targetRecordsData]);

  const selectedRecord = availableRecords.find(
    (r: { id: string }) => r.id === value
  );

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground"
          )}
          variant="outline"
        >
          {selectedRecord
            ? selectedRecord.name
            : `Выберите ${name.toLowerCase()}`}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Поиск записей..." />
          <CommandList>
            <CommandEmpty>Записи не найдены.</CommandEmpty>
            <CommandGroup>
              {availableRecords.map((record: { id: string; name: string }) => (
                <CommandItem
                  key={record.id}
                  onSelect={() => {
                    onChange(record.id);
                    setOpen(false);
                  }}
                >
                  <div
                    className={cn(
                      "mr-2 flex size-4 items-center justify-center rounded-full border border-primary",
                      value === record.id
                        ? "bg-primary text-primary-foreground"
                        : "opacity-50"
                    )}
                  >
                    {value === record.id && <Check className="size-3" />}
                  </div>
                  {record.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// Relation multi field component (multiple relations)
function RelationMultiField({
  value,
  onChange,
  targetEntityId,
  name,
}: {
  value: string[];
  onChange: (value: string[]) => void;
  targetEntityId: string;
  name: string;
}) {
  const [open, setOpen] = React.useState(false);

  const { data: targetRecordsData } = useRelationRecordsHook({
    targetEntityId,
    enabled: !!targetEntityId,
  });

  const availableRecords = React.useMemo(() => {
    if (!targetRecordsData) return [];
    return targetRecordsData.map(
      (record: { id: string; values: Record<string, unknown> }) => ({
        id: record.id,
        name: (record.values?.name as string) ?? "Unnamed",
      })
    );
  }, [targetRecordsData]);

  const toggleRecord = (recordId: string) => {
    const newValues = value.includes(recordId)
      ? value.filter((v) => v !== recordId)
      : [...value, recordId];
    onChange(newValues);
  };

  const removeRecord = (recordId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter((v) => v !== recordId));
  };

  const selectedRecords = value
    .map((id) => availableRecords.find((r: { id: string }) => r.id === id))
    .filter((r): r is { id: string; name: string } => r !== undefined)
    .slice(0, 3);

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button
          className="h-auto min-h-9 w-full justify-start px-3 py-2 font-normal"
          variant="outline"
        >
          {value.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {selectedRecords.map((record) => (
                <Badge className="gap-1" key={record.id} variant="secondary">
                  {record.name}
                  <X
                    className="size-3 cursor-pointer"
                    onClick={(e) => removeRecord(record.id, e)}
                  />
                </Badge>
              ))}
              {value.length > 3 && (
                <Badge variant="secondary">+{value.length - 3} ещё</Badge>
              )}
            </div>
          ) : (
            <span className="text-muted-foreground">
              Выберите {name.toLowerCase()}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Поиск записей..." />
          <CommandList>
            <CommandEmpty>Записи не найдены.</CommandEmpty>
            <CommandGroup>
              {availableRecords.map((record: { id: string; name: string }) => (
                <CommandItem
                  key={record.id}
                  onSelect={() => toggleRecord(record.id)}
                >
                  <div
                    className={cn(
                      "mr-2 flex size-4 items-center justify-center rounded-sm border border-primary",
                      value.includes(record.id)
                        ? "bg-primary text-primary-foreground"
                        : "opacity-50"
                    )}
                  >
                    {value.includes(record.id) && <Check className="size-3" />}
                  </div>
                  {record.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

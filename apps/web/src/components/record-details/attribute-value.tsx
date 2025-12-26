"use client";

import { Check, X } from "lucide-react";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { useRelationRecords } from "@/hooks/use-relation-records";
import { useResolveRelations } from "@/hooks/use-resolve-relations";
import { cn } from "@/lib/utils";

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

interface AttributeValueProps {
  attribute: Attribute;
  value: unknown;
  onChange?: (value: unknown) => void;
  readOnly?: boolean;
  className?: string;
  compact?: boolean;
}

export function AttributeValue({
  attribute,
  value,
  onChange,
  readOnly = false,
  className,
  compact = false,
}: AttributeValueProps) {
  const config = parseConfig(attribute.config);

  switch (attribute.type) {
    case "short-text":
    case "url":
      return (
        <ShortTextValue
          className={className}
          compact={compact}
          onChange={onChange}
          readOnly={readOnly}
          type={attribute.type}
          value={value as string}
        />
      );
    case "long-text":
      return (
        <LongTextValue
          className={className}
          compact={compact}
          onChange={onChange}
          readOnly={readOnly}
          value={value as string}
        />
      );
    case "number":
      return (
        <NumberValue
          className={className}
          compact={compact}
          max={config.max}
          min={config.min}
          onChange={onChange}
          readOnly={readOnly}
          step={config.step}
          value={value as number}
        />
      );
    case "checkbox":
      return (
        <CheckboxValue
          className={className}
          onChange={onChange}
          readOnly={readOnly}
          value={value as boolean}
        />
      );
    case "date":
      return (
        <DateValue
          className={className}
          compact={compact}
          onChange={onChange}
          readOnly={readOnly}
          value={value as string}
        />
      );
    case "select":
      return (
        <SelectValue
          className={className}
          compact={compact}
          onChange={onChange}
          options={config.options ?? []}
          readOnly={readOnly}
          value={value as string}
        />
      );
    case "multi-select":
      return (
        <MultiSelectValue
          className={className}
          compact={compact}
          onChange={onChange}
          options={config.options ?? []}
          readOnly={readOnly}
          value={value as string[]}
        />
      );
    case "relation":
      return (
        <RelationValue
          className={className}
          compact={compact}
          onChange={onChange}
          readOnly={readOnly}
          targetEntityId={config.targetEntityId ?? ""}
          targetEntitySlug={config.targetEntitySlug ?? ""}
          value={value as string}
        />
      );
    case "relation-multi":
      return (
        <RelationMultiValue
          className={className}
          compact={compact}
          onChange={onChange}
          readOnly={readOnly}
          targetEntityId={config.targetEntityId ?? ""}
          targetEntitySlug={config.targetEntitySlug ?? ""}
          value={value as string[]}
        />
      );
    default:
      return <span className={className}>{String(value ?? "")}</span>;
  }
}

// Short Text / URL Value
function ShortTextValue({
  value,
  onChange,
  readOnly,
  className,
  compact,
  type,
}: {
  value: string;
  onChange?: (value: unknown) => void;
  readOnly: boolean;
  className?: string;
  compact: boolean;
  type: "short-text" | "url";
}) {
  const [localValue, setLocalValue] = React.useState(value ?? "");
  const [isEditing, setIsEditing] = React.useState(false);

  React.useEffect(() => {
    setLocalValue(value ?? "");
  }, [value]);

  const handleBlur = () => {
    setIsEditing(false);
    if (localValue !== value) {
      onChange?.(localValue || null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleBlur();
    } else if (e.key === "Escape") {
      setLocalValue(value ?? "");
      setIsEditing(false);
    }
  };

  if (readOnly || !onChange) {
    if (type === "url" && localValue) {
      return (
        <a
          className={cn(
            "text-primary underline-offset-2 hover:underline",
            className
          )}
          href={
            localValue.startsWith("http") ? localValue : `https://${localValue}`
          }
          rel="noopener noreferrer"
          target="_blank"
        >
          {localValue}
        </a>
      );
    }
    return (
      <span className={cn("text-foreground", className)}>
        {localValue || (
          <span className="text-muted-foreground">Set a value...</span>
        )}
      </span>
    );
  }

  if (isEditing) {
    return (
      <Input
        autoFocus
        className={cn("h-8", compact && "h-7 text-sm", className)}
        onBlur={handleBlur}
        onChange={(e) => setLocalValue(e.target.value)}
        onKeyDown={handleKeyDown}
        type={type === "url" ? "url" : "text"}
        value={localValue}
      />
    );
  }

  return (
    <button
      className={cn(
        "min-h-[32px] w-full cursor-text rounded-md border border-transparent px-3 py-1.5 text-left text-sm transition-colors hover:border-input hover:bg-accent/50",
        compact && "min-h-[28px] px-2 py-1",
        className
      )}
      onClick={() => setIsEditing(true)}
      type="button"
    >
      {localValue || (
        <span className="text-muted-foreground">Set a value...</span>
      )}
    </button>
  );
}

// Long Text Value
function LongTextValue({
  value,
  onChange,
  readOnly,
  className,
  compact,
}: {
  value: string;
  onChange?: (value: unknown) => void;
  readOnly: boolean;
  className?: string;
  compact: boolean;
}) {
  const [localValue, setLocalValue] = React.useState(value ?? "");
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    setLocalValue(value ?? "");
  }, [value]);

  const handleSave = () => {
    setIsOpen(false);
    if (localValue !== value) {
      onChange?.(localValue || null);
    }
  };

  if (readOnly || !onChange) {
    return (
      <span className={cn("line-clamp-3 text-foreground", className)}>
        {localValue || (
          <span className="text-muted-foreground">Set a value...</span>
        )}
      </span>
    );
  }

  return (
    <Popover onOpenChange={setIsOpen} open={isOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "min-h-[32px] w-full cursor-text rounded-md border border-transparent px-3 py-1.5 text-left text-sm transition-colors hover:border-input hover:bg-accent/50",
            compact && "min-h-[28px] px-2 py-1",
            className
          )}
          type="button"
        >
          <span className="line-clamp-2">
            {localValue || (
              <span className="text-muted-foreground">Set a value...</span>
            )}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 p-2">
        <Textarea
          autoFocus
          className="min-h-[120px] resize-none"
          onChange={(e) => setLocalValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setLocalValue(value ?? "");
              setIsOpen(false);
            } else if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
              handleSave();
            }
          }}
          placeholder="Enter text..."
          value={localValue}
        />
        <div className="mt-2 flex justify-end gap-2">
          <button
            className="text-muted-foreground text-xs hover:text-foreground"
            onClick={() => {
              setLocalValue(value ?? "");
              setIsOpen(false);
            }}
            type="button"
          >
            Cancel
          </button>
          <button
            className="text-primary text-xs hover:text-primary/80"
            onClick={handleSave}
            type="button"
          >
            Save
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Number Value
function NumberValue({
  value,
  onChange,
  readOnly,
  className,
  compact,
  min,
  max,
  step,
}: {
  value: number;
  onChange?: (value: unknown) => void;
  readOnly: boolean;
  className?: string;
  compact: boolean;
  min?: number;
  max?: number;
  step?: number;
}) {
  const [localValue, setLocalValue] = React.useState(String(value ?? ""));
  const [isEditing, setIsEditing] = React.useState(false);

  React.useEffect(() => {
    setLocalValue(String(value ?? ""));
  }, [value]);

  const handleBlur = () => {
    setIsEditing(false);
    const numValue = localValue === "" ? null : Number(localValue);
    if (numValue !== value) {
      onChange?.(numValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleBlur();
    } else if (e.key === "Escape") {
      setLocalValue(String(value ?? ""));
      setIsEditing(false);
    }
  };

  const displayValue =
    value != null ? (
      value.toLocaleString()
    ) : (
      <span className="text-muted-foreground">Set a value...</span>
    );

  if (readOnly || !onChange) {
    return (
      <span className={cn("text-foreground", className)}>{displayValue}</span>
    );
  }

  if (isEditing) {
    return (
      <Input
        autoFocus
        className={cn("h-8", compact && "h-7 text-sm", className)}
        max={max}
        min={min}
        onBlur={handleBlur}
        onChange={(e) => setLocalValue(e.target.value)}
        onKeyDown={handleKeyDown}
        step={step}
        type="number"
      />
    );
  }

  return (
    <button
      className={cn(
        "min-h-[32px] w-full cursor-text rounded-md border border-transparent px-3 py-1.5 text-left text-sm transition-colors hover:border-input hover:bg-accent/50",
        compact && "min-h-[28px] px-2 py-1",
        className
      )}
      onClick={() => setIsEditing(true)}
      type="button"
    >
      {displayValue}
    </button>
  );
}

// Checkbox Value
function CheckboxValue({
  value,
  onChange,
  readOnly,
  className,
}: {
  value: boolean;
  onChange?: (value: unknown) => void;
  readOnly: boolean;
  className?: string;
}) {
  return (
    <Checkbox
      checked={Boolean(value)}
      className={className}
      disabled={readOnly || !onChange}
      onCheckedChange={(checked) => onChange?.(checked)}
    />
  );
}

// Date Value
function DateValue({
  value,
  onChange,
  readOnly,
  className,
  compact,
}: {
  value: string;
  onChange?: (value: unknown) => void;
  readOnly: boolean;
  className?: string;
  compact: boolean;
}) {
  const [isOpen, setIsOpen] = React.useState(false);

  const selectedDate = value ? new Date(value) : undefined;
  const displayValue = selectedDate ? (
    selectedDate.toLocaleDateString()
  ) : (
    <span className="text-muted-foreground">Set a date...</span>
  );

  if (readOnly || !onChange) {
    return (
      <span className={cn("text-foreground", className)}>{displayValue}</span>
    );
  }

  return (
    <Popover onOpenChange={setIsOpen} open={isOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "min-h-[32px] w-full cursor-pointer rounded-md border border-transparent px-3 py-1.5 text-left text-sm transition-colors hover:border-input hover:bg-accent/50",
            compact && "min-h-[28px] px-2 py-1",
            className
          )}
          type="button"
        >
          {displayValue}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          autoFocus
          captionLayout="dropdown"
          defaultMonth={selectedDate ?? new Date()}
          mode="single"
          onSelect={(date) => {
            if (date) {
              onChange?.(date.toISOString().split("T")[0]);
            }
            setIsOpen(false);
          }}
          selected={selectedDate}
        />
      </PopoverContent>
    </Popover>
  );
}

// Select Value
function SelectValue({
  value,
  onChange,
  readOnly,
  options,
  className,
  compact,
}: {
  value: string;
  onChange?: (value: unknown) => void;
  readOnly: boolean;
  options: Array<{ label: string; value: string; color?: string }>;
  className?: string;
  compact: boolean;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const selectedOption = options.find((opt) => opt.value === value);

  if (readOnly || !onChange) {
    return selectedOption ? (
      <Badge className={cn("px-1.5 py-px", className)} variant="secondary">
        {selectedOption.label}
      </Badge>
    ) : (
      <span className={cn("text-muted-foreground", className)}>
        Set a value...
      </span>
    );
  }

  return (
    <Popover onOpenChange={setIsOpen} open={isOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "min-h-[32px] w-full cursor-pointer rounded-md border border-transparent px-3 py-1.5 text-left text-sm transition-colors hover:border-input hover:bg-accent/50",
            compact && "min-h-[28px] px-2 py-1",
            className
          )}
          type="button"
        >
          {selectedOption ? (
            <Badge className="px-1.5 py-px" variant="secondary">
              {selectedOption.label}
            </Badge>
          ) : (
            <span className="text-muted-foreground">Set a value...</span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-56 p-0">
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandList>
            <CommandEmpty>No options found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  onSelect={() => {
                    onChange?.(option.value);
                    setIsOpen(false);
                  }}
                  value={option.label}
                >
                  <Check
                    className={cn(
                      "mr-2 size-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
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

// Multi-Select Value
function MultiSelectValue({
  value,
  onChange,
  readOnly,
  options,
  className,
  compact,
}: {
  value: string[];
  onChange?: (value: unknown) => void;
  readOnly: boolean;
  options: Array<{ label: string; value: string; color?: string }>;
  className?: string;
  compact: boolean;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const selectedValues = value ?? [];

  const toggleValue = (val: string) => {
    const newValues = selectedValues.includes(val)
      ? selectedValues.filter((v) => v !== val)
      : [...selectedValues, val];
    onChange?.(newValues);
  };

  const displayLabels = selectedValues
    .map((val) => options.find((opt) => opt.value === val)?.label)
    .filter(Boolean);

  if (readOnly || !onChange) {
    return displayLabels.length > 0 ? (
      <div className={cn("flex flex-wrap gap-1", className)}>
        {displayLabels.map((label, i) => (
          <Badge
            className="px-1.5 py-px"
            key={selectedValues[i]}
            variant="secondary"
          >
            {label}
          </Badge>
        ))}
      </div>
    ) : (
      <span className={cn("text-muted-foreground", className)}>
        Set values...
      </span>
    );
  }

  return (
    <Popover onOpenChange={setIsOpen} open={isOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "min-h-[32px] w-full cursor-pointer rounded-md border border-transparent px-3 py-1.5 text-left text-sm transition-colors hover:border-input hover:bg-accent/50",
            compact && "min-h-[28px] px-2 py-1",
            className
          )}
          type="button"
        >
          {displayLabels.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {displayLabels.map((label, i) => (
                <Badge
                  className="px-1.5 py-px"
                  key={selectedValues[i]}
                  variant="secondary"
                >
                  {label}
                </Badge>
              ))}
            </div>
          ) : (
            <span className="text-muted-foreground">Set values...</span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-56 p-0">
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandList>
            <CommandEmpty>No options found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  onSelect={() => toggleValue(option.value)}
                  value={option.label}
                >
                  <div
                    className={cn(
                      "mr-2 flex size-4 items-center justify-center rounded-sm border border-primary",
                      selectedValues.includes(option.value)
                        ? "bg-primary text-primary-foreground"
                        : "opacity-50 [&_svg]:invisible"
                    )}
                  >
                    <Check className="size-3" />
                  </div>
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
            {selectedValues.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    className="justify-center text-muted-foreground"
                    onSelect={() => onChange?.([])}
                  >
                    Clear all
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// Relation Value
function RelationValue({
  value,
  onChange,
  readOnly,
  targetEntityId,
  targetEntitySlug,
  className,
  compact,
}: {
  value: string;
  onChange?: (value: unknown) => void;
  readOnly: boolean;
  targetEntityId: string;
  targetEntitySlug: string;
  className?: string;
  compact: boolean;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");

  const { data: targetRecords } = useRelationRecords({
    targetEntityId,
    enabled: isOpen && !!targetEntityId,
  });

  const recordIds = React.useMemo(() => (value ? [value] : []), [value]);
  const { data: resolvedRecords } = useResolveRelations(recordIds);

  const resolvedRecord = value ? resolvedRecords?.[value] : null;
  const availableRecords = React.useMemo(() => {
    if (!targetRecords) return [];
    return targetRecords.map(
      (record: { id: string; values: Record<string, unknown> }) => ({
        id: record.id,
        name: (record.values?.name as string) ?? "Unnamed",
      })
    );
  }, [targetRecords]);

  const filteredRecords = React.useMemo(() => {
    if (!searchValue) return availableRecords;
    const searchLower = searchValue.toLowerCase();
    return availableRecords.filter((record) =>
      record.name.toLowerCase().includes(searchLower)
    );
  }, [availableRecords, searchValue]);

  if (readOnly || !onChange) {
    return resolvedRecord ? (
      <a
        className={cn(
          "text-primary underline-offset-2 hover:underline",
          className
        )}
        href={`/entities/${targetEntitySlug || resolvedRecord.entitySlug}/${value}`}
      >
        {resolvedRecord.name}
      </a>
    ) : value ? (
      <span className={cn("text-muted-foreground", className)}>Loading...</span>
    ) : (
      <span className={cn("text-muted-foreground", className)}>
        Set a value...
      </span>
    );
  }

  return (
    <Popover onOpenChange={setIsOpen} open={isOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "min-h-[32px] w-full cursor-pointer rounded-md border border-transparent px-3 py-1.5 text-left text-sm transition-colors hover:border-input hover:bg-accent/50",
            compact && "min-h-[28px] px-2 py-1",
            className
          )}
          type="button"
        >
          {resolvedRecord ? (
            <span className="text-primary">{resolvedRecord.name}</span>
          ) : value ? (
            <span className="text-muted-foreground">Loading...</span>
          ) : (
            <span className="text-muted-foreground">Set a value...</span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-0">
        <Command>
          <CommandInput
            onValueChange={setSearchValue}
            placeholder="Search records..."
            value={searchValue}
          />
          <CommandList>
            <CommandEmpty>No records found.</CommandEmpty>
            {value && (
              <>
                <CommandGroup>
                  <CommandItem
                    onSelect={() => {
                      onChange?.(null);
                      setIsOpen(false);
                    }}
                    value="__clear__"
                  >
                    <X className="mr-2 size-4" />
                    Clear selection
                  </CommandItem>
                </CommandGroup>
                <CommandSeparator />
              </>
            )}
            <CommandGroup>
              {filteredRecords.map((record) => (
                <CommandItem
                  key={record.id}
                  onSelect={() => {
                    onChange?.(record.id);
                    setIsOpen(false);
                    setSearchValue("");
                  }}
                  value={record.id}
                >
                  <Check
                    className={cn(
                      "mr-2 size-4",
                      value === record.id ? "opacity-100" : "opacity-0"
                    )}
                  />
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

// Relation Multi Value
function RelationMultiValue({
  value,
  onChange,
  readOnly,
  targetEntityId,
  targetEntitySlug,
  className,
  compact,
}: {
  value: string[];
  onChange?: (value: unknown) => void;
  readOnly: boolean;
  targetEntityId: string;
  targetEntitySlug: string;
  className?: string;
  compact: boolean;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");

  const selectedValues = value ?? [];

  const { data: targetRecords } = useRelationRecords({
    targetEntityId,
    enabled: isOpen && !!targetEntityId,
  });

  const { data: resolvedRecords } = useResolveRelations(selectedValues);

  const availableRecords = React.useMemo(() => {
    if (!targetRecords) return [];
    return targetRecords.map(
      (record: { id: string; values: Record<string, unknown> }) => ({
        id: record.id,
        name: (record.values?.name as string) ?? "Unnamed",
      })
    );
  }, [targetRecords]);

  const filteredRecords = React.useMemo(() => {
    if (!searchValue) return availableRecords;
    const searchLower = searchValue.toLowerCase();
    return availableRecords.filter((record) =>
      record.name.toLowerCase().includes(searchLower)
    );
  }, [availableRecords, searchValue]);

  const toggleValue = (recordId: string) => {
    const newValues = selectedValues.includes(recordId)
      ? selectedValues.filter((v) => v !== recordId)
      : [...selectedValues, recordId];
    onChange?.(newValues);
  };

  const displayLabels = selectedValues
    .map((id) => ({
      id,
      name: resolvedRecords?.[id]?.name ?? "Loading...",
      entitySlug: resolvedRecords?.[id]?.entitySlug ?? targetEntitySlug,
    }))
    .filter(Boolean);

  if (readOnly || !onChange) {
    return displayLabels.length > 0 ? (
      <div className={cn("flex flex-wrap gap-1", className)}>
        {displayLabels.map((item) => (
          <a
            className="inline-flex"
            href={`/entities/${item.entitySlug}/${item.id}`}
            key={item.id}
          >
            <Badge
              className="px-1.5 py-px text-primary underline-offset-2 hover:underline"
              variant="secondary"
            >
              {item.name}
            </Badge>
          </a>
        ))}
      </div>
    ) : (
      <span className={cn("text-muted-foreground", className)}>
        Set values...
      </span>
    );
  }

  return (
    <Popover onOpenChange={setIsOpen} open={isOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "min-h-[32px] w-full cursor-pointer rounded-md border border-transparent px-3 py-1.5 text-left text-sm transition-colors hover:border-input hover:bg-accent/50",
            compact && "min-h-[28px] px-2 py-1",
            className
          )}
          type="button"
        >
          {displayLabels.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {displayLabels.map((item) => (
                <Badge
                  className="px-1.5 py-px"
                  key={item.id}
                  variant="secondary"
                >
                  {item.name}
                </Badge>
              ))}
            </div>
          ) : (
            <span className="text-muted-foreground">Set values...</span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-0">
        <Command>
          <CommandInput
            onValueChange={setSearchValue}
            placeholder="Search records..."
            value={searchValue}
          />
          <CommandList>
            <CommandEmpty>No records found.</CommandEmpty>
            {selectedValues.length > 0 && (
              <>
                <CommandGroup>
                  <CommandItem
                    onSelect={() => onChange?.([])}
                    value="__clear_all__"
                  >
                    <X className="mr-2 size-4" />
                    Clear all
                  </CommandItem>
                </CommandGroup>
                <CommandSeparator />
              </>
            )}
            <CommandGroup>
              {filteredRecords.map((record) => (
                <CommandItem
                  key={record.id}
                  onSelect={() => toggleValue(record.id)}
                  value={record.id}
                >
                  <div
                    className={cn(
                      "mr-2 flex size-4 items-center justify-center rounded-sm border border-primary",
                      selectedValues.includes(record.id)
                        ? "bg-primary text-primary-foreground"
                        : "opacity-50 [&_svg]:invisible"
                    )}
                  >
                    <Check className="size-3" />
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

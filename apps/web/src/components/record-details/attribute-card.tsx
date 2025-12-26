"use client";

import { AttributeIcon } from "@/components/record-details/attribute-icon";
import { AttributeValue } from "@/components/record-details/attribute-value";
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

interface AttributeCardProps {
  attribute: Attribute;
  value: unknown;
  onChange?: (value: unknown) => void;
  readOnly?: boolean;
  className?: string;
}

export function AttributeCard({
  attribute,
  value,
  onChange,
  readOnly = false,
  className,
}: AttributeCardProps) {
  return (
    <div
      className={cn(
        "flex min-h-[100px] flex-col rounded-lg border bg-card p-4",
        className
      )}
    >
      {/* Header with attribute name and icon */}
      <div className="mb-2 flex items-center gap-2 text-muted-foreground">
        <span className="truncate text-sm">{attribute.name}</span>
        <AttributeIcon className="size-4 shrink-0" type={attribute.type} />
      </div>

      {/* Value display/edit area */}
      <div className="flex-1">
        <AttributeValue
          attribute={attribute}
          className="w-full"
          onChange={onChange}
          readOnly={readOnly}
          value={value}
        />
      </div>
    </div>
  );
}

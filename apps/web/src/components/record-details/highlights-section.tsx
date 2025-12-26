"use client";

import { LayoutGrid } from "lucide-react";
import { AttributeCard } from "@/components/record-details/attribute-card";
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

interface HighlightsSectionProps {
  attributes: Attribute[];
  values: Record<string, unknown>;
  onValueChange?: (slug: string, value: unknown) => void;
  readOnly?: boolean;
  maxAttributes?: number;
  className?: string;
}

export function HighlightsSection({
  attributes,
  values,
  onValueChange,
  readOnly = false,
  maxAttributes = 9,
  className,
}: HighlightsSectionProps) {
  // Take up to maxAttributes
  const displayedAttributes = attributes.slice(0, maxAttributes);

  return (
    <section className={cn("space-y-4", className)}>
      {/* Section header */}
      <div className="flex items-center gap-2 text-muted-foreground">
        <LayoutGrid className="size-4" />
        <h2 className="font-medium text-sm">Highlights</h2>
      </div>

      {/* Grid of attribute cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {displayedAttributes.map((attribute) => (
          <AttributeCard
            attribute={attribute}
            key={attribute.id}
            onChange={
              onValueChange
                ? (value) => onValueChange(attribute.slug, value)
                : undefined
            }
            readOnly={readOnly}
            value={values[attribute.slug]}
          />
        ))}
      </div>
    </section>
  );
}

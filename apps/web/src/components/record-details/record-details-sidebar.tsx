"use client";

import { ChevronDown, ChevronRight, MessageSquare } from "lucide-react";
import * as React from "react";
import { AttributeIcon } from "@/components/record-details/attribute-icon";
import { AttributeValue } from "@/components/record-details/attribute-value";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

interface RecordDetailsSidebarProps {
  attributes: Attribute[];
  values: Record<string, unknown>;
  onValueChange?: (slug: string, value: unknown) => void;
  readOnly?: boolean;
  className?: string;
}

export function RecordDetailsSidebar({
  attributes,
  values,
  onValueChange,
  readOnly = false,
  className,
}: RecordDetailsSidebarProps) {
  const [detailsOpen, setDetailsOpen] = React.useState(true);
  const [listsOpen, setListsOpen] = React.useState(true);
  const [showAll, setShowAll] = React.useState(false);

  const displayedAttributes = showAll ? attributes : attributes.slice(0, 6);
  const hasMoreAttributes = attributes.length > 6;

  return (
    <aside
      className={cn(
        "flex h-full w-80 shrink-0 flex-col border-l bg-muted/30",
        className
      )}
    >
      {/* Tabs */}
      <Tabs className="flex flex-1 flex-col" defaultValue="details">
        <TabsList className="h-12 justify-start rounded-none border-b bg-transparent px-4">
          <TabsTrigger
            className="rounded-none border-primary/0 border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            value="details"
          >
            Details
          </TabsTrigger>
          <TabsTrigger
            className="gap-1 rounded-none border-primary/0 border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            value="comments"
          >
            <MessageSquare className="size-4" />
            Comments
            <span className="text-muted-foreground">0</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent className="flex-1 overflow-auto p-4" value="details">
          <div className="space-y-4">
            {/* Record Details Section */}
            <Collapsible onOpenChange={setDetailsOpen} open={detailsOpen}>
              <CollapsibleTrigger className="flex w-full items-center gap-2 py-2 text-left">
                {detailsOpen ? (
                  <ChevronDown className="size-4" />
                ) : (
                  <ChevronRight className="size-4" />
                )}
                <span className="font-medium text-sm">Record Details</span>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="space-y-1 pt-2">
                  {displayedAttributes.map((attribute) => (
                    <div
                      className="flex items-start gap-3 rounded-md px-2 py-2 hover:bg-accent/50"
                      key={attribute.id}
                    >
                      <div className="flex min-w-[120px] items-center gap-2 text-muted-foreground">
                        <AttributeIcon
                          className="size-4 shrink-0"
                          type={attribute.type}
                        />
                        <span className="truncate text-sm">
                          {attribute.name}
                        </span>
                      </div>
                      <div className="flex-1">
                        <AttributeValue
                          attribute={attribute}
                          compact
                          onChange={
                            onValueChange
                              ? (value) => onValueChange(attribute.slug, value)
                              : undefined
                          }
                          readOnly={readOnly}
                          value={values[attribute.slug]}
                        />
                      </div>
                    </div>
                  ))}

                  {hasMoreAttributes && (
                    <button
                      className="flex w-full items-center gap-1 px-2 py-2 text-muted-foreground text-sm hover:text-foreground"
                      onClick={() => setShowAll(!showAll)}
                      type="button"
                    >
                      {showAll
                        ? "Show less"
                        : `Show all values (${attributes.length - 6} more)`}
                      <ChevronRight
                        className={cn(
                          "size-3 transition-transform",
                          showAll && "rotate-90"
                        )}
                      />
                    </button>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Lists Section - Placeholder */}
            <Collapsible onOpenChange={setListsOpen} open={listsOpen}>
              <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-left">
                <div className="flex items-center gap-2">
                  {listsOpen ? (
                    <ChevronDown className="size-4" />
                  ) : (
                    <ChevronRight className="size-4" />
                  )}
                  <span className="font-medium text-sm">Lists</span>
                </div>
                <button
                  className="text-muted-foreground text-xs hover:text-foreground"
                  onClick={(e) => e.stopPropagation()}
                  type="button"
                >
                  + Add to list
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="px-6 py-4 text-center">
                  <p className="text-muted-foreground text-sm">
                    This record has not been added to any lists
                  </p>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </TabsContent>

        <TabsContent className="flex-1 overflow-auto p-4" value="comments">
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground text-sm">
              Comments coming soon
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </aside>
  );
}

import { ChevronDown, Pin } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import type { MemoryItem as MemoryItemType } from "@/types/chat";
import { MemoryItem } from "./memory-item";

type MemorySectionProps = {
  title: string;
  subtitle?: string;
  items: MemoryItemType[];
  isPinned?: boolean;
};

export function MemorySection({
  title,
  subtitle,
  items,
  isPinned,
}: MemorySectionProps) {
  return (
    <Collapsible className="group/section" defaultOpen>
      <CollapsibleTrigger
        className={cn(
          "flex w-full items-center gap-2 rounded-md px-2 py-1.5 font-medium text-xs hover:bg-accent",
          isPinned && "text-primary"
        )}
      >
        {isPinned ? <Pin className="size-3" /> : null}
        <span>{title}</span>
        <span className="ml-auto text-muted-foreground">{items.length}</span>
        <ChevronDown className="size-3 text-muted-foreground transition-transform group-data-[state=open]/section:rotate-180" />
      </CollapsibleTrigger>
      {subtitle ? (
        <p className="mb-1 px-2 text-[10px] text-muted-foreground">
          {subtitle}
        </p>
      ) : null}
      <CollapsibleContent className="mt-1 space-y-1">
        {items.map((item) => (
          <MemoryItem item={item} key={item.id} />
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}

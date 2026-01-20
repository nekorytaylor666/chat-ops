import { useParams } from "@tanstack/react-router";
import { ChevronRight, User } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import type { Deal } from "@/types/chat";
import { StageItem } from "./stage-item";

type DealItemProps = {
  deal: Deal;
  isExpanded: boolean;
};

export function DealItem({ deal, isExpanded }: DealItemProps) {
  const params = useParams({ strict: false });
  const currentStageId = params.stageId;

  return (
    <Collapsible className="group/deal" defaultOpen={isExpanded}>
      <CollapsibleTrigger
        className={cn(
          "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent",
          isExpanded && "bg-accent"
        )}
      >
        <ChevronRight className="size-3.5 shrink-0 text-muted-foreground transition-transform group-data-[state=open]/deal:rotate-90" />
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted">
            <User className="size-3.5 text-muted-foreground" />
          </div>
          <div className="min-w-0 flex-1 text-left">
            <div className="truncate font-medium">{deal.name}</div>
            <div className="truncate text-muted-foreground text-xs">
              {deal.clientName}
            </div>
          </div>
          {deal.unreadCount > 0 && (
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
              {deal.unreadCount}
            </span>
          )}
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-0.5 ml-5 space-y-0.5 border-l pl-2">
        {deal.stages.map((stage) => (
          <StageItem
            dealId={deal.id}
            isActive={stage.id === currentStageId}
            key={stage.id}
            stage={stage}
          />
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}

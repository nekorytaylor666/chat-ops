import { Link } from "@tanstack/react-router";
import { Check, Circle, CircleDot } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Stage } from "@/types/chat";

type StageItemProps = {
  stage: Stage;
  dealId: string;
  isActive: boolean;
};

export function StageItem({ stage, dealId, isActive }: StageItemProps) {
  const StatusIcon = {
    completed: Check,
    active: CircleDot,
    pending: Circle,
  }[stage.status];

  const statusColor = {
    completed: "text-green-500",
    active: "text-blue-500",
    pending: "text-muted-foreground",
  }[stage.status];

  return (
    <Link
      className={cn(
        "flex items-center gap-2 rounded-md px-2 py-1 text-sm hover:bg-accent",
        isActive && "bg-accent font-medium"
      )}
      params={{ dealId, stageId: stage.id }}
      to="/deals/$dealId/$stageId"
    >
      <StatusIcon className={cn("size-3.5 shrink-0", statusColor)} />
      <span className="min-w-0 flex-1 truncate">{stage.name}</span>
      {stage.unreadCount > 0 && (
        <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-primary text-[9px] text-primary-foreground">
          {stage.unreadCount}
        </span>
      )}
    </Link>
  );
}

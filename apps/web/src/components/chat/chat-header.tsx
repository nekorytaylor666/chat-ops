import { Check, CircleDot, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Deal, Stage } from "@/types/chat";

type ChatHeaderProps = {
  deal: Deal;
  stage: Stage;
};

export function ChatHeader({ deal, stage }: ChatHeaderProps) {
  const statusConfig = {
    completed: {
      icon: Check,
      label: "Completed",
      variant: "default" as const,
      className: "bg-green-500/10 text-green-600 border-green-500/20",
    },
    active: {
      icon: CircleDot,
      label: "Active",
      variant: "default" as const,
      className: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    },
    pending: {
      icon: CircleDot,
      label: "Pending",
      variant: "secondary" as const,
      className: "",
    },
  };

  const config = statusConfig[stage.status];
  const StatusIcon = config.icon;

  return (
    <header className="flex flex-col gap-2 border-b bg-background px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="font-semibold text-lg">{stage.name}</h1>
          <Badge
            className={cn("gap-1", config.className)}
            variant={config.variant}
          >
            <StatusIcon className="size-3" />
            {config.label}
          </Badge>
        </div>
        <div className="text-muted-foreground text-sm">
          {deal.name} &middot; {deal.clientName}
        </div>
      </div>
      <div className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2 text-sm">
        <Target className="size-4 shrink-0 text-primary" />
        <span className="text-muted-foreground">Target:</span>
        <span>{stage.target}</span>
      </div>
    </header>
  );
}

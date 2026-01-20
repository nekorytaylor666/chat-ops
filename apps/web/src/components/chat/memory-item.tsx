import {
  Calendar,
  CheckCircle,
  DollarSign,
  Heart,
  Pin,
  Sparkles,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { MemoryItem as MemoryItemType, MemoryType } from "@/types/chat";

type MemoryItemProps = {
  item: MemoryItemType;
};

const typeConfig: Record<MemoryType, { icon: typeof User; className: string }> =
  {
    client: { icon: User, className: "text-blue-500" },
    budget: { icon: DollarSign, className: "text-green-500" },
    preference: { icon: Heart, className: "text-pink-500" },
    timeline: { icon: Calendar, className: "text-orange-500" },
    requirement: { icon: CheckCircle, className: "text-purple-500" },
  };

export function MemoryItem({ item }: MemoryItemProps) {
  const config = typeConfig[item.type];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "group relative rounded-md border bg-background p-2 transition-colors hover:border-primary/30",
        item.isNew && "border-primary/50 shadow-primary/10 shadow-sm"
      )}
    >
      {item.isNew ? (
        <div className="absolute -top-1.5 right-2 flex items-center gap-1 rounded-full bg-primary px-1.5 py-0.5 text-[9px] text-primary-foreground">
          <Sparkles className="size-2.5" />
          New
        </div>
      ) : null}
      {item.isPinned ? (
        <Pin className="absolute top-2 right-2 size-3 text-primary opacity-50" />
      ) : null}
      <div className="flex items-start gap-2">
        <div
          className={cn(
            "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded",
            config.className,
            "bg-current/10"
          )}
        >
          <Icon className={cn("size-3", config.className)} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-medium text-xs">{item.label}</div>
          <div className="mt-0.5 text-muted-foreground text-xs">
            {item.value}
          </div>
        </div>
      </div>
    </div>
  );
}

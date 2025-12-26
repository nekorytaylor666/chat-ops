"use client";

import { ChevronRight, Sparkles, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivitySectionProps {
  recordName?: string;
  createdAt?: Date;
  className?: string;
}

export function ActivitySection({
  recordName,
  createdAt,
  className,
}: ActivitySectionProps) {
  const formattedDate = createdAt ? formatRelativeTime(createdAt) : "recently";

  return (
    <section className={cn("space-y-4", className)}>
      {/* Section header */}
      <button
        className="flex w-full items-center gap-2 text-muted-foreground hover:text-foreground"
        type="button"
      >
        <Sparkles className="size-4" />
        <h2 className="font-medium text-sm">Activity</h2>
        <ChevronRight className="size-4" />
      </button>

      {/* Activity items */}
      <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
        {/* Placeholder activity item - record created */}
        <div className="flex items-start gap-3">
          <div className="flex size-8 items-center justify-center rounded-full bg-primary/10">
            <User className="size-4 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm">
              <span className="font-medium">{recordName || "Record"}</span> was
              created
            </p>
            <p className="text-muted-foreground text-xs">{formattedDate}</p>
          </div>
        </div>

        {/* Coming soon message */}
        <div className="border-muted-foreground/20 border-t pt-3">
          <p className="text-center text-muted-foreground text-xs">
            Activity tracking coming soon
          </p>
        </div>
      </div>

      {/* View all link */}
      <button
        className="flex items-center gap-1 text-muted-foreground text-sm hover:text-foreground"
        type="button"
      >
        View all
        <ChevronRight className="size-3" />
      </button>
    </section>
  );
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "just now";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? "" : "s"} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays === 1 ? "" : "s"} ago`;
  }

  return date.toLocaleDateString();
}

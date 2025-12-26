"use client";

import { Link } from "@tanstack/react-router";
import { ChevronDown, ChevronUp, Circle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RecordHeaderProps {
  entitySlug: string;
  entityName: string;
  recordName: string;
  currentIndex: number;
  totalCount: number;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
  className?: string;
}

export function RecordHeader({
  entitySlug,
  entityName,
  recordName,
  currentIndex,
  totalCount,
  onPrevious,
  onNext,
  hasPrevious = false,
  hasNext = false,
  className,
}: RecordHeaderProps) {
  return (
    <div className={cn("flex flex-col border-b", className)}>
      {/* Top navigation bar */}
      <div className="flex h-12 items-center gap-2 border-b px-4">
        <Button asChild size="icon" variant="ghost">
          <Link params={{ entitySlug }} to="/entities/$entitySlug">
            <X className="size-4" />
          </Link>
        </Button>

        <div className="flex items-center gap-1">
          <Button
            disabled={!hasPrevious}
            onClick={onPrevious}
            size="icon"
            variant="ghost"
          >
            <ChevronUp className="size-4" />
          </Button>
          <Button
            disabled={!hasNext}
            onClick={onNext}
            size="icon"
            variant="ghost"
          >
            <ChevronDown className="size-4" />
          </Button>
        </div>

        <span className="text-muted-foreground text-sm">
          {currentIndex + 1} of {totalCount} in {entityName}
        </span>

        <div className="flex-1" />

        {/* Placeholder for action buttons */}
        <Button className="ml-auto" size="sm" variant="outline">
          Actions
        </Button>
      </div>

      {/* Record title */}
      <div className="flex items-center gap-3 px-6 py-4">
        <Circle className="size-8 fill-primary text-primary" />
        <h1 className="font-semibold text-2xl">
          {recordName || "Unnamed Record"}
        </h1>
      </div>
    </div>
  );
}

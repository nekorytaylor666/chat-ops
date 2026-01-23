import {
  ArrowRight,
  Box,
  CheckCircle,
  ChevronDown,
  CircleDot,
  Cog,
  FileText,
  Flag,
  Folder,
  GitBranch,
  GripVertical,
  MoreHorizontal,
  Package,
  Pencil,
  Play,
  Target,
  Trash2,
  Workflow,
  Zap,
} from "lucide-react";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SortableItem, SortableItemHandle } from "@/components/ui/sortable";
import { useDeleteStage } from "@/hooks/use-workflow-mutations";
import { cn } from "@/lib/utils";
import type { StageDefinition } from "@/types/workflow";

import { StageAttributesPanel } from "./stage-attributes-panel";
import { StageModal } from "./stage-modal";

const ICON_MAP: Record<string, React.ElementType> = {
  CircleDot,
  Play,
  ArrowRight,
  Cog,
  Target,
  Flag,
  CheckCircle,
  Workflow,
  GitBranch,
  Zap,
  Package,
  Folder,
  FileText,
  Box,
};

interface StageItemProps {
  stage: StageDefinition;
  workflowId: string;
  allStages?: StageDefinition[];
}

export function StageItem({ stage, workflowId, allStages }: StageItemProps) {
  const deleteStage = useDeleteStage();
  const [isOpen, setIsOpen] = React.useState(false);
  const [editModalOpen, setEditModalOpen] = React.useState(false);

  const Icon = ICON_MAP[stage.icon ?? "CircleDot"] ?? CircleDot;

  const handleDelete = () => {
    deleteStage.mutate({ stageId: stage.id });
  };

  const inputCount =
    stage.attributes?.filter((attr: { io?: string }) => attr.io === "input")
      .length ?? 0;
  const outputCount =
    stage.attributes?.filter((attr: { io?: string }) => attr.io === "output")
      .length ?? 0;

  return (
    <>
      <SortableItem
        asChild
        className="rounded-lg border bg-card"
        value={stage.id}
      >
        <Collapsible onOpenChange={setIsOpen} open={isOpen}>
          <div className="flex items-center gap-2 p-3">
            <SortableItemHandle asChild>
              <button
                className="cursor-grab touch-none text-muted-foreground hover:text-foreground"
                type="button"
              >
                <GripVertical className="size-4" />
              </button>
            </SortableItemHandle>

            <div
              className="flex size-8 shrink-0 items-center justify-center rounded"
              style={{ backgroundColor: stage.color ?? "#6366f1" }}
            >
              <Icon className="size-4 text-white" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate font-medium">{stage.name}</span>
                {stage.isInitial && (
                  <Badge className="shrink-0" variant="secondary">
                    Начальный
                  </Badge>
                )}
                {stage.isFinal && (
                  <Badge className="shrink-0" variant="secondary">
                    Финальный
                  </Badge>
                )}
              </div>
              {stage.description && (
                <p className="truncate text-muted-foreground text-xs">
                  {stage.description}
                </p>
              )}
              {stage.instructions && (
                <p className="truncate text-muted-foreground text-xs italic">
                  Инструкции: {stage.instructions}
                </p>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-1">
              {inputCount > 0 && (
                <Badge variant="outline">{inputCount} вход</Badge>
              )}
              {outputCount > 0 && (
                <Badge variant="outline">{outputCount} выход</Badge>
              )}
              {inputCount === 0 && outputCount === 0 && (
                <Badge variant="outline">0 атрибутов</Badge>
              )}

              <CollapsibleTrigger asChild>
                <Button size="icon" variant="ghost">
                  <ChevronDown
                    className={cn(
                      "size-4 transition-transform",
                      isOpen && "rotate-180"
                    )}
                  />
                </Button>
              </CollapsibleTrigger>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" variant="ghost">
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setEditModalOpen(true)}>
                    <Pencil className="size-4" />
                    Редактировать
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleDelete}
                    variant="destructive"
                  >
                    <Trash2 className="size-4" />
                    Удалить
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <CollapsibleContent>
            <div className="border-t px-3 py-3">
              <StageAttributesPanel allStages={allStages} stage={stage} />
            </div>
          </CollapsibleContent>
        </Collapsible>
      </SortableItem>

      <StageModal
        onOpenChange={setEditModalOpen}
        open={editModalOpen}
        stage={stage}
        workflowId={workflowId}
      />
    </>
  );
}

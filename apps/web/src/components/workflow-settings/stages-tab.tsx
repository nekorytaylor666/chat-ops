import { Plus, Search } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sortable,
  SortableContent,
  SortableOverlay,
} from "@/components/ui/sortable";
import { useReorderStages } from "@/hooks/use-workflow-mutations";
import type { StageDefinition, Workflow } from "@/types/workflow";

import { StageItem } from "./stage-item";
import { StageModal } from "./stage-modal";

interface StagesTabProps {
  workflow: Workflow;
}

export function StagesTab({ workflow }: StagesTabProps) {
  const reorderStages = useReorderStages();

  const [searchQuery, setSearchQuery] = React.useState("");
  const [createModalOpen, setCreateModalOpen] = React.useState(false);

  // Sort stages by order and filter by search
  const sortedStages = React.useMemo(() => {
    const stages = [...(workflow.stages ?? [])].sort(
      (a, b) => a.order - b.order
    );
    if (!searchQuery) return stages;
    return stages.filter((stage) =>
      stage.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [workflow.stages, searchQuery]);

  const handleReorder = (stages: StageDefinition[]) => {
    const orderedIds = stages.map((s) => s.id);
    reorderStages.mutate({
      workflowDefinitionId: workflow.id,
      orderedIds,
    });
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-lg">Этапы</h2>
          <p className="text-muted-foreground text-sm">
            Управляйте этапами рабочего процесса
          </p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)}>
          <Plus className="size-4" />
          Создать этап
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Поиск этапов"
          value={searchQuery}
        />
      </div>

      {/* Stages List */}
      {sortedStages.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
          <p className="text-muted-foreground">
            {searchQuery
              ? "Нет этапов, соответствующих поиску"
              : "Пока нет этапов"}
          </p>
          {!searchQuery && (
            <Button
              onClick={() => setCreateModalOpen(true)}
              size="sm"
              variant="outline"
            >
              <Plus className="size-4" />
              Создать первый этап
            </Button>
          )}
        </div>
      ) : (
        <Sortable
          getItemValue={(stage: StageDefinition) => stage.id}
          onValueChange={handleReorder}
          value={sortedStages}
        >
          <SortableContent className="flex flex-col gap-2 pb-4">
            {sortedStages.map((stage) => (
              <StageItem
                allStages={workflow.stages}
                key={stage.id}
                stage={stage}
                workflowId={workflow.id}
              />
            ))}
          </SortableContent>
          <SortableOverlay>
            {({ value }) => {
              const stage = sortedStages.find((s) => s.id === value);
              if (!stage) return null;
              return (
                <div className="rounded-lg border bg-card p-3 opacity-80 shadow-lg">
                  <span className="font-medium">{stage.name}</span>
                </div>
              );
            }}
          </SortableOverlay>
        </Sortable>
      )}

      {/* Create Stage Modal */}
      <StageModal
        onOpenChange={setCreateModalOpen}
        open={createModalOpen}
        workflowId={workflow.id}
      />
    </div>
  );
}

import {
  CheckCircle,
  ChevronDown,
  Edit3,
  History,
  Loader2,
  RotateCcw,
} from "lucide-react";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { useUpdateStageValues } from "@/hooks/use-deal-mutations";
import { useStageContext } from "@/hooks/use-deals";
import { cn } from "@/lib/utils";
import type { Deal, Stage } from "@/types/chat";

type InheritedDataPanelProps = {
  deal: Deal;
  stage: Stage;
};

type EditingState = {
  stageName: string;
  attributeSlug: string;
} | null;

/**
 * Content-only version of InheritedDataPanel for use inside tabbed interfaces
 */
export function InheritedDataPanelContent({
  deal,
  stage,
}: InheritedDataPanelProps) {
  const { data: stageContext, isLoading } = useStageContext(deal.id, stage.id);
  const updateValues = useUpdateStageValues();

  const [editing, setEditing] = React.useState<EditingState>(null);
  const [editValue, setEditValue] = React.useState("");

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!stageContext) {
    return (
      <div className="flex h-full items-center justify-center p-4 text-center text-muted-foreground text-sm">
        Не удалось загрузить данные этапов
      </div>
    );
  }

  const { previousStages, stageInstance } = stageContext;
  const currentValues = stageInstance.values as Record<string, unknown>;

  const handleStartEdit = (
    stageName: string,
    attributeSlug: string,
    currentValue: unknown
  ) => {
    setEditing({ stageName, attributeSlug });
    setEditValue(String(currentValue ?? ""));
  };

  const handleSaveEdit = () => {
    if (!editing) return;

    updateValues.mutate(
      {
        stageInstanceId: stage.id,
        values: { [editing.attributeSlug]: editValue },
      },
      {
        onSuccess: () => {
          setEditing(null);
          setEditValue("");
        },
      }
    );
  };

  const handleCancelEdit = () => {
    setEditing(null);
    setEditValue("");
  };

  const handleResetToInherited = (
    attributeSlug: string,
    _inheritedValue: unknown
  ) => {
    const newValues = { ...currentValues };
    delete newValues[attributeSlug];

    updateValues.mutate({
      stageInstanceId: stage.id,
      values: newValues,
    });
  };

  const isOverridden = (attributeSlug: string, inheritedValue: unknown) => {
    if (currentValues[attributeSlug] === undefined) return false;
    return currentValues[attributeSlug] !== inheritedValue;
  };

  const getDisplayValue = (attributeSlug: string, inheritedValue: unknown) => {
    if (currentValues[attributeSlug] !== undefined) {
      return currentValues[attributeSlug];
    }
    return inheritedValue;
  };

  const hasPreviousData = previousStages.length > 0;

  return (
    <div className="h-full overflow-auto p-4">
      {hasPreviousData ? (
        <div className="space-y-3">
          {previousStages.map((prevStage) => (
            <StageDataSection
              currentValues={currentValues}
              editing={editing}
              editValue={editValue}
              getDisplayValue={getDisplayValue}
              isOverridden={isOverridden}
              isSaving={updateValues.isPending}
              key={prevStage.id}
              onCancelEdit={handleCancelEdit}
              onResetToInherited={handleResetToInherited}
              onSaveEdit={handleSaveEdit}
              onStartEdit={handleStartEdit}
              setEditValue={setEditValue}
              stage={prevStage}
            />
          ))}
        </div>
      ) : (
        <div className="text-center text-muted-foreground text-sm">
          Это первый этап. Данные из предыдущих этапов отсутствуют.
        </div>
      )}
    </div>
  );
}

/**
 * Full panel with header and wrapper for standalone usage
 */
export function InheritedDataPanel({ deal, stage }: InheritedDataPanelProps) {
  return (
    <aside className="flex h-full w-80 shrink-0 flex-col bg-muted/30">
      <header className="flex h-12 items-center gap-2 border-b bg-background px-4">
        <History className="size-4 text-primary" />
        <h2 className="font-semibold text-sm">Данные из предыдущих этапов</h2>
      </header>
      <InheritedDataPanelContent deal={deal} stage={stage} />
    </aside>
  );
}

type StageDataSectionProps = {
  stage: {
    id: string;
    name: string;
    values: Record<string, unknown>;
    attributes: {
      id: string;
      slug: string;
      name: string;
      type: string;
    }[];
  };
  currentValues: Record<string, unknown>;
  editing: EditingState;
  editValue: string;
  setEditValue: (value: string) => void;
  isSaving: boolean;
  getDisplayValue: (slug: string, inheritedValue: unknown) => unknown;
  isOverridden: (slug: string, inheritedValue: unknown) => boolean;
  onStartEdit: (stageName: string, slug: string, value: unknown) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onResetToInherited: (slug: string, inheritedValue: unknown) => void;
};

function StageDataSection({
  stage,
  editing,
  editValue,
  setEditValue,
  isSaving,
  getDisplayValue,
  isOverridden,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onResetToInherited,
}: StageDataSectionProps) {
  return (
    <Collapsible className="group/section" defaultOpen>
      <CollapsibleTrigger className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 font-medium text-xs hover:bg-accent">
        <CheckCircle className="size-3 text-green-500" />
        <span>{stage.name}</span>
        <span className="ml-auto text-muted-foreground">
          {stage.attributes.length}
        </span>
        <ChevronDown className="size-3 text-muted-foreground transition-transform group-data-[state=open]/section:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-1 space-y-1">
        {stage.attributes.map((attr) => {
          const inheritedValue = stage.values[attr.slug];
          const displayValue = getDisplayValue(attr.slug, inheritedValue);
          const overridden = isOverridden(attr.slug, inheritedValue);
          const isEditing =
            editing?.stageName === stage.name &&
            editing?.attributeSlug === attr.slug;

          return (
            <div
              className={cn(
                "group rounded-md px-2 py-1.5 text-xs",
                overridden && "bg-amber-500/10"
              )}
              key={attr.id}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">{attr.name}</span>
                <div className="flex items-center gap-1">
                  {overridden && (
                    <Badge className="text-[9px]" variant="outline">
                      Изменено
                    </Badge>
                  )}
                  {!isEditing && (
                    <Button
                      className="size-5 opacity-0 group-hover:opacity-100"
                      onClick={() =>
                        onStartEdit(stage.name, attr.slug, displayValue)
                      }
                      size="icon"
                      variant="ghost"
                    >
                      <Edit3 className="size-3" />
                    </Button>
                  )}
                  {overridden && !isEditing && (
                    <Button
                      className="size-5 opacity-0 group-hover:opacity-100"
                      onClick={() =>
                        onResetToInherited(attr.slug, inheritedValue)
                      }
                      size="icon"
                      title="Сбросить к исходному значению"
                      variant="ghost"
                    >
                      <RotateCcw className="size-3" />
                    </Button>
                  )}
                </div>
              </div>
              {isEditing ? (
                <div className="mt-1 flex items-center gap-1">
                  <Input
                    autoFocus
                    className="h-7 text-xs"
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") onSaveEdit();
                      if (e.key === "Escape") onCancelEdit();
                    }}
                    value={editValue}
                  />
                  <Button
                    className="size-7"
                    disabled={isSaving}
                    onClick={onSaveEdit}
                    size="icon"
                    variant="default"
                  >
                    {isSaving ? (
                      <Loader2 className="size-3 animate-spin" />
                    ) : (
                      <CheckCircle className="size-3" />
                    )}
                  </Button>
                </div>
              ) : (
                <p className="mt-0.5 font-medium">
                  {displayValue !== undefined && displayValue !== null
                    ? String(displayValue)
                    : "-"}
                </p>
              )}
            </div>
          );
        })}
      </CollapsibleContent>
    </Collapsible>
  );
}

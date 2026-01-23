import {
  AlignLeft,
  Calendar,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  File,
  GripVertical,
  Hash,
  History,
  Link,
  Link2,
  List,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
  Type,
} from "lucide-react";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sortable,
  SortableContent,
  SortableItem,
  SortableItemHandle,
  SortableOverlay,
} from "@/components/ui/sortable";
import {
  useDeleteStageAttribute,
  useReorderStageAttributes,
} from "@/hooks/use-workflow-mutations";
import type {
  AttributeType,
  StageAttribute,
  StageAttributeIo,
  StageDefinition,
} from "@/types/workflow";

import { StageAttributeModal } from "./stage-attribute-modal";

const TYPE_ICONS: Record<AttributeType, React.ElementType> = {
  "short-text": Type,
  "long-text": AlignLeft,
  number: Hash,
  checkbox: CheckSquare,
  date: Calendar,
  select: ChevronDown,
  "multi-select": List,
  url: Link,
  relation: Link2,
  "relation-multi": Link2,
  file: File,
};

const TYPE_LABELS: Record<AttributeType, string> = {
  "short-text": "Текст",
  "long-text": "Длинный текст",
  number: "Число",
  checkbox: "Чекбокс",
  date: "Дата",
  select: "Выбор",
  "multi-select": "Множ. выбор",
  url: "URL",
  relation: "Связь",
  "relation-multi": "Множ. связь",
  file: "Файл",
};

interface StageAttributesPanelProps {
  stage: StageDefinition;
  allStages?: StageDefinition[];
}

interface AttributeListProps {
  attributes: StageAttribute[];
  onEdit: (attr: StageAttribute) => void;
  onDelete: (attr: StageAttribute) => void;
  onReorder: (attributes: StageAttribute[]) => void;
}

function AttributeList({
  attributes,
  onEdit,
  onDelete,
  onReorder,
}: AttributeListProps) {
  return (
    <Sortable
      getItemValue={(attr: StageAttribute) => attr.id}
      onValueChange={onReorder}
      value={attributes}
    >
      <SortableContent className="flex flex-col gap-1">
        {attributes.map((attr: StageAttribute) => {
          const TypeIcon = TYPE_ICONS[attr.type as AttributeType];
          return (
            <SortableItem
              asChild
              className="rounded border bg-background"
              key={attr.id}
              value={attr.id}
            >
              <div className="flex items-center gap-2 px-2 py-1.5">
                <SortableItemHandle asChild>
                  <button
                    className="cursor-grab touch-none text-muted-foreground hover:text-foreground"
                    type="button"
                  >
                    <GripVertical className="size-3" />
                  </button>
                </SortableItemHandle>

                <TypeIcon className="size-3.5 shrink-0 text-muted-foreground" />

                <span className="min-w-0 flex-1 truncate text-sm">
                  {attr.name}
                </span>

                <div className="flex shrink-0 items-center gap-1">
                  <Badge className="text-[10px]" variant="outline">
                    {TYPE_LABELS[attr.type as AttributeType]}
                  </Badge>
                  {attr.isRequired && (
                    <Badge className="text-[10px]" variant="secondary">
                      Обяз.
                    </Badge>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button className="size-6" size="icon" variant="ghost">
                        <MoreHorizontal className="size-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(attr)}>
                        <Pencil className="size-4" />
                        Редактировать
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDelete(attr)}
                        variant="destructive"
                      >
                        <Trash2 className="size-4" />
                        Удалить
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </SortableItem>
          );
        })}
      </SortableContent>
      <SortableOverlay>
        {({ value }) => {
          const attr = attributes.find((a) => a.id === value);
          if (!attr) return null;
          return (
            <div className="rounded border bg-background px-2 py-1.5 opacity-80 shadow-lg">
              <span className="text-sm">{attr.name}</span>
            </div>
          );
        }}
      </SortableOverlay>
    </Sortable>
  );
}

export function StageAttributesPanel({
  stage,
  allStages = [],
}: StageAttributesPanelProps) {
  const deleteAttribute = useDeleteStageAttribute();
  const reorderAttributes = useReorderStageAttributes();

  const [createModalOpen, setCreateModalOpen] = React.useState(false);
  const [createModalIo, setCreateModalIo] =
    React.useState<StageAttributeIo>("output");
  const [editingAttribute, setEditingAttribute] = React.useState<
    StageAttribute | undefined
  >();
  const [previousStagesOpen, setPreviousStagesOpen] = React.useState(true);

  const inputAttributes = React.useMemo(
    () =>
      [...(stage.attributes ?? [])]
        .filter((a) => a.io === "input")
        .sort((a, b) => a.order - b.order),
    [stage.attributes]
  );

  const outputAttributes = React.useMemo(
    () =>
      [...(stage.attributes ?? [])]
        .filter((a) => a.io === "output" || !a.io)
        .sort((a, b) => a.order - b.order),
    [stage.attributes]
  );

  // Get previous stages with their output attributes
  const previousStagesWithOutputs = React.useMemo(() => {
    const currentOrder = stage.order;
    return allStages
      .filter((s) => s.order < currentOrder)
      .sort((a, b) => a.order - b.order)
      .map((s) => ({
        ...s,
        outputAttributes: (s.attributes ?? [])
          .filter((attr: StageAttribute) => attr.io === "output" || !attr.io)
          .sort((a: StageAttribute, b: StageAttribute) => a.order - b.order),
      }))
      .filter((s) => s.outputAttributes.length > 0);
  }, [allStages, stage.order]);

  const handleReorder = (attributes: StageAttribute[]) => {
    const orderedIds = attributes.map((a) => a.id);
    reorderAttributes.mutate({
      stageDefinitionId: stage.id,
      orderedIds,
    });
  };

  const handleEdit = (attr: StageAttribute) => {
    setEditingAttribute(attr);
  };

  const handleDelete = (attr: StageAttribute) => {
    deleteAttribute.mutate({ attributeId: attr.id });
  };

  const openCreateModal = (io: StageAttributeIo) => {
    setCreateModalIo(io);
    setCreateModalOpen(true);
  };

  const hasNoAttributes =
    inputAttributes.length === 0 && outputAttributes.length === 0;

  if (hasNoAttributes) {
    return (
      <div className="space-y-4">
        {/* Previous Stages Data Section */}
        {previousStagesWithOutputs.length > 0 && (
          <div className="space-y-2">
            <button
              className="flex w-full items-center gap-2 text-left"
              onClick={() => setPreviousStagesOpen(!previousStagesOpen)}
              type="button"
            >
              <ChevronRight
                className={`size-4 text-muted-foreground transition-transform ${
                  previousStagesOpen ? "rotate-90" : ""
                }`}
              />
              <History className="size-4 text-muted-foreground" />
              <span className="font-medium text-sm">
                Доступные данные из предыдущих этапов
              </span>
            </button>
            {previousStagesOpen && (
              <div className="ml-6 space-y-3 rounded-md border bg-muted/30 p-3">
                {previousStagesWithOutputs.map((prevStage) => (
                  <div className="space-y-1" key={prevStage.id}>
                    <span className="font-medium text-muted-foreground text-xs">
                      {prevStage.name}
                    </span>
                    <div className="space-y-0.5">
                      {prevStage.outputAttributes.map(
                        (attr: StageAttribute) => {
                          const TypeIcon =
                            TYPE_ICONS[attr.type as AttributeType];
                          return (
                            <div
                              className="flex items-center gap-2 text-xs"
                              key={attr.id}
                            >
                              <span className="text-muted-foreground">•</span>
                              <TypeIcon className="size-3 text-muted-foreground" />
                              <span>{attr.name}</span>
                              <Badge className="text-[9px]" variant="outline">
                                {TYPE_LABELS[attr.type as AttributeType]}
                              </Badge>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col items-center gap-2 py-4 text-center">
          <p className="text-muted-foreground text-sm">
            У этого этапа пока нет атрибутов
          </p>
          <div className="flex gap-2">
            <Button
              onClick={() => openCreateModal("input")}
              size="sm"
              variant="outline"
            >
              <Plus className="size-4" />
              Добавить входные данные
            </Button>
            <Button
              onClick={() => openCreateModal("output")}
              size="sm"
              variant="outline"
            >
              <Plus className="size-4" />
              Добавить выходные данные
            </Button>
          </div>
        </div>
        <StageAttributeModal
          io={createModalIo}
          onOpenChange={setCreateModalOpen}
          open={createModalOpen}
          stageId={stage.id}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Previous Stages Data Section */}
      {previousStagesWithOutputs.length > 0 && (
        <div className="space-y-2">
          <button
            className="flex w-full items-center gap-2 text-left"
            onClick={() => setPreviousStagesOpen(!previousStagesOpen)}
            type="button"
          >
            <ChevronRight
              className={`size-4 text-muted-foreground transition-transform ${
                previousStagesOpen ? "rotate-90" : ""
              }`}
            />
            <History className="size-4 text-muted-foreground" />
            <span className="font-medium text-sm">
              Доступные данные из предыдущих этапов
            </span>
          </button>
          {previousStagesOpen && (
            <div className="ml-6 space-y-3 rounded-md border bg-muted/30 p-3">
              {previousStagesWithOutputs.map((prevStage) => (
                <div className="space-y-1" key={prevStage.id}>
                  <span className="font-medium text-muted-foreground text-xs">
                    {prevStage.name}
                  </span>
                  <div className="space-y-0.5">
                    {prevStage.outputAttributes.map((attr: StageAttribute) => {
                      const TypeIcon = TYPE_ICONS[attr.type as AttributeType];
                      return (
                        <div
                          className="flex items-center gap-2 text-xs"
                          key={attr.id}
                        >
                          <span className="text-muted-foreground">•</span>
                          <TypeIcon className="size-3 text-muted-foreground" />
                          <span>{attr.name}</span>
                          <Badge className="text-[9px]" variant="outline">
                            {TYPE_LABELS[attr.type as AttributeType]}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Input Attributes Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-medium text-sm">Входные данные</span>
          <Button
            onClick={() => openCreateModal("input")}
            size="sm"
            variant="outline"
          >
            <Plus className="size-4" />
            Добавить
          </Button>
        </div>
        {inputAttributes.length > 0 ? (
          <AttributeList
            attributes={inputAttributes}
            onDelete={handleDelete}
            onEdit={handleEdit}
            onReorder={handleReorder}
          />
        ) : (
          <p className="py-2 text-center text-muted-foreground text-xs">
            Нет входных данных
          </p>
        )}
      </div>

      {/* Output Attributes Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-medium text-sm">Выходные данные</span>
          <Button
            onClick={() => openCreateModal("output")}
            size="sm"
            variant="outline"
          >
            <Plus className="size-4" />
            Добавить
          </Button>
        </div>
        {outputAttributes.length > 0 ? (
          <AttributeList
            attributes={outputAttributes}
            onDelete={handleDelete}
            onEdit={handleEdit}
            onReorder={handleReorder}
          />
        ) : (
          <p className="py-2 text-center text-muted-foreground text-xs">
            Нет выходных данных
          </p>
        )}
      </div>

      {/* Create Attribute Modal */}
      <StageAttributeModal
        io={createModalIo}
        onOpenChange={setCreateModalOpen}
        open={createModalOpen}
        stageId={stage.id}
      />

      {/* Edit Attribute Modal */}
      <StageAttributeModal
        attribute={editingAttribute}
        onOpenChange={(open) => {
          if (!open) setEditingAttribute(undefined);
        }}
        open={!!editingAttribute}
        stageId={stage.id}
      />
    </div>
  );
}

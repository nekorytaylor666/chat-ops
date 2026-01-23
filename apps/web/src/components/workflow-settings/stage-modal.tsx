import {
  ArrowRight,
  Box,
  CheckCircle,
  CircleDot,
  Cog,
  FileText,
  Flag,
  Folder,
  GitBranch,
  Loader2,
  Package,
  Play,
  Target,
  Workflow,
  Zap,
} from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAddStage, useUpdateStage } from "@/hooks/use-workflow-mutations";
import { cn } from "@/lib/utils";
import type { StageDefinition } from "@/types/workflow";

const ICON_OPTIONS = [
  { name: "CircleDot", icon: CircleDot },
  { name: "Play", icon: Play },
  { name: "ArrowRight", icon: ArrowRight },
  { name: "Cog", icon: Cog },
  { name: "Target", icon: Target },
  { name: "Flag", icon: Flag },
  { name: "CheckCircle", icon: CheckCircle },
  { name: "Workflow", icon: Workflow },
  { name: "GitBranch", icon: GitBranch },
  { name: "Zap", icon: Zap },
  { name: "Package", icon: Package },
  { name: "Folder", icon: Folder },
  { name: "FileText", icon: FileText },
  { name: "Box", icon: Box },
] as const;

const COLOR_OPTIONS = [
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "#d946ef",
  "#ec4899",
  "#f43f5e",
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#eab308",
  "#84cc16",
  "#22c55e",
  "#10b981",
  "#14b8a6",
  "#06b6d4",
  "#0ea5e9",
  "#3b82f6",
  "#64748b",
];

interface StageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workflowId: string;
  stage?: StageDefinition;
}

export function StageModal({
  open,
  onOpenChange,
  workflowId,
  stage,
}: StageModalProps) {
  const addStage = useAddStage();
  const updateStage = useUpdateStage();

  const isEditing = !!stage;

  const [name, setName] = React.useState(stage?.name ?? "");
  const [description, setDescription] = React.useState(
    stage?.description ?? ""
  );
  const [instructions, setInstructions] = React.useState(
    stage?.instructions ?? ""
  );
  const [target, setTarget] = React.useState(stage?.target ?? "");
  const [selectedIcon, setSelectedIcon] = React.useState(
    stage?.icon ?? "CircleDot"
  );
  const [selectedColor, setSelectedColor] = React.useState(
    stage?.color ?? "#6366f1"
  );
  const [isInitial, setIsInitial] = React.useState(stage?.isInitial ?? false);
  const [isFinal, setIsFinal] = React.useState(stage?.isFinal ?? false);

  // Reset form when modal opens/closes or stage changes
  React.useEffect(() => {
    if (open) {
      setName(stage?.name ?? "");
      setDescription(stage?.description ?? "");
      setInstructions(stage?.instructions ?? "");
      setTarget(stage?.target ?? "");
      setSelectedIcon(stage?.icon ?? "CircleDot");
      setSelectedColor(stage?.color ?? "#6366f1");
      setIsInitial(stage?.isInitial ?? false);
      setIsFinal(stage?.isFinal ?? false);
    }
  }, [open, stage]);

  const isPending = addStage.isPending || updateStage.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (isEditing && stage) {
      updateStage.mutate(
        {
          stageId: stage.id,
          name: name.trim(),
          description: description.trim() || undefined,
          instructions: instructions.trim() || undefined,
          target: target.trim() || undefined,
          icon: selectedIcon,
          color: selectedColor,
          isInitial,
          isFinal,
        },
        {
          onSuccess: () => onOpenChange(false),
        }
      );
    } else {
      addStage.mutate(
        {
          workflowDefinitionId: workflowId,
          name: name.trim(),
          description: description.trim() || undefined,
          instructions: instructions.trim() || undefined,
          target: target.trim() || undefined,
          icon: selectedIcon,
          color: selectedColor,
          isInitial,
          isFinal,
        },
        {
          onSuccess: () => onOpenChange(false),
        }
      );
    }
  };

  const SelectedIconComponent =
    ICON_OPTIONS.find((opt) => opt.name === selectedIcon)?.icon ?? CircleDot;

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Редактировать этап" : "Создать этап"}
          </DialogTitle>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="stage-name">Название</Label>
            <Input
              autoFocus
              id="stage-name"
              onChange={(e) => setName(e.target.value)}
              placeholder="напр., Первый контакт"
              value={name}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="stage-desc">
              Описание{" "}
              <span className="text-muted-foreground">(необязательно)</span>
            </Label>
            <Textarea
              id="stage-desc"
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Опишите этот этап"
              rows={2}
              value={description}
            />
          </div>

          {/* Instructions */}
          <div className="space-y-2">
            <Label htmlFor="stage-instructions">
              Инструкции{" "}
              <span className="text-muted-foreground">(необязательно)</span>
            </Label>
            <Textarea
              id="stage-instructions"
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Опишите, что должно быть достигнуто на этом этапе"
              rows={3}
              value={instructions}
            />
          </div>

          {/* Target */}
          <div className="space-y-2">
            <Label htmlFor="stage-target">
              Цель{" "}
              <span className="text-muted-foreground">(необязательно)</span>
            </Label>
            <Input
              id="stage-target"
              onChange={(e) => setTarget(e.target.value)}
              placeholder="напр., Получить контактные данные клиента"
              value={target}
            />
          </div>

          {/* Icon & Color */}
          <div className="space-y-2">
            <Label>Иконка и цвет</Label>
            <div className="flex items-start gap-4">
              {/* Preview */}
              <div
                className="flex size-12 shrink-0 items-center justify-center rounded-lg"
                style={{ backgroundColor: selectedColor }}
              >
                <SelectedIconComponent className="size-6 text-white" />
              </div>

              <div className="flex-1 space-y-3">
                {/* Icons */}
                <div className="grid grid-cols-7 gap-1">
                  {ICON_OPTIONS.map(({ name: iconName, icon: Icon }) => (
                    <button
                      className={cn(
                        "flex size-8 items-center justify-center rounded border transition-colors hover:bg-accent",
                        selectedIcon === iconName &&
                          "border-primary bg-primary/10"
                      )}
                      key={iconName}
                      onClick={() => setSelectedIcon(iconName)}
                      type="button"
                    >
                      <Icon className="size-4" />
                    </button>
                  ))}
                </div>

                {/* Colors */}
                <div className="grid grid-cols-9 gap-1">
                  {COLOR_OPTIONS.map((color) => (
                    <button
                      className={cn(
                        "size-6 rounded-full transition-transform hover:scale-110",
                        selectedColor === color &&
                          "ring-2 ring-primary ring-offset-1"
                      )}
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      style={{ backgroundColor: color }}
                      type="button"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Stage Type */}
          <div className="space-y-3">
            <Label>Тип этапа</Label>
            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={isInitial}
                  onCheckedChange={(checked) => setIsInitial(checked === true)}
                />
                <span className="text-sm">Начальный этап</span>
                <span className="text-muted-foreground text-xs">
                  (сделки начинаются с этого этапа)
                </span>
              </label>
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={isFinal}
                  onCheckedChange={(checked) => setIsFinal(checked === true)}
                />
                <span className="text-sm">Финальный этап</span>
                <span className="text-muted-foreground text-xs">
                  (сделки завершаются на этом этапе)
                </span>
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => onOpenChange(false)}
              type="button"
              variant="outline"
            >
              Отмена
            </Button>
            <Button disabled={!name.trim() || isPending} type="submit">
              {isPending && <Loader2 className="size-4 animate-spin" />}
              {isEditing ? "Сохранить изменения" : "Создать этап"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateWorkflow } from "@/hooks/use-workflow-mutations";
import { cn } from "@/lib/utils";
import type { Workflow as WorkflowType } from "@/types/workflow";

// Available icons for workflows
const ICON_OPTIONS = [
  { name: "Workflow", icon: Workflow },
  { name: "GitBranch", icon: GitBranch },
  { name: "Zap", icon: Zap },
  { name: "Target", icon: Target },
  { name: "Flag", icon: Flag },
  { name: "Play", icon: Play },
  { name: "ArrowRight", icon: ArrowRight },
  { name: "CheckCircle", icon: CheckCircle },
  { name: "CircleDot", icon: CircleDot },
  { name: "Cog", icon: Cog },
  { name: "Package", icon: Package },
  { name: "Folder", icon: Folder },
  { name: "FileText", icon: FileText },
  { name: "Box", icon: Box },
] as const;

// Preset colors
const COLOR_OPTIONS = [
  "#6366f1", // Indigo
  "#8b5cf6", // Violet
  "#a855f7", // Purple
  "#d946ef", // Fuchsia
  "#ec4899", // Pink
  "#f43f5e", // Rose
  "#ef4444", // Red
  "#f97316", // Orange
  "#f59e0b", // Amber
  "#eab308", // Yellow
  "#84cc16", // Lime
  "#22c55e", // Green
  "#10b981", // Emerald
  "#14b8a6", // Teal
  "#06b6d4", // Cyan
  "#0ea5e9", // Sky
  "#3b82f6", // Blue
  "#64748b", // Slate
];

interface AppearanceTabProps {
  workflow: WorkflowType;
}

export function AppearanceTab({ workflow }: AppearanceTabProps) {
  const updateWorkflow = useUpdateWorkflow();

  const [selectedIcon, setSelectedIcon] = React.useState(
    workflow.icon ?? "Workflow"
  );
  const [selectedColor, setSelectedColor] = React.useState(
    workflow.color ?? "#6366f1"
  );
  const [customColor, setCustomColor] = React.useState(workflow.color ?? "");

  // Reset form when workflow changes
  React.useEffect(() => {
    setSelectedIcon(workflow.icon ?? "Workflow");
    setSelectedColor(workflow.color ?? "#6366f1");
    setCustomColor(workflow.color ?? "");
  }, [workflow.icon, workflow.color]);

  const hasChanges =
    selectedIcon !== (workflow.icon ?? "Workflow") ||
    selectedColor !== (workflow.color ?? "#6366f1");

  const handleSave = () => {
    updateWorkflow.mutate({
      workflowId: workflow.id,
      icon: selectedIcon,
      color: selectedColor,
    });
  };

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    setCustomColor(color);
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setCustomColor(color);
    if (/^#[0-9A-Fa-f]{6}$/.test(color)) {
      setSelectedColor(color);
    }
  };

  const SelectedIconComponent =
    ICON_OPTIONS.find((opt) => opt.name === selectedIcon)?.icon ?? Workflow;

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Предпросмотр</CardTitle>
          <CardDescription>
            Посмотрите, как ваш рабочий процесс будет выглядеть в списке
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 rounded-lg border bg-muted/50 p-3">
            <div
              className="flex size-10 items-center justify-center rounded-lg"
              style={{ backgroundColor: selectedColor }}
            >
              <SelectedIconComponent className="size-5 text-white" />
            </div>
            <div>
              <p className="font-medium">{workflow.name}</p>
              <p className="text-muted-foreground text-sm">
                {workflow.stages?.length ?? 0} этапов
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Icon Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Иконка</CardTitle>
          <CardDescription>
            Выберите иконку для этого рабочего процесса
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {ICON_OPTIONS.map(({ name, icon: Icon }) => (
              <button
                className={cn(
                  "flex size-10 items-center justify-center rounded-lg border transition-colors hover:bg-accent",
                  selectedIcon === name &&
                    "border-primary bg-primary/10 ring-1 ring-primary"
                )}
                key={name}
                onClick={() => setSelectedIcon(name)}
                type="button"
              >
                <Icon className="size-5" />
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Color Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Цвет</CardTitle>
          <CardDescription>
            Выберите цвет для иконки рабочего процесса
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-9 gap-2">
            {COLOR_OPTIONS.map((color) => (
              <button
                className={cn(
                  "size-8 rounded-full transition-transform hover:scale-110",
                  selectedColor === color && "ring-2 ring-primary ring-offset-2"
                )}
                key={color}
                onClick={() => handleColorChange(color)}
                style={{ backgroundColor: color }}
                type="button"
              />
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Label className="shrink-0" htmlFor="customColor">
              Свой цвет
            </Label>
            <div className="flex flex-1 items-center gap-2">
              <div
                className="size-8 shrink-0 rounded border"
                style={{ backgroundColor: selectedColor }}
              />
              <Input
                className="font-mono"
                id="customColor"
                onChange={handleCustomColorChange}
                placeholder="#6366f1"
                value={customColor}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {hasChanges && (
        <div className="flex justify-end">
          <Button disabled={updateWorkflow.isPending} onClick={handleSave}>
            {updateWorkflow.isPending && (
              <Loader2 className="size-4 animate-spin" />
            )}
            Сохранить изменения
          </Button>
        </div>
      )}
    </div>
  );
}

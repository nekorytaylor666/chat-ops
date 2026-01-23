import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { AlertTriangle, Info, Loader2, Trash2 } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useOrganizationContext } from "@/contexts/workspace-context";
import {
  useDeleteWorkflow,
  useUpdateWorkflow,
} from "@/hooks/use-workflow-mutations";
import type { Workflow, WorkflowStatus } from "@/types/workflow";
import { useTRPC } from "@/utils/trpc";

interface ConfigurationTabProps {
  workflow: Workflow;
}

const STATUS_OPTIONS: { value: WorkflowStatus; label: string }[] = [
  { value: "draft", label: "Черновик" },
  { value: "active", label: "Активный" },
  { value: "archived", label: "Архивный" },
];

export function ConfigurationTab({ workflow }: ConfigurationTabProps) {
  const navigate = useNavigate();
  const trpc = useTRPC();
  const { organizationId } = useOrganizationContext();
  const updateWorkflow = useUpdateWorkflow();
  const deleteWorkflow = useDeleteWorkflow();

  const [name, setName] = React.useState(workflow.name);
  const [description, setDescription] = React.useState(
    workflow.description ?? ""
  );
  const [status, setStatus] = React.useState<WorkflowStatus>(workflow.status);
  const [triggerEntityId, setTriggerEntityId] = React.useState(
    workflow.triggerEntityId ?? ""
  );
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);

  // Fetch entities for trigger entity selector
  const { data: entities } = useQuery(
    trpc.entity.list.queryOptions(
      { organizationId: organizationId ?? "" },
      { enabled: !!organizationId }
    )
  );

  // Reset form when workflow changes
  React.useEffect(() => {
    setName(workflow.name);
    setDescription(workflow.description ?? "");
    setStatus(workflow.status);
    setTriggerEntityId(workflow.triggerEntityId ?? "");
  }, [
    workflow.name,
    workflow.description,
    workflow.status,
    workflow.triggerEntityId,
  ]);

  const hasChanges =
    name !== workflow.name ||
    description !== (workflow.description ?? "") ||
    status !== workflow.status ||
    triggerEntityId !== (workflow.triggerEntityId ?? "");

  const handleSave = () => {
    updateWorkflow.mutate({
      workflowId: workflow.id,
      name,
      description: description || undefined,
      status,
      triggerEntityId: triggerEntityId || null,
    });
  };

  const handleDelete = () => {
    deleteWorkflow.mutate(
      { workflowId: workflow.id },
      {
        onSuccess: () => {
          navigate({ to: "/workflows" });
        },
      }
    );
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      {/* General Section */}
      <Card>
        <CardHeader>
          <CardTitle>Основные настройки</CardTitle>
          <CardDescription>
            Настройте название, описание и статус рабочего процесса
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Название</Label>
            <Input
              id="name"
              onChange={(e) => setName(e.target.value)}
              placeholder="напр. Продажи"
              value={name}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              Описание{" "}
              <span className="text-muted-foreground">(необязательно)</span>
            </Label>
            <Textarea
              id="description"
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Опишите назначение этого рабочего процесса"
              rows={3}
              value={description}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Статус</Label>
            <Select
              onValueChange={(v) => setStatus(v as WorkflowStatus)}
              value={status}
            >
              <SelectTrigger className="w-full" id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-muted-foreground text-xs">
              Только активные рабочие процессы могут использоваться для создания
              сделок
            </p>
          </div>

          {hasChanges && (
            <div className="flex justify-end pt-2">
              <Button disabled={updateWorkflow.isPending} onClick={handleSave}>
                {updateWorkflow.isPending && (
                  <Loader2 className="size-4 animate-spin" />
                )}
                Сохранить изменения
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Trigger Entity Section */}
      <Card>
        <CardHeader>
          <CardTitle>Триггер сущность</CardTitle>
          <CardDescription>
            Выберите сущность, которая будет использоваться как триггер для
            этого рабочего процесса
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-1">
              <Label htmlFor="triggerEntity">Сущность</Label>
              <Info className="size-3.5 text-muted-foreground" />
            </div>
            <Select
              onValueChange={setTriggerEntityId}
              value={triggerEntityId || "none"}
            >
              <SelectTrigger className="w-full" id="triggerEntity">
                <SelectValue placeholder="Выберите сущность..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Не выбрано</SelectItem>
                {entities?.map((entity) => (
                  <SelectItem key={entity.id} value={entity.id}>
                    {entity.singularName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-muted-foreground text-xs">
              Сделки этого рабочего процесса будут связаны с записями выбранной
              сущности
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="size-5" />
            Опасная зона
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Удалить рабочий процесс</p>
              <p className="text-muted-foreground text-sm">
                После удаления рабочий процесс не может быть восстановлен.
              </p>
            </div>
            <Button
              onClick={() => setShowDeleteDialog(true)}
              variant="destructive"
            >
              <Trash2 className="size-4" />
              Удалить
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog onOpenChange={setShowDeleteDialog} open={showDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить рабочий процесс?</DialogTitle>
            <DialogDescription>
              Это действие нельзя отменить. Рабочий процесс "{workflow.name}" и
              все связанные данные будут удалены навсегда.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => setShowDeleteDialog(false)}
              variant="outline"
            >
              Отмена
            </Button>
            <Button
              disabled={deleteWorkflow.isPending}
              onClick={handleDelete}
              variant="destructive"
            >
              {deleteWorkflow.isPending && (
                <Loader2 className="size-4 animate-spin" />
              )}
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

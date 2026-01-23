import { useNavigate } from "@tanstack/react-router";
import { Loader2, Plus } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useOrganizationContext } from "@/contexts/workspace-context";
import { useCreateWorkflow } from "@/hooks/use-workflow-mutations";

interface CreateWorkflowDialogProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CreateWorkflowDialog({
  trigger,
  open: controlledOpen,
  onOpenChange,
}: CreateWorkflowDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const navigate = useNavigate();
  const { organizationId } = useOrganizationContext();
  const createWorkflow = useCreateWorkflow();

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? onOpenChange! : setInternalOpen;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!(name.trim() && organizationId)) return;

    createWorkflow.mutate(
      {
        organizationId,
        name: name.trim(),
        description: description.trim() || undefined,
        status: "draft",
      },
      {
        onSuccess: (data) => {
          setOpen(false);
          setName("");
          setDescription("");
          if (data?.id) {
            navigate({
              to: "/workflows/$workflowId/settings",
              params: { workflowId: data.id },
            });
          }
        },
      }
    );
  };

  const defaultTrigger = (
    <Button>
      <Plus className="size-4" />
      Создать рабочий процесс
    </Button>
  );

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      {trigger !== undefined ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>{defaultTrigger}</DialogTrigger>
      )}
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Создать рабочий процесс</DialogTitle>
            <DialogDescription>
              Создайте новый рабочий процесс для управления этапами работы. Вы
              сможете настроить этапы после создания.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="workflow-name">Название</Label>
              <Input
                autoFocus
                id="workflow-name"
                onChange={(e) => setName(e.target.value)}
                placeholder="напр. Продажи, Онбординг, Поддержка"
                value={name}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workflow-description">
                Описание{" "}
                <span className="text-muted-foreground">(необязательно)</span>
              </Label>
              <Textarea
                id="workflow-description"
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Опишите назначение этого рабочего процесса"
                rows={2}
                value={description}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setOpen(false)}
              type="button"
              variant="outline"
            >
              Отмена
            </Button>
            <Button
              disabled={!name.trim() || createWorkflow.isPending}
              type="submit"
            >
              {createWorkflow.isPending && (
                <Loader2 className="size-4 animate-spin" />
              )}
              Создать
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

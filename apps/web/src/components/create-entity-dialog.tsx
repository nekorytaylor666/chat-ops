import { useNavigate } from "@tanstack/react-router";
import { Plus } from "lucide-react";
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
import { useOrganizationContext } from "@/contexts/workspace-context";
import { useCreateEntity } from "@/hooks/use-entity-mutations";

interface CreateEntityDialogProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CreateEntityDialog({
  trigger,
  open: controlledOpen,
  onOpenChange,
}: CreateEntityDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const navigate = useNavigate();
  const { organizationId } = useOrganizationContext();
  const createEntity = useCreateEntity();

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? onOpenChange! : setInternalOpen;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!(name.trim() && organizationId)) return;

    const singularName = name.trim();
    const pluralName = singularName.endsWith("s")
      ? singularName
      : `${singularName}s`;

    createEntity.mutate(
      {
        organizationId,
        singularName,
        pluralName,
      },
      {
        onSuccess: (data) => {
          setOpen(false);
          setName("");
          if (data?.slug) {
            navigate({
              to: "/entities/$entitySlug/settings",
              params: { entitySlug: data.slug },
            });
          }
        },
      }
    );
  };

  const defaultTrigger = (
    <Button>
      <Plus className="size-4" />
      Создать сущность
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
            <DialogTitle>Создать сущность</DialogTitle>
            <DialogDescription>
              Дайте название вашей сущности. Вы можете настроить её атрибуты в
              настройках.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              autoFocus
              onChange={(e) => setName(e.target.value)}
              placeholder="напр. Контакт, Проект, Задача"
              value={name}
            />
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
              disabled={!name.trim() || createEntity.isPending}
              type="submit"
            >
              {createEntity.isPending ? "Создание..." : "Создать"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

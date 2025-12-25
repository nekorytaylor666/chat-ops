import { useNavigate } from "@tanstack/react-router";
import { Database, Plus } from "lucide-react";
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

export function EmptyEntitiesState() {
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const navigate = useNavigate();
  const { organizationId } = useOrganizationContext();
  const createEntity = useCreateEntity();

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

  return (
    <div className="flex h-full flex-col items-center justify-center px-4">
      <div className="flex size-16 items-center justify-center rounded-full bg-muted">
        <Database className="size-8 text-muted-foreground" />
      </div>
      <h2 className="mt-4 font-semibold text-lg">No entities yet</h2>
      <p className="mt-1 max-w-sm text-center text-muted-foreground text-sm">
        Entities define the structure of your data. Create your first entity to
        start organizing your information.
      </p>
      <Dialog onOpenChange={setOpen} open={open}>
        <DialogTrigger asChild>
          <Button className="mt-6">
            <Plus className="size-4" />
            Create your first entity
          </Button>
        </DialogTrigger>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Create entity</DialogTitle>
              <DialogDescription>
                Give your entity a name. You can configure its attributes in the
                settings.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Input
                autoFocus
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Contact, Project, Task"
                value={name}
              />
            </div>
            <DialogFooter>
              <Button
                onClick={() => setOpen(false)}
                type="button"
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                disabled={!name.trim() || createEntity.isPending}
                type="submit"
              >
                {createEntity.isPending ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

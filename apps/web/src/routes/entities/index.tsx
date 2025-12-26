import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, ChevronRight, Database, Plus } from "lucide-react";

import { CreateEntityDialog } from "@/components/create-entity-dialog";
import { EmptyEntitiesState } from "@/components/empty-entities-state";
import { PageHeader, PageToolbar } from "@/components/header";
import { Button } from "@/components/ui/button";
import { useEntities } from "@/hooks/use-entities";

export const Route = createFileRoute("/entities/")({
  component: EntitiesPage,
});

function EntitiesPage() {
  const { data: entities, isLoading } = useEntities();

  if (isLoading) {
    return (
      <div className="flex h-full flex-col">
        <PageHeader count={0} icon={Database} title="Сущности" />
        <PageToolbar />
        <div className="flex flex-1 items-center justify-center">
          <div className="text-muted-foreground">Загрузка...</div>
        </div>
      </div>
    );
  }

  if (!entities || entities.length === 0) {
    return (
      <div className="flex h-full flex-col">
        <EmptyEntitiesState />
      </div>
    );
  }

  const toolbarRight = (
    <CreateEntityDialog
      trigger={
        <Button size="sm">
          <Plus className="size-4" />
          Создать сущность
        </Button>
      }
    />
  );

  return (
    <div className="flex h-full flex-col">
      <PageHeader count={entities.length} icon={Database} title="Сущности" />
      <PageToolbar right={toolbarRight} />
      <div className="flex-1 overflow-auto px-4 pb-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {entities.map((entity) => (
            <Link
              className="group flex items-center justify-between rounded-lg border bg-card p-4 transition-colors hover:bg-accent"
              key={entity.id}
              params={{ entitySlug: entity.slug }}
              to="/entities/$entitySlug"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                  <Building2 className="size-5 text-muted-foreground" />
                </div>
                <div>
                  <div className="font-medium">{entity.pluralName}</div>
                  <div className="text-muted-foreground text-sm">
                    {entity.attributes?.length ?? 0} атрибутов
                  </div>
                </div>
              </div>
              <ChevronRight className="size-5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

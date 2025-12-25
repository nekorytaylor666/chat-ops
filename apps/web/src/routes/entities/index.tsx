import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { EmptyEntitiesState } from "@/components/empty-entities-state";
import { useEntities } from "@/hooks/use-entities";

export const Route = createFileRoute("/entities/")({
  component: EntitiesPage,
});

function EntitiesPage() {
  const { data: entities, isLoading } = useEntities();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && entities && entities.length > 0) {
      const firstEntity = entities[0];
      if (firstEntity) {
        navigate({
          to: "/entities/$entitySlug",
          params: { entitySlug: firstEntity.slug },
        });
      }
    }
  }, [entities, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
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

  // Redirecting...
  return null;
}

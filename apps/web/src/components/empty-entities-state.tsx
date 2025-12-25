import { Database, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyEntitiesStateProps {
  onCreateEntity: () => void;
}

export function EmptyEntitiesState({
  onCreateEntity,
}: EmptyEntitiesStateProps) {
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
      <Button className="mt-6" onClick={onCreateEntity}>
        <Plus className="size-4" />
        Create your first entity
      </Button>
    </div>
  );
}

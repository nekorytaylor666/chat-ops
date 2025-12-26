import { Database, Plus } from "lucide-react";

import { CreateEntityDialog } from "@/components/create-entity-dialog";
import { Button } from "@/components/ui/button";

export function EmptyEntitiesState() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-4">
      <div className="flex size-16 items-center justify-center rounded-full bg-muted">
        <Database className="size-8 text-muted-foreground" />
      </div>
      <h2 className="mt-4 font-semibold text-lg">Пока нет сущностей</h2>
      <p className="mt-1 max-w-sm text-center text-muted-foreground text-sm">
        Сущности определяют структуру ваших данных. Создайте первую сущность,
        чтобы начать организацию информации.
      </p>
      <CreateEntityDialog
        trigger={
          <Button className="mt-6">
            <Plus className="size-4" />
            Создать первую сущность
          </Button>
        }
      />
    </div>
  );
}

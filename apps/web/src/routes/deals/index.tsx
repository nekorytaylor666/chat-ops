import { createFileRoute } from "@tanstack/react-router";
import { MessageSquare } from "lucide-react";

export const Route = createFileRoute("/deals/")({
  component: DealsIndex,
});

function DealsIndex() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 text-muted-foreground">
      <MessageSquare className="size-16 opacity-50" />
      <h2 className="font-semibold text-lg">
        Выберите сделку для начала общения
      </h2>
      <p className="text-sm">
        Выберите сделку из боковой панели для просмотра переписки
      </p>
    </div>
  );
}

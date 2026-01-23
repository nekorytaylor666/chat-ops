import { Link } from "@tanstack/react-router";
import { Check, Circle, CircleDot, MessageSquare, User } from "lucide-react";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockDeals } from "@/lib/chat-mock-data";
import { cn } from "@/lib/utils";
import type { Deal, StageStatus } from "@/types/chat";

const stageTemplates = [
  { name: "Квалификация", target: "Проверить намерение и бюджет клиента" },
  {
    name: "Выявление потребностей",
    target: "Понять требования и предпочтения клиента",
  },
  { name: "Подбор автомобиля", target: "Представить подходящие варианты" },
  { name: "Тест-драйв", target: "Назначить и провести тест-драйв" },
  { name: "Переговоры", target: "Согласовать итоговую цену и условия" },
  { name: "Оформление", target: "Оформить кредит и документы" },
  { name: "Успешная сделка", target: "Выдать автомобиль и получить оплату" },
];

function getStatusIcon(status: StageStatus, size: "sm" | "md" = "sm") {
  const sizeClass = size === "sm" ? "size-3" : "size-4";
  switch (status) {
    case "completed":
      return <Check className={cn(sizeClass, "text-green-500")} />;
    case "active":
      return <CircleDot className={cn(sizeClass, "text-blue-500")} />;
    case "pending":
      return <Circle className={cn(sizeClass, "text-muted-foreground")} />;
  }
}

function getCurrentStageIndex(deal: Deal): number {
  return deal.stages.findIndex((s) => s.id === deal.currentStageId);
}

type KanbanColumn = {
  name: string;
  target: string;
  deals: Deal[];
};

function DealCard({ deal }: { deal: Deal }) {
  const currentStage = deal.stages.find((s) => s.id === deal.currentStageId);

  return (
    <Link
      className="block"
      params={{
        dealId: deal.id,
        stageId: deal.currentStageId,
      }}
      to="/deals/$dealId/$stageId"
    >
      <Card className="cursor-pointer gap-3 py-3 transition-shadow hover:shadow-md">
        <CardHeader className="px-3 py-0">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-sm">{deal.name}</CardTitle>
            {deal.unreadCount > 0 && (
              <Badge className="shrink-0" variant="default">
                {deal.unreadCount}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-2 px-3 py-0">
          <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
            <User className="size-3" />
            <span>{deal.clientName}</span>
          </div>
          {currentStage && (
            <div className="flex items-center gap-1.5 text-xs">
              {getStatusIcon(currentStage.status)}
              <span className="text-muted-foreground">{currentStage.name}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 pt-1 text-muted-foreground text-xs">
            <MessageSquare className="size-3" />
            <span>Открыть чат</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function KanbanColumn({
  column,
  index,
}: {
  column: KanbanColumn;
  index: number;
}) {
  const getColumnHeaderColor = (idx: number) => {
    const colors = [
      "bg-slate-100 text-slate-700",
      "bg-blue-50 text-blue-700",
      "bg-purple-50 text-purple-700",
      "bg-amber-50 text-amber-700",
      "bg-orange-50 text-orange-700",
      "bg-cyan-50 text-cyan-700",
      "bg-green-50 text-green-700",
    ];
    return colors[idx % colors.length];
  };

  return (
    <div className="flex w-72 shrink-0 flex-col rounded-lg bg-muted/30">
      <div
        className={cn(
          "flex items-center justify-between rounded-t-lg px-3 py-2",
          getColumnHeaderColor(index)
        )}
      >
        <div>
          <h3 className="font-medium text-sm">{column.name}</h3>
          <p className="text-xs opacity-70">{column.target}</p>
        </div>
        <Badge className="shrink-0" variant="secondary">
          {column.deals.length}
        </Badge>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-2">
        {column.deals.length === 0 ? (
          <div className="flex h-24 items-center justify-center text-muted-foreground text-sm">
            Нет сделок
          </div>
        ) : (
          column.deals.map((deal) => <DealCard deal={deal} key={deal.id} />)
        )}
      </div>
    </div>
  );
}

export function DealsKanban() {
  const columns = useMemo<KanbanColumn[]>(
    () =>
      stageTemplates.map((template, index) => ({
        name: template.name,
        target: template.target,
        deals: mockDeals.filter((deal) => getCurrentStageIndex(deal) === index),
      })),
    []
  );

  return (
    <div className="flex h-full gap-4 overflow-x-auto pb-4">
      {columns.map((column, index) => (
        <KanbanColumn column={column} index={index} key={column.name} />
      ))}
    </div>
  );
}

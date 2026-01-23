import { Link } from "@tanstack/react-router";
import type { CellContext, ColumnDef } from "@tanstack/react-table";
import { ExternalLink, MessageSquare } from "lucide-react";
import { useMemo } from "react";
import { EntityGrid } from "@/components/entity-grid/entity-grid";
import { Button } from "@/components/ui/button";
import { mockDeals } from "@/lib/chat-mock-data";
import type { Deal, Stage, StageStatus } from "@/types/chat";
import type { CellSelectOption } from "@/types/data-grid";

// Stage options for the select column
const stageOptions: CellSelectOption[] = [
  { label: "Квалификация", value: "Квалификация" },
  { label: "Выявление потребностей", value: "Выявление потребностей" },
  { label: "Подбор автомобиля", value: "Подбор автомобиля" },
  { label: "Тест-драйв", value: "Тест-драйв" },
  { label: "Переговоры", value: "Переговоры" },
  { label: "Оформление", value: "Оформление" },
  { label: "Успешная сделка", value: "Успешная сделка" },
];

// Status options for the select column
const statusOptions: CellSelectOption[] = [
  { label: "Завершён", value: "completed" },
  { label: "Активный", value: "active" },
  { label: "Ожидание", value: "pending" },
];

function getCurrentStage(deal: Deal): Stage | undefined {
  return deal.stages.find((s) => s.id === deal.currentStageId);
}

function getStageProgress(deal: Deal): number {
  const completedStages = deal.stages.filter(
    (s) => s.status === "completed"
  ).length;
  return Math.round((completedStages / deal.stages.length) * 100);
}

// Row data structure for the grid
type DealRow = {
  id: string;
  name: string;
  clientName: string;
  currentStageName: string;
  status: StageStatus;
  progress: number;
  unreadCount: number;
  dealId: string;
  currentStageId: string;
};

// Custom cell for actions column
function ActionsCell({ row }: CellContext<DealRow, unknown>) {
  return (
    <Button asChild className="h-7" size="sm" variant="ghost">
      <Link
        params={{
          dealId: row.original.dealId,
          stageId: row.original.currentStageId,
        }}
        to="/deals/$dealId/$stageId"
      >
        <MessageSquare className="mr-1 size-3.5" />
        Чат
        <ExternalLink className="ml-1 size-3" />
      </Link>
    </Button>
  );
}

// Column definitions
const columns: ColumnDef<DealRow>[] = [
  {
    accessorKey: "name",
    id: "name",
    header: "Сделка",
    size: 200,
    meta: {
      label: "Сделка",
      cell: { variant: "short-text" },
    },
  },
  {
    accessorKey: "clientName",
    id: "clientName",
    header: "Клиент",
    size: 180,
    meta: {
      label: "Клиент",
      cell: { variant: "short-text" },
    },
  },
  {
    accessorKey: "currentStageName",
    id: "currentStageName",
    header: "Текущий этап",
    size: 180,
    meta: {
      label: "Текущий этап",
      cell: { variant: "select", options: stageOptions },
    },
  },
  {
    accessorKey: "status",
    id: "status",
    header: "Статус",
    size: 140,
    meta: {
      label: "Статус",
      cell: { variant: "select", options: statusOptions },
    },
  },
  {
    accessorKey: "progress",
    id: "progress",
    header: "Прогресс %",
    size: 120,
    meta: {
      label: "Прогресс %",
      cell: { variant: "number", min: 0, max: 100 },
    },
  },
  {
    accessorKey: "unreadCount",
    id: "unreadCount",
    header: "Непрочитанные",
    size: 140,
    meta: {
      label: "Непрочитанные",
      cell: { variant: "number", min: 0 },
    },
  },
  {
    id: "actions",
    header: "Действия",
    size: 120,
    cell: ActionsCell,
    enableSorting: false,
    enableResizing: false,
  },
];

export function DealsDataGrid() {
  // Transform mock deals into flat row data
  const data = useMemo<DealRow[]>(
    () =>
      mockDeals.map((deal) => {
        const currentStage = getCurrentStage(deal);
        return {
          id: deal.id,
          name: deal.name,
          clientName: deal.clientName,
          currentStageName: currentStage?.name ?? "",
          status: currentStage?.status ?? "pending",
          progress: getStageProgress(deal),
          unreadCount: deal.unreadCount,
          dealId: deal.id,
          currentStageId: deal.currentStageId,
        };
      }),
    []
  );

  return (
    <EntityGrid
      columns={columns}
      compactHeader
      data={data}
      enableSearch
      getRowId={(row) => row.id}
      height={600}
      readOnly
      showHeader={false}
      stretchColumns
    />
  );
}

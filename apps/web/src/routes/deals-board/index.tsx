import { createFileRoute } from "@tanstack/react-router";
import { Handshake, LayoutGrid, Table } from "lucide-react";
import { useState } from "react";
import { DealsDataGrid } from "@/components/deals-board/deals-data-grid";
import { DealsKanban } from "@/components/deals-board/deals-kanban";
import { PageHeader, PageToolbar } from "@/components/header";
import { Button } from "@/components/ui/button";
import { mockDeals } from "@/lib/chat-mock-data";

export const Route = createFileRoute("/deals-board/")({
  component: DealsBoardPage,
});

type ViewMode = "grid" | "kanban";

function DealsBoardPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("kanban");

  const toolbarLeft = (
    <div className="flex items-center rounded-md border p-0.5">
      <Button
        className="h-7 px-2"
        onClick={() => setViewMode("kanban")}
        size="sm"
        variant={viewMode === "kanban" ? "secondary" : "ghost"}
      >
        <LayoutGrid className="mr-1 size-3.5" />
        Канбан
      </Button>
      <Button
        className="h-7 px-2"
        onClick={() => setViewMode("grid")}
        size="sm"
        variant={viewMode === "grid" ? "secondary" : "ghost"}
      >
        <Table className="mr-1 size-3.5" />
        Таблица
      </Button>
    </div>
  );

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <PageHeader count={mockDeals.length} icon={Handshake} title="Сделки" />
      <PageToolbar left={toolbarLeft} />
      <div className="min-h-0 flex-1 overflow-auto p-4">
        {viewMode === "kanban" ? <DealsKanban /> : <DealsDataGrid />}
      </div>
    </div>
  );
}

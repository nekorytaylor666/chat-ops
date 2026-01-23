import { Link, useParams } from "@tanstack/react-router";
import {
  AlertCircle,
  ChevronDown,
  Home,
  Loader2,
  MessageSquare,
  Plus,
  Search,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { useChatDeals } from "@/hooks/use-chat-deals";
import type { Deal } from "@/types/chat";
import { DealItem } from "./deal-item";

function DealsContent({
  deals,
  isLoading,
  isError,
  currentDealId,
}: {
  deals: Deal[];
  isLoading: boolean;
  isError: boolean;
  currentDealId: string | undefined;
}) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-8 text-muted-foreground">
        <AlertCircle className="size-5" />
        <span className="text-sm">Ошибка загрузки сделок</span>
      </div>
    );
  }

  return (
    <Collapsible className="group/deals" defaultOpen>
      <CollapsibleTrigger className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 font-medium text-muted-foreground text-xs hover:bg-accent">
        <MessageSquare className="size-3.5" />
        <span>Активные сделки</span>
        <span className="ml-auto rounded-full bg-primary/10 px-1.5 py-0.5 font-semibold text-[10px] text-primary">
          {deals.length}
        </span>
        <ChevronDown className="size-3 transition-transform group-data-[state=open]/deals:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-1 space-y-0.5">
        {deals.length === 0 ? (
          <div className="py-4 text-center text-muted-foreground text-sm">
            Сделки не найдены
          </div>
        ) : (
          deals.map((deal) => (
            <DealItem
              deal={deal}
              isExpanded={deal.id === currentDealId}
              key={deal.id}
            />
          ))
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}

export function DealsSidebar() {
  const [search, setSearch] = useState("");
  const params = useParams({ strict: false });
  const currentDealId = params.dealId;

  const { deals, isLoading, isError } = useChatDeals({ search });

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r bg-sidebar">
      <header className="flex h-12 items-center justify-between border-b px-3">
        <div className="flex items-center gap-2">
          <div className="flex size-6 items-center justify-center rounded-md bg-primary font-semibold text-primary-foreground text-xs">
            D
          </div>
          <span className="font-semibold text-sm">Сделки</span>
        </div>
        <Button asChild className="size-7" size="icon" variant="ghost">
          <Link to="/">
            <Home className="size-4" />
          </Link>
        </Button>
      </header>

      <div className="p-2">
        <div className="relative">
          <Search className="absolute top-1/2 left-2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="h-8 bg-background pl-8 text-sm"
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск сделок..."
            value={search}
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto p-2">
        <DealsContent
          currentDealId={currentDealId}
          deals={deals}
          isError={isError}
          isLoading={isLoading}
        />
      </div>

      <footer className="border-t p-2">
        <Button
          className="w-full justify-start gap-2 text-muted-foreground"
          size="sm"
          variant="ghost"
        >
          <Plus className="size-4" />
          <span>Новая сделка</span>
        </Button>
      </footer>
    </aside>
  );
}

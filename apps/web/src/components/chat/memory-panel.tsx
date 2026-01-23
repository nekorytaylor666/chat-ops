import { Brain, Loader2 } from "lucide-react";
import { useChatMemory } from "@/hooks/use-chat-memory";
import type { Deal, Stage } from "@/types/chat";
import { MemorySection } from "./memory-section";

type MemoryPanelProps = {
  deal: Deal;
  stage: Stage;
};

/**
 * Content-only version of MemoryPanel for use inside tabbed interfaces
 */
export function MemoryPanelContent({ deal, stage }: MemoryPanelProps) {
  const { dealMemory, stageMemory, pinnedItems, isLoading } = useChatMemory(
    deal.id,
    stage.id
  );

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center py-8">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto p-4">
      <div className="space-y-4">
        {pinnedItems.length > 0 && (
          <MemorySection isPinned items={pinnedItems} title="Закреплено" />
        )}

        {dealMemory.length > 0 && (
          <MemorySection
            items={dealMemory}
            subtitle="Сохраняется на всех этапах"
            title="Память сделки"
          />
        )}

        {stageMemory.length > 0 && (
          <MemorySection
            items={stageMemory}
            subtitle="Только для этого этапа"
            title={`Память: ${stage.name}`}
          />
        )}

        {pinnedItems.length === 0 &&
          dealMemory.length === 0 &&
          stageMemory.length === 0 && (
            <div className="text-center text-muted-foreground text-sm">
              Пока нет записей. AI будет извлекать информацию из переписки.
            </div>
          )}
      </div>
    </div>
  );
}

/**
 * Full panel with header and wrapper for standalone usage
 */
export function MemoryPanel({ deal, stage }: MemoryPanelProps) {
  return (
    <aside className="flex h-full w-80 shrink-0 flex-col bg-muted/30">
      <header className="flex h-12 items-center gap-2 border-b bg-background px-4">
        <Brain className="size-4 text-primary" />
        <h2 className="font-semibold text-sm">AI Память</h2>
      </header>
      <MemoryPanelContent deal={deal} stage={stage} />
    </aside>
  );
}

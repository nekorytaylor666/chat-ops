import { Brain } from "lucide-react";
import { getDealLevelMemory, getMemoryForStage } from "@/lib/chat-mock-data";
import type { Deal, Stage } from "@/types/chat";
import { MemorySection } from "./memory-section";

type MemoryPanelProps = {
  deal: Deal;
  stage: Stage;
};

export function MemoryPanel({ deal, stage }: MemoryPanelProps) {
  const dealMemory = getDealLevelMemory(deal.id);
  const stageMemory = getMemoryForStage(deal.id, stage.id);

  const pinnedItems = [...dealMemory, ...stageMemory].filter((m) => m.isPinned);
  const unpinnedDealMemory = dealMemory.filter((m) => !m.isPinned);
  const unpinnedStageMemory = stageMemory.filter((m) => !m.isPinned);

  return (
    <aside className="flex h-full w-80 shrink-0 flex-col bg-muted/30">
      <header className="flex h-12 items-center gap-2 border-b bg-background px-4">
        <Brain className="size-4 text-primary" />
        <h2 className="font-semibold text-sm">AI Memory</h2>
      </header>

      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-4">
          {pinnedItems.length > 0 && (
            <MemorySection isPinned items={pinnedItems} title="Pinned" />
          )}

          {unpinnedDealMemory.length > 0 && (
            <MemorySection
              items={unpinnedDealMemory}
              subtitle="Persists across all stages"
              title="Deal Memory"
            />
          )}

          {unpinnedStageMemory.length > 0 && (
            <MemorySection
              items={unpinnedStageMemory}
              subtitle="Specific to this stage"
              title={`${stage.name} Memory`}
            />
          )}

          {pinnedItems.length === 0 &&
            unpinnedDealMemory.length === 0 &&
            unpinnedStageMemory.length === 0 && (
              <div className="text-center text-muted-foreground text-sm">
                No memory items yet. AI will extract information from
                conversations.
              </div>
            )}
        </div>
      </div>
    </aside>
  );
}

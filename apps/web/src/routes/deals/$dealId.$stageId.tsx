import { createFileRoute } from "@tanstack/react-router";
import { AlertCircle, Brain, History, Loader2 } from "lucide-react";
import { ChatArea } from "@/components/chat/chat-area";
import { InheritedDataPanelContent } from "@/components/chat/inherited-data-panel";
import { MemoryPanelContent } from "@/components/chat/memory-panel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useChatStage } from "@/hooks/use-chat-deals";

export const Route = createFileRoute("/deals/$dealId/$stageId")({
  component: StageChat,
});

function StageChat() {
  const { dealId, stageId } = Route.useParams();
  const { deal, stage, isLoading, isError } = useChatStage(dealId, stageId);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
        <AlertCircle className="size-8" />
        <span>Ошибка загрузки сделки</span>
      </div>
    );
  }

  if (!(deal && stage)) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Сделка или этап не найдены
      </div>
    );
  }

  return (
    <>
      <ChatArea deal={deal} stage={stage} />
      <RightPanel deal={deal} stage={stage} />
    </>
  );
}

type RightPanelProps = {
  deal: NonNullable<ReturnType<typeof useChatStage>["deal"]>;
  stage: NonNullable<ReturnType<typeof useChatStage>["stage"]>;
};

function RightPanel({ deal, stage }: RightPanelProps) {
  return (
    <aside className="flex h-full w-80 shrink-0 flex-col bg-muted/30">
      <Tabs className="flex h-full flex-col" defaultValue="memory">
        <header className="flex h-12 items-center border-b bg-background px-2">
          <TabsList className="h-8">
            <TabsTrigger className="gap-1.5 text-xs" value="memory">
              <Brain className="size-3" />
              Память
            </TabsTrigger>
            <TabsTrigger className="gap-1.5 text-xs" value="data">
              <History className="size-3" />
              Данные
            </TabsTrigger>
          </TabsList>
        </header>
        <TabsContent className="mt-0 flex-1 overflow-hidden" value="memory">
          <MemoryPanelContent deal={deal} stage={stage} />
        </TabsContent>
        <TabsContent className="mt-0 flex-1 overflow-hidden" value="data">
          <InheritedDataPanelContent deal={deal} stage={stage} />
        </TabsContent>
      </Tabs>
    </aside>
  );
}

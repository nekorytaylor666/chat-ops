import { createFileRoute } from "@tanstack/react-router";
import { ChatArea } from "@/components/chat/chat-area";
import { MemoryPanel } from "@/components/chat/memory-panel";
import { getDealById, getStageById } from "@/lib/chat-mock-data";

export const Route = createFileRoute("/deals/$dealId/$stageId")({
  component: StageChat,
});

function StageChat() {
  const { dealId, stageId } = Route.useParams();
  const deal = getDealById(dealId);
  const stage = getStageById(dealId, stageId);

  if (!(deal && stage)) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Deal or stage not found
      </div>
    );
  }

  return (
    <>
      <ChatArea deal={deal} stage={stage} />
      <MemoryPanel deal={deal} stage={stage} />
    </>
  );
}

import type { Deal, Stage } from "@/types/chat";
import { ChatHeader } from "./chat-header";
import { MessageInput } from "./message-input";
import { MessageList } from "./message-list";

type ChatAreaProps = {
  deal: Deal;
  stage: Stage;
};

export function ChatArea({ deal, stage }: ChatAreaProps) {
  return (
    <div className="flex min-w-0 flex-1 flex-col border-r">
      <ChatHeader deal={deal} stage={stage} />
      <MessageList stageId={stage.id} />
      <MessageInput />
    </div>
  );
}

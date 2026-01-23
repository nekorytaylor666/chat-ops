import { Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { useChatMessages } from "@/hooks/use-chat-messages";
import { MessageItem } from "./message-item";

type MessageListProps = {
  dealId: string;
  stageId: string;
};

export function MessageList({ dealId, stageId }: MessageListProps) {
  const { messages, isLoading } = useChatMessages(dealId, stageId);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  });

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center text-muted-foreground">
        Пока нет сообщений на этом этапе
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-4" ref={scrollRef}>
      <div className="space-y-4">
        {messages.map((message) => (
          <MessageItem key={message.id} message={message} />
        ))}
      </div>
    </div>
  );
}

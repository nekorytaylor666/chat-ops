import { useEffect, useRef } from "react";
import { getMessagesForStage } from "@/lib/chat-mock-data";
import { MessageItem } from "./message-item";

type MessageListProps = {
  stageId: string;
};

export function MessageList({ stageId }: MessageListProps) {
  const messages = getMessagesForStage(stageId);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  });

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center text-muted-foreground">
        No messages in this stage yet
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

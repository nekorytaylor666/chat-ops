import { Bot } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { Message } from "@/types/chat";

type MessageItemProps = {
  message: Message;
};

function formatTimestamp(date: Date): string {
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 0) {
    return `Today at ${date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    })}`;
  }
  if (diffDays === 1) {
    return `Yesterday at ${date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    })}`;
  }
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function MessageItem({ message }: MessageItemProps) {
  const initials = message.authorName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div
      className={cn(
        "group flex gap-3",
        message.isAI && "-mx-4 rounded-lg bg-muted/30 px-4 py-3"
      )}
    >
      {message.isAI ? (
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <Bot className="size-4 text-primary" />
        </div>
      ) : (
        <Avatar className="size-8 shrink-0">
          <AvatarImage alt={message.authorName} src={message.authorAvatar} />
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span
            className={cn(
              "font-semibold text-sm",
              message.isAI && "text-primary"
            )}
          >
            {message.authorName}
          </span>
          <span className="text-muted-foreground text-xs">
            {formatTimestamp(message.timestamp)}
          </span>
        </div>
        <p
          className={cn(
            "mt-1 whitespace-pre-wrap text-sm",
            message.isAI && "text-muted-foreground italic"
          )}
        >
          {message.content}
        </p>
      </div>
    </div>
  );
}

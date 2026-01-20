import { Paperclip, Send, Smile } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function MessageInput() {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      return;
    }
    // In a real app, this would send the message
    setMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form className="border-t bg-background p-4" onSubmit={handleSubmit}>
      <div className="flex items-end gap-2">
        <Button
          className="size-8 shrink-0"
          size="icon"
          type="button"
          variant="ghost"
        >
          <Paperclip className="size-4" />
        </Button>
        <Textarea
          className="max-h-32 min-h-10 resize-none"
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          rows={1}
          value={message}
        />
        <Button
          className="size-8 shrink-0"
          size="icon"
          type="button"
          variant="ghost"
        >
          <Smile className="size-4" />
        </Button>
        <Button
          className="size-8 shrink-0"
          disabled={!message.trim()}
          size="icon"
          type="submit"
        >
          <Send className="size-4" />
        </Button>
      </div>
    </form>
  );
}

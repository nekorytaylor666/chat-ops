import { createFileRoute, Outlet } from "@tanstack/react-router";
import { ChatLayout } from "@/components/chat/chat-layout";

export const Route = createFileRoute("/deals")({
  component: DealsLayout,
});

function DealsLayout() {
  return (
    <ChatLayout>
      <Outlet />
    </ChatLayout>
  );
}

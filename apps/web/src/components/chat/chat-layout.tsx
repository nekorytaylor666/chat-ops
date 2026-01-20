import type { ReactNode } from "react";
import { DealsSidebar } from "./deals-sidebar";

type ChatLayoutProps = {
  children: ReactNode;
};

export function ChatLayout({ children }: ChatLayoutProps) {
  return (
    <div className="flex h-svh w-full bg-background">
      <DealsSidebar />
      <div className="flex min-w-0 flex-1">{children}</div>
    </div>
  );
}

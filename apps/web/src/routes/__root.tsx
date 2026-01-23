import type { AppRouter } from "@chat-ops/api/routers/index";
import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
  useLocation,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import type { TRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { WorkspaceProvider } from "@/contexts/workspace-context";
import Header, { PageHeaderProvider } from "../components/header";
import appCss from "../index.css?url";
export type RouterAppContext = {
  trpc: TRPCOptionsProxy<AppRouter>;
  queryClient: QueryClient;
};

export const Route = createRootRouteWithContext<RouterAppContext>()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "My App",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),

  component: RootDocument,
});

function RootDocument() {
  const pathname = useLocation({ select: (loc) => loc.pathname });
  // Only the deals chat routes (/deals and /deals/$dealId/$stageId) use special layout
  // /deals-board uses the standard layout with sidebar
  const isDealsRoute = pathname === "/deals" || pathname.startsWith("/deals/");

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <WorkspaceProvider>
          {isDealsRoute ? (
            <Outlet />
          ) : (
            <PageHeaderProvider>
              <SidebarProvider>
                <AppSidebar />
                <SidebarInset className="h-screen overflow-hidden">
                  <Header />
                  <div className="min-h-0 min-w-0 flex-1 overflow-hidden">
                    <Outlet />
                  </div>
                </SidebarInset>
              </SidebarProvider>
            </PageHeaderProvider>
          )}
        </WorkspaceProvider>

        <Toaster richColors />
        <TanStackRouterDevtools position="bottom-left" />
        <ReactQueryDevtools buttonPosition="bottom-right" position="bottom" />
        <Scripts />
      </body>
    </html>
  );
}

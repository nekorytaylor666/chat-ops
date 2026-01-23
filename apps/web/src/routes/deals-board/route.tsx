import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/deals-board")({
  component: DealsboardLayout,
});

function DealsboardLayout() {
  return <Outlet />;
}

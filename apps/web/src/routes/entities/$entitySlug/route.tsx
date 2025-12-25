import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/entities/$entitySlug")({
  component: EntitySlugLayout,
});

function EntitySlugLayout() {
  return <Outlet />;
}

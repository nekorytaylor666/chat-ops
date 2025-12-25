import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import * as React from "react";
import { useWorkspaceContext } from "@/contexts/workspace-context";

export const Route = createFileRoute("/entities")({
  component: EntitiesLayout,
});

function EntitiesLayout() {
  const { workspaceId } = useWorkspaceContext();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!workspaceId) {
      navigate({ to: "/login" });
    }
  }, [workspaceId, navigate]);

  if (!workspaceId) {
    return null;
  }

  return <Outlet />;
}

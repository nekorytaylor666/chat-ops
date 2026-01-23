import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import * as React from "react";
import { useOrganizationContext } from "@/contexts/workspace-context";

export const Route = createFileRoute("/workflows")({
  component: WorkflowsLayout,
});

function WorkflowsLayout() {
  const { organizationId } = useOrganizationContext();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!organizationId) {
      navigate({ to: "/login" });
    }
  }, [organizationId, navigate]);

  if (!organizationId) {
    return null;
  }

  return <Outlet />;
}

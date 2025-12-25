import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import * as React from "react";
import { useOrganizationContext } from "@/contexts/workspace-context";

export const Route = createFileRoute("/entities")({
  component: EntitiesLayout,
});

function EntitiesLayout() {
  const { organizationId } = useOrganizationContext();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
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

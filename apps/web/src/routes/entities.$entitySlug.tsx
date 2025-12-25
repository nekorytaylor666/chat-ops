import {
  createFileRoute,
  Outlet,
  useNavigate,
  useParams,
} from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/entities/$entitySlug")({
  component: EntitySlugLayout,
});

function EntitySlugLayout() {
  const { entitySlug } = useParams({ from: "/entities/$entitySlug" });
  const navigate = useNavigate();

  // Check if we're at the index (no child route) and redirect to settings
  useEffect(() => {
    const path = window.location.pathname;
    if (path === `/entities/${entitySlug}`) {
      navigate({
        to: "/entities/$entitySlug/settings",
        params: { entitySlug },
      });
    }
  }, [entitySlug, navigate]);

  return <Outlet />;
}

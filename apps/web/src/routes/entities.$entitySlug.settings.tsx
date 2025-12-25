import { createFileRoute } from "@tanstack/react-router";
import { EntitySettingsPage } from "@/components/entity-settings/entity-settings-page";

export const Route = createFileRoute("/entities/$entitySlug/settings")({
  component: EntitySettingsRoute,
});

function EntitySettingsRoute() {
  const { entitySlug } = Route.useParams();
  return <EntitySettingsPage entitySlug={entitySlug} />;
}

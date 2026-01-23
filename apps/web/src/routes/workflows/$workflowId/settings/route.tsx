import { createFileRoute } from "@tanstack/react-router";
import { WorkflowSettingsPage } from "@/components/workflow-settings/workflow-settings-page";

export const Route = createFileRoute("/workflows/$workflowId/settings")({
  component: WorkflowSettingsRoute,
});

function WorkflowSettingsRoute() {
  const { workflowId } = Route.useParams();
  return <WorkflowSettingsPage workflowId={workflowId} />;
}

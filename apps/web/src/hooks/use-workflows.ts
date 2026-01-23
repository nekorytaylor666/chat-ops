import { useQuery } from "@tanstack/react-query";
import { useOrganizationContext } from "@/contexts/workspace-context";
import type { WorkflowStatus } from "@/types/workflow";
import { useTRPC } from "@/utils/trpc";

type UseWorkflowsOptions = {
  status?: WorkflowStatus;
  enabled?: boolean;
};

export function useWorkflows(options: UseWorkflowsOptions = {}) {
  const trpc = useTRPC();
  const { organizationId } = useOrganizationContext();
  const { status, enabled = true } = options;

  return useQuery(
    trpc.workflow.list.queryOptions(
      {
        organizationId: organizationId ?? "",
        status,
      },
      { enabled: enabled && Boolean(organizationId) }
    )
  );
}

export function useWorkflow(workflowId: string) {
  const trpc = useTRPC();

  return useQuery(
    trpc.workflow.getById.queryOptions(
      { workflowId },
      { enabled: Boolean(workflowId) }
    )
  );
}

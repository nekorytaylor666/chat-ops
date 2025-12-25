import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useTRPC } from "@/utils/trpc";

const WORKSPACE_STORAGE_KEY = "workspace_id";
const DEFAULT_WORKSPACE_NAME = "Default Workspace";
const DEFAULT_WORKSPACE_SLUG = "default";

function getStoredWorkspaceId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(WORKSPACE_STORAGE_KEY);
}

function setStoredWorkspaceId(id: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(WORKSPACE_STORAGE_KEY, id);
}

export function useWorkspace() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const workspacesQuery = useQuery(trpc.workspace.list.queryOptions());

  const createWorkspaceMutation = useMutation(
    trpc.workspace.create.mutationOptions({
      onSuccess: (workspace) => {
        setStoredWorkspaceId(workspace.id);
        queryClient.invalidateQueries({
          queryKey: trpc.workspace.list.queryKey(),
        });
      },
    })
  );

  const workspaces = workspacesQuery.data ?? [];
  const storedId = getStoredWorkspaceId();

  // Find workspace by stored ID or use first available
  const currentWorkspace =
    workspaces.find((w) => w.id === storedId) ?? workspaces[0];

  // Auto-create default workspace if none exists
  useEffect(() => {
    if (
      workspacesQuery.isSuccess &&
      workspaces.length === 0 &&
      !createWorkspaceMutation.isPending
    ) {
      createWorkspaceMutation.mutate({
        name: DEFAULT_WORKSPACE_NAME,
        slug: DEFAULT_WORKSPACE_SLUG,
      });
    }
  }, [
    workspacesQuery.isSuccess,
    workspaces.length,
    createWorkspaceMutation.isPending,
    createWorkspaceMutation.mutate,
  ]);

  // Store workspace ID when we have one
  useEffect(() => {
    if (currentWorkspace) {
      setStoredWorkspaceId(currentWorkspace.id);
    }
  }, [currentWorkspace?.id]);

  const isLoading =
    workspacesQuery.isLoading ||
    (workspaces.length === 0 && createWorkspaceMutation.isPending);

  return {
    workspaceId: currentWorkspace?.id ?? null,
    workspace: currentWorkspace ?? null,
    workspaces,
    isLoading,
    isError: workspacesQuery.isError,
    error: workspacesQuery.error,
  };
}

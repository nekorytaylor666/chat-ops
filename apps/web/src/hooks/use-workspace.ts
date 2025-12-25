import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useTRPC } from "@/utils/trpc";

const WORKSPACE_STORAGE_KEY = "workspace_id";

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

  const workspacesQuery = useQuery({
    ...trpc.workspace.list.queryOptions(),
    retry: false, // Don't retry on auth errors
  });

  const workspaces = workspacesQuery.data ?? [];
  const storedId = getStoredWorkspaceId();

  // Find workspace by stored ID or use first available
  const currentWorkspace =
    workspaces.find((w) => w.id === storedId) ?? workspaces[0];

  // Store workspace ID when we have one
  useEffect(() => {
    if (currentWorkspace) {
      setStoredWorkspaceId(currentWorkspace.id);
    }
  }, [currentWorkspace?.id]);

  return {
    workspaceId: currentWorkspace?.id ?? null,
    workspace: currentWorkspace ?? null,
    workspaces,
    isLoading: workspacesQuery.isLoading,
    isError: workspacesQuery.isError,
    error: workspacesQuery.error,
  };
}

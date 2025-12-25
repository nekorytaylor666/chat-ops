import * as React from "react";
import Loader from "@/components/loader";
import { useWorkspace } from "@/hooks/use-workspace";

interface WorkspaceContextValue {
  workspaceId: string | null;
}

const WorkspaceContext = React.createContext<WorkspaceContextValue | null>(
  null
);

function isUnauthorizedError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const err = error as { data?: { code?: string } };
  return err.data?.code === "UNAUTHORIZED";
}

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const { workspaceId, isLoading, isError, error } = useWorkspace();

  // On auth error, render children anyway (let routes handle redirect)
  // This allows /login to work without workspace
  if (isError && isUnauthorizedError(error)) {
    return (
      <WorkspaceContext.Provider value={{ workspaceId: null }}>
        {children}
      </WorkspaceContext.Provider>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="font-semibold text-lg">Failed to load workspace</h2>
          <p className="mt-1 text-muted-foreground text-sm">
            {error?.message ?? "An unexpected error occurred"}
          </p>
        </div>
      </div>
    );
  }

  if (!workspaceId) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="font-semibold text-lg">No workspace available</h2>
          <p className="mt-1 text-muted-foreground text-sm">
            Unable to create or load a workspace. Please try refreshing the
            page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <WorkspaceContext.Provider value={{ workspaceId }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspaceContext(): WorkspaceContextValue {
  const context = React.useContext(WorkspaceContext);
  if (!context) {
    throw new Error(
      "useWorkspaceContext must be used within WorkspaceProvider"
    );
  }
  return context;
}

import { useLocation, useNavigate } from "@tanstack/react-router";
import * as React from "react";
import Loader from "@/components/loader";
import { authClient } from "@/lib/auth-client";

interface OrganizationContextValue {
  organizationId: string | null;
}

const OrganizationContext =
  React.createContext<OrganizationContextValue | null>(null);

export function OrganizationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: activeOrg, isPending: isActiveOrgPending } =
    authClient.useActiveOrganization();
  const { data: organizations, isPending: isOrgsLoading } =
    authClient.useListOrganizations();
  const { data: session, isPending: isSessionLoading } =
    authClient.useSession();

  const isLoading = isActiveOrgPending || isOrgsLoading || isSessionLoading;
  const isOnboardingPage = location.pathname === "/onboarding";
  const isLoginPage = location.pathname === "/login";

  // Set active organization if none is set but organizations exist
  React.useEffect(() => {
    if (!isLoading && session && !activeOrg && organizations?.length) {
      authClient.organization.setActive({
        organizationId: organizations[0].id,
      });
    }
  }, [isLoading, session, activeOrg, organizations]);

  // Redirect to onboarding if logged in but no organizations exist
  React.useEffect(() => {
    if (
      !isLoading &&
      session &&
      !organizations?.length &&
      !isOnboardingPage &&
      !isLoginPage
    ) {
      navigate({ to: "/onboarding" });
    }
  }, [
    isLoading,
    session,
    organizations,
    isOnboardingPage,
    isLoginPage,
    navigate,
  ]);

  // Allow login and onboarding pages to render without waiting for auth
  if (isLoginPage || isOnboardingPage) {
    return (
      <OrganizationContext.Provider value={{ organizationId: null }}>
        {children}
      </OrganizationContext.Provider>
    );
  }

  // If not logged in, render children (let routes handle redirect)
  if (!(isLoading || session)) {
    return (
      <OrganizationContext.Provider value={{ organizationId: null }}>
        {children}
      </OrganizationContext.Provider>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader />
      </div>
    );
  }

  // Show loader while redirecting to onboarding
  if (!(activeOrg || organizations?.length)) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <OrganizationContext.Provider
      value={{ organizationId: activeOrg?.id ?? null }}
    >
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganizationContext(): OrganizationContextValue {
  const context = React.useContext(OrganizationContext);
  if (!context) {
    throw new Error(
      "useOrganizationContext must be used within OrganizationProvider"
    );
  }
  return context;
}

// Backward compatibility aliases
export const WorkspaceProvider = OrganizationProvider;
export const useWorkspaceContext = useOrganizationContext;

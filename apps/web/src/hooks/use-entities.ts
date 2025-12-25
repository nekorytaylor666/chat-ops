import { useQuery } from "@tanstack/react-query";
import { useOrganizationContext } from "@/contexts/workspace-context";
import { useTRPC } from "@/utils/trpc";

export function useEntities() {
  const trpc = useTRPC();
  const { organizationId } = useOrganizationContext();

  return useQuery(
    trpc.entity.list.queryOptions(
      { organizationId: organizationId ?? "" },
      { enabled: Boolean(organizationId) }
    )
  );
}

export function useEntity(entityId: string) {
  const trpc = useTRPC();

  return useQuery(
    trpc.entity.getById.queryOptions(
      { entityId },
      { enabled: Boolean(entityId) }
    )
  );
}

export function useEntityBySlug(slug: string) {
  const trpc = useTRPC();
  const { organizationId } = useOrganizationContext();

  return useQuery(
    trpc.entity.getBySlug.queryOptions(
      { organizationId: organizationId ?? "", slug },
      { enabled: Boolean(slug) && Boolean(organizationId) }
    )
  );
}

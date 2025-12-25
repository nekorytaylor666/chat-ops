import { useQuery } from "@tanstack/react-query";
import { useWorkspaceContext } from "@/contexts/workspace-context";
import { useTRPC } from "@/utils/trpc";

export function useEntities() {
  const trpc = useTRPC();
  const { workspaceId } = useWorkspaceContext();

  return useQuery(trpc.entity.list.queryOptions({ workspaceId }));
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
  const { workspaceId } = useWorkspaceContext();

  return useQuery(
    trpc.entity.getBySlug.queryOptions(
      { workspaceId, slug },
      { enabled: Boolean(slug) }
    )
  );
}

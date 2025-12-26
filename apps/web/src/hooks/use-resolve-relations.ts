import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/utils/trpc";

export function useResolveRelations(recordIds: string[]) {
  const trpc = useTRPC();

  const filteredIds = recordIds.filter(Boolean);

  return useQuery(
    trpc.record.resolveRelations.queryOptions(
      { recordIds: filteredIds },
      {
        enabled: filteredIds.length > 0,
        staleTime: 5 * 60 * 1000,
      }
    )
  );
}

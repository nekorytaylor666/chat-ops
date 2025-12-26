import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/utils/trpc";

interface UseRelationRecordsOptions {
  targetEntityId: string;
  enabled?: boolean;
}

export function useRelationRecords({
  targetEntityId,
  enabled = true,
}: UseRelationRecordsOptions) {
  const trpc = useTRPC();

  return useQuery(
    trpc.record.list.queryOptions(
      {
        entityDefinitionId: targetEntityId,
        limit: 100,
      },
      {
        enabled: enabled && Boolean(targetEntityId),
      }
    )
  );
}

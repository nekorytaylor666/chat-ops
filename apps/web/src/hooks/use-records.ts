import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/utils/trpc";

interface UseRecordsOptions {
  entityDefinitionId: string;
  limit?: number;
  offset?: number;
  sortField?: string;
  sortOrder?: "asc" | "desc";
  enabled?: boolean;
}

export function useRecords({
  entityDefinitionId,
  limit = 50,
  offset = 0,
  sortField,
  sortOrder = "desc",
  enabled = true,
}: UseRecordsOptions) {
  const trpc = useTRPC();

  return useQuery(
    trpc.record.list.queryOptions(
      {
        entityDefinitionId,
        limit,
        offset,
        sortField,
        sortOrder,
      },
      {
        enabled: enabled && Boolean(entityDefinitionId),
      }
    )
  );
}

export function useRecord(recordId: string) {
  const trpc = useTRPC();

  return useQuery(
    trpc.record.getById.queryOptions(
      { recordId },
      { enabled: Boolean(recordId) }
    )
  );
}

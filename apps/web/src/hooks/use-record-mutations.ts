import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTRPC } from "@/utils/trpc";

type Record = {
  id: string;
  entityDefinitionId: string;
  values: globalThis.Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
};

export function useCreateRecord(entityDefinitionId: string) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.record.create.mutationOptions({
      onMutate: async (newRecord) => {
        const queryKey = trpc.record.list.queryKey({
          entityDefinitionId: newRecord.entityDefinitionId,
        });

        await queryClient.cancelQueries({ queryKey });

        const previousRecords = queryClient.getQueryData<Record[]>(queryKey);

        const optimisticRecord: Record = {
          id: `temp-${Date.now()}`,
          entityDefinitionId: newRecord.entityDefinitionId,
          values: newRecord.values,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        queryClient.setQueryData<Record[]>(queryKey, (old) => [
          optimisticRecord,
          ...(old ?? []),
        ]);

        return { previousRecords, queryKey };
      },
      onError: (_err, _newRecord, context) => {
        if (context?.previousRecords && context?.queryKey) {
          queryClient.setQueryData(context.queryKey, context.previousRecords);
        }
        toast.error("Failed to create record");
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.record.list.queryKey({ entityDefinitionId }),
        });
      },
    })
  );
}

export function useUpdateRecord(entityDefinitionId: string) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.record.update.mutationOptions({
      onMutate: async (updates) => {
        const queryKey = trpc.record.list.queryKey({ entityDefinitionId });

        await queryClient.cancelQueries({ queryKey });

        const previousRecords = queryClient.getQueryData<Record[]>(queryKey);

        queryClient.setQueryData<Record[]>(queryKey, (old) =>
          old?.map((record) =>
            record.id === updates.recordId
              ? {
                  ...record,
                  values: { ...record.values, ...updates.values },
                  updatedAt: new Date(),
                }
              : record
          )
        );

        return { previousRecords, queryKey };
      },
      onError: (_err, _updates, context) => {
        if (context?.previousRecords && context?.queryKey) {
          queryClient.setQueryData(context.queryKey, context.previousRecords);
        }
        toast.error("Failed to update record");
      },
      onSettled: (_data, _error, variables) => {
        queryClient.invalidateQueries({
          queryKey: trpc.record.list.queryKey({ entityDefinitionId }),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.record.getById.queryKey({
            recordId: variables.recordId,
          }),
        });
      },
    })
  );
}

export function useDeleteRecord(entityDefinitionId: string) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.record.delete.mutationOptions({
      onMutate: async ({ recordId }) => {
        const queryKey = trpc.record.list.queryKey({ entityDefinitionId });

        await queryClient.cancelQueries({ queryKey });

        const previousRecords = queryClient.getQueryData<Record[]>(queryKey);

        queryClient.setQueryData<Record[]>(queryKey, (old) =>
          old?.filter((record) => record.id !== recordId)
        );

        return { previousRecords, queryKey };
      },
      onError: (_err, _variables, context) => {
        if (context?.previousRecords && context?.queryKey) {
          queryClient.setQueryData(context.queryKey, context.previousRecords);
        }
        toast.error("Failed to delete record");
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.record.list.queryKey({ entityDefinitionId }),
        });
      },
    })
  );
}

export function useBulkDeleteRecords(entityDefinitionId: string) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.record.bulkDelete.mutationOptions({
      onMutate: async ({ recordIds }) => {
        const queryKey = trpc.record.list.queryKey({ entityDefinitionId });

        await queryClient.cancelQueries({ queryKey });

        const previousRecords = queryClient.getQueryData<Record[]>(queryKey);
        const idsToDelete = new Set(recordIds);

        queryClient.setQueryData<Record[]>(queryKey, (old) =>
          old?.filter((record) => !idsToDelete.has(record.id))
        );

        return { previousRecords, queryKey };
      },
      onError: (_err, _variables, context) => {
        if (context?.previousRecords && context?.queryKey) {
          queryClient.setQueryData(context.queryKey, context.previousRecords);
        }
        toast.error("Failed to delete records");
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.record.list.queryKey({ entityDefinitionId }),
        });
      },
    })
  );
}

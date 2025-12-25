import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useWorkspaceContext } from "@/contexts/workspace-context";
import { useTRPC } from "@/utils/trpc";

type Entity = NonNullable<
  Awaited<
    ReturnType<
      ReturnType<typeof useTRPC>["entity"]["list"]["queryOptions"]
    >["queryFn"]
  >
>[number];

type Attribute = NonNullable<Entity["attributes"]>[number];

export function useCreateEntity() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { workspaceId } = useWorkspaceContext();

  return useMutation(
    trpc.entity.create.mutationOptions({
      onMutate: async (newEntity) => {
        await queryClient.cancelQueries({
          queryKey: trpc.entity.list.queryKey({ workspaceId }),
        });

        const previousEntities = queryClient.getQueryData<Entity[]>(
          trpc.entity.list.queryKey({ workspaceId })
        );

        const optimisticEntity: Entity = {
          id: `temp-${Date.now()}`,
          workspaceId,
          slug: newEntity.singularName.toLowerCase().replace(/\s+/g, "-"),
          singularName: newEntity.singularName,
          pluralName: newEntity.pluralName,
          description: newEntity.description ?? null,
          icon: newEntity.icon ?? null,
          color: newEntity.color ?? null,
          createdAt: new Date(),
          updatedAt: new Date(),
          attributes: [],
        };

        queryClient.setQueryData<Entity[]>(
          trpc.entity.list.queryKey({ workspaceId }),
          (old) => [...(old ?? []), optimisticEntity]
        );

        return { previousEntities };
      },
      onError: (_err, _newEntity, context) => {
        if (context?.previousEntities) {
          queryClient.setQueryData(
            trpc.entity.list.queryKey({ workspaceId }),
            context.previousEntities
          );
        }
        toast.error("Failed to create entity");
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.entity.list.queryKey({ workspaceId }),
        });
      },
    })
  );
}

export function useUpdateEntity() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { workspaceId } = useWorkspaceContext();

  return useMutation(
    trpc.entity.update.mutationOptions({
      onMutate: async (updates) => {
        await queryClient.cancelQueries({
          queryKey: trpc.entity.list.queryKey({ workspaceId }),
        });

        const previousEntities = queryClient.getQueryData<Entity[]>(
          trpc.entity.list.queryKey({ workspaceId })
        );

        queryClient.setQueryData<Entity[]>(
          trpc.entity.list.queryKey({ workspaceId }),
          (old) =>
            old?.map((entity) =>
              entity.id === updates.entityId
                ? { ...entity, ...updates, updatedAt: new Date() }
                : entity
            )
        );

        return { previousEntities };
      },
      onError: (_err, _updates, context) => {
        if (context?.previousEntities) {
          queryClient.setQueryData(
            trpc.entity.list.queryKey({ workspaceId }),
            context.previousEntities
          );
        }
        toast.error("Failed to update entity");
      },
      onSettled: (_data, _error, variables) => {
        queryClient.invalidateQueries({
          queryKey: trpc.entity.list.queryKey({ workspaceId }),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.entity.getById.queryKey({
            entityId: variables.entityId,
          }),
        });
      },
    })
  );
}

export function useDeleteEntity() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { workspaceId } = useWorkspaceContext();

  return useMutation(
    trpc.entity.delete.mutationOptions({
      onMutate: async ({ entityId }) => {
        await queryClient.cancelQueries({
          queryKey: trpc.entity.list.queryKey({ workspaceId }),
        });

        const previousEntities = queryClient.getQueryData<Entity[]>(
          trpc.entity.list.queryKey({ workspaceId })
        );

        queryClient.setQueryData<Entity[]>(
          trpc.entity.list.queryKey({ workspaceId }),
          (old) => old?.filter((entity) => entity.id !== entityId)
        );

        return { previousEntities };
      },
      onError: (_err, _variables, context) => {
        if (context?.previousEntities) {
          queryClient.setQueryData(
            trpc.entity.list.queryKey({ workspaceId }),
            context.previousEntities
          );
        }
        toast.error("Failed to delete entity");
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.entity.list.queryKey({ workspaceId }),
        });
      },
    })
  );
}

export function useAddAttribute() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { workspaceId } = useWorkspaceContext();

  return useMutation(
    trpc.entity.addAttribute.mutationOptions({
      onMutate: async (newAttr) => {
        await queryClient.cancelQueries({
          queryKey: trpc.entity.list.queryKey({ workspaceId }),
        });

        const previousEntities = queryClient.getQueryData<Entity[]>(
          trpc.entity.list.queryKey({ workspaceId })
        );

        const optimisticAttr: Attribute = {
          id: `temp-${Date.now()}`,
          entityDefinitionId: newAttr.entityDefinitionId,
          slug: newAttr.name.toLowerCase().replace(/\s+/g, "-"),
          name: newAttr.name,
          description: newAttr.description ?? null,
          type: newAttr.type,
          isRequired: newAttr.isRequired ?? false,
          isUnique: newAttr.isUnique ?? false,
          isSystem: false,
          defaultValue: newAttr.defaultValue ?? null,
          order: 999,
          config: newAttr.config ?? null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        queryClient.setQueryData<Entity[]>(
          trpc.entity.list.queryKey({ workspaceId }),
          (old) =>
            old?.map((entity) =>
              entity.id === newAttr.entityDefinitionId
                ? {
                    ...entity,
                    attributes: [...entity.attributes, optimisticAttr],
                    updatedAt: new Date(),
                  }
                : entity
            )
        );

        return { previousEntities };
      },
      onError: (_err, _newAttr, context) => {
        if (context?.previousEntities) {
          queryClient.setQueryData(
            trpc.entity.list.queryKey({ workspaceId }),
            context.previousEntities
          );
        }
        toast.error("Failed to add attribute");
      },
      onSettled: (_data, _error, variables) => {
        queryClient.invalidateQueries({
          queryKey: trpc.entity.list.queryKey({ workspaceId }),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.entity.getById.queryKey({
            entityId: variables.entityDefinitionId,
          }),
        });
      },
    })
  );
}

export function useUpdateAttribute() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { workspaceId } = useWorkspaceContext();

  return useMutation(
    trpc.entity.updateAttribute.mutationOptions({
      onMutate: async (updates) => {
        await queryClient.cancelQueries({
          queryKey: trpc.entity.list.queryKey({ workspaceId }),
        });

        const previousEntities = queryClient.getQueryData<Entity[]>(
          trpc.entity.list.queryKey({ workspaceId })
        );

        queryClient.setQueryData<Entity[]>(
          trpc.entity.list.queryKey({ workspaceId }),
          (old) =>
            old?.map((entity) => ({
              ...entity,
              attributes: entity.attributes.map((attr) =>
                attr.id === updates.attributeId
                  ? { ...attr, ...updates, updatedAt: new Date() }
                  : attr
              ),
            }))
        );

        return { previousEntities };
      },
      onError: (_err, _updates, context) => {
        if (context?.previousEntities) {
          queryClient.setQueryData(
            trpc.entity.list.queryKey({ workspaceId }),
            context.previousEntities
          );
        }
        toast.error("Failed to update attribute");
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.entity.list.queryKey({ workspaceId }),
        });
      },
    })
  );
}

export function useDeleteAttribute() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { workspaceId } = useWorkspaceContext();

  return useMutation(
    trpc.entity.deleteAttribute.mutationOptions({
      onMutate: async ({ attributeId }) => {
        await queryClient.cancelQueries({
          queryKey: trpc.entity.list.queryKey({ workspaceId }),
        });

        const previousEntities = queryClient.getQueryData<Entity[]>(
          trpc.entity.list.queryKey({ workspaceId })
        );

        queryClient.setQueryData<Entity[]>(
          trpc.entity.list.queryKey({ workspaceId }),
          (old) =>
            old?.map((entity) => ({
              ...entity,
              attributes: entity.attributes.filter(
                (attr) => attr.id !== attributeId
              ),
            }))
        );

        return { previousEntities };
      },
      onError: (_err, _variables, context) => {
        if (context?.previousEntities) {
          queryClient.setQueryData(
            trpc.entity.list.queryKey({ workspaceId }),
            context.previousEntities
          );
        }
        toast.error("Failed to delete attribute");
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.entity.list.queryKey({ workspaceId }),
        });
      },
    })
  );
}

export function useReorderAttributes() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { workspaceId } = useWorkspaceContext();

  return useMutation(
    trpc.entity.reorderAttributes.mutationOptions({
      onMutate: async ({ entityDefinitionId, orderedIds }) => {
        await queryClient.cancelQueries({
          queryKey: trpc.entity.list.queryKey({ workspaceId }),
        });

        const previousEntities = queryClient.getQueryData<Entity[]>(
          trpc.entity.list.queryKey({ workspaceId })
        );

        queryClient.setQueryData<Entity[]>(
          trpc.entity.list.queryKey({ workspaceId }),
          (old) =>
            old?.map((entity) => {
              if (entity.id !== entityDefinitionId) return entity;

              const reorderedAttrs = entity.attributes
                .slice()
                .sort((a, b) => {
                  const aIndex = orderedIds.indexOf(a.id);
                  const bIndex = orderedIds.indexOf(b.id);
                  if (aIndex === -1) return 1;
                  if (bIndex === -1) return -1;
                  return aIndex - bIndex;
                })
                .map((attr, index) => ({ ...attr, order: index }));

              return { ...entity, attributes: reorderedAttrs };
            })
        );

        return { previousEntities };
      },
      onError: (_err, _variables, context) => {
        if (context?.previousEntities) {
          queryClient.setQueryData(
            trpc.entity.list.queryKey({ workspaceId }),
            context.previousEntities
          );
        }
        toast.error("Failed to reorder attributes");
      },
      onSettled: (_data, _error, variables) => {
        queryClient.invalidateQueries({
          queryKey: trpc.entity.list.queryKey({ workspaceId }),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.entity.getById.queryKey({
            entityId: variables.entityDefinitionId,
          }),
        });
      },
    })
  );
}

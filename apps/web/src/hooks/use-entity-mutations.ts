import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useOrganizationContext } from "@/contexts/workspace-context";
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
  const { organizationId } = useOrganizationContext();

  return useMutation(
    trpc.entity.create.mutationOptions({
      onMutate: async (newEntity) => {
        await queryClient.cancelQueries({
          queryKey: trpc.entity.list.queryKey({
            organizationId: organizationId ?? "",
          }),
        });

        const previousEntities = queryClient.getQueryData<Entity[]>(
          trpc.entity.list.queryKey({ organizationId: organizationId ?? "" })
        );

        const optimisticEntity: Entity = {
          id: `temp-${Date.now()}`,
          organizationId: organizationId ?? "",
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
          trpc.entity.list.queryKey({ organizationId: organizationId ?? "" }),
          (old) => [...(old ?? []), optimisticEntity]
        );

        return { previousEntities };
      },
      onError: (_err, _newEntity, context) => {
        if (context?.previousEntities) {
          queryClient.setQueryData(
            trpc.entity.list.queryKey({ organizationId: organizationId ?? "" }),
            context.previousEntities
          );
        }
        toast.error("Failed to create entity");
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.entity.list.queryKey({
            organizationId: organizationId ?? "",
          }),
        });
      },
    })
  );
}

export function useUpdateEntity() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { organizationId } = useOrganizationContext();

  return useMutation(
    trpc.entity.update.mutationOptions({
      onMutate: async (updates) => {
        await queryClient.cancelQueries({
          queryKey: trpc.entity.list.queryKey({
            organizationId: organizationId ?? "",
          }),
        });

        const previousEntities = queryClient.getQueryData<Entity[]>(
          trpc.entity.list.queryKey({ organizationId: organizationId ?? "" })
        );

        queryClient.setQueryData<Entity[]>(
          trpc.entity.list.queryKey({ organizationId: organizationId ?? "" }),
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
            trpc.entity.list.queryKey({ organizationId: organizationId ?? "" }),
            context.previousEntities
          );
        }
        toast.error("Failed to update entity");
      },
      onSettled: (_data, _error, variables) => {
        queryClient.invalidateQueries({
          queryKey: trpc.entity.list.queryKey({
            organizationId: organizationId ?? "",
          }),
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
  const { organizationId } = useOrganizationContext();

  return useMutation(
    trpc.entity.delete.mutationOptions({
      onMutate: async ({ entityId }) => {
        await queryClient.cancelQueries({
          queryKey: trpc.entity.list.queryKey({
            organizationId: organizationId ?? "",
          }),
        });

        const previousEntities = queryClient.getQueryData<Entity[]>(
          trpc.entity.list.queryKey({ organizationId: organizationId ?? "" })
        );

        queryClient.setQueryData<Entity[]>(
          trpc.entity.list.queryKey({ organizationId: organizationId ?? "" }),
          (old) => old?.filter((entity) => entity.id !== entityId)
        );

        return { previousEntities };
      },
      onError: (_err, _variables, context) => {
        if (context?.previousEntities) {
          queryClient.setQueryData(
            trpc.entity.list.queryKey({ organizationId: organizationId ?? "" }),
            context.previousEntities
          );
        }
        toast.error("Failed to delete entity");
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.entity.list.queryKey({
            organizationId: organizationId ?? "",
          }),
        });
      },
    })
  );
}

export function useAddAttribute() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { organizationId } = useOrganizationContext();

  return useMutation(
    trpc.entity.addAttribute.mutationOptions({
      onMutate: async (newAttr) => {
        await queryClient.cancelQueries({
          queryKey: trpc.entity.list.queryKey({
            organizationId: organizationId ?? "",
          }),
        });

        const previousEntities = queryClient.getQueryData<Entity[]>(
          trpc.entity.list.queryKey({ organizationId: organizationId ?? "" })
        );

        // Generate slug matching backend logic (only a-z0-9, with deterministic fallback for non-ASCII)
        const baseSlug = newAttr.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");
        // Use char codes for deterministic slug that matches backend
        const charCodeSlug = newAttr.name
          .split("")
          .map((c) => c.charCodeAt(0).toString(36))
          .join("")
          .slice(0, 20);
        const generatedSlug = baseSlug || `attr-${charCodeSlug}`;

        const optimisticAttr: Attribute = {
          id: `temp-${Date.now()}`,
          entityDefinitionId: newAttr.entityDefinitionId,
          slug: generatedSlug,
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
          trpc.entity.list.queryKey({ organizationId: organizationId ?? "" }),
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
            trpc.entity.list.queryKey({ organizationId: organizationId ?? "" }),
            context.previousEntities
          );
        }
        toast.error("Failed to add attribute");
      },
      onSettled: (_data, _error, variables) => {
        queryClient.invalidateQueries({
          queryKey: trpc.entity.list.queryKey({
            organizationId: organizationId ?? "",
          }),
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
  const { organizationId } = useOrganizationContext();

  return useMutation(
    trpc.entity.updateAttribute.mutationOptions({
      onMutate: async (updates) => {
        await queryClient.cancelQueries({
          queryKey: trpc.entity.list.queryKey({
            organizationId: organizationId ?? "",
          }),
        });

        const previousEntities = queryClient.getQueryData<Entity[]>(
          trpc.entity.list.queryKey({ organizationId: organizationId ?? "" })
        );

        queryClient.setQueryData<Entity[]>(
          trpc.entity.list.queryKey({ organizationId: organizationId ?? "" }),
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
            trpc.entity.list.queryKey({ organizationId: organizationId ?? "" }),
            context.previousEntities
          );
        }
        toast.error("Failed to update attribute");
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.entity.list.queryKey({
            organizationId: organizationId ?? "",
          }),
        });
      },
    })
  );
}

export function useDeleteAttribute() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { organizationId } = useOrganizationContext();

  return useMutation(
    trpc.entity.deleteAttribute.mutationOptions({
      onMutate: async ({ attributeId }) => {
        await queryClient.cancelQueries({
          queryKey: trpc.entity.list.queryKey({
            organizationId: organizationId ?? "",
          }),
        });

        const previousEntities = queryClient.getQueryData<Entity[]>(
          trpc.entity.list.queryKey({ organizationId: organizationId ?? "" })
        );

        queryClient.setQueryData<Entity[]>(
          trpc.entity.list.queryKey({ organizationId: organizationId ?? "" }),
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
            trpc.entity.list.queryKey({ organizationId: organizationId ?? "" }),
            context.previousEntities
          );
        }
        toast.error("Failed to delete attribute");
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.entity.list.queryKey({
            organizationId: organizationId ?? "",
          }),
        });
      },
    })
  );
}

export function useReorderAttributes() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { organizationId } = useOrganizationContext();

  return useMutation(
    trpc.entity.reorderAttributes.mutationOptions({
      onMutate: async ({ entityDefinitionId, orderedIds }) => {
        await queryClient.cancelQueries({
          queryKey: trpc.entity.list.queryKey({
            organizationId: organizationId ?? "",
          }),
        });

        const previousEntities = queryClient.getQueryData<Entity[]>(
          trpc.entity.list.queryKey({ organizationId: organizationId ?? "" })
        );

        queryClient.setQueryData<Entity[]>(
          trpc.entity.list.queryKey({ organizationId: organizationId ?? "" }),
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
            trpc.entity.list.queryKey({ organizationId: organizationId ?? "" }),
            context.previousEntities
          );
        }
        toast.error("Failed to reorder attributes");
      },
      onSettled: (_data, _error, variables) => {
        queryClient.invalidateQueries({
          queryKey: trpc.entity.list.queryKey({
            organizationId: organizationId ?? "",
          }),
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

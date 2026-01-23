import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useOrganizationContext } from "@/contexts/workspace-context";
import type {
  StageAttribute,
  StageDefinition,
  Workflow,
} from "@/types/workflow";
import { useTRPC } from "@/utils/trpc";

export function useCreateWorkflow() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { organizationId } = useOrganizationContext();

  return useMutation(
    trpc.workflow.create.mutationOptions({
      onMutate: async (newWorkflow) => {
        await queryClient.cancelQueries({
          queryKey: trpc.workflow.list.queryKey({
            organizationId: organizationId ?? "",
          }),
        });

        const previousWorkflows = queryClient.getQueryData<Workflow[]>(
          trpc.workflow.list.queryKey({ organizationId: organizationId ?? "" })
        );

        const optimisticWorkflow: Workflow = {
          id: `temp-${Date.now()}`,
          organizationId: organizationId ?? "",
          name: newWorkflow.name,
          description: newWorkflow.description ?? null,
          triggerEntityId: newWorkflow.triggerEntityId ?? null,
          icon: newWorkflow.icon ?? null,
          color: newWorkflow.color ?? null,
          status: newWorkflow.status ?? "draft",
          createdAt: new Date(),
          updatedAt: new Date(),
          stages: [],
        };

        queryClient.setQueryData<Workflow[]>(
          trpc.workflow.list.queryKey({ organizationId: organizationId ?? "" }),
          (old) => [...(old ?? []), optimisticWorkflow]
        );

        return { previousWorkflows };
      },
      onError: (_err, _newWorkflow, context) => {
        if (context?.previousWorkflows) {
          queryClient.setQueryData(
            trpc.workflow.list.queryKey({
              organizationId: organizationId ?? "",
            }),
            context.previousWorkflows
          );
        }
        toast.error("Failed to create workflow");
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.workflow.list.queryKey({
            organizationId: organizationId ?? "",
          }),
        });
      },
    })
  );
}

export function useUpdateWorkflow() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { organizationId } = useOrganizationContext();

  return useMutation(
    trpc.workflow.update.mutationOptions({
      onMutate: async (updates) => {
        await queryClient.cancelQueries({
          queryKey: trpc.workflow.list.queryKey({
            organizationId: organizationId ?? "",
          }),
        });

        const previousWorkflows = queryClient.getQueryData<Workflow[]>(
          trpc.workflow.list.queryKey({ organizationId: organizationId ?? "" })
        );

        queryClient.setQueryData<Workflow[]>(
          trpc.workflow.list.queryKey({ organizationId: organizationId ?? "" }),
          (old) =>
            old?.map((workflow) =>
              workflow.id === updates.workflowId
                ? { ...workflow, ...updates, updatedAt: new Date() }
                : workflow
            )
        );

        return { previousWorkflows };
      },
      onError: (_err, _updates, context) => {
        if (context?.previousWorkflows) {
          queryClient.setQueryData(
            trpc.workflow.list.queryKey({
              organizationId: organizationId ?? "",
            }),
            context.previousWorkflows
          );
        }
        toast.error("Failed to update workflow");
      },
      onSettled: (_data, _error, variables) => {
        queryClient.invalidateQueries({
          queryKey: trpc.workflow.list.queryKey({
            organizationId: organizationId ?? "",
          }),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.workflow.getById.queryKey({
            workflowId: variables.workflowId,
          }),
        });
      },
    })
  );
}

export function useDeleteWorkflow() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { organizationId } = useOrganizationContext();

  return useMutation(
    trpc.workflow.delete.mutationOptions({
      onMutate: async ({ workflowId }) => {
        await queryClient.cancelQueries({
          queryKey: trpc.workflow.list.queryKey({
            organizationId: organizationId ?? "",
          }),
        });

        const previousWorkflows = queryClient.getQueryData<Workflow[]>(
          trpc.workflow.list.queryKey({ organizationId: organizationId ?? "" })
        );

        queryClient.setQueryData<Workflow[]>(
          trpc.workflow.list.queryKey({ organizationId: organizationId ?? "" }),
          (old) => old?.filter((workflow) => workflow.id !== workflowId)
        );

        return { previousWorkflows };
      },
      onError: (_err, _variables, context) => {
        if (context?.previousWorkflows) {
          queryClient.setQueryData(
            trpc.workflow.list.queryKey({
              organizationId: organizationId ?? "",
            }),
            context.previousWorkflows
          );
        }
        toast.error("Failed to delete workflow");
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.workflow.list.queryKey({
            organizationId: organizationId ?? "",
          }),
        });
      },
    })
  );
}

// Stage operations
export function useAddStage() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { organizationId } = useOrganizationContext();

  return useMutation(
    trpc.workflow.addStage.mutationOptions({
      onMutate: async (newStage) => {
        await queryClient.cancelQueries({
          queryKey: trpc.workflow.list.queryKey({
            organizationId: organizationId ?? "",
          }),
        });

        const previousWorkflows = queryClient.getQueryData<Workflow[]>(
          trpc.workflow.list.queryKey({ organizationId: organizationId ?? "" })
        );

        const optimisticStage: StageDefinition = {
          id: `temp-${Date.now()}`,
          workflowDefinitionId: newStage.workflowDefinitionId,
          name: newStage.name,
          description: newStage.description ?? null,
          instructions: newStage.instructions ?? null,
          target: newStage.target ?? null,
          order: 999,
          icon: newStage.icon ?? null,
          color: newStage.color ?? null,
          isInitial: newStage.isInitial ?? false,
          isFinal: newStage.isFinal ?? false,
          createdAt: new Date(),
          updatedAt: new Date(),
          attributes: [],
        };

        queryClient.setQueryData<Workflow[]>(
          trpc.workflow.list.queryKey({ organizationId: organizationId ?? "" }),
          (old) =>
            old?.map((workflow) =>
              workflow.id === newStage.workflowDefinitionId
                ? {
                    ...workflow,
                    stages: [...workflow.stages, optimisticStage],
                    updatedAt: new Date(),
                  }
                : workflow
            )
        );

        return { previousWorkflows };
      },
      onError: (_err, _newStage, context) => {
        if (context?.previousWorkflows) {
          queryClient.setQueryData(
            trpc.workflow.list.queryKey({
              organizationId: organizationId ?? "",
            }),
            context.previousWorkflows
          );
        }
        toast.error("Failed to add stage");
      },
      onSettled: (_data, _error, variables) => {
        queryClient.invalidateQueries({
          queryKey: trpc.workflow.list.queryKey({
            organizationId: organizationId ?? "",
          }),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.workflow.getById.queryKey({
            workflowId: variables.workflowDefinitionId,
          }),
        });
      },
    })
  );
}

export function useUpdateStage() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { organizationId } = useOrganizationContext();

  return useMutation(
    trpc.workflow.updateStage.mutationOptions({
      onMutate: async (updates) => {
        await queryClient.cancelQueries({
          queryKey: trpc.workflow.list.queryKey({
            organizationId: organizationId ?? "",
          }),
        });

        const previousWorkflows = queryClient.getQueryData<Workflow[]>(
          trpc.workflow.list.queryKey({ organizationId: organizationId ?? "" })
        );

        queryClient.setQueryData<Workflow[]>(
          trpc.workflow.list.queryKey({ organizationId: organizationId ?? "" }),
          (old) =>
            old?.map((workflow) => ({
              ...workflow,
              stages: workflow.stages.map((stage) =>
                stage.id === updates.stageId
                  ? { ...stage, ...updates, updatedAt: new Date() }
                  : stage
              ),
            }))
        );

        return { previousWorkflows };
      },
      onError: (_err, _updates, context) => {
        if (context?.previousWorkflows) {
          queryClient.setQueryData(
            trpc.workflow.list.queryKey({
              organizationId: organizationId ?? "",
            }),
            context.previousWorkflows
          );
        }
        toast.error("Failed to update stage");
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.workflow.list.queryKey({
            organizationId: organizationId ?? "",
          }),
        });
      },
    })
  );
}

export function useDeleteStage() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { organizationId } = useOrganizationContext();

  return useMutation(
    trpc.workflow.deleteStage.mutationOptions({
      onMutate: async ({ stageId }) => {
        await queryClient.cancelQueries({
          queryKey: trpc.workflow.list.queryKey({
            organizationId: organizationId ?? "",
          }),
        });

        const previousWorkflows = queryClient.getQueryData<Workflow[]>(
          trpc.workflow.list.queryKey({ organizationId: organizationId ?? "" })
        );

        queryClient.setQueryData<Workflow[]>(
          trpc.workflow.list.queryKey({ organizationId: organizationId ?? "" }),
          (old) =>
            old?.map((workflow) => ({
              ...workflow,
              stages: workflow.stages.filter((stage) => stage.id !== stageId),
            }))
        );

        return { previousWorkflows };
      },
      onError: (_err, _variables, context) => {
        if (context?.previousWorkflows) {
          queryClient.setQueryData(
            trpc.workflow.list.queryKey({
              organizationId: organizationId ?? "",
            }),
            context.previousWorkflows
          );
        }
        toast.error("Failed to delete stage");
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.workflow.list.queryKey({
            organizationId: organizationId ?? "",
          }),
        });
      },
    })
  );
}

export function useReorderStages() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { organizationId } = useOrganizationContext();

  return useMutation(
    trpc.workflow.reorderStages.mutationOptions({
      onMutate: async ({ workflowDefinitionId, orderedIds }) => {
        await queryClient.cancelQueries({
          queryKey: trpc.workflow.list.queryKey({
            organizationId: organizationId ?? "",
          }),
        });

        const previousWorkflows = queryClient.getQueryData<Workflow[]>(
          trpc.workflow.list.queryKey({ organizationId: organizationId ?? "" })
        );

        queryClient.setQueryData<Workflow[]>(
          trpc.workflow.list.queryKey({ organizationId: organizationId ?? "" }),
          (old) =>
            old?.map((workflow) => {
              if (workflow.id !== workflowDefinitionId) {
                return workflow;
              }

              const reorderedStages = workflow.stages
                .slice()
                .sort((a, b) => {
                  const aIndex = orderedIds.indexOf(a.id);
                  const bIndex = orderedIds.indexOf(b.id);
                  if (aIndex === -1) {
                    return 1;
                  }
                  if (bIndex === -1) {
                    return -1;
                  }
                  return aIndex - bIndex;
                })
                .map((stage, index) => ({ ...stage, order: index }));

              return { ...workflow, stages: reorderedStages };
            })
        );

        return { previousWorkflows };
      },
      onError: (_err, _variables, context) => {
        if (context?.previousWorkflows) {
          queryClient.setQueryData(
            trpc.workflow.list.queryKey({
              organizationId: organizationId ?? "",
            }),
            context.previousWorkflows
          );
        }
        toast.error("Failed to reorder stages");
      },
      onSettled: (_data, _error, variables) => {
        queryClient.invalidateQueries({
          queryKey: trpc.workflow.list.queryKey({
            organizationId: organizationId ?? "",
          }),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.workflow.getById.queryKey({
            workflowId: variables.workflowDefinitionId,
          }),
        });
      },
    })
  );
}

// Stage attribute operations
export function useAddStageAttribute() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { organizationId } = useOrganizationContext();

  return useMutation(
    trpc.workflow.addStageAttribute.mutationOptions({
      onMutate: async (newAttr) => {
        await queryClient.cancelQueries({
          queryKey: trpc.workflow.list.queryKey({
            organizationId: organizationId ?? "",
          }),
        });

        const previousWorkflows = queryClient.getQueryData<Workflow[]>(
          trpc.workflow.list.queryKey({ organizationId: organizationId ?? "" })
        );

        const baseSlug = newAttr.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");
        const charCodeSlug = newAttr.name
          .split("")
          .map((c) => c.charCodeAt(0).toString(36))
          .join("")
          .slice(0, 20);
        const generatedSlug = baseSlug || `attr-${charCodeSlug}`;

        const optimisticAttr: StageAttribute = {
          id: `temp-${Date.now()}`,
          stageDefinitionId: newAttr.stageDefinitionId,
          slug: generatedSlug,
          name: newAttr.name,
          description: newAttr.description ?? null,
          type: newAttr.type,
          io: newAttr.io ?? "output",
          isRequired: newAttr.isRequired ?? false,
          isUnique: newAttr.isUnique ?? false,
          defaultValue: newAttr.defaultValue ?? null,
          order: 999,
          config: newAttr.config ?? null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        queryClient.setQueryData<Workflow[]>(
          trpc.workflow.list.queryKey({ organizationId: organizationId ?? "" }),
          (old) =>
            old?.map((workflow) => ({
              ...workflow,
              stages: workflow.stages.map((stage) =>
                stage.id === newAttr.stageDefinitionId
                  ? {
                      ...stage,
                      attributes: [...stage.attributes, optimisticAttr],
                      updatedAt: new Date(),
                    }
                  : stage
              ),
            }))
        );

        return { previousWorkflows };
      },
      onError: (_err, _newAttr, context) => {
        if (context?.previousWorkflows) {
          queryClient.setQueryData(
            trpc.workflow.list.queryKey({
              organizationId: organizationId ?? "",
            }),
            context.previousWorkflows
          );
        }
        toast.error("Failed to add attribute");
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.workflow.list.queryKey({
            organizationId: organizationId ?? "",
          }),
        });
      },
    })
  );
}

export function useUpdateStageAttribute() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { organizationId } = useOrganizationContext();

  return useMutation(
    trpc.workflow.updateStageAttribute.mutationOptions({
      onMutate: async (updates) => {
        await queryClient.cancelQueries({
          queryKey: trpc.workflow.list.queryKey({
            organizationId: organizationId ?? "",
          }),
        });

        const previousWorkflows = queryClient.getQueryData<Workflow[]>(
          trpc.workflow.list.queryKey({ organizationId: organizationId ?? "" })
        );

        queryClient.setQueryData<Workflow[]>(
          trpc.workflow.list.queryKey({ organizationId: organizationId ?? "" }),
          (old) =>
            old?.map((workflow) => ({
              ...workflow,
              stages: workflow.stages.map((stage) => ({
                ...stage,
                attributes: stage.attributes.map((attr) =>
                  attr.id === updates.attributeId
                    ? { ...attr, ...updates, updatedAt: new Date() }
                    : attr
                ),
              })),
            }))
        );

        return { previousWorkflows };
      },
      onError: (_err, _updates, context) => {
        if (context?.previousWorkflows) {
          queryClient.setQueryData(
            trpc.workflow.list.queryKey({
              organizationId: organizationId ?? "",
            }),
            context.previousWorkflows
          );
        }
        toast.error("Failed to update attribute");
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.workflow.list.queryKey({
            organizationId: organizationId ?? "",
          }),
        });
      },
    })
  );
}

export function useDeleteStageAttribute() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { organizationId } = useOrganizationContext();

  return useMutation(
    trpc.workflow.deleteStageAttribute.mutationOptions({
      onMutate: async ({ attributeId }) => {
        await queryClient.cancelQueries({
          queryKey: trpc.workflow.list.queryKey({
            organizationId: organizationId ?? "",
          }),
        });

        const previousWorkflows = queryClient.getQueryData<Workflow[]>(
          trpc.workflow.list.queryKey({ organizationId: organizationId ?? "" })
        );

        queryClient.setQueryData<Workflow[]>(
          trpc.workflow.list.queryKey({ organizationId: organizationId ?? "" }),
          (old) =>
            old?.map((workflow) => ({
              ...workflow,
              stages: workflow.stages.map((stage) => ({
                ...stage,
                attributes: stage.attributes.filter(
                  (attr) => attr.id !== attributeId
                ),
              })),
            }))
        );

        return { previousWorkflows };
      },
      onError: (_err, _variables, context) => {
        if (context?.previousWorkflows) {
          queryClient.setQueryData(
            trpc.workflow.list.queryKey({
              organizationId: organizationId ?? "",
            }),
            context.previousWorkflows
          );
        }
        toast.error("Failed to delete attribute");
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.workflow.list.queryKey({
            organizationId: organizationId ?? "",
          }),
        });
      },
    })
  );
}

export function useReorderStageAttributes() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { organizationId } = useOrganizationContext();

  return useMutation(
    trpc.workflow.reorderStageAttributes.mutationOptions({
      onMutate: async ({ stageDefinitionId, orderedIds }) => {
        await queryClient.cancelQueries({
          queryKey: trpc.workflow.list.queryKey({
            organizationId: organizationId ?? "",
          }),
        });

        const previousWorkflows = queryClient.getQueryData<Workflow[]>(
          trpc.workflow.list.queryKey({ organizationId: organizationId ?? "" })
        );

        queryClient.setQueryData<Workflow[]>(
          trpc.workflow.list.queryKey({ organizationId: organizationId ?? "" }),
          (old) =>
            old?.map((workflow) => ({
              ...workflow,
              stages: workflow.stages.map((stage: StageDefinition) => {
                if (stage.id !== stageDefinitionId) {
                  return stage;
                }

                const reorderedAttributes = stage.attributes
                  .slice()
                  .sort((a: StageAttribute, b: StageAttribute) => {
                    const aIndex = orderedIds.indexOf(a.id);
                    const bIndex = orderedIds.indexOf(b.id);
                    if (aIndex === -1) {
                      return 1;
                    }
                    if (bIndex === -1) {
                      return -1;
                    }
                    return aIndex - bIndex;
                  })
                  .map((attr: StageAttribute, index: number) => ({
                    ...attr,
                    order: index,
                  }));

                return { ...stage, attributes: reorderedAttributes };
              }),
            }))
        );

        return { previousWorkflows };
      },
      onError: (_err, _variables, context) => {
        if (context?.previousWorkflows) {
          queryClient.setQueryData(
            trpc.workflow.list.queryKey({
              organizationId: organizationId ?? "",
            }),
            context.previousWorkflows
          );
        }
        toast.error("Failed to reorder attributes");
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.workflow.list.queryKey({
            organizationId: organizationId ?? "",
          }),
        });
      },
    })
  );
}

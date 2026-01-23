import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, Plus, Workflow } from "lucide-react";

import { CreateWorkflowDialog } from "@/components/create-workflow-dialog";
import { PageHeader, PageToolbar } from "@/components/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useWorkflows } from "@/hooks/use-workflows";

export const Route = createFileRoute("/workflows/")({
  component: WorkflowsPage,
});

const STATUS_LABELS: Record<string, string> = {
  draft: "Черновик",
  active: "Активный",
  archived: "Архивный",
};

const STATUS_VARIANTS: Record<string, "secondary" | "default" | "outline"> = {
  draft: "secondary",
  active: "default",
  archived: "outline",
};

function WorkflowsPage() {
  const { data: workflows, isLoading } = useWorkflows();

  if (isLoading) {
    return (
      <div className="flex h-full flex-col">
        <PageHeader count={0} icon={Workflow} title="Рабочие процессы" />
        <PageToolbar />
        <div className="flex flex-1 items-center justify-center">
          <div className="text-muted-foreground">Загрузка...</div>
        </div>
      </div>
    );
  }

  if (!workflows || workflows.length === 0) {
    return (
      <div className="flex h-full flex-col">
        <PageHeader count={0} icon={Workflow} title="Рабочие процессы" />
        <PageToolbar />
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <div className="flex size-16 items-center justify-center rounded-full bg-muted">
            <Workflow className="size-8 text-muted-foreground" />
          </div>
          <div className="text-center">
            <h2 className="font-semibold text-lg">Нет рабочих процессов</h2>
            <p className="mt-1 text-muted-foreground text-sm">
              Создайте первый рабочий процесс для управления этапами работы
            </p>
          </div>
          <CreateWorkflowDialog
            trigger={
              <Button>
                <Plus className="size-4" />
                Создать рабочий процесс
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  const toolbarRight = (
    <CreateWorkflowDialog
      trigger={
        <Button size="sm">
          <Plus className="size-4" />
          Создать рабочий процесс
        </Button>
      }
    />
  );

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        count={workflows.length}
        icon={Workflow}
        title="Рабочие процессы"
      />
      <PageToolbar right={toolbarRight} />
      <div className="flex-1 overflow-auto px-4 pb-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {workflows.map((workflow) => (
            <Link
              className="group flex items-center justify-between rounded-lg border bg-card p-4 transition-colors hover:bg-accent"
              key={workflow.id}
              params={{ workflowId: workflow.id }}
              to="/workflows/$workflowId/settings"
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex size-10 items-center justify-center rounded-lg"
                  style={{
                    backgroundColor: workflow.color ?? "#6366f1",
                  }}
                >
                  <Workflow className="size-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{workflow.name}</span>
                    <Badge variant={STATUS_VARIANTS[workflow.status]}>
                      {STATUS_LABELS[workflow.status]}
                    </Badge>
                  </div>
                  <div className="text-muted-foreground text-sm">
                    {workflow.stages.length} этапов
                  </div>
                </div>
              </div>
              <ChevronRight className="size-5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

import { Link } from "@tanstack/react-router";
import { ArrowLeft, Workflow } from "lucide-react";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useWorkflow } from "@/hooks/use-workflows";
import { cn } from "@/lib/utils";

import { AppearanceTab } from "./appearance-tab";
import { ConfigurationTab } from "./configuration-tab";
import { StagesTab } from "./stages-tab";

interface WorkflowSettingsPageProps {
  workflowId: string;
}

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

type TabValue = "configuration" | "appearance" | "stages";

export function WorkflowSettingsPage({
  workflowId,
}: WorkflowSettingsPageProps) {
  const { data: workflow, isLoading, isError } = useWorkflow(workflowId);
  const [activeTab, setActiveTab] = React.useState<TabValue>("configuration");

  if (isLoading) {
    return (
      <div className="flex h-full flex-col">
        <div className="border-b px-6 py-4">
          <Button asChild className="mb-4" size="sm" variant="ghost">
            <Link to="/workflows">
              <ArrowLeft className="size-4" />
              Назад
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <Skeleton className="size-12 rounded-lg" />
            <div>
              <Skeleton className="mb-2 h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
        </div>
        <div className="flex-1 p-6">
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (isError || !workflow) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="font-semibold text-lg">Рабочий процесс не найден</h2>
          <p className="mt-1 text-muted-foreground text-sm">
            Рабочий процесс с указанным ID не существует.
          </p>
          <Button asChild className="mt-4" variant="outline">
            <Link to="/workflows">Назад к рабочим процессам</Link>
          </Button>
        </div>
      </div>
    );
  }

  const stageCount = workflow.stages?.length ?? 0;

  const tabs: { value: TabValue; label: React.ReactNode }[] = [
    { value: "configuration", label: "Конфигурация" },
    { value: "appearance", label: "Внешний вид" },
    {
      value: "stages",
      label: (
        <>
          Этапы
          <span className="ml-1 text-muted-foreground">{stageCount}</span>
        </>
      ),
    },
  ];

  return (
    <div className="grid h-full grid-rows-[auto_auto_1fr] overflow-hidden">
      {/* Header */}
      <div className="border-b px-6 py-4">
        <Button asChild className="mb-4" size="sm" variant="ghost">
          <Link to="/workflows">
            <ArrowLeft className="size-4" />
            Назад
          </Link>
        </Button>

        <div className="flex items-center gap-3">
          <div
            className="flex size-12 items-center justify-center rounded-lg"
            style={{ backgroundColor: workflow.color ?? "#6366f1" }}
          >
            <Workflow className="size-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-semibold text-xl">{workflow.name}</h1>
              <Badge variant={STATUS_VARIANTS[workflow.status]}>
                {STATUS_LABELS[workflow.status]}
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm">
              Настройте рабочий процесс и его этапы
            </p>
          </div>
        </div>
      </div>

      {/* Tab Buttons */}
      <div className="border-b px-6">
        <div className="flex gap-4">
          {tabs.map((tab) => (
            <button
              className={cn(
                "border-transparent border-b-2 px-0 pt-2 pb-3 font-medium text-sm transition-colors hover:text-foreground",
                activeTab === tab.value
                  ? "border-primary text-foreground"
                  : "text-muted-foreground"
              )}
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="overflow-y-auto">
        {activeTab === "configuration" && (
          <ConfigurationTab workflow={workflow} />
        )}
        {activeTab === "appearance" && <AppearanceTab workflow={workflow} />}
        {activeTab === "stages" && <StagesTab workflow={workflow} />}
      </div>
    </div>
  );
}

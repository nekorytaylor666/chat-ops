import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Building2, ChevronDown, Plus, Settings2, Upload } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import type { AttributeType } from "@/components/data-grid/add-column-dropdown";
import {
  DataGridSkeleton,
  DataGridSkeletonGrid,
  DataGridSkeletonToolbar,
} from "@/components/data-grid/data-grid-skeleton";
import { EmptyEntitiesState } from "@/components/empty-entities-state";
import { EntityGrid } from "@/components/entity-grid";
import { AddRecordDialog } from "@/components/entity-grid/add-record-dialog";
import { AttributeModal } from "@/components/entity-settings/attribute-modal";
import { PageHeader, PageToolbar } from "@/components/header";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEntities } from "@/hooks/use-entities";
import {
  useBulkDeleteRecords,
  useCreateRecord,
  useUpdateRecord,
} from "@/hooks/use-record-mutations";
import { useRecords } from "@/hooks/use-records";
import { generateColumnsFromAttributes } from "@/lib/columns-from-attributes";

export const Route = createFileRoute("/entities/$entitySlug/")({
  component: EntityPage,
});

interface RecordData {
  id: string;
  values: Record<string, unknown>;
  [key: string]: unknown;
}

function EntityPage() {
  const { entitySlug } = Route.useParams();
  const navigate = useNavigate();
  const { data: entities, isLoading: entitiesLoading } = useEntities();

  const currentEntity = useMemo(() => {
    if (!entities) return null;
    return entities.find((e) => e.slug === entitySlug) ?? null;
  }, [entities, entitySlug]);

  const { data: records, isLoading: recordsLoading } = useRecords({
    entityDefinitionId: currentEntity?.id ?? "",
    enabled: Boolean(currentEntity?.id),
  });

  const createRecord = useCreateRecord(currentEntity?.id ?? "");
  const updateRecord = useUpdateRecord(currentEntity?.id ?? "");
  const bulkDeleteRecords = useBulkDeleteRecords(currentEntity?.id ?? "");

  const data = useMemo<RecordData[]>(() => {
    if (!records) return [];
    return records.map((record) => ({
      id: record.id,
      values: (record.values ?? {}) as Record<string, unknown>,
      ...((record.values ?? {}) as Record<string, unknown>),
    }));
  }, [records]);

  const [localData, setLocalData] = useState<RecordData[]>([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [attributeModalOpen, setAttributeModalOpen] = useState(false);
  const [selectedAttributeType, setSelectedAttributeType] =
    useState<AttributeType>("short-text");

  useEffect(() => {
    setLocalData(data);
  }, [data]);

  const columns = useMemo(() => {
    if (!currentEntity?.attributes) return [];
    return generateColumnsFromAttributes(currentEntity.attributes, entitySlug);
  }, [currentEntity?.attributes, entitySlug]);

  // Key to force grid re-render when columns change
  const gridKey = useMemo(() => {
    if (!currentEntity?.attributes) return "empty";
    return currentEntity.attributes.map((a) => a.id).join("-");
  }, [currentEntity?.attributes]);

  const handleOpenAddDialog = useCallback(() => {
    setAddDialogOpen(true);
    return null;
  }, []);

  const handleAddAttribute = useCallback((type: AttributeType) => {
    setSelectedAttributeType(type);
    setAttributeModalOpen(true);
  }, []);

  const handleRecordCreate = useCallback(
    (values: Record<string, unknown>) => {
      if (!currentEntity) return;

      const newId = `temp-${Date.now()}`;
      const newRecord: RecordData = {
        id: newId,
        values,
        ...values,
      };

      setLocalData((prev) => [...prev, newRecord]);

      createRecord.mutate({
        entityDefinitionId: currentEntity.id,
        values,
      });

      setAddDialogOpen(false);
    },
    [currentEntity, createRecord]
  );

  const handleRowsDelete = useCallback(
    (rows: RecordData[]) => {
      const idsToDelete = rows
        .map((r) => r.id)
        .filter((id) => !id.startsWith("temp-"));
      if (idsToDelete.length > 0) {
        bulkDeleteRecords.mutate({ recordIds: idsToDelete });
      }
      setLocalData((prev) =>
        prev.filter((item) => !rows.some((r) => r.id === item.id))
      );
    },
    [bulkDeleteRecords]
  );

  const handleDataChange = useCallback(
    (newData: RecordData[] | ((prev: RecordData[]) => RecordData[])) => {
      setLocalData((currentLocalData) => {
        const updatedData =
          typeof newData === "function" ? newData(currentLocalData) : newData;

        for (const newRecord of updatedData) {
          const oldRecord = currentLocalData.find((r) => r.id === newRecord.id);
          if (oldRecord && !newRecord.id.startsWith("temp-")) {
            const changedValues: Record<string, unknown> = {};

            // Check top-level properties (where the grid updates values)
            // Skip 'id' and 'values' as they are metadata
            for (const key of Object.keys(newRecord)) {
              if (key === "id" || key === "values") continue;
              const newValue = newRecord[key];
              const oldValue = oldRecord[key];

              // Handle comparison for different types including numbers
              const hasChanged =
                newValue !== oldValue &&
                !(
                  typeof newValue === "number" &&
                  typeof oldValue === "number" &&
                  Number.isNaN(newValue) &&
                  Number.isNaN(oldValue)
                );

              if (hasChanged) {
                changedValues[key] = newValue;
              }
            }

            if (Object.keys(changedValues).length > 0) {
              updateRecord.mutate({
                recordId: newRecord.id,
                values: changedValues,
              });
            }
          }
        }

        return updatedData;
      });
    },
    [updateRecord]
  );

  const handleEntityChange = useCallback(
    (slug: string) => {
      navigate({
        to: "/entities/$entitySlug",
        params: { entitySlug: slug },
      });
    },
    [navigate]
  );

  if (entitiesLoading) {
    return (
      <div className="flex h-full flex-col">
        <PageHeader count={0} icon={Building2} title="Загрузка..." />
        <PageToolbar />
        <div className="min-h-0 flex-1 px-4">
          <DataGridSkeleton>
            <DataGridSkeletonToolbar actionCount={3} />
            <DataGridSkeletonGrid />
          </DataGridSkeleton>
        </div>
      </div>
    );
  }

  if (!entities || entities.length === 0) {
    return (
      <div className="flex h-full flex-col">
        <EmptyEntitiesState />
      </div>
    );
  }

  if (!currentEntity) {
    return (
      <div className="flex h-full flex-col">
        <EmptyEntitiesState />
      </div>
    );
  }

  const toolbarLeft = (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="font-normal" size="sm" variant="outline">
            {currentEntity.pluralName}
            <ChevronDown className="text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {entities.map((entity) => (
            <DropdownMenuItem
              key={entity.id}
              onClick={() => handleEntityChange(entity.slug)}
            >
              {entity.pluralName}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <Button className="font-normal" size="sm" variant="ghost">
        <Settings2 className="text-muted-foreground" />
        Настройки вида
      </Button>
    </>
  );

  const toolbarRight = (
    <>
      <Button asChild className="font-normal" size="sm" variant="ghost">
        <Link
          params={{ entitySlug: currentEntity.slug }}
          to="/entities/$entitySlug/settings"
        >
          <Settings2 className="text-muted-foreground" />
          Настройки сущности
        </Link>
      </Button>
      <Button className="font-normal" size="sm" variant="ghost">
        <Upload className="text-muted-foreground" />
        Импорт / Экспорт
        <ChevronDown className="text-muted-foreground" />
      </Button>
      <Button onClick={handleOpenAddDialog} size="sm">
        <Plus />
        Добавить {currentEntity.singularName}
      </Button>
    </>
  );

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        count={localData.length}
        icon={Building2}
        title={currentEntity.pluralName}
      />
      <PageToolbar left={toolbarLeft} right={toolbarRight} />
      <div className="min-h-0 flex-1 px-4">
        {recordsLoading ? (
          <DataGridSkeleton>
            <DataGridSkeletonGrid />
          </DataGridSkeleton>
        ) : (
          <EntityGrid
            columns={columns}
            compactHeader
            data={localData}
            key={gridKey}
            onAddAttribute={handleAddAttribute}
            onDataChange={handleDataChange}
            onRowAdd={handleOpenAddDialog}
            onRowsDelete={handleRowsDelete}
          />
        )}
      </div>

      <AddRecordDialog
        entity={currentEntity}
        isPending={createRecord.isPending}
        onOpenChange={setAddDialogOpen}
        onSubmit={handleRecordCreate}
        open={addDialogOpen}
      />

      <AttributeModal
        defaultType={selectedAttributeType}
        entityId={currentEntity.id}
        onOpenChange={setAttributeModalOpen}
        open={attributeModalOpen}
      />
    </div>
  );
}

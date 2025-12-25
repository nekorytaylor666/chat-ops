import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Building2, ChevronDown, Plus, Settings2, Upload } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  DataGridSkeleton,
  DataGridSkeletonGrid,
  DataGridSkeletonToolbar,
} from "@/components/data-grid/data-grid-skeleton";
import { EmptyEntitiesState } from "@/components/empty-entities-state";
import { EntityGrid } from "@/components/entity-grid";
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

  useEffect(() => {
    setLocalData(data);
  }, [data]);

  const columns = useMemo(() => {
    if (!currentEntity?.attributes) return [];
    return generateColumnsFromAttributes(currentEntity.attributes);
  }, [currentEntity?.attributes]);

  const handleRowAdd = useCallback(() => {
    if (!currentEntity) return { rowIndex: 0, columnId: "name" };

    const newId = `temp-${Date.now()}`;
    const newRecord: RecordData = {
      id: newId,
      values: { name: "" },
      name: "",
    };

    setLocalData((prev) => [...prev, newRecord]);

    createRecord.mutate({
      entityDefinitionId: currentEntity.id,
      values: { name: "" },
    });

    return {
      rowIndex: localData.length,
      columnId: "name",
    };
  }, [currentEntity, localData.length, createRecord]);

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
      const updatedData =
        typeof newData === "function" ? newData(localData) : newData;

      for (const newRecord of updatedData) {
        const oldRecord = localData.find((r) => r.id === newRecord.id);
        if (oldRecord && !newRecord.id.startsWith("temp-")) {
          const oldValues = oldRecord.values;
          const newValues = newRecord.values;
          const changedValues: Record<string, unknown> = {};

          for (const key of Object.keys(newValues)) {
            if (newValues[key] !== oldValues[key]) {
              changedValues[key] = newValues[key];
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

      setLocalData(updatedData);
    },
    [localData, updateRecord]
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
        <PageHeader count={0} icon={Building2} title="Loading..." />
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
        View settings
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
          Entity Settings
        </Link>
      </Button>
      <Button className="font-normal" size="sm" variant="ghost">
        <Upload className="text-muted-foreground" />
        Import / Export
        <ChevronDown className="text-muted-foreground" />
      </Button>
      <Button onClick={handleRowAdd} size="sm">
        <Plus />
        Add {currentEntity.singularName}
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
            onDataChange={handleDataChange}
            onRowAdd={handleRowAdd}
            onRowsDelete={handleRowsDelete}
          />
        )}
      </div>
    </div>
  );
}

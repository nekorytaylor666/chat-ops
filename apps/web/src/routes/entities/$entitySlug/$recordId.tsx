import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useMemo } from "react";
import { ActivitySection } from "@/components/record-details/activity-section";
import { HighlightsSection } from "@/components/record-details/highlights-section";
import { RecordDetailsSidebar } from "@/components/record-details/record-details-sidebar";
import { RecordHeader } from "@/components/record-details/record-header";
import { RecordTabs } from "@/components/record-details/record-tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useEntities } from "@/hooks/use-entities";
import { useUpdateRecord } from "@/hooks/use-record-mutations";
import { useRecord, useRecords } from "@/hooks/use-records";

export const Route = createFileRoute("/entities/$entitySlug/$recordId")({
  component: RecordDetailsPage,
});

function RecordDetailsPage() {
  const { entitySlug, recordId } = Route.useParams();
  const navigate = useNavigate();

  // Fetch entities to get the current entity definition
  const { data: entities, isLoading: entitiesLoading } = useEntities();

  const currentEntity = useMemo(() => {
    if (!entities) return null;
    return entities.find((e) => e.slug === entitySlug) ?? null;
  }, [entities, entitySlug]);

  // Fetch the current record
  const { data: record, isLoading: recordLoading } = useRecord(recordId);

  // Fetch all records for navigation
  const { data: allRecords } = useRecords({
    entityDefinitionId: currentEntity?.id ?? "",
    enabled: Boolean(currentEntity?.id),
  });

  // Update record mutation
  const updateRecord = useUpdateRecord(currentEntity?.id ?? "");

  // Get record navigation info
  const navigationInfo = useMemo(() => {
    if (!(allRecords && recordId)) {
      return { currentIndex: 0, totalCount: 0, prevId: null, nextId: null };
    }

    const currentIndex = allRecords.findIndex((r) => r.id === recordId);
    const prevId = currentIndex > 0 ? allRecords[currentIndex - 1]?.id : null;
    const nextId =
      currentIndex < allRecords.length - 1
        ? allRecords[currentIndex + 1]?.id
        : null;

    return {
      currentIndex: currentIndex >= 0 ? currentIndex : 0,
      totalCount: allRecords.length,
      prevId,
      nextId,
    };
  }, [allRecords, recordId]);

  // Navigation handlers
  const handlePrevious = useCallback(() => {
    if (navigationInfo.prevId) {
      navigate({
        to: "/entities/$entitySlug/$recordId",
        params: { entitySlug, recordId: navigationInfo.prevId },
      });
    }
  }, [navigate, entitySlug, navigationInfo.prevId]);

  const handleNext = useCallback(() => {
    if (navigationInfo.nextId) {
      navigate({
        to: "/entities/$entitySlug/$recordId",
        params: { entitySlug, recordId: navigationInfo.nextId },
      });
    }
  }, [navigate, entitySlug, navigationInfo.nextId]);

  // Handle value changes
  const handleValueChange = useCallback(
    (slug: string, value: unknown) => {
      if (!record) return;

      updateRecord.mutate({
        recordId: record.id,
        values: { [slug]: value },
      });
    },
    [record, updateRecord]
  );

  // Loading state
  if (entitiesLoading || recordLoading) {
    return <RecordDetailsSkeleton />;
  }

  // Not found state
  if (!(currentEntity && record)) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Record not found</p>
      </div>
    );
  }

  const values = (record.values ?? {}) as Record<string, unknown>;
  const recordName = (values.name as string) ?? "Unnamed Record";

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <RecordHeader
        currentIndex={navigationInfo.currentIndex}
        entityName={currentEntity.pluralName}
        entitySlug={entitySlug}
        hasNext={Boolean(navigationInfo.nextId)}
        hasPrevious={Boolean(navigationInfo.prevId)}
        onNext={handleNext}
        onPrevious={handlePrevious}
        recordName={recordName}
        totalCount={navigationInfo.totalCount}
      />

      {/* Main content area */}
      <div className="flex min-h-0 flex-1">
        {/* Left side - Tabs and content */}
        <RecordTabs
          className="flex-1"
          overviewContent={
            <div className="space-y-8">
              <HighlightsSection
                attributes={currentEntity.attributes}
                onValueChange={handleValueChange}
                values={values}
              />
              <ActivitySection
                createdAt={
                  record.createdAt ? new Date(record.createdAt) : undefined
                }
                recordName={recordName}
              />
            </div>
          }
        />

        {/* Right sidebar */}
        <RecordDetailsSidebar
          attributes={currentEntity.attributes}
          onValueChange={handleValueChange}
          values={values}
        />
      </div>
    </div>
  );
}

function RecordDetailsSkeleton() {
  return (
    <div className="flex h-full flex-col">
      {/* Header skeleton */}
      <div className="flex flex-col border-b">
        <div className="flex h-12 items-center gap-2 border-b px-4">
          <Skeleton className="size-8" />
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="flex items-center gap-3 px-6 py-4">
          <Skeleton className="size-8 rounded-full" />
          <Skeleton className="h-8 w-48" />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="flex min-h-0 flex-1">
        <div className="flex-1 p-6">
          <div className="space-y-4">
            <Skeleton className="h-4 w-24" />
            <div className="grid grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton className="h-24" key={`skeleton-${i}`} />
              ))}
            </div>
          </div>
        </div>
        <div className="w-80 border-l p-4">
          <Skeleton className="h-8 w-full" />
          <div className="mt-4 space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton className="h-10" key={`sidebar-skeleton-${i}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

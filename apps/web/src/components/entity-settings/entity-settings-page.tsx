import { Link } from "@tanstack/react-router";
import { ArrowLeft, Box } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEntityBySlug } from "@/hooks/use-entities";
import { AppearanceTab } from "./appearance-tab";
import { AttributesTab } from "./attributes-tab";
import { ConfigurationTab } from "./configuration-tab";

interface EntitySettingsPageProps {
  entitySlug: string;
}

export function EntitySettingsPage({ entitySlug }: EntitySettingsPageProps) {
  const { data: entity, isLoading, isError } = useEntityBySlug(entitySlug);

  if (isLoading) {
    return (
      <div className="flex h-full flex-col">
        <div className="border-b px-6 py-4">
          <Button asChild className="mb-4" size="sm" variant="ghost">
            <Link to="/entities">
              <ArrowLeft className="size-4" />
              Back
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

  if (isError || !entity) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="font-semibold text-lg">Entity not found</h2>
          <p className="mt-1 text-muted-foreground text-sm">
            The entity "{entitySlug}" does not exist.
          </p>
          <Button asChild className="mt-4" variant="outline">
            <Link to="/entities">Back to entities</Link>
          </Button>
        </div>
      </div>
    );
  }

  const attributeCount = entity.attributes.length;

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b px-6 py-4">
        <Button asChild className="mb-4" size="sm" variant="ghost">
          <Link to="/entities">
            <ArrowLeft className="size-4" />
            Back
          </Link>
        </Button>

        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-lg border bg-muted">
            <Box className="size-6 text-muted-foreground" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-semibold text-xl">{entity.pluralName}</h1>
              <Badge variant="secondary">Custom</Badge>
            </div>
            <p className="text-muted-foreground text-sm">
              Manage object attributes and other relevant settings
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-1 overflow-auto">
        <Tabs className="h-full" defaultValue="configuration">
          <div className="border-b px-6">
            <TabsList className="h-auto gap-4 rounded-none bg-transparent p-0">
              <TabsTrigger
                className="rounded-none border-transparent border-b-2 bg-transparent px-0 pt-2 pb-3 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                value="configuration"
              >
                Configuration
              </TabsTrigger>
              <TabsTrigger
                className="rounded-none border-transparent border-b-2 bg-transparent px-0 pt-2 pb-3 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                value="appearance"
              >
                Appearance
              </TabsTrigger>
              <TabsTrigger
                className="rounded-none border-transparent border-b-2 bg-transparent px-0 pt-2 pb-3 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                value="attributes"
              >
                Attributes
                <span className="ml-1 text-muted-foreground">
                  {attributeCount}
                </span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent className="mt-0 h-full" value="configuration">
            <ConfigurationTab entity={entity} />
          </TabsContent>
          <TabsContent className="mt-0 h-full" value="appearance">
            <AppearanceTab entity={entity} />
          </TabsContent>
          <TabsContent className="mt-0 h-full" value="attributes">
            <AttributesTab entity={entity} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

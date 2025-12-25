import { useNavigate } from "@tanstack/react-router";
import { AlertTriangle, Info, Trash2 } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEntities } from "@/contexts/entity-context";
import type { EntityDefinition } from "@/types/entity";

interface ConfigurationTabProps {
  entity: EntityDefinition;
}

export function ConfigurationTab({ entity }: ConfigurationTabProps) {
  const navigate = useNavigate();
  const { updateEntity, deleteEntity } = useEntities();
  const [singularName, setSingularName] = React.useState(entity.singularName);
  const [pluralName, setPluralName] = React.useState(entity.pluralName);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);

  const hasChanges =
    singularName !== entity.singularName || pluralName !== entity.pluralName;

  const handleSave = () => {
    updateEntity(entity.slug, {
      singularName,
      pluralName,
    });
  };

  const handleDelete = () => {
    deleteEntity(entity.slug);
    navigate({ to: "/entities" });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      {/* General Section */}
      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
          <CardDescription>
            Set words to describe a single and multiple objects of this type
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="singular">Singular noun</Label>
              <Input
                id="singular"
                onChange={(e) => setSingularName(e.target.value)}
                placeholder="e.g., Company"
                value={singularName}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="plural">Plural noun</Label>
              <Input
                id="plural"
                onChange={(e) => setPluralName(e.target.value)}
                placeholder="e.g., Companies"
                value={pluralName}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-1">
              <Label htmlFor="slug">Identifier / Slug</Label>
              <Info className="size-3.5 text-muted-foreground" />
            </div>
            <Input
              className="bg-muted text-muted-foreground"
              disabled
              id="slug"
              value={`/${entity.slug}`}
            />
            <p className="text-muted-foreground text-xs">
              Changing the identifier can have unintended consequences, contact
              our support to make changes
            </p>
          </div>

          {hasChanges && (
            <div className="flex justify-end pt-2">
              <Button onClick={handleSave}>Save changes</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="size-5" />
            Danger zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Delete object</p>
              <p className="text-muted-foreground text-sm">
                Once deleted, your object cannot be recovered.
              </p>
            </div>
            <Button
              onClick={() => setShowDeleteDialog(true)}
              variant="destructive"
            >
              <Trash2 className="size-4" />
              Delete object
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog onOpenChange={setShowDeleteDialog} open={showDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {entity.singularName}?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the "
              {entity.pluralName}" object and all associated data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => setShowDeleteDialog(false)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button onClick={handleDelete} variant="destructive">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

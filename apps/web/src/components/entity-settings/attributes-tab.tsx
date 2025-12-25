import {
  AlignLeft,
  Calendar,
  CheckSquare,
  ChevronDown,
  GripVertical,
  Hash,
  Link,
  List,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
  Type,
} from "lucide-react";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  useDeleteAttribute,
  useReorderAttributes,
} from "@/hooks/use-entity-mutations";
import { cn } from "@/lib/utils";
import { AttributeModal } from "./attribute-modal";

type AttributeType =
  | "short-text"
  | "long-text"
  | "number"
  | "select"
  | "multi-select"
  | "checkbox"
  | "date"
  | "url";

interface Attribute {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  type: AttributeType;
  isRequired: boolean;
  isUnique: boolean;
  isSystem: boolean;
  order: number;
  config?: unknown;
}

interface Entity {
  id: string;
  slug: string;
  singularName: string;
  pluralName: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  attributes: Attribute[];
}

// Map attribute types to icons
const TYPE_ICONS: Record<AttributeType, React.ElementType> = {
  "short-text": Type,
  "long-text": AlignLeft,
  number: Hash,
  checkbox: CheckSquare,
  date: Calendar,
  select: ChevronDown,
  "multi-select": List,
  url: Link,
};

const TYPE_LABELS: Record<AttributeType, string> = {
  "short-text": "Text",
  "long-text": "Long Text",
  number: "Number",
  checkbox: "Checkbox",
  date: "Date",
  select: "Select",
  "multi-select": "Multi-select",
  url: "URL",
};

interface AttributesTabProps {
  entity: Entity;
}

export function AttributesTab({ entity }: AttributesTabProps) {
  const deleteAttribute = useDeleteAttribute();
  const reorderAttributes = useReorderAttributes();

  const [searchQuery, setSearchQuery] = React.useState("");
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editingAttribute, setEditingAttribute] = React.useState<
    Attribute | undefined
  >();

  // Filter attributes by search query
  const filteredAttributes = entity.attributes
    .filter((attr) =>
      attr.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => a.order - b.order);

  const handleCreateAttribute = () => {
    setEditingAttribute(undefined);
    setModalOpen(true);
  };

  const handleEditAttribute = (attr: Attribute) => {
    setEditingAttribute(attr);
    setModalOpen(true);
  };

  const handleDeleteAttribute = (attr: Attribute) => {
    if (attr.isSystem) return;
    deleteAttribute.mutate({ attributeId: attr.id });
  };

  // Simple drag and drop state
  const [draggedId, setDraggedId] = React.useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, attrId: string) => {
    setDraggedId(attrId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;

    const currentOrder = entity.attributes
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((a) => a.id);

    const draggedIndex = currentOrder.indexOf(draggedId);
    const targetIndex = currentOrder.indexOf(targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    // Remove from current position and insert at target position
    const newOrder = [...currentOrder];
    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedId);

    reorderAttributes.mutate({
      entityDefinitionId: entity.id,
      orderedIds: newOrder,
    });
    setDraggedId(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
  };

  return (
    <div className="flex h-full flex-col p-6">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-lg">Attributes</h2>
          <p className="text-muted-foreground text-sm">
            Modify and add object attributes
          </p>
        </div>
        <Button onClick={handleCreateAttribute}>
          <Plus className="size-4" />
          Create attribute
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search attributes"
          value={searchQuery}
        />
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto rounded-lg border">
        <table className="w-full">
          <thead className="sticky top-0 bg-muted/50">
            <tr className="border-b text-left text-muted-foreground text-sm">
              <th className="w-8 px-2 py-3" />
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Constraints</th>
              <th className="px-4 py-3 font-medium">Properties</th>
              <th className="w-12 px-2 py-3" />
            </tr>
          </thead>
          <tbody>
            {filteredAttributes.map((attr) => {
              const TypeIcon = TYPE_ICONS[attr.type];
              return (
                <tr
                  className={cn(
                    "border-b transition-colors hover:bg-muted/30",
                    draggedId === attr.id && "opacity-50"
                  )}
                  draggable={!attr.isSystem}
                  key={attr.id}
                  onDragEnd={handleDragEnd}
                  onDragOver={handleDragOver}
                  onDragStart={(e) => handleDragStart(e, attr.id)}
                  onDrop={(e) => handleDrop(e, attr.id)}
                >
                  <td className="px-2 py-3">
                    {!attr.isSystem && (
                      <GripVertical className="size-4 cursor-grab text-muted-foreground" />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <TypeIcon className="size-4 text-muted-foreground" />
                      <span className="font-medium">{attr.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {TYPE_LABELS[attr.type]}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {attr.isRequired && (
                        <Badge variant="secondary">Required</Badge>
                      )}
                      {attr.isUnique && (
                        <Badge variant="secondary">Unique</Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {attr.isSystem && <Badge variant="outline">System</Badge>}
                  </td>
                  <td className="px-2 py-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          disabled={attr.isSystem}
                          onClick={() => handleEditAttribute(attr)}
                        >
                          <Pencil className="size-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          disabled={attr.isSystem}
                          onClick={() => handleDeleteAttribute(attr)}
                          variant="destructive"
                        >
                          <Trash2 className="size-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              );
            })}
            {filteredAttributes.length === 0 && (
              <tr>
                <td
                  className="px-4 py-8 text-center text-muted-foreground"
                  colSpan={6}
                >
                  {searchQuery
                    ? "No attributes match your search"
                    : "No attributes yet"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Attribute Modal */}
      <AttributeModal
        attribute={editingAttribute}
        entityId={entity.id}
        onOpenChange={setModalOpen}
        open={modalOpen}
      />
    </div>
  );
}

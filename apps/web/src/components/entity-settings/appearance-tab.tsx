import {
  Box,
  Building2,
  CircleUser,
  Database,
  FileText,
  Folder,
  Heart,
  Mail,
  MapPin,
  Package,
  ShoppingCart,
  Star,
  Tag,
  Users,
  Wallet,
} from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEntities } from "@/contexts/entity-context";
import { cn } from "@/lib/utils";
import type { EntityDefinition } from "@/types/entity";

// Available icons for entities
const ICON_OPTIONS = [
  { name: "Building2", icon: Building2 },
  { name: "Users", icon: Users },
  { name: "CircleUser", icon: CircleUser },
  { name: "Folder", icon: Folder },
  { name: "FileText", icon: FileText },
  { name: "Mail", icon: Mail },
  { name: "Package", icon: Package },
  { name: "ShoppingCart", icon: ShoppingCart },
  { name: "Tag", icon: Tag },
  { name: "Star", icon: Star },
  { name: "Heart", icon: Heart },
  { name: "Wallet", icon: Wallet },
  { name: "MapPin", icon: MapPin },
  { name: "Database", icon: Database },
  { name: "Box", icon: Box },
] as const;

// Preset colors
const COLOR_OPTIONS = [
  "#6366f1", // Indigo
  "#8b5cf6", // Violet
  "#a855f7", // Purple
  "#d946ef", // Fuchsia
  "#ec4899", // Pink
  "#f43f5e", // Rose
  "#ef4444", // Red
  "#f97316", // Orange
  "#f59e0b", // Amber
  "#eab308", // Yellow
  "#84cc16", // Lime
  "#22c55e", // Green
  "#10b981", // Emerald
  "#14b8a6", // Teal
  "#06b6d4", // Cyan
  "#0ea5e9", // Sky
  "#3b82f6", // Blue
  "#64748b", // Slate
];

interface AppearanceTabProps {
  entity: EntityDefinition;
}

export function AppearanceTab({ entity }: AppearanceTabProps) {
  const { updateEntity } = useEntities();
  const [selectedIcon, setSelectedIcon] = React.useState(
    entity.icon ?? "Building2"
  );
  const [selectedColor, setSelectedColor] = React.useState(
    entity.color ?? "#6366f1"
  );
  const [customColor, setCustomColor] = React.useState(entity.color ?? "");

  const hasChanges =
    selectedIcon !== entity.icon || selectedColor !== entity.color;

  const handleSave = () => {
    updateEntity(entity.slug, {
      icon: selectedIcon,
      color: selectedColor,
    });
  };

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    setCustomColor(color);
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setCustomColor(color);
    if (/^#[0-9A-Fa-f]{6}$/.test(color)) {
      setSelectedColor(color);
    }
  };

  const SelectedIconComponent =
    ICON_OPTIONS.find((opt) => opt.name === selectedIcon)?.icon ?? Building2;

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
          <CardDescription>
            See how your entity will appear in the sidebar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 rounded-lg border bg-muted/50 p-3">
            <div
              className="flex size-10 items-center justify-center rounded-lg"
              style={{ backgroundColor: selectedColor }}
            >
              <SelectedIconComponent className="size-5 text-white" />
            </div>
            <div>
              <p className="font-medium">{entity.pluralName}</p>
              <p className="text-muted-foreground text-sm">
                {entity.attributes.length} attributes
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Icon Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Icon</CardTitle>
          <CardDescription>Choose an icon for this entity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-8 gap-2">
            {ICON_OPTIONS.map(({ name, icon: Icon }) => (
              <button
                className={cn(
                  "flex size-10 items-center justify-center rounded-lg border transition-colors hover:bg-accent",
                  selectedIcon === name &&
                    "border-primary bg-primary/10 ring-1 ring-primary"
                )}
                key={name}
                onClick={() => setSelectedIcon(name)}
                type="button"
              >
                <Icon className="size-5" />
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Color Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Color</CardTitle>
          <CardDescription>Choose a color for the entity icon</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-9 gap-2">
            {COLOR_OPTIONS.map((color) => (
              <button
                className={cn(
                  "size-8 rounded-full transition-transform hover:scale-110",
                  selectedColor === color && "ring-2 ring-primary ring-offset-2"
                )}
                key={color}
                onClick={() => handleColorChange(color)}
                style={{ backgroundColor: color }}
                type="button"
              />
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Label className="shrink-0" htmlFor="customColor">
              Custom color
            </Label>
            <div className="flex flex-1 items-center gap-2">
              <div
                className="size-8 shrink-0 rounded border"
                style={{ backgroundColor: selectedColor }}
              />
              <Input
                className="font-mono"
                id="customColor"
                onChange={handleCustomColorChange}
                placeholder="#6366f1"
                value={customColor}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {hasChanges && (
        <div className="flex justify-end">
          <Button onClick={handleSave}>Save changes</Button>
        </div>
      )}
    </div>
  );
}

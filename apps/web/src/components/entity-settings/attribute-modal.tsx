import {
  AlignLeft,
  Calendar,
  CheckSquare,
  ChevronDown,
  Hash,
  Link,
  List,
  Plus,
  Type,
  X,
} from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useEntities } from "@/contexts/entity-context";
import type {
  AttributeDefinition,
  AttributeType,
  SelectAttributeConfig,
} from "@/types/entity";

const ATTRIBUTE_TYPES: {
  value: AttributeType;
  label: string;
  icon: React.ElementType;
}[] = [
  { value: "short-text", label: "Text", icon: Type },
  { value: "long-text", label: "Long Text", icon: AlignLeft },
  { value: "number", label: "Number", icon: Hash },
  { value: "checkbox", label: "Checkbox", icon: CheckSquare },
  { value: "date", label: "Date", icon: Calendar },
  { value: "select", label: "Select", icon: ChevronDown },
  { value: "multi-select", label: "Multi-select", icon: List },
  { value: "url", label: "URL", icon: Link },
];

interface AttributeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entitySlug: string;
  attribute?: AttributeDefinition;
}

export function AttributeModal({
  open,
  onOpenChange,
  entitySlug,
  attribute,
}: AttributeModalProps) {
  const { addAttribute, updateAttribute } = useEntities();
  const isEditing = !!attribute;

  const [type, setType] = React.useState<AttributeType>(
    attribute?.type ?? "short-text"
  );
  const [name, setName] = React.useState(attribute?.name ?? "");
  const [description, setDescription] = React.useState(
    attribute?.description ?? ""
  );
  const [isRequired, setIsRequired] = React.useState(
    attribute?.isRequired ?? false
  );
  const [isUnique, setIsUnique] = React.useState(attribute?.isUnique ?? false);
  const [options, setOptions] = React.useState<string[]>(
    (attribute?.config as SelectAttributeConfig)?.options?.map(
      (o) => o.label
    ) ?? [""]
  );

  // Reset form when modal opens/closes or attribute changes
  React.useEffect(() => {
    if (open) {
      setType(attribute?.type ?? "short-text");
      setName(attribute?.name ?? "");
      setDescription(attribute?.description ?? "");
      setIsRequired(attribute?.isRequired ?? false);
      setIsUnique(attribute?.isUnique ?? false);
      setOptions(
        (attribute?.config as SelectAttributeConfig)?.options?.map(
          (o) => o.label
        ) ?? [""]
      );
    }
  }, [open, attribute]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return;

    const config =
      type === "select" || type === "multi-select"
        ? {
            options: options
              .filter((o) => o.trim())
              .map((o) => ({
                label: o.trim(),
                value: o.toLowerCase().replace(/\s+/g, "-"),
              })),
          }
        : undefined;

    if (isEditing && attribute) {
      updateAttribute(entitySlug, attribute.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        isRequired,
        isUnique,
        config,
      });
    } else {
      addAttribute(entitySlug, {
        name: name.trim(),
        type,
        description: description.trim() || undefined,
        isRequired,
        isUnique,
        config,
      });
    }

    onOpenChange(false);
  };

  const handleAddOption = () => {
    setOptions([...options, ""]);
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 1) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const needsOptions = type === "select" || type === "multi-select";
  const TypeIcon = ATTRIBUTE_TYPES.find((t) => t.value === type)?.icon ?? Type;

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit attribute" : "Create attribute"}
          </DialogTitle>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Attribute Type */}
          <div className="space-y-2">
            <Label>Attribute Type</Label>
            <Select
              disabled={isEditing}
              onValueChange={(v) => setType(v as AttributeType)}
              value={type}
            >
              <SelectTrigger className="w-full">
                <SelectValue>
                  <span className="flex items-center gap-2">
                    <TypeIcon className="size-4 text-muted-foreground" />
                    {ATTRIBUTE_TYPES.find((t) => t.value === type)?.label}
                  </span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {ATTRIBUTE_TYPES.map(({ value, label, icon: Icon }) => (
                  <SelectItem key={value} value={value}>
                    <Icon className="size-4" />
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="attr-name">Name</Label>
            <Input
              autoFocus
              id="attr-name"
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Email Address"
              value={name}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="attr-desc">
              Description{" "}
              <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="attr-desc"
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description for this attribute"
              rows={2}
              value={description}
            />
          </div>

          {/* Options for Select/Multi-select */}
          {needsOptions && (
            <div className="space-y-2">
              <Label>Options</Label>
              <div className="space-y-2">
                {options.map((option, index) => (
                  <div className="flex items-center gap-2" key={index}>
                    <Input
                      onChange={(e) =>
                        handleOptionChange(index, e.target.value)
                      }
                      placeholder={`Option ${index + 1}`}
                      value={option}
                    />
                    <Button
                      className="shrink-0"
                      disabled={options.length === 1}
                      onClick={() => handleRemoveOption(index)}
                      size="icon"
                      type="button"
                      variant="ghost"
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  className="w-full"
                  onClick={handleAddOption}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  <Plus className="size-4" />
                  Add option
                </Button>
              </div>
            </div>
          )}

          {/* Constraints */}
          <div className="space-y-3">
            <Label>Constraints</Label>
            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={isRequired}
                  onCheckedChange={(checked) => setIsRequired(checked === true)}
                />
                <span className="text-sm">Required</span>
              </label>
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={isUnique}
                  onCheckedChange={(checked) => setIsUnique(checked === true)}
                />
                <span className="text-sm">Unique</span>
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => onOpenChange(false)}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button disabled={!name.trim()} type="submit">
              {isEditing ? "Save changes" : "Create attribute"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

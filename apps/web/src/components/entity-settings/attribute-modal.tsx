import { useQuery } from "@tanstack/react-query";
import {
  AlignLeft,
  Calendar,
  CheckSquare,
  ChevronDown,
  Hash,
  Link,
  Link2,
  List,
  Loader2,
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
import { useOrganizationContext } from "@/contexts/workspace-context";
import {
  useAddAttribute,
  useUpdateAttribute,
} from "@/hooks/use-entity-mutations";
import { useTRPC } from "@/utils/trpc";

type AttributeType =
  | "short-text"
  | "long-text"
  | "number"
  | "select"
  | "multi-select"
  | "checkbox"
  | "date"
  | "url"
  | "relation"
  | "relation-multi";

interface AttributeConfig {
  options?: Array<{ label: string; value: string }>;
  targetEntityId?: string;
  targetEntitySlug?: string;
}

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
  config?: AttributeConfig | null;
}

interface EntityOption {
  id: string;
  slug: string;
  singularName: string;
}

const ATTRIBUTE_TYPES: {
  value: AttributeType;
  label: string;
  icon: React.ElementType;
}[] = [
  { value: "short-text", label: "Текст", icon: Type },
  { value: "long-text", label: "Длинный текст", icon: AlignLeft },
  { value: "number", label: "Число", icon: Hash },
  { value: "checkbox", label: "Чекбокс", icon: CheckSquare },
  { value: "date", label: "Дата", icon: Calendar },
  { value: "select", label: "Выбор", icon: ChevronDown },
  { value: "multi-select", label: "Множественный выбор", icon: List },
  { value: "url", label: "URL", icon: Link },
  { value: "relation", label: "Связь", icon: Link2 },
  { value: "relation-multi", label: "Множественная связь", icon: Link2 },
];

interface AttributeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityId: string;
  attribute?: Attribute;
  defaultType?: AttributeType;
  entities?: EntityOption[];
}

export function AttributeModal({
  open,
  onOpenChange,
  entityId,
  attribute,
  defaultType = "short-text",
}: AttributeModalProps) {
  const trpc = useTRPC();
  const { organizationId } = useOrganizationContext();
  const addAttribute = useAddAttribute();
  const updateAttribute = useUpdateAttribute();

  const isEditing = !!attribute;

  const [type, setType] = React.useState<AttributeType>(
    attribute?.type ?? "short-text"
  );

  // Fetch entities for relation type selector
  const needsTargetEntityFetch =
    type === "relation" || type === "relation-multi";
  const { data: entitiesData } = useQuery(
    trpc.entity.list.queryOptions(
      { organizationId: organizationId ?? "" },
      {
        enabled: open && needsTargetEntityFetch && !!organizationId,
      }
    )
  );
  const entities: EntityOption[] = entitiesData ?? [];
  const [name, setName] = React.useState(attribute?.name ?? "");
  const [description, setDescription] = React.useState(
    attribute?.description ?? ""
  );
  const [isRequired, setIsRequired] = React.useState(
    attribute?.isRequired ?? false
  );
  const [isUnique, setIsUnique] = React.useState(attribute?.isUnique ?? false);
  const [options, setOptions] = React.useState<string[]>(
    attribute?.config?.options?.map((o) => o.label) ?? [""]
  );
  const [targetEntityId, setTargetEntityId] = React.useState(
    attribute?.config?.targetEntityId ?? ""
  );

  // Reset form when modal opens/closes or attribute changes
  React.useEffect(() => {
    if (open) {
      setType(attribute?.type ?? defaultType);
      setName(attribute?.name ?? "");
      setDescription(attribute?.description ?? "");
      setIsRequired(attribute?.isRequired ?? false);
      setIsUnique(attribute?.isUnique ?? false);
      setOptions(attribute?.config?.options?.map((o) => o.label) ?? [""]);
      setTargetEntityId(attribute?.config?.targetEntityId ?? "");
    }
  }, [open, attribute, defaultType]);

  const isPending = addAttribute.isPending || updateAttribute.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return;

    const needsTargetEntity = type === "relation" || type === "relation-multi";
    if (needsTargetEntity && !targetEntityId) return;

    const targetEntity = entities.find((e) => e.id === targetEntityId);

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
        : needsTargetEntity
          ? {
              targetEntityId,
              targetEntitySlug: targetEntity?.slug,
            }
          : undefined;

    if (isEditing && attribute) {
      updateAttribute.mutate(
        {
          attributeId: attribute.id,
          name: name.trim(),
          description: description.trim() || undefined,
          isRequired,
          isUnique,
          config,
        },
        {
          onSuccess: () => onOpenChange(false),
        }
      );
    } else {
      addAttribute.mutate(
        {
          entityDefinitionId: entityId,
          name: name.trim(),
          type,
          description: description.trim() || undefined,
          isRequired,
          isUnique,
          config,
        },
        {
          onSuccess: () => onOpenChange(false),
        }
      );
    }
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
  const needsTargetEntity = type === "relation" || type === "relation-multi";
  const TypeIcon = ATTRIBUTE_TYPES.find((t) => t.value === type)?.icon ?? Type;
  const availableEntities = entities.filter((e) => e.id !== entityId);

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Редактировать атрибут" : "Создать атрибут"}
          </DialogTitle>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Attribute Type */}
          <div className="space-y-2">
            <Label>Тип атрибута</Label>
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
            <Label htmlFor="attr-name">Название</Label>
            <Input
              autoFocus
              id="attr-name"
              onChange={(e) => setName(e.target.value)}
              placeholder="напр., Адрес электронной почты"
              value={name}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="attr-desc">
              Описание{" "}
              <span className="text-muted-foreground">(необязательно)</span>
            </Label>
            <Textarea
              id="attr-desc"
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Добавьте описание для этого атрибута"
              rows={2}
              value={description}
            />
          </div>

          {/* Options for Select/Multi-select */}
          {needsOptions && (
            <div className="space-y-2">
              <Label>Опции</Label>
              <div className="space-y-2">
                {options.map((option, index) => (
                  <div className="flex items-center gap-2" key={index}>
                    <Input
                      onChange={(e) =>
                        handleOptionChange(index, e.target.value)
                      }
                      placeholder={`Опция ${index + 1}`}
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
                  Добавить опцию
                </Button>
              </div>
            </div>
          )}

          {/* Target Entity for Relations */}
          {needsTargetEntity && (
            <div className="space-y-2">
              <Label>Целевая сущность</Label>
              <Select onValueChange={setTargetEntityId} value={targetEntityId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Выберите сущность..." />
                </SelectTrigger>
                <SelectContent>
                  {availableEntities.map((entity) => (
                    <SelectItem key={entity.id} value={entity.id}>
                      {entity.singularName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-muted-foreground text-xs">
                {type === "relation"
                  ? "Связь с одной записью из выбранной сущности"
                  : "Связь с несколькими записями из выбранной сущности"}
              </p>
            </div>
          )}

          {/* Constraints */}
          <div className="space-y-3">
            <Label>Ограничения</Label>
            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={isRequired}
                  onCheckedChange={(checked) => setIsRequired(checked === true)}
                />
                <span className="text-sm">Обязательный</span>
              </label>
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={isUnique}
                  onCheckedChange={(checked) => setIsUnique(checked === true)}
                />
                <span className="text-sm">Уникальный</span>
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => onOpenChange(false)}
              type="button"
              variant="outline"
            >
              Отмена
            </Button>
            <Button
              disabled={
                !name.trim() ||
                isPending ||
                (needsTargetEntity && !targetEntityId)
              }
              type="submit"
            >
              {isPending && <Loader2 className="size-4 animate-spin" />}
              {isEditing ? "Сохранить изменения" : "Создать атрибут"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

import type { LucideIcon } from "lucide-react";
import {
  Calendar,
  CheckSquare,
  Hash,
  Link2,
  List,
  ListChecks,
  Text,
  Type,
} from "lucide-react";

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

const iconMap: Record<AttributeType, LucideIcon> = {
  "short-text": Type,
  "long-text": Text,
  number: Hash,
  select: List,
  "multi-select": ListChecks,
  checkbox: CheckSquare,
  date: Calendar,
  url: Link2,
  relation: Link2,
  "relation-multi": Link2,
};

interface AttributeIconProps {
  type: AttributeType;
  className?: string;
}

export function AttributeIcon({ type, className }: AttributeIconProps) {
  const Icon = iconMap[type] || Type;
  return <Icon className={className} />;
}

export function getAttributeIcon(type: AttributeType): LucideIcon {
  return iconMap[type] || Type;
}

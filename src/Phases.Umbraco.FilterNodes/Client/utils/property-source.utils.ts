import {
  BLOCK_GRID_CONTAINER_ICON,
  BLOCK_GRID_PROPERTY_GROUP_NAME,
  BLOCK_LIST_CONTAINER_ICON,
  BLOCK_LIST_PROPERTY_GROUP_NAME,
  COMPOSITION_PROPERTY_SOURCE_ICON,
  COMPOSITIONS_PROPERTY_GROUP_NAME,
  CONTENT_TYPE_PROPERTY_GROUP_NAME,
  CONTENT_TYPE_PROPERTY_SOURCE_ICON,
  DEFAULT_PROPERTY_GROUP_NAME,
  SYSTEM_PROPERTY_GROUP_NAME,
  SYSTEM_PROPERTY_SOURCE_ICON,
} from "../constants/filter-nodes.constants.js";
import type { FilterablePropertyMetadata } from "../models/filter-models.js";

export type PropertySourceKind =
  | "system"
  | "contentType"
  | "composition"
  | "blockGrid"
  | "blockList"
  | "general";

const PROPERTY_SOURCE_ICONS: Readonly<Record<PropertySourceKind, string>> = {
  system: SYSTEM_PROPERTY_SOURCE_ICON,
  contentType: CONTENT_TYPE_PROPERTY_SOURCE_ICON,
  composition: COMPOSITION_PROPERTY_SOURCE_ICON,
  blockGrid: BLOCK_GRID_CONTAINER_ICON,
  blockList: BLOCK_LIST_CONTAINER_ICON,
  general: CONTENT_TYPE_PROPERTY_SOURCE_ICON,
};

const PROPERTY_SOURCE_LABELS: Readonly<Record<PropertySourceKind, string>> = {
  system: SYSTEM_PROPERTY_GROUP_NAME,
  contentType: CONTENT_TYPE_PROPERTY_GROUP_NAME,
  composition: COMPOSITIONS_PROPERTY_GROUP_NAME,
  blockGrid: BLOCK_GRID_PROPERTY_GROUP_NAME,
  blockList: BLOCK_LIST_PROPERTY_GROUP_NAME,
  general: DEFAULT_PROPERTY_GROUP_NAME,
};

function isBlockListEditorAlias(editorAlias: string | undefined): boolean {
  return (
    editorAlias?.localeCompare("Umbraco.BlockList", undefined, {
      sensitivity: "accent",
    }) === 0
  );
}

export function resolvePropertyGroupSourceKind(
  groupName: string,
): PropertySourceKind {
  switch (groupName) {
    case SYSTEM_PROPERTY_GROUP_NAME:
      return "system";
    case COMPOSITIONS_PROPERTY_GROUP_NAME:
      return "composition";
    case BLOCK_GRID_PROPERTY_GROUP_NAME:
      return "blockGrid";
    case BLOCK_LIST_PROPERTY_GROUP_NAME:
      return "blockList";
    case CONTENT_TYPE_PROPERTY_GROUP_NAME:
      return "contentType";
    default:
      return "general";
  }
}

export function resolvePropertySourceKind(
  property: FilterablePropertyMetadata,
): PropertySourceKind {
  if (property.isContainer) {
    return isBlockListEditorAlias(property.containerEditorAlias)
      ? "blockList"
      : "blockGrid";
  }

  if (property.containerAlias) {
    if (
      property.sourceCategory === "BlockList" ||
      isBlockListEditorAlias(property.containerEditorAlias)
    ) {
      return "blockList";
    }

    return "blockGrid";
  }

  switch (property.sourceCategory) {
    case "System":
      return "system";
    case "Composition":
      return "composition";
    case "ContentType":
      return "contentType";
    case "BlockGrid":
      return "blockGrid";
    case "BlockList":
      return "blockList";
    default:
      return resolvePropertyGroupSourceKind(
        property.groupName?.trim() || DEFAULT_PROPERTY_GROUP_NAME,
      );
  }
}

export function getPropertySourceIcon(
  property: FilterablePropertyMetadata,
): string {
  return PROPERTY_SOURCE_ICONS[resolvePropertySourceKind(property)];
}

export function getPropertyGroupSourceIcon(groupName: string): string {
  return PROPERTY_SOURCE_ICONS[resolvePropertyGroupSourceKind(groupName)];
}

export function getPropertySourceLabel(
  property: FilterablePropertyMetadata,
): string {
  return PROPERTY_SOURCE_LABELS[resolvePropertySourceKind(property)];
}

export function getPropertyGroupSourceLabel(groupName: string): string {
  return PROPERTY_SOURCE_LABELS[resolvePropertyGroupSourceKind(groupName)];
}

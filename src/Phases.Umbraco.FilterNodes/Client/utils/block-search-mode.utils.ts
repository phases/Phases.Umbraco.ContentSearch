import {
  BLOCK_CONTAINER_SEARCH_MODE_DESCRIPTION,
  BLOCK_CONTAINER_SEARCH_MODE_LABEL,
  BLOCK_DEDICATED_PROPERTY_SEARCH_MODE_DESCRIPTION,
  BLOCK_DEDICATED_PROPERTY_SEARCH_MODE_LABEL,
  BLOCK_GRID_PROPERTY_GROUP_NAME,
  BLOCK_LIST_PROPERTY_GROUP_NAME,
} from "../constants/filter-nodes.constants.js";
import type { FilterablePropertyMetadata } from "../models/filter-models.js";
import {
  isBlockContainerProperty,
  isBlockElementProperty,
  isBlockGridContainerProperty,
  isBlockGridElementProperty,
  isPropertyFilterable,
} from "./filter-condition.utils.js";

export type BlockPropertySearchMode = "container" | "dedicated";

export interface BlockPropertySearchModeDisplay {
  readonly mode: BlockPropertySearchMode;
  readonly label: string;
  readonly description: string;
}

export function resolveBlockEditorLabel(
  property: FilterablePropertyMetadata,
): typeof BLOCK_GRID_PROPERTY_GROUP_NAME | typeof BLOCK_LIST_PROPERTY_GROUP_NAME {
  if (isBlockGridContainerProperty(property) || isBlockGridElementProperty(property)) {
    return BLOCK_GRID_PROPERTY_GROUP_NAME;
  }

  return BLOCK_LIST_PROPERTY_GROUP_NAME;
}

export function hasDedicatedBlockPropertyExamineField(
  property: FilterablePropertyMetadata,
): boolean {
  if (!isBlockElementProperty(property) || !isPropertyFilterable(property)) {
    return false;
  }

  const indexedFields =
    property.indexedFieldAliases?.map((field) => field.trim()).filter(Boolean) ??
    [];

  return indexedFields.length > 0;
}

function isBlockRelatedProperty(
  property: FilterablePropertyMetadata,
): boolean {
  return isBlockContainerProperty(property) || isBlockElementProperty(property);
}

export function formatBlockContainerSearchModeDescription(
  blockEditorLabel:
    | typeof BLOCK_GRID_PROPERTY_GROUP_NAME
    | typeof BLOCK_LIST_PROPERTY_GROUP_NAME,
): string {
  return BLOCK_CONTAINER_SEARCH_MODE_DESCRIPTION.replace(
    "{blockEditor}",
    blockEditorLabel,
  );
}

export function resolveBlockPropertySearchMode(
  property: FilterablePropertyMetadata | undefined,
): BlockPropertySearchModeDisplay | undefined {
  if (!property || !isBlockRelatedProperty(property)) {
    return undefined;
  }

  if (hasDedicatedBlockPropertyExamineField(property)) {
    return {
      mode: "dedicated",
      label: BLOCK_DEDICATED_PROPERTY_SEARCH_MODE_LABEL,
      description: BLOCK_DEDICATED_PROPERTY_SEARCH_MODE_DESCRIPTION,
    };
  }

  if (isBlockContainerProperty(property) || isBlockElementProperty(property)) {
    const blockEditorLabel = resolveBlockEditorLabel(property);

    return {
      mode: "container",
      label: BLOCK_CONTAINER_SEARCH_MODE_LABEL,
      description: formatBlockContainerSearchModeDescription(blockEditorLabel),
    };
  }

  return undefined;
}

export function resolveBlockContainerExamineSearchMode(): BlockPropertySearchModeDisplay {
  return {
    mode: "container",
    label: BLOCK_CONTAINER_SEARCH_MODE_LABEL,
    description: formatBlockContainerSearchModeDescription(BLOCK_GRID_PROPERTY_GROUP_NAME),
  };
}

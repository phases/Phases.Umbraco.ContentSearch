import {
  BLOCK_GRID_PROPERTY_GROUP_NAME,
  BLOCK_LIST_PROPERTY_GROUP_NAME,
  PROPERTY_METADATA_HIERARCHY_SEPARATOR,
} from "../constants/filter-nodes.constants.js";
import type {
  BlockDiscoveryDiagnostics,
  BlockExamineDiagnostics,
  FilterablePropertyMetadata,
} from "../models/filter-models.js";
import type { BlockPropertySearchModeDisplay } from "./block-search-mode.utils.js";
import { resolveBlockPropertySearchMode } from "./block-search-mode.utils.js";
import {
  formatPropertySearchResultLabel,
  getPropertyLeafName,
  isPropertyFilterable,
} from "./filter-condition.utils.js";

export interface BlockDiagnosticsDisplay {
  readonly containerName: string;
  readonly blockEditorLabel: string;
  readonly isBlockGrid: boolean;
  readonly isContainerSelected: boolean;
  readonly blockGridExampleValue?: string;
  readonly discoveryDiagnostics?: BlockDiscoveryDiagnostics;
  readonly examineDiagnostics?: BlockExamineDiagnostics;
  readonly propertySearchMode?: BlockPropertySearchModeDisplay;
  readonly elementTypes: readonly string[];
  readonly propertiesFound: readonly string[];
  readonly searchableProperties: readonly string[];
  readonly nonSearchableProperties: readonly string[];
}

/** @deprecated Use {@link BlockDiagnosticsDisplay} */
export type BlockGridDiagnosticsDisplay = BlockDiagnosticsDisplay;

function isBlockGridEditorAlias(editorAlias: string | undefined): boolean {
  return (
    editorAlias?.localeCompare("Umbraco.BlockGrid", undefined, {
      sensitivity: "accent",
    }) === 0
  );
}

function isBlockListEditorAlias(editorAlias: string | undefined): boolean {
  return (
    editorAlias?.localeCompare("Umbraco.BlockList", undefined, {
      sensitivity: "accent",
    }) === 0
  );
}

export function isBlockRelatedProperty(
  property: FilterablePropertyMetadata | undefined,
): boolean {
  if (!property) {
    return false;
  }

  if (
    property.sourceCategory === "BlockGrid" ||
    property.sourceCategory === "BlockList"
  ) {
    return true;
  }

  return (
    isBlockGridEditorAlias(property.containerEditorAlias) ||
    isBlockListEditorAlias(property.containerEditorAlias)
  );
}

export function resolveBlockContainerAlias(
  property: FilterablePropertyMetadata,
): string | undefined {
  if (property.isContainer) {
    return property.containerAlias ?? property.alias;
  }

  return property.containerAlias;
}

function resolveBlockEditorLabel(
  containerProperty: FilterablePropertyMetadata | undefined,
  fallbackProperty: FilterablePropertyMetadata,
): string {
  if (containerProperty?.sourceCategory === "BlockList") {
    return BLOCK_LIST_PROPERTY_GROUP_NAME;
  }

  if (containerProperty?.sourceCategory === "BlockGrid") {
    return BLOCK_GRID_PROPERTY_GROUP_NAME;
  }

  if (isBlockListEditorAlias(containerProperty?.containerEditorAlias)) {
    return BLOCK_LIST_PROPERTY_GROUP_NAME;
  }

  if (isBlockListEditorAlias(fallbackProperty.containerEditorAlias)) {
    return BLOCK_LIST_PROPERTY_GROUP_NAME;
  }

  return BLOCK_GRID_PROPERTY_GROUP_NAME;
}

function resolveBlockContainerName(
  containerProperty: FilterablePropertyMetadata | undefined,
  fallbackProperty: FilterablePropertyMetadata,
  containerAlias: string,
): string {
  return (
    containerProperty?.containerName ??
    fallbackProperty.containerName ??
    containerAlias
  );
}

function collectUniqueSorted(values: Iterable<string>): readonly string[] {
  return [...new Set([...values].filter(Boolean))].sort((left, right) =>
    left.localeCompare(right, undefined, { sensitivity: "base" }),
  );
}

function formatDiagnosticsPropertyLabel(
  property: FilterablePropertyMetadata,
): string {
  return formatPropertySearchResultLabel(property).split(
    PROPERTY_METADATA_HIERARCHY_SEPARATOR,
  ).join(" › ");
}

function resolveBlockGridExampleValue(
  elementProperties: readonly FilterablePropertyMetadata[],
): string | undefined {
  const firstProperty = elementProperties[0];

  if (!firstProperty) {
    return undefined;
  }

  const leafName = getPropertyLeafName(firstProperty).trim();

  return leafName || undefined;
}

export function buildBlockDiagnostics(
  allProperties: readonly FilterablePropertyMetadata[],
  selectedProperty: FilterablePropertyMetadata,
): BlockDiagnosticsDisplay | undefined {
  if (!isBlockRelatedProperty(selectedProperty)) {
    return undefined;
  }

  const containerAlias = resolveBlockContainerAlias(selectedProperty);

  if (!containerAlias) {
    return undefined;
  }

  const containerProperty = allProperties.find(
    (property) => property.isContainer && property.alias === containerAlias,
  );

  if (containerProperty && !isBlockRelatedProperty(containerProperty)) {
    return undefined;
  }

  const elementProperties = allProperties.filter(
    (property) =>
      property.containerAlias === containerAlias &&
      !property.isContainer &&
      isBlockRelatedProperty(property),
  );

  const elementTypes = collectUniqueSorted(
    elementProperties.map(
      (property) => property.elementTypeName ?? property.sourceName ?? "",
    ),
  );

  const propertyLabels = collectUniqueSorted(
    elementProperties.map((property) => formatDiagnosticsPropertyLabel(property)),
  );

  const searchableProperties: string[] = [];
  const nonSearchableProperties: string[] = [];

  for (const property of elementProperties) {
    const label = formatDiagnosticsPropertyLabel(property);

    if (isPropertyFilterable(property)) {
      searchableProperties.push(label);
      continue;
    }

    nonSearchableProperties.push(label);
  }

  const blockEditorLabel = resolveBlockEditorLabel(
    containerProperty,
    selectedProperty,
  );
  const isBlockGrid = blockEditorLabel === BLOCK_GRID_PROPERTY_GROUP_NAME;
  const isContainerSelected = selectedProperty.isContainer === true;

  return {
    containerName: resolveBlockContainerName(
      containerProperty,
      selectedProperty,
      containerAlias,
    ),
    blockEditorLabel,
    isBlockGrid,
    isContainerSelected,
    blockGridExampleValue: isBlockGrid
      ? resolveBlockGridExampleValue(elementProperties)
      : undefined,
    discoveryDiagnostics: containerProperty?.blockDiscoveryDiagnostics,
    examineDiagnostics: isBlockGrid
      ? containerProperty?.blockExamineDiagnostics
      : undefined,
    propertySearchMode: resolveBlockPropertySearchMode(selectedProperty),
    elementTypes,
    propertiesFound: propertyLabels,
    searchableProperties: collectUniqueSorted(searchableProperties),
    nonSearchableProperties: collectUniqueSorted(nonSearchableProperties),
  };
}

/** @deprecated Use {@link buildBlockDiagnostics} */
export function buildBlockGridDiagnostics(
  allProperties: readonly FilterablePropertyMetadata[],
  selectedProperty: FilterablePropertyMetadata,
) {
  return buildBlockDiagnostics(allProperties, selectedProperty);
}

/** @deprecated Use {@link isBlockRelatedProperty} */
export function isBlockGridRelatedProperty(
  property: FilterablePropertyMetadata | undefined,
): boolean {
  return isBlockRelatedProperty(property);
}

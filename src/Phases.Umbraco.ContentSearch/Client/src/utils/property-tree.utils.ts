import type { SearchPropertyMetadata } from "../models/metadata.models.js";
import {
  BLOCK_GRID_CONTAINER_ICON,
  BLOCK_GRID_PROPERTY_GROUP_NAME,
  BLOCK_LIST_CONTAINER_ICON,
  BLOCK_LIST_PROPERTY_GROUP_NAME,
  COMPOSITIONS_PROPERTY_GROUP_NAME,
  CONTENT_TYPE_PROPERTY_GROUP_NAME,
  DEFAULT_PROPERTY_GROUP_NAME,
  PROPERTY_BROWSE_PATH_SEPARATOR,
  PROPERTY_METADATA_HIERARCHY_SEPARATOR,
  SYSTEM_PROPERTY_GROUP_NAME,
} from "../constants/property-picker.constants.js";

export interface PropertyElementTypeGroup {
  readonly elementTypeKey: string;
  readonly elementTypeAlias: string;
  readonly elementTypeName: string;
  readonly properties: readonly SearchPropertyMetadata[];
}

export interface PropertyContainerGroup {
  readonly containerKey: string;
  readonly containerName: string;
  readonly containerEditorLabel?: string;
  readonly containerProperty?: SearchPropertyMetadata;
  readonly elementTypes: readonly PropertyElementTypeGroup[];
}

export interface PropertyCompositionSection {
  readonly name: string;
  readonly properties: readonly SearchPropertyMetadata[];
}

export interface PropertyTreeGroup {
  readonly name: string;
  readonly displayName: string;
  readonly sortOrder: number;
  readonly properties: readonly SearchPropertyMetadata[];
  readonly compositionSections: readonly PropertyCompositionSection[];
  readonly containers: readonly PropertyContainerGroup[];
}

const GROUP_DISPLAY_NAMES: Readonly<Record<string, string>> = {
  [SYSTEM_PROPERTY_GROUP_NAME]: "SYSTEM",
  [CONTENT_TYPE_PROPERTY_GROUP_NAME]: "CONTENT",
  [COMPOSITIONS_PROPERTY_GROUP_NAME]: "COMPOSITIONS",
  [BLOCK_GRID_PROPERTY_GROUP_NAME]: "BLOCK GRID",
  [BLOCK_LIST_PROPERTY_GROUP_NAME]: "BLOCK LIST",
};

export function getPropertyGroupDisplayName(groupName: string): string {
  return GROUP_DISPLAY_NAMES[groupName] ?? groupName.toUpperCase();
}

export function resolvePropertyGroupName(property: SearchPropertyMetadata): string {
  return property.groupName?.trim() || DEFAULT_PROPERTY_GROUP_NAME;
}

export function formatPropertyLabel(property: SearchPropertyMetadata): string {
  return property.name?.trim() || property.alias;
}

export function isBlockElementProperty(property: SearchPropertyMetadata): boolean {
  return Boolean(property.containerAlias && !property.isContainer);
}

export function formatBlockElementPropertyLabel(
  property: SearchPropertyMetadata,
): string {
  const displayPath = property.displayPath;

  if (displayPath && displayPath.length > 0) {
    return displayPath[displayPath.length - 1] ?? formatPropertyLabel(property);
  }

  const aliasParts = property.alias.split("__");

  if (aliasParts.length >= 3) {
    return aliasParts[aliasParts.length - 1] ?? formatPropertyLabel(property);
  }

  return formatPropertyLabel(property);
}

export function getPropertyLeafName(property: SearchPropertyMetadata): string {
  const displayPath = property.displayPath;

  if (displayPath && displayPath.length > 0) {
    return displayPath[displayPath.length - 1] ?? formatPropertyLabel(property);
  }

  return formatBlockElementPropertyLabel(property);
}

export function formatPropertySearchResultLabel(
  property: SearchPropertyMetadata,
): string {
  if (isBlockElementProperty(property)) {
    const leafName = getPropertyLeafName(property);
    const elementTypeName = property.elementTypeName?.trim();

    if (elementTypeName) {
      return `${elementTypeName}${PROPERTY_METADATA_HIERARCHY_SEPARATOR}${leafName}`;
    }
  }

  return getPropertyLeafName(property);
}

export function formatPropertySearchContextLabel(
  property: SearchPropertyMetadata,
): string | undefined {
  if (isBlockElementProperty(property)) {
    const containerName = property.containerAlias
      ? property.displayPath?.[0]?.trim()
      : undefined;

    if (containerName) {
      return containerName;
    }
  }

  if (property.sourceCategory === "Composition") {
    const sourceName = property.sourceName?.trim();

    if (sourceName) {
      return sourceName;
    }
  }

  const groupName = resolvePropertyGroupName(property);

  if (groupName === DEFAULT_PROPERTY_GROUP_NAME) {
    return undefined;
  }

  return getPropertyGroupDisplayName(groupName);
}

export function shouldShowPropertySearchContext(
  property: SearchPropertyMetadata,
): boolean {
  const context = formatPropertySearchContextLabel(property);

  if (!context) {
    return false;
  }

  const primary = formatPropertySearchResultLabel(property);

  return (
    primary.localeCompare(context, undefined, { sensitivity: "accent" }) !== 0 &&
    !primary.toLowerCase().includes(context.toLowerCase())
  );
}

export function shouldShowPropertyAlias(
  _property: SearchPropertyMetadata,
): boolean {
  return false;
}

export function isPropertySelectable(property: SearchPropertyMetadata): boolean {
  return property.isSelectable !== false && !property.isContainer;
}

export function formatBlockContainerDisplayLabel(
  container: PropertyContainerGroup,
): string {
  return container.containerName;
}

export function getBlockContainerIcon(container: PropertyContainerGroup): string {
  if (container.containerEditorLabel === BLOCK_LIST_PROPERTY_GROUP_NAME) {
    return BLOCK_LIST_CONTAINER_ICON;
  }

  return BLOCK_GRID_CONTAINER_ICON;
}

export function isBlockGridGroup(groupName: string): boolean {
  return groupName === BLOCK_GRID_PROPERTY_GROUP_NAME;
}

export function countContainerBlockProperties(
  container: PropertyContainerGroup,
): number {
  return container.elementTypes.reduce(
    (count, elementType) => count + elementType.properties.length,
    0,
  );
}

function sortPropertiesWithinGroup(
  properties: readonly SearchPropertyMetadata[],
): SearchPropertyMetadata[] {
  return [...properties].sort(
    (left, right) =>
      (left.sortOrder ?? Number.MAX_SAFE_INTEGER) -
        (right.sortOrder ?? Number.MAX_SAFE_INTEGER) ||
      formatPropertyLabel(left).localeCompare(formatPropertyLabel(right), undefined, {
        sensitivity: "base",
      }),
  );
}

function formatBlockContainerEditorLabel(
  property: SearchPropertyMetadata,
): string | undefined {
  const editorAlias = property.editorAlias ?? "";

  if (editorAlias.includes("BlockGrid")) {
    return BLOCK_GRID_PROPERTY_GROUP_NAME;
  }

  if (editorAlias.includes("BlockList")) {
    return BLOCK_LIST_PROPERTY_GROUP_NAME;
  }

  return undefined;
}

function resolveElementTypeAlias(property: SearchPropertyMetadata): string {
  if (property.elementTypeAlias) {
    return property.elementTypeAlias;
  }

  const aliasParts = property.alias.split("__");

  if (aliasParts.length >= 3) {
    return aliasParts[1] ?? "_unknown";
  }

  return "_unknown";
}

function resolveElementTypeName(
  property: SearchPropertyMetadata,
  elementTypeAlias: string,
): string {
  return property.elementTypeName ?? property.sourceName ?? elementTypeAlias;
}

type MutableElementTypeGroup = {
  elementTypeKey: string;
  elementTypeAlias: string;
  elementTypeName: string;
  sortOrder: number;
  properties: SearchPropertyMetadata[];
};

type MutableContainerGroup = {
  containerKey: string;
  containerName: string;
  containerEditorLabel?: string;
  containerProperty?: SearchPropertyMetadata;
  elementTypes: Map<string, MutableElementTypeGroup>;
};

function addBlockElementProperty(
  container: MutableContainerGroup,
  property: SearchPropertyMetadata,
): void {
  const elementTypeAlias = resolveElementTypeAlias(property);
  const elementTypeKey = `${container.containerKey}::${elementTypeAlias}`;
  const elementTypeName = resolveElementTypeName(property, elementTypeAlias);
  const existing = container.elementTypes.get(elementTypeKey);
  const propertySortOrder = property.sortOrder ?? Number.MAX_SAFE_INTEGER;

  container.elementTypes.set(elementTypeKey, {
    elementTypeKey,
    elementTypeAlias,
    elementTypeName,
    sortOrder: Math.min(existing?.sortOrder ?? propertySortOrder, propertySortOrder),
    properties: [...(existing?.properties ?? []), property],
  });
}

function finalizeContainerGroup(
  container: MutableContainerGroup,
): PropertyContainerGroup {
  return {
    containerKey: container.containerKey,
    containerName: container.containerName,
    containerEditorLabel: container.containerEditorLabel,
    containerProperty: container.containerProperty,
    elementTypes: [...container.elementTypes.values()]
      .sort(
        (left, right) =>
          left.sortOrder - right.sortOrder ||
          left.elementTypeName.localeCompare(right.elementTypeName, undefined, {
            sensitivity: "base",
          }),
      )
      .map((elementType) => ({
        elementTypeKey: elementType.elementTypeKey,
        elementTypeAlias: elementType.elementTypeAlias,
        elementTypeName: elementType.elementTypeName,
        properties: sortPropertiesWithinGroup(elementType.properties),
      })),
  };
}

function groupCompositionProperties(
  properties: readonly SearchPropertyMetadata[],
): PropertyCompositionSection[] {
  const sections = new Map<string, SearchPropertyMetadata[]>();

  for (const property of properties) {
    const sectionName = property.sourceName?.trim() || "General";
    const existing = sections.get(sectionName) ?? [];
    existing.push(property);
    sections.set(sectionName, existing);
  }

  return [...sections.entries()]
    .sort(([left], [right]) =>
      left.localeCompare(right, undefined, { sensitivity: "base" }),
    )
    .map(([name, sectionProperties]) => ({
      name,
      properties: sortPropertiesWithinGroup(sectionProperties),
    }));
}

export function groupSearchProperties(
  properties: readonly SearchPropertyMetadata[],
): readonly PropertyTreeGroup[] {
  const groups = new Map<
    string,
    {
      sortOrder: number;
      direct: SearchPropertyMetadata[];
      containers: Map<string, MutableContainerGroup>;
    }
  >();

  for (const property of properties) {
    const name = resolvePropertyGroupName(property);
    const sortOrder = property.groupSortOrder ?? Number.MAX_SAFE_INTEGER - 100;
    const group = groups.get(name) ?? {
      sortOrder,
      direct: [],
      containers: new Map<string, MutableContainerGroup>(),
    };

    group.sortOrder = Math.min(group.sortOrder, sortOrder);

    if (property.isContainer) {
      const containerKey = property.containerAlias ?? property.alias;
      const existing = group.containers.get(containerKey);

      group.containers.set(containerKey, {
        containerKey,
        containerName:
          property.displayPath?.[0]?.trim() ?? formatPropertyLabel(property),
        containerEditorLabel: formatBlockContainerEditorLabel(property),
        containerProperty: property,
        elementTypes: existing?.elementTypes ?? new Map(),
      });
      groups.set(name, group);
      continue;
    }

    if (property.containerAlias) {
      const containerKey = property.containerAlias;
      const existing = group.containers.get(containerKey);
      const containerName =
        property.displayPath?.[0]?.trim() ??
        existing?.containerName ??
        containerKey;
      const container: MutableContainerGroup = {
        containerKey,
        containerName,
        containerEditorLabel:
          existing?.containerEditorLabel ??
          formatBlockContainerEditorLabel(property),
        containerProperty: existing?.containerProperty,
        elementTypes: existing?.elementTypes ?? new Map(),
      };

      addBlockElementProperty(container, property);
      group.containers.set(containerKey, container);
      groups.set(name, group);
      continue;
    }

    group.direct.push(property);
    groups.set(name, group);
  }

  return [...groups.entries()]
    .sort(
      (left, right) =>
        left[1].sortOrder - right[1].sortOrder ||
        left[0].localeCompare(right[0], undefined, { sensitivity: "base" }),
    )
    .map(([name, group]) => {
      const direct = sortPropertiesWithinGroup(group.direct);
      const isCompositionGroup = name === COMPOSITIONS_PROPERTY_GROUP_NAME;

      return {
        name,
        displayName: getPropertyGroupDisplayName(name),
        sortOrder: group.sortOrder,
        properties: isCompositionGroup ? [] : direct,
        compositionSections: isCompositionGroup
          ? groupCompositionProperties(direct)
          : [],
        containers: [...group.containers.values()]
          .sort((left, right) =>
            left.containerName.localeCompare(right.containerName, undefined, {
              sensitivity: "base",
            }),
          )
          .map((container) => finalizeContainerGroup(container)),
      };
    });
}

export function countGroupedProperties(groups: readonly PropertyTreeGroup[]): number {
  return groups.reduce((count, group) => {
    const compositionCount = group.compositionSections.reduce(
      (sectionCount, section) => sectionCount + section.properties.length,
      0,
    );
    const containerPropertyCount = group.containers.filter(
      (container) => container.containerProperty,
    ).length;
    const elementPropertyCount = group.containers.reduce(
      (containerCount, container) =>
        containerCount + countContainerBlockProperties(container),
      0,
    );

    return (
      count +
      group.properties.length +
      compositionCount +
      containerPropertyCount +
      elementPropertyCount
    );
  }, 0);
}

export function formatBlockElementBrowseBreadcrumb(property: SearchPropertyMetadata): {
  prefix?: string;
  leaf: string;
} {
  const displayPath = property.displayPath ?? [];
  const leaf = getPropertyLeafName(property);

  if (displayPath.length >= 3) {
    return {
      prefix: displayPath.slice(1, -1).join(PROPERTY_BROWSE_PATH_SEPARATOR),
      leaf,
    };
  }

  if (property.elementTypeName) {
    return {
      prefix: property.elementTypeName,
      leaf,
    };
  }

  return { leaf };
}

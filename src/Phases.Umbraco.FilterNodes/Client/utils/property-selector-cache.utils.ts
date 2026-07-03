import type { FilterablePropertyMetadata } from "../models/filter-models.js";
import {
  groupFilterableProperties,
  formatPropertyLabel,
  formatPropertySearchResultLabel,
  formatBlockElementPropertyLabel,
  getPropertyLeafName,
  resolvePropertyGroupName,
  type FilterablePropertyContainerGroup,
  type FilterablePropertyElementTypeGroup,
  type FilterablePropertyGroup,
} from "./filter-condition.utils.js";
import { PROPERTY_METADATA_HIERARCHY_SEPARATOR } from "../constants/filter-nodes.constants.js";

export interface PropertySearchIndexEntry {
  readonly property: FilterablePropertyMetadata;
  readonly searchText: string;
  readonly sortLabel: string;
}

export interface PropertySelectorCollapseState {
  readonly collapsedGroups: ReadonlySet<string>;
  readonly collapsedContainers: ReadonlySet<string>;
  readonly collapsedElementTypes: ReadonlySet<string>;
  readonly hydratedContainers: ReadonlySet<string>;
}

export interface PropertySelectorCache {
  readonly properties: readonly FilterablePropertyMetadata[];
  readonly grouped: readonly FilterablePropertyGroup[];
  readonly searchIndex: readonly PropertySearchIndexEntry[];
  search(searchTerm: string): readonly FilterablePropertyMetadata[];
  getBrowseGroups(
    hydratedContainerKeys: ReadonlySet<string>,
  ): readonly FilterablePropertyGroup[];
  getContainerElementTypes(
    containerKey: string,
  ): readonly FilterablePropertyElementTypeGroup[];
  getContainerNestedPropertyCount(containerKey: string): number;
  createCollapseState(
    selectedAlias: string,
    collapseThreshold: number,
  ): PropertySelectorCollapseState;
}

const cacheByProperties = new WeakMap<
  readonly FilterablePropertyMetadata[],
  PropertySelectorCache
>();

export function getPropertySelectorCache(
  properties: readonly FilterablePropertyMetadata[],
): PropertySelectorCache {
  const existing = cacheByProperties.get(properties);

  if (existing) {
    return existing;
  }

  const cache = buildPropertySelectorCache(properties);
  cacheByProperties.set(properties, cache);
  return cache;
}

export function primePropertySelectorCache(
  properties: readonly FilterablePropertyMetadata[],
): PropertySelectorCache {
  return getPropertySelectorCache(properties);
}

function buildPropertySelectorCache(
  properties: readonly FilterablePropertyMetadata[],
): PropertySelectorCache {
  const grouped = groupFilterableProperties(properties);
  const containerElementTypes = new Map<
    string,
    readonly FilterablePropertyElementTypeGroup[]
  >();
  const containerNestedCounts = new Map<string, number>();

  for (const group of grouped) {
    for (const container of group.containers) {
      containerElementTypes.set(container.containerKey, container.elementTypes);
      containerNestedCounts.set(
        container.containerKey,
        container.elementTypes.reduce(
          (count, elementType) => count + elementType.properties.length,
          0,
        ),
      );
    }
  }

  const searchIndex = properties.map((property) => ({
    property,
    searchText: buildPropertySearchText(property),
    sortLabel: formatPropertySearchResultLabel(property),
  }));

  return {
    properties,
    grouped,
    searchIndex,
    search(searchTerm: string) {
      const normalizedSearch = searchTerm.trim().toLowerCase();

      if (!normalizedSearch) {
        return [];
      }

      return searchIndex
        .filter((entry) => entry.searchText.includes(normalizedSearch))
        .sort((left, right) =>
          left.sortLabel.localeCompare(right.sortLabel, undefined, {
            sensitivity: "base",
          }),
        )
        .map((entry) => entry.property);
    },
    getBrowseGroups(hydratedContainerKeys) {
      return grouped.map((group) => ({
        ...group,
        containers: group.containers.map((container) =>
          toLazyContainerGroup(container, hydratedContainerKeys, containerElementTypes),
        ),
      }));
    },
    getContainerElementTypes(containerKey) {
      return containerElementTypes.get(containerKey) ?? [];
    },
    getContainerNestedPropertyCount(containerKey) {
      return containerNestedCounts.get(containerKey) ?? 0;
    },
    createCollapseState(selectedAlias, collapseThreshold) {
      return createPropertySelectorCollapseState(
        grouped,
        containerElementTypes,
        selectedAlias,
        collapseThreshold,
      );
    },
  };
}

function toLazyContainerGroup(
  container: FilterablePropertyContainerGroup,
  hydratedContainerKeys: ReadonlySet<string>,
  containerElementTypes: ReadonlyMap<
    string,
    readonly FilterablePropertyElementTypeGroup[]
  >,
): FilterablePropertyContainerGroup {
  if (hydratedContainerKeys.has(container.containerKey)) {
    return {
      ...container,
      elementTypes:
        containerElementTypes.get(container.containerKey) ??
        container.elementTypes,
    };
  }

  return {
    ...container,
    elementTypes: [],
  };
}

function buildPropertySearchText(property: FilterablePropertyMetadata): string {
  const parts = [
    formatPropertyLabel(property),
    formatBlockElementPropertyLabel(property),
    getPropertyLeafName(property),
    formatPropertySearchResultLabel(property),
    property.alias,
    resolvePropertyGroupName(property),
    property.sourceName,
    property.containerName,
    property.elementTypeName,
    ...(property.displayPath ?? []),
    (property.displayPath ?? []).join(PROPERTY_METADATA_HIERARCHY_SEPARATOR),
  ];

  return parts
    .map((part) => part?.trim().toLowerCase())
    .filter(Boolean)
    .join(" ");
}

function createPropertySelectorCollapseState(
  grouped: readonly FilterablePropertyGroup[],
  containerElementTypes: ReadonlyMap<
    string,
    readonly FilterablePropertyElementTypeGroup[]
  >,
  selectedAlias: string,
  collapseThreshold: number,
): PropertySelectorCollapseState {
  if (grouped.length === 0) {
    return {
      collapsedGroups: new Set(),
      collapsedContainers: new Set(),
      collapsedElementTypes: new Set(),
      hydratedContainers: new Set(),
    };
  }

  const propertyCount = grouped.reduce(
    (count, group) =>
      count +
      group.properties.length +
      group.containers.reduce(
        (containerCount, container) =>
          containerCount +
          (container.containerProperty ? 1 : 0) +
          (containerElementTypes.get(container.containerKey)?.reduce(
            (elementCount, elementType) =>
              elementCount + elementType.properties.length,
            0,
          ) ?? 0),
        0,
      ),
    0,
  );

  if (propertyCount <= collapseThreshold) {
    const hydratedContainers = new Set<string>();

    if (selectedAlias) {
      for (const group of grouped) {
        for (const container of group.containers) {
          if (containerContainsAlias(container, containerElementTypes, selectedAlias)) {
            hydratedContainers.add(container.containerKey);
          }
        }
      }
    }

    return {
      collapsedGroups: new Set(),
      collapsedContainers: new Set(),
      collapsedElementTypes: new Set(),
      hydratedContainers,
    };
  }

  const collapsedGroups = new Set<string>();
  const collapsedContainers = new Set<string>();
  const collapsedElementTypes = new Set<string>();
  const hydratedContainers = new Set<string>();
  let selectedGroupName: string | undefined;

  for (const group of grouped) {
    if (groupContainsAlias(group, containerElementTypes, selectedAlias)) {
      selectedGroupName = group.name;
      break;
    }
  }

  for (const group of grouped) {
    if (group.name !== selectedGroupName) {
      collapsedGroups.add(group.name);
    }

    for (const container of group.containers) {
      const containsSelection = containerContainsAlias(
        container,
        containerElementTypes,
        selectedAlias,
      );

      if (containsSelection) {
        hydratedContainers.add(container.containerKey);
      } else {
        collapsedContainers.add(container.containerKey);
      }

      const elementTypes =
        containerElementTypes.get(container.containerKey) ?? container.elementTypes;

      for (const elementType of elementTypes) {
        const containsElementSelection = elementType.properties.some(
          (property) => property.alias === selectedAlias,
        );

        if (!containsElementSelection) {
          collapsedElementTypes.add(elementType.elementTypeKey);
        }
      }
    }
  }

  return {
    collapsedGroups,
    collapsedContainers,
    collapsedElementTypes,
    hydratedContainers,
  };
}

function groupContainsAlias(
  group: FilterablePropertyGroup,
  containerElementTypes: ReadonlyMap<
    string,
    readonly FilterablePropertyElementTypeGroup[]
  >,
  alias: string,
): boolean {
  if (!alias) {
    return false;
  }

  if (group.properties.some((property) => property.alias === alias)) {
    return true;
  }

  return group.containers.some((container) =>
    containerContainsAlias(container, containerElementTypes, alias),
  );
}

function containerContainsAlias(
  container: FilterablePropertyContainerGroup,
  containerElementTypes: ReadonlyMap<
    string,
    readonly FilterablePropertyElementTypeGroup[]
  >,
  alias: string,
): boolean {
  if (!alias) {
    return false;
  }

  if (container.containerProperty?.alias === alias) {
    return true;
  }

  const elementTypes =
    containerElementTypes.get(container.containerKey) ?? container.elementTypes;

  return elementTypes.some((elementType) =>
    elementType.properties.some((property) => property.alias === alias),
  );
}

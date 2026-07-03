import {
  ALL_CONTENT_TYPES_OPTION_LABEL,
  CONTENT_TYPE_ALIAS_PROPERTY_ALIAS,
  CREATED_DATE_PROPERTY_ALIAS,
  DATE_FILTER_OPERATORS,
  ENTIRE_SITE_SYSTEM_PROPERTY_ALIASES,
  FILTER_OPERATORS,
  NODE_NAME_PROPERTY_ALIAS,
  NAME_HIGHLIGHT_OPERATORS,
  NUMERIC_FILTER_OPERATORS,
  PUBLISH_STATUS_PROPERTY_ALIAS,
  RESERVED_CONTENT_TYPE_ALIASES,
  UPDATED_DATE_PROPERTY_ALIAS,
  DEFAULT_PROPERTY_GROUP_NAME,
  SYSTEM_PROPERTY_GROUP_NAME,
  BLOCK_GRID_CONTAINER_ICON,
  BLOCK_GRID_PROPERTY_GROUP_NAME,
  BLOCK_LIST_CONTAINER_ICON,
  BLOCK_LIST_PROPERTY_GROUP_NAME,
  PROPERTY_BROWSE_PATH_SEPARATOR,
  PROPERTY_METADATA_HIERARCHY_SEPARATOR,
} from "../constants/filter-nodes.constants.js";
import { getPropertySourceIcon } from "./property-source.utils.js";
import type {
  EditableFilterOperator,
  FilterOperator,
  FilterType,
  FilterablePropertyMetadata,
  PropertyFilterOption,
  PropertyFilterType,
  SearchScope,
  ContentTypeListItem,
} from "../models/filter-models.js";
import type { EditableFilterCondition } from "../controllers/filter-nodes-workspace.models.js";

export type FilterSelectOption = {
  name: string;
  value: string;
  selected?: boolean;
};

export function isReservedContentTypeAlias(alias: string): boolean {
  const normalized = alias.trim();

  if (!normalized) {
    return true;
  }

  if (
    normalized.localeCompare(ALL_CONTENT_TYPES_OPTION_LABEL, undefined, {
      sensitivity: "accent",
    }) === 0
  ) {
    return true;
  }

  return RESERVED_CONTENT_TYPE_ALIASES.some(
    (reservedAlias) =>
      reservedAlias.localeCompare(normalized, undefined, {
        sensitivity: "accent",
      }) === 0,
  );
}

export function filterDocumentTypeAliases(
  aliases: readonly string[],
): readonly string[] {
  return aliases.filter((alias) => !isReservedContentTypeAlias(alias));
}

export function filterContentTypes(
  contentTypes: readonly ContentTypeListItem[],
): readonly ContentTypeListItem[] {
  return contentTypes.filter(
    (contentType) => !isReservedContentTypeAlias(contentType.alias),
  );
}

export function getContentTypeAliases(
  contentTypes: readonly ContentTypeListItem[],
): readonly string[] {
  return filterDocumentTypeAliases(
    contentTypes.map((contentType) => contentType.alias),
  );
}

export function formatDocumentTypeLabel(contentTypeAlias: string): string {
  if (!contentTypeAlias) {
    return "";
  }

  const spaced = contentTypeAlias
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .replace(/[-_]/g, " ");

  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

export function resolveContentTypeDisplayName(
  contentTypeAlias: string,
  contentTypes: readonly ContentTypeListItem[],
): string {
  if (!contentTypeAlias) {
    return "";
  }

  const match = contentTypes.find(
    (contentType) =>
      contentType.alias.localeCompare(contentTypeAlias, undefined, {
        sensitivity: "accent",
      }) === 0,
  );

  return match?.name ?? formatDocumentTypeLabel(contentTypeAlias);
}

export function shouldShowContentTypeAlias(
  contentType: ContentTypeListItem,
): boolean {
  return (
    contentType.name.localeCompare(contentType.alias, undefined, {
      sensitivity: "accent",
    }) !== 0 &&
    contentType.name.localeCompare(
      formatDocumentTypeLabel(contentType.alias),
      undefined,
      { sensitivity: "accent" },
    ) !== 0
  );
}

export function formatContentTypeDisplayValue(
  contentType: ContentTypeListItem,
): string {
  return shouldShowContentTypeAlias(contentType)
    ? `${contentType.name} (${contentType.alias})`
    : contentType.name;
}

export function matchesContentTypeSearch(
  contentType: ContentTypeListItem,
  searchTerm: string,
): boolean {
  const normalizedSearch = searchTerm.trim().toLowerCase();

  if (!normalizedSearch) {
    return true;
  }

  return (
    contentType.name.toLowerCase().includes(normalizedSearch) ||
    contentType.alias.toLowerCase().includes(normalizedSearch)
  );
}

export function isEntireSiteSystemPropertyAlias(propertyAlias: string): boolean {
  const normalized = propertyAlias.trim();

  return ENTIRE_SITE_SYSTEM_PROPERTY_ALIASES.some(
    (alias) =>
      alias.localeCompare(normalized, undefined, { sensitivity: "accent" }) === 0,
  );
}

export function isEntireSiteSearchScope(searchScope: SearchScope): boolean {
  return searchScope === "EntireSite";
}


export function getEntireSitePropertyMetadata(
  contentTypes: readonly ContentTypeListItem[],
): readonly FilterablePropertyMetadata[] {
  const documentTypes = filterContentTypes(contentTypes);

  return [
    {
      alias: NODE_NAME_PROPERTY_ALIAS,
      name: "Node Name",
      filterType: "Text",
      groupName: SYSTEM_PROPERTY_GROUP_NAME,
      groupSortOrder: Number.MAX_SAFE_INTEGER,
      sortOrder: 0,
      sourceCategory: "System",
    },
    {
      alias: CREATED_DATE_PROPERTY_ALIAS,
      name: "Create Date",
      filterType: "Date",
      groupName: SYSTEM_PROPERTY_GROUP_NAME,
      groupSortOrder: Number.MAX_SAFE_INTEGER,
      sortOrder: 1,
      sourceCategory: "System",
    },
    {
      alias: UPDATED_DATE_PROPERTY_ALIAS,
      name: "Update Date",
      filterType: "Date",
      groupName: SYSTEM_PROPERTY_GROUP_NAME,
      groupSortOrder: Number.MAX_SAFE_INTEGER,
      sortOrder: 2,
      sourceCategory: "System",
    },
    {
      alias: CONTENT_TYPE_ALIAS_PROPERTY_ALIAS,
      name: "Content Type Alias",
      filterType: "Dropdown",
      groupName: SYSTEM_PROPERTY_GROUP_NAME,
      groupSortOrder: Number.MAX_SAFE_INTEGER,
      sortOrder: 3,
      sourceCategory: "System",
      options: documentTypes.map((contentType) => ({
        label: contentType.name,
        value: contentType.alias,
      })),
    },
    {
      alias: PUBLISH_STATUS_PROPERTY_ALIAS,
      name: "Publish Status",
      filterType: "Dropdown",
      editorAlias: "Umbraco.TrueFalse",
      groupName: SYSTEM_PROPERTY_GROUP_NAME,
      groupSortOrder: Number.MAX_SAFE_INTEGER,
      sortOrder: 4,
      sourceCategory: "System",
      options: [
        { label: "Published", value: "1" },
        { label: "Unpublished", value: "0" },
      ],
    },
  ];
}

export function resolvePropertyMetadata(
  propertyMetadataByContentType: Readonly<
    Record<string, readonly FilterablePropertyMetadata[]>
  >,
  contentTypeAlias: string,
  propertyAlias: string,
  searchScope: SearchScope,
  contentTypes: readonly ContentTypeListItem[],
): FilterablePropertyMetadata | undefined {
  if (!propertyAlias) {
    return undefined;
  }

  if (isEntireSiteSearchScope(searchScope)) {
    return getEntireSitePropertyMetadata(contentTypes).find(
      (property) => property.alias === propertyAlias,
    );
  }

  return getPropertyMetadata(
    propertyMetadataByContentType,
    contentTypeAlias,
    propertyAlias,
  );
}

export function isDatePropertyAlias(propertyAlias: string): boolean {
  return (
    propertyAlias === CREATED_DATE_PROPERTY_ALIAS ||
    propertyAlias === UPDATED_DATE_PROPERTY_ALIAS
  );
}

export function usesDateRangeFields(
  _propertyMetadata: FilterablePropertyMetadata | undefined,
  propertyAlias: string,
): boolean {
  return isDatePropertyAlias(propertyAlias);
}

export function isDateFilterControl(
  propertyMetadata: FilterablePropertyMetadata | undefined,
  propertyAlias: string,
): boolean {
  return (
    propertyMetadata?.filterType === "Date" || isDatePropertyAlias(propertyAlias)
  );
}

export function getPropertyMetadata(
  propertyMetadataByContentType: Readonly<
    Record<string, readonly FilterablePropertyMetadata[]>
  >,
  contentTypeAlias: string,
  propertyAlias: string,
): FilterablePropertyMetadata | undefined {
  if (!contentTypeAlias || !propertyAlias) {
    return undefined;
  }

  return propertyMetadataByContentType[contentTypeAlias]?.find(
    (property) => property.alias === propertyAlias,
  );
}

export function isDateProperty(
  propertyMetadata: FilterablePropertyMetadata | undefined,
  propertyAlias: string,
): boolean {
  return isDateFilterControl(propertyMetadata, propertyAlias);
}

export const TRUE_FALSE_FILTER_OPTIONS: readonly PropertyFilterOption[] = [
  { label: "True", value: "1" },
  { label: "False", value: "0" },
];

export function isTrueFalseProperty(
  propertyMetadata: FilterablePropertyMetadata | undefined,
): boolean {
  return (
    propertyMetadata?.editorAlias?.localeCompare("Umbraco.TrueFalse", undefined, {
      sensitivity: "accent",
    }) === 0
  );
}

export function getPropertyFilterType(
  propertyMetadata: FilterablePropertyMetadata | undefined,
): PropertyFilterType {
  if (isTrueFalseProperty(propertyMetadata)) {
    return "Dropdown";
  }

  return propertyMetadata?.filterType ?? "Text";
}

export function getOperatorOptions(
  propertyMetadata: FilterablePropertyMetadata | undefined,
  propertyAlias: string,
): readonly FilterOperator[] {
  if (isBlockGridContainerProperty(propertyMetadata)) {
    return [...NAME_HIGHLIGHT_OPERATORS, "IsEmpty", "IsNotEmpty"];
  }

  if (isBlockContainerProperty(propertyMetadata)) {
    return ["IsEmpty", "IsNotEmpty"];
  }

  if (usesDateRangeFields(propertyMetadata, propertyAlias)) {
    return DATE_FILTER_OPERATORS;
  }

  if (propertyMetadata?.filterType === "Date") {
    return [
      "Equals",
      "NotEquals",
      "GreaterThan",
      "GreaterThanOrEqual",
      "LessThan",
      "LessThanOrEqual",
      "IsEmpty",
      "IsNotEmpty",
    ];
  }

  if (propertyMetadata?.filterType === "Number") {
    return NUMERIC_FILTER_OPERATORS;
  }

  if (
    propertyMetadata?.filterType === "Dropdown" ||
    propertyMetadata?.filterType === "MultiSelect"
  ) {
    return ["Equals", "NotEquals", "IsEmpty", "IsNotEmpty"];
  }

  return FILTER_OPERATORS;
}

export function shouldQuoteFilterValue(
  operator: FilterOperator,
  filterType: PropertyFilterType,
): boolean {
  if (filterType === "Number") {
    return false;
  }

  return (
    operator === "Contains" ||
    operator === "StartsWith" ||
    operator === "EndsWith"
  );
}

export function shouldShowValueInput(
  propertyMetadata: FilterablePropertyMetadata | undefined,
  propertyAlias: string,
  filterOperator: EditableFilterOperator,
): boolean {
  if (
    !propertyAlias ||
    !filterOperator ||
    isDateFilterControl(propertyMetadata, propertyAlias)
  ) {
    return false;
  }

  return filterOperator !== "IsEmpty" && filterOperator !== "IsNotEmpty";
}

export function formatOperatorLabel(operator: FilterOperator): string {
  return operator
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (char) => char.toUpperCase())
    .trim();
}

export function isPropertyFilterable(
  property: FilterablePropertyMetadata | undefined,
): boolean {
  return property?.isFilterable !== false;
}

export function filterPropertiesBySearchableMode(
  properties: readonly FilterablePropertyMetadata[],
  searchableOnly: boolean,
  selectedPropertyAlias = "",
): readonly FilterablePropertyMetadata[] {
  if (!searchableOnly) {
    return properties;
  }

  const normalizedSelection = selectedPropertyAlias.trim();

  return properties.filter((property) => {
    if (isPropertyFilterable(property)) {
      return true;
    }

    if (!normalizedSelection) {
      return false;
    }

    return (
      property.alias.localeCompare(normalizedSelection, undefined, {
        sensitivity: "accent",
      }) === 0
    );
  });
}

export function filterPropertiesForPropertySelector(
  properties: readonly FilterablePropertyMetadata[],
  searchableOnly: boolean,
  selectedPropertyAlias = "",
): readonly FilterablePropertyMetadata[] {
  const filtered = filterPropertiesBySearchableMode(
    properties,
    searchableOnly,
    selectedPropertyAlias,
  );

  if (!searchableOnly) {
    return filtered;
  }

  const visibleAliases = new Set(filtered.map((property) => property.alias));
  const blockGridTreeProperties = properties.filter(
    (property) =>
      isBlockGridElementProperty(property) &&
      !visibleAliases.has(property.alias),
  );

  if (blockGridTreeProperties.length === 0) {
    return filtered;
  }

  return [...filtered, ...blockGridTreeProperties];
}

export function isBlockContainerProperty(
  property: FilterablePropertyMetadata | undefined,
): boolean {
  return property?.isContainer === true;
}

export function isBlockGridContainerProperty(
  property: FilterablePropertyMetadata | undefined,
): boolean {
  if (!property || !isBlockContainerProperty(property)) {
    return false;
  }

  if (property.sourceCategory === "BlockGrid") {
    return true;
  }

  return (
    property.editorAlias?.localeCompare("Umbraco.BlockGrid", undefined, {
      sensitivity: "accent",
    }) === 0 ||
    property.containerEditorAlias?.localeCompare("Umbraco.BlockGrid", undefined, {
      sensitivity: "accent",
    }) === 0
  );
}

export function isBlockElementProperty(
  property: FilterablePropertyMetadata | undefined,
): boolean {
  return Boolean(property?.containerAlias && !property.isContainer);
}

export function isBlockGridElementProperty(
  property: FilterablePropertyMetadata | undefined,
): boolean {
  if (!property || !isBlockElementProperty(property)) {
    return false;
  }

  if (property.sourceCategory === "BlockGrid") {
    return true;
  }

  return (
    property.containerEditorAlias?.localeCompare("Umbraco.BlockGrid", undefined, {
      sensitivity: "accent",
    }) === 0
  );
}

export type BlockElementIndexStatus = "indexed" | "notIndexed";

export function getBlockElementIndexStatus(
  property: FilterablePropertyMetadata | undefined,
): BlockElementIndexStatus | undefined {
  if (!isBlockElementProperty(property)) {
    return undefined;
  }

  return isPropertyFilterable(property) ? "indexed" : "notIndexed";
}

export function formatPropertyLabel(
  property: FilterablePropertyMetadata,
): string {
  return property.name || property.alias;
}

export function formatBlockElementPropertyLabel(
  property: FilterablePropertyMetadata,
): string {
  const displayPath = property.displayPath;

  if (displayPath && displayPath.length > 0) {
    return displayPath[displayPath.length - 1] ?? formatPropertyLabel(property);
  }

  const label = formatPropertyLabel(property);

  if (label.includes(PROPERTY_METADATA_HIERARCHY_SEPARATOR)) {
    const segments = label.split(PROPERTY_METADATA_HIERARCHY_SEPARATOR);
    return segments[segments.length - 1]?.trim() || label;
  }

  return label;
}

export interface BlockElementBrowseBreadcrumb {
  readonly prefix: string;
  readonly leaf: string;
}

export function formatBlockElementBrowseBreadcrumb(
  property: FilterablePropertyMetadata,
): BlockElementBrowseBreadcrumb {
  const leaf = getPropertyLeafName(property);
  const prefixParts: string[] = [];

  if (property.containerName?.trim()) {
    prefixParts.push(property.containerName.trim());
  }

  if (property.elementTypeName?.trim()) {
    prefixParts.push(property.elementTypeName.trim());
  }

  return {
    prefix: prefixParts.join(PROPERTY_BROWSE_PATH_SEPARATOR),
    leaf,
  };
}

export function formatBlockContainerDisplayLabel(
  container: Pick<
    FilterablePropertyContainerGroup,
    "containerName" | "containerEditorLabel" | "containerProperty"
  >,
): string {
  const containerPropertyLabel = container.containerProperty
    ? formatPropertyLabel(container.containerProperty)
    : undefined;

  if (containerPropertyLabel) {
    return containerPropertyLabel;
  }

  const editorLabel = container.containerEditorLabel;

  if (
    editorLabel &&
    !container.containerName.includes(`(${editorLabel})`)
  ) {
    return `${container.containerName} (${editorLabel})`;
  }

  return container.containerName;
}

export function getBlockContainerIcon(
  container: Pick<
    FilterablePropertyContainerGroup,
    "containerEditorLabel" | "containerProperty"
  >,
): string {
  if (container.containerProperty) {
    return getPropertySourceIcon(container.containerProperty);
  }

  if (container.containerEditorLabel === BLOCK_GRID_PROPERTY_GROUP_NAME) {
    return BLOCK_GRID_CONTAINER_ICON;
  }

  if (container.containerEditorLabel === BLOCK_LIST_PROPERTY_GROUP_NAME) {
    return BLOCK_LIST_CONTAINER_ICON;
  }

  return "icon-folder";
}

export function countContainerBlockProperties(
  container: FilterablePropertyContainerGroup,
): number {
  return container.elementTypes.reduce(
    (count, elementType) => count + elementType.properties.length,
    0,
  );
}

export function formatBlockContainerEditorLabel(
  property: FilterablePropertyMetadata,
): string | undefined {
  if (!property.containerEditorAlias) {
    return undefined;
  }

  if (
    property.containerEditorAlias.localeCompare("Umbraco.BlockGrid", undefined, {
      sensitivity: "accent",
    }) === 0
  ) {
    return BLOCK_GRID_PROPERTY_GROUP_NAME;
  }

  if (
    property.containerEditorAlias.localeCompare("Umbraco.BlockList", undefined, {
      sensitivity: "accent",
    }) === 0
  ) {
    return BLOCK_LIST_PROPERTY_GROUP_NAME;
  }

  return undefined;
}

export function getPropertyLeafName(
  property: FilterablePropertyMetadata,
): string {
  const displayPath = property.displayPath;

  if (displayPath && displayPath.length > 0) {
    return displayPath[displayPath.length - 1] ?? formatPropertyLabel(property);
  }

  return formatBlockElementPropertyLabel(property);
}

export function formatPropertySearchResultLabel(
  property: FilterablePropertyMetadata,
): string {
  if (property.isContainer) {
    return getPropertyLeafName(property);
  }

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
  property: FilterablePropertyMetadata,
): string | undefined {
  if (isBlockElementProperty(property)) {
    const containerName = property.containerName?.trim();

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

  return groupName;
}

export function shouldShowPropertySearchContext(
  property: FilterablePropertyMetadata,
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
  _property: FilterablePropertyMetadata,
): boolean {
  return false;
}

export function matchesPropertySearch(
  property: FilterablePropertyMetadata,
  searchTerm: string,
): boolean {
  const normalizedSearch = searchTerm.trim().toLowerCase();

  if (!normalizedSearch) {
    return true;
  }

  const label = formatPropertyLabel(property).toLowerCase();
  const alias = property.alias.toLowerCase();
  const groupName = resolvePropertyGroupName(property).toLowerCase();
  const sourceName = property.sourceName?.toLowerCase() ?? "";
  const containerName = property.containerName?.toLowerCase() ?? "";
  const elementTypeName = property.elementTypeName?.toLowerCase() ?? "";
  const displayPath = (property.displayPath ?? []).join(" ").toLowerCase();
  const nestedLabel = formatBlockElementPropertyLabel(property).toLowerCase();
  const leafName = getPropertyLeafName(property).toLowerCase();
  const searchResultLabel =
    formatPropertySearchResultLabel(property).toLowerCase();
  const hierarchicalPath = (property.displayPath ?? [])
    .join(PROPERTY_METADATA_HIERARCHY_SEPARATOR)
    .toLowerCase();

  return (
    label.includes(normalizedSearch) ||
    nestedLabel.includes(normalizedSearch) ||
    leafName.includes(normalizedSearch) ||
    searchResultLabel.includes(normalizedSearch) ||
    hierarchicalPath.includes(normalizedSearch) ||
    alias.includes(normalizedSearch) ||
    groupName.includes(normalizedSearch) ||
    sourceName.includes(normalizedSearch) ||
    containerName.includes(normalizedSearch) ||
    elementTypeName.includes(normalizedSearch) ||
    displayPath.includes(normalizedSearch)
  );
}

export function searchFilterableProperties(
  properties: readonly FilterablePropertyMetadata[],
  searchTerm: string,
  cache?: {
    search(searchTerm: string): readonly FilterablePropertyMetadata[];
  } | null,
): readonly FilterablePropertyMetadata[] {
  if (cache) {
    return cache.search(searchTerm);
  }

  const normalizedSearch = searchTerm.trim();

  if (!normalizedSearch) {
    return [];
  }

  return [...properties]
    .filter((property) => matchesPropertySearch(property, normalizedSearch))
    .sort((left, right) =>
      formatPropertySearchResultLabel(left).localeCompare(
        formatPropertySearchResultLabel(right),
        undefined,
        { sensitivity: "base" },
      ),
    );
}

export interface FilterablePropertyElementTypeGroup {
  readonly elementTypeKey: string;
  readonly elementTypeAlias: string;
  readonly elementTypeName: string;
  readonly properties: readonly FilterablePropertyMetadata[];
}

export interface FilterablePropertyContainerGroup {
  readonly containerKey: string;
  readonly containerName: string;
  readonly containerEditorLabel?: string;
  readonly containerProperty?: FilterablePropertyMetadata;
  readonly elementTypes: readonly FilterablePropertyElementTypeGroup[];
}

export interface FilterablePropertyGroup {
  readonly name: string;
  readonly sortOrder: number;
  readonly properties: readonly FilterablePropertyMetadata[];
  readonly containers: readonly FilterablePropertyContainerGroup[];
}

export function resolvePropertyGroupName(
  property: FilterablePropertyMetadata,
): string {
  return property.groupName?.trim() || DEFAULT_PROPERTY_GROUP_NAME;
}

type MutableElementTypeGroup = {
  elementTypeKey: string;
  elementTypeAlias: string;
  elementTypeName: string;
  sortOrder: number;
  properties: FilterablePropertyMetadata[];
};

type MutableContainerGroup = {
  containerKey: string;
  containerName: string;
  containerEditorLabel?: string;
  containerProperty?: FilterablePropertyMetadata;
  elementTypes: Map<string, MutableElementTypeGroup>;
};

function resolveElementTypeAlias(
  property: FilterablePropertyMetadata,
): string {
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
  property: FilterablePropertyMetadata,
  elementTypeAlias: string,
): string {
  return (
    property.elementTypeName ??
    property.sourceName ??
    elementTypeAlias
  );
}

function addBlockElementProperty(
  container: MutableContainerGroup,
  property: FilterablePropertyMetadata,
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
): FilterablePropertyContainerGroup {
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

export function groupFilterableProperties(
  properties: readonly FilterablePropertyMetadata[],
): readonly FilterablePropertyGroup[] {
  const groups = new Map<
    string,
    {
      sortOrder: number;
      direct: FilterablePropertyMetadata[];
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
        containerName: property.containerName ?? formatPropertyLabel(property),
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
        property.containerName ?? existing?.containerName ?? containerKey;
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
    .map(([name, group]) => ({
      name,
      sortOrder: group.sortOrder,
      properties: sortPropertiesWithinGroup(group.direct),
      containers: [...group.containers.values()]
        .sort((left, right) =>
          left.containerName.localeCompare(right.containerName, undefined, {
            sensitivity: "base",
          }),
        )
        .map((container) => finalizeContainerGroup(container)),
    }));
}

export function countGroupedFilterableProperties(
  groups: readonly FilterablePropertyGroup[],
): number {
  return groups.reduce((count, group) => {
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
      containerPropertyCount +
      elementPropertyCount
    );
  }, 0);
}

export function filterGroupedFilterableProperties(
  properties: readonly FilterablePropertyMetadata[],
  searchTerm: string,
): readonly FilterablePropertyGroup[] {
  const normalizedSearch = searchTerm.trim();

  if (!normalizedSearch) {
    return groupFilterableProperties(properties);
  }

  return groupFilterableProperties(
    properties.filter((property) => matchesPropertySearch(property, normalizedSearch)),
  );
}

function sortPropertiesWithinGroup(
  properties: readonly FilterablePropertyMetadata[],
): readonly FilterablePropertyMetadata[] {
  return [...properties].sort(
    (left, right) =>
      (left.sortOrder ?? 0) - (right.sortOrder ?? 0) ||
      formatPropertyLabel(left).localeCompare(
        formatPropertyLabel(right),
        undefined,
        { sensitivity: "base" },
      ),
  );
}

export function toPropertySelectOptions(
  properties: readonly FilterablePropertyMetadata[],
  selectedAlias: string,
  placeholder: string,
): FilterSelectOption[] {
  if (properties.length === 0) {
    return [{ name: placeholder, value: "", selected: true }];
  }

  return [
    { name: placeholder, value: "", selected: !selectedAlias },
    ...properties.map((property) => ({
      name: formatPropertyLabel(property),
      value: property.alias,
      selected: property.alias === selectedAlias,
    })),
  ];
}

export function toSelectOptions(
  values: readonly string[],
  selectedValue: string,
  placeholder: string,
  labelFormatter: (value: string) => string = (value) => value,
): FilterSelectOption[] {
  if (values.length === 0) {
    return [{ name: placeholder, value: "", selected: true }];
  }

  return [
    { name: placeholder, value: "", selected: !selectedValue },
    ...values.map((value) => ({
      name: labelFormatter(value),
      value,
      selected: value === selectedValue,
    })),
  ];
}

export function toOperatorSelectOptions(
  operators: readonly FilterOperator[],
  selectedOperator: EditableFilterOperator,
  placeholder = "Select operator...",
): FilterSelectOption[] {
  return [
    { name: placeholder, value: "", selected: !selectedOperator },
    ...operators.map((operator) => ({
      name: formatOperatorLabel(operator),
      value: operator,
      selected: operator === selectedOperator,
    })),
  ];
}

export function toFilterValueSelectOptions(
  propertyMetadata: FilterablePropertyMetadata | undefined,
  selectedValue: string,
  placeholder = "Select value",
): FilterSelectOption[] {
  const options = isTrueFalseProperty(propertyMetadata)
    ? TRUE_FALSE_FILTER_OPTIONS
    : (propertyMetadata?.options ?? []);

  if (options.length === 0) {
    return [{ name: placeholder, value: "", selected: true }];
  }

  return [
    { name: placeholder, value: "", selected: !selectedValue },
    ...options.map((option) => ({
      name: option.label,
      value: option.value,
      selected: option.value === selectedValue,
    })),
  ];
}

export function parseMultiSelectValue(propertyValue: string): readonly string[] {
  return propertyValue
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

export function formatMultiSelectValue(values: readonly string[]): string {
  return values.join(",");
}

export function isMultiSelectValueSelected(
  propertyValue: string,
  optionValue: string,
): boolean {
  return parseMultiSelectValue(propertyValue).includes(optionValue);
}

export function conditionsContainValues(
  conditions: readonly EditableFilterCondition[],
  filterType: FilterType = "All",
): boolean {
  if (filterType !== "All") {
    return true;
  }

  return conditions.some(
    (condition) =>
      condition.contentTypeAlias.trim() !== "" ||
      condition.propertyAlias.trim() !== "" ||
      condition.propertyValue.trim() !== "" ||
      condition.fromDate.trim() !== "" ||
      condition.toDate.trim() !== "",
  );
}

import type {
  FilterablePropertyGroup,
  FilterablePropertyContainerGroup,
} from "./filter-condition.utils.js";
import {
  countContainerBlockProperties,
  countGroupedFilterableProperties,
} from "./filter-condition.utils.js";
import { COMBOBOX_MAX_VISIBLE_OPTIONS } from "../constants/filter-nodes.constants.js";

export interface VisibleListLimitResult<T> {
  readonly items: readonly T[];
  readonly truncated: boolean;
  readonly totalCount: number;
}

export function limitVisibleListItems<T>(
  items: readonly T[],
  isSearching: boolean,
  maxVisible = COMBOBOX_MAX_VISIBLE_OPTIONS,
): VisibleListLimitResult<T> {
  if (items.length <= maxVisible) {
    return {
      items,
      truncated: false,
      totalCount: items.length,
    };
  }

  if (!isSearching) {
    return {
      items: items.slice(0, maxVisible),
      truncated: true,
      totalCount: items.length,
    };
  }

  return {
    items: items.slice(0, maxVisible),
    truncated: true,
    totalCount: items.length,
  };
}

export interface LimitedPropertyGroupsResult {
  readonly groups: readonly FilterablePropertyGroup[];
  readonly truncated: boolean;
  readonly totalPropertyCount: number;
}

export function limitVisiblePropertyGroups(
  groups: readonly FilterablePropertyGroup[],
  maxVisible = COMBOBOX_MAX_VISIBLE_OPTIONS,
): LimitedPropertyGroupsResult {
  const totalPropertyCount = countGroupedFilterableProperties(groups);

  if (totalPropertyCount <= maxVisible) {
    return {
      groups,
      truncated: false,
      totalPropertyCount,
    };
  }

  const limitedGroups: FilterablePropertyGroup[] = [];
  let remaining = maxVisible;

  for (const group of groups) {
    if (remaining <= 0) {
      break;
    }

    const limitedGroup = limitGroupProperties(group, remaining);
    remaining -= countGroupItems(limitedGroup);
    limitedGroups.push(limitedGroup);
  }

  return {
    groups: limitedGroups,
    truncated: true,
    totalPropertyCount,
  };
}

function countGroupItems(group: FilterablePropertyGroup): number {
  const containerPropertyCount = group.containers.filter(
    (container) => container.containerProperty,
  ).length;
  const elementPropertyCount = group.containers.reduce(
    (count, container) => count + countContainerBlockProperties(container),
    0,
  );

  return group.properties.length + containerPropertyCount + elementPropertyCount;
}

function limitGroupProperties(
  group: FilterablePropertyGroup,
  maxVisible: number,
): FilterablePropertyGroup {
  if (countGroupItems(group) <= maxVisible) {
    return group;
  }

  let remaining = maxVisible;
  const direct = group.properties.slice(0, remaining);
  remaining -= direct.length;

  const containers: FilterablePropertyContainerGroup[] = [];

  for (const container of group.containers) {
    if (remaining <= 0) {
      break;
    }

    const limitedContainer = limitContainerProperties(container, remaining);
    remaining -= countContainerItems(limitedContainer);
    if (countContainerItems(limitedContainer) > 0) {
      containers.push(limitedContainer);
    }
  }

  return {
    ...group,
    properties: direct,
    containers,
  };
}

function countContainerItems(container: FilterablePropertyContainerGroup): number {
  return (
    (container.containerProperty ? 1 : 0) + countContainerBlockProperties(container)
  );
}

function limitContainerProperties(
  container: FilterablePropertyContainerGroup,
  maxVisible: number,
): FilterablePropertyContainerGroup {
  let remaining = maxVisible;
  const containerProperty = container.containerProperty && remaining > 0
    ? container.containerProperty
    : undefined;

  if (containerProperty) {
    remaining -= 1;
  }

  const elementTypes = [];

  for (const elementType of container.elementTypes) {
    if (remaining <= 0) {
      break;
    }

    const properties = elementType.properties.slice(0, remaining);

    if (properties.length === 0) {
      continue;
    }

    remaining -= properties.length;
    elementTypes.push({
      ...elementType,
      properties,
    });
  }

  return {
    ...container,
    containerProperty,
    elementTypes,
  };
}

export function buildComboboxLimitMessage(
  totalCount: number,
  visibleCount: number,
  truncated: boolean,
  isSearching: boolean,
  itemLabel: string,
): string {
  if (!truncated) {
    return "";
  }

  if (!isSearching) {
    return `${totalCount} ${itemLabel}. Type to narrow the list.`;
  }

  return `Showing ${visibleCount} of ${totalCount} ${itemLabel}. Refine your search to see more.`;
}

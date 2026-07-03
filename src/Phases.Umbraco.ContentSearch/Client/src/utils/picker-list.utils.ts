import type { PropertyContainerGroup, PropertyTreeGroup } from "./property-tree.utils.js";
import {
  countContainerBlockProperties,
  countGroupedProperties,
} from "./property-tree.utils.js";
import { PICKER_MAX_VISIBLE_OPTIONS } from "../constants/property-picker.constants.js";

export function buildPickerLimitMessage(
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

export interface LimitedPropertyGroupsResult {
  readonly groups: readonly PropertyTreeGroup[];
  readonly truncated: boolean;
  readonly totalPropertyCount: number;
}

export function limitVisiblePropertyGroups(
  groups: readonly PropertyTreeGroup[],
  maxVisible = PICKER_MAX_VISIBLE_OPTIONS,
): LimitedPropertyGroupsResult {
  const totalPropertyCount = countGroupedProperties(groups);

  if (totalPropertyCount <= maxVisible) {
    return {
      groups,
      truncated: false,
      totalPropertyCount,
    };
  }

  const limitedGroups: PropertyTreeGroup[] = [];
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

function countGroupItems(group: PropertyTreeGroup): number {
  const compositionCount = group.compositionSections.reduce(
    (count, section) => count + section.properties.length,
    0,
  );
  const elementPropertyCount = group.containers.reduce(
    (count, container) => count + countContainerBlockProperties(container),
    0,
  );

  return group.properties.length + compositionCount + elementPropertyCount;
}

function limitGroupProperties(
  group: PropertyTreeGroup,
  maxVisible: number,
): PropertyTreeGroup {
  if (countGroupItems(group) <= maxVisible) {
    return group;
  }

  let remaining = maxVisible;
  const properties = group.properties.slice(0, remaining);
  remaining -= properties.length;

  const compositionSections = [];
  for (const section of group.compositionSections) {
    if (remaining <= 0) {
      break;
    }

    const sectionProperties = section.properties.slice(0, remaining);

    if (sectionProperties.length === 0) {
      continue;
    }

    remaining -= sectionProperties.length;
    compositionSections.push({
      ...section,
      properties: sectionProperties,
    });
  }

  const containers: PropertyContainerGroup[] = [];

  for (const container of group.containers) {
    if (remaining <= 0) {
      break;
    }

    const limitedContainer = limitContainerProperties(container, remaining);
    remaining -= countContainerBlockProperties(limitedContainer);

    if (countContainerBlockProperties(limitedContainer) > 0) {
      containers.push(limitedContainer);
    }
  }

  return {
    ...group,
    properties,
    compositionSections,
    containers,
  };
}

function limitContainerProperties(
  container: PropertyContainerGroup,
  maxVisible: number,
): PropertyContainerGroup {
  let remaining = maxVisible;
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
    containerProperty: undefined,
    elementTypes,
  };
}

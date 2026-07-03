import type { FilterablePropertyMetadata } from "../models/filter-models.js";
import { isPropertyFilterable } from "./filter-condition.utils.js";

export interface PropertySearchabilityCounts {
  readonly searchable: number;
  readonly hidden: number;
  readonly total: number;
}

export function countPropertySearchability(
  properties: readonly FilterablePropertyMetadata[],
): PropertySearchabilityCounts {
  const searchable = properties.filter((property) =>
    isPropertyFilterable(property),
  ).length;

  return {
    searchable,
    hidden: properties.length - searchable,
    total: properties.length,
  };
}

export function formatHiddenPropertiesHint(
  counts: PropertySearchabilityCounts,
): string | undefined {
  if (counts.hidden <= 0) {
    return undefined;
  }

  const propertyLabel = counts.searchable === 1 ? "property" : "properties";

  return `Showing ${counts.searchable} searchable ${propertyLabel} (${counts.hidden} hidden). Uncheck "Hide properties that can't be searched" to show all.`;
}

export function formatToolbarSearchabilitySummary(
  counts: PropertySearchabilityCounts,
): string | undefined {
  if (counts.hidden <= 0) {
    return undefined;
  }

  const propertyLabel = counts.searchable === 1 ? "property" : "properties";

  return `${counts.searchable} searchable ${propertyLabel} (${counts.hidden} hidden)`;
}

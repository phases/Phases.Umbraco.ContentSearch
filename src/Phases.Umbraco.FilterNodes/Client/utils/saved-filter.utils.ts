import type { EditableFilterCondition } from "../controllers/filter-nodes-workspace.models.js";
import { createEmptyCondition } from "../controllers/filter-nodes-workspace.models.js";
import type { FilterNodesWorkspaceViewState } from "../controllers/filter-nodes-workspace.models.js";
import type {
  SaveSavedFilterRequest,
  SavedFilter,
  SavedFilterCondition,
} from "../models/saved-filter-models.js";
import type { FilterOperator } from "../models/filter-models.js";
import { isReservedContentTypeAlias } from "./filter-condition.utils.js";

export function toSavedFilterConditions(
  conditions: readonly EditableFilterCondition[],
): readonly SavedFilterCondition[] {
  return conditions
    .filter(
      (condition) =>
        Boolean(condition.filterOperator) &&
        !isReservedContentTypeAlias(condition.contentTypeAlias),
    )
    .map((condition) => ({
      contentTypeAlias: condition.contentTypeAlias.trim(),
      propertyAlias: condition.propertyAlias.trim(),
      filterOperator: condition.filterOperator as FilterOperator,
      propertyValue: condition.propertyValue.trim(),
      fromDate: condition.fromDate.trim() || undefined,
      toDate: condition.toDate.trim() || undefined,
    }));
}

export function buildSaveSavedFilterRequest(
  name: string,
  state: Pick<
    FilterNodesWorkspaceViewState,
    "filterType" | "conditions" | "pageSize" | "searchCultureMode" | "culture"
  >,
): SaveSavedFilterRequest {
  return {
    name: name.trim(),
    filterType: state.filterType,
    pageSize: state.pageSize,
    searchCultureMode: state.searchCultureMode,
    culture:
      state.searchCultureMode === "SpecificCulture"
        ? state.culture.trim() || undefined
        : undefined,
    conditions: toSavedFilterConditions(state.conditions),
  };
}

export function toEditableConditions(
  conditions: readonly SavedFilterCondition[],
): readonly EditableFilterCondition[] {
  if (conditions.length === 0) {
    return [createEmptyCondition()];
  }

  return conditions.map((condition) => ({
    id: crypto.randomUUID(),
    contentTypeAlias: condition.contentTypeAlias ?? "",
    propertyAlias: condition.propertyAlias ?? "",
    filterOperator: condition.filterOperator ?? "",
    propertyValue: condition.propertyValue ?? "",
    fromDate: condition.fromDate ?? "",
    toDate: condition.toDate ?? "",
  }));
}

export function getUniqueContentTypeAliases(
  savedFilter: SavedFilter,
): readonly string[] {
  const aliases = new Set<string>();

  for (const condition of savedFilter.conditions) {
    const alias = condition.contentTypeAlias?.trim();

    if (alias) {
      aliases.add(alias);
    }
  }

  return [...aliases];
}

export function toSavedFilterSelectOptions(
  savedFilters: readonly SavedFilter[],
  selectedId: string,
): Array<{ name: string; value: string; selected?: boolean }> {
  if (savedFilters.length === 0) {
    return [
      {
        name: "No saved searches",
        value: "",
        selected: true,
      },
    ];
  }

  return [
    {
      name: "Select saved search",
      value: "",
      selected: !selectedId,
    },
    ...savedFilters.map((savedFilter) => ({
      name: savedFilter.name,
      value: savedFilter.id,
      selected: savedFilter.id === selectedId,
    })),
  ];
}

export function matchesSavedFilterSearch(
  savedFilter: SavedFilter,
  searchTerm: string,
): boolean {
  const normalizedSearch = searchTerm.trim().toLowerCase();

  if (!normalizedSearch) {
    return true;
  }

  return savedFilter.name.toLowerCase().includes(normalizedSearch);
}

export function formatSavedFilterOptionLabel(savedFilter: SavedFilter): string {
  const conditionCount = savedFilter.conditions.length;
  const conditionLabel =
    conditionCount === 1 ? "1 condition" : `${conditionCount} conditions`;

  return `${savedFilter.name} (${conditionLabel})`;
}

const SAVED_FILTER_LAST_USED_STORAGE_KEY =
  "phases.filterNodes.savedFilterLastUsed";

function readSavedFilterLastUsedMap(): Record<string, string> {
  try {
    const raw = localStorage.getItem(SAVED_FILTER_LAST_USED_STORAGE_KEY);

    if (!raw) {
      return {};
    }

    const parsed: unknown = JSON.parse(raw);

    return parsed && typeof parsed === "object"
      ? (parsed as Record<string, string>)
      : {};
  } catch {
    return {};
  }
}

function writeSavedFilterLastUsedMap(map: Record<string, string>): void {
  try {
    localStorage.setItem(SAVED_FILTER_LAST_USED_STORAGE_KEY, JSON.stringify(map));
  } catch {
    // Ignore storage failures in restricted browser contexts.
  }
}

export function recordSavedFilterLastUsed(savedFilterId: string): void {
  if (!savedFilterId) {
    return;
  }

  const map = readSavedFilterLastUsedMap();
  map[savedFilterId] = new Date().toISOString();
  writeSavedFilterLastUsedMap(map);
}

export function clearSavedFilterLastUsed(savedFilterId: string): void {
  if (!savedFilterId) {
    return;
  }

  const map = readSavedFilterLastUsedMap();

  if (!(savedFilterId in map)) {
    return;
  }

  delete map[savedFilterId];
  writeSavedFilterLastUsedMap(map);
}

export function getSavedFilterLastUsed(
  savedFilterId: string,
): string | undefined {
  if (!savedFilterId) {
    return undefined;
  }

  return readSavedFilterLastUsedMap()[savedFilterId];
}

export function formatSavedFilterLastUsed(
  isoTimestamp: string,
  referenceDate: Date = new Date(),
): string {
  const date = new Date(isoTimestamp);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const elapsedMs = referenceDate.getTime() - date.getTime();
  const elapsedMinutes = Math.round(elapsedMs / 60_000);

  if (elapsedMinutes < 1) {
    return "just now";
  }

  if (elapsedMinutes < 60) {
    return `${elapsedMinutes} minute${elapsedMinutes === 1 ? "" : "s"} ago`;
  }

  const elapsedHours = Math.round(elapsedMinutes / 60);

  if (elapsedHours < 24) {
    return `${elapsedHours} hour${elapsedHours === 1 ? "" : "s"} ago`;
  }

  const elapsedDays = Math.round(elapsedHours / 24);

  if (elapsedDays < 7) {
    return `${elapsedDays} day${elapsedDays === 1 ? "" : "s"} ago`;
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function getSavedFilterUsageLabel(savedFilterId: string): string | undefined {
  const lastUsed = getSavedFilterLastUsed(savedFilterId);

  if (!lastUsed) {
    return undefined;
  }

  const formatted = formatSavedFilterLastUsed(lastUsed);

  return formatted ? `Last used ${formatted}` : undefined;
}

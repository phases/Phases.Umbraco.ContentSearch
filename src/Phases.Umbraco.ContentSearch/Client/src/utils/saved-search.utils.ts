import type { SearchCondition, SearchMatchMode } from "../models/search-builder.models.js";
import type { SearchCultureMode } from "../models/search-culture.models.js";
import type { ContentSearchResultsGridColumn } from "../components/content-search-results/content-search-results.models.js";
import { createEmptySearchCondition } from "../models/search-builder.models.js";
import type {
  RecordRecentSearchRequest,
  SaveSavedSearchRequest,
  SavedSearchCondition,
  SavedSearchDetail,
  SavedSearchSummary,
  SavedSearchScope,
} from "../models/saved-search.models.js";

export interface SavedSearchWorkspaceSnapshot {
  readonly matchMode: SearchMatchMode;
  readonly conditions: readonly SearchCondition[];
  readonly searchCultureMode: SearchCultureMode;
  readonly culture: string;
  readonly pageSize: number;
  readonly sortColumn: ContentSearchResultsGridColumn;
  readonly sortDescending: boolean;
}

export function toSavedSearchConditions(
  conditions: readonly SearchCondition[],
): readonly SavedSearchCondition[] {
  return conditions
    .filter(
      (condition) =>
        Boolean(condition.contentTypeAlias.trim()) &&
        Boolean(condition.propertyAlias.trim()) &&
        Boolean(condition.operator),
    )
    .map((condition) => ({
      contentTypeAlias: condition.contentTypeAlias.trim(),
      propertyAlias: condition.propertyAlias.trim(),
      operator: condition.operator,
      value: condition.value.trim() || undefined,
    }));
}

export function buildSaveSavedSearchRequest(
  name: string,
  description: string | undefined,
  isShared: boolean,
  snapshot: SavedSearchWorkspaceSnapshot,
): SaveSavedSearchRequest {
  return {
    name: name.trim(),
    description: description?.trim() || undefined,
    isShared,
    matchMode: snapshot.matchMode,
    searchCultureMode: snapshot.searchCultureMode,
    culture:
      snapshot.searchCultureMode === "SpecificCulture"
        ? snapshot.culture.trim() || undefined
        : undefined,
    conditions: toSavedSearchConditions(snapshot.conditions),
    pageSize: snapshot.pageSize,
    sortColumn: snapshot.sortColumn,
    sortDescending: snapshot.sortDescending,
  };
}

export function buildRecordRecentSearchRequest(
  name: string,
  snapshot: SavedSearchWorkspaceSnapshot,
  savedSearchId?: string,
): RecordRecentSearchRequest {
  return {
    name,
    savedSearchId,
    matchMode: snapshot.matchMode,
    searchCultureMode: snapshot.searchCultureMode,
    culture:
      snapshot.searchCultureMode === "SpecificCulture"
        ? snapshot.culture.trim() || undefined
        : undefined,
    conditions: toSavedSearchConditions(snapshot.conditions),
    pageSize: snapshot.pageSize,
    sortColumn: snapshot.sortColumn,
    sortDescending: snapshot.sortDescending,
  };
}

export function toEditableSearchConditions(
  conditions: readonly SavedSearchCondition[],
): SearchCondition[] {
  if (conditions.length === 0) {
    return [createEmptySearchCondition()];
  }

  return conditions.map((condition) => ({
    id: crypto.randomUUID(),
    contentTypeAlias: condition.contentTypeAlias ?? "",
    propertyAlias: condition.propertyAlias ?? "",
    operator: (condition.operator ?? "") as SearchCondition["operator"],
    value: condition.value ?? "",
  }));
}

export function getUniqueContentTypeAliasesFromDetail(
  detail: SavedSearchDetail,
): readonly string[] {
  const aliases = new Set<string>();

  for (const condition of detail.conditions) {
    const alias = condition.contentTypeAlias?.trim();

    if (alias) {
      aliases.add(alias);
    }
  }

  return [...aliases];
}

export function formatSavedSearchLastUsed(value?: string): string {
  if (!value) {
    return "Never";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return new Intl.RelativeTimeFormat(undefined, { numeric: "auto" }).format(
    Math.round((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
    "day",
  );
}

export function buildDefaultRecentSearchName(
  snapshot: SavedSearchWorkspaceSnapshot,
): string {
  const firstCondition = snapshot.conditions.find(
    (condition) => condition.contentTypeAlias && condition.propertyAlias,
  );

  if (!firstCondition) {
    return "Recent search";
  }

  const value = firstCondition.value.trim();
  const property = firstCondition.propertyAlias;

  return value ? `${property}: ${value}` : property;
}

export function mapSavedSearchScope(value: string): SavedSearchScope {
  const normalized = value.toLowerCase();

  if (normalized === "shared") {
    return "shared";
  }

  if (normalized === "recent") {
    return "recent";
  }

  return "personal";
}

export function mapSavedSearchSummary(
  item: SavedSearchSummary & { scope: string },
): SavedSearchSummary {
  return {
    ...item,
    scope: mapSavedSearchScope(item.scope),
  };
}

export function mapSavedSearchDetail(
  detail: SavedSearchDetail & {
    scope: string;
    matchMode: string;
    searchCultureMode: string;
  },
): SavedSearchDetail {
  return {
    ...mapSavedSearchSummary(detail),
    matchMode: mapMatchModeFromApi(detail.matchMode),
    searchCultureMode: mapSearchCultureModeFromApi(detail.searchCultureMode),
    culture: detail.culture,
    conditions: detail.conditions,
    pageSize: detail.pageSize,
    sortColumn: detail.sortColumn,
    sortDescending: detail.sortDescending,
    linkedSavedSearchId: detail.linkedSavedSearchId,
  };
}

export function mapSavedSearchListResponse(response: {
  readonly items: readonly (SavedSearchSummary & { scope: string })[];
  readonly recent: readonly (SavedSearchSummary & { scope: string })[];
  readonly pinned: readonly (SavedSearchSummary & { scope: string })[];
  readonly personal: readonly (SavedSearchSummary & { scope: string })[];
  readonly shared: readonly (SavedSearchSummary & { scope: string })[];
}) {
  const mapItems = (items: readonly (SavedSearchSummary & { scope: string })[]) =>
    items.map(mapSavedSearchSummary);

  return {
    items: mapItems(response.items ?? []),
    recent: mapItems(response.recent ?? []),
    pinned: mapItems(response.pinned ?? []),
    personal: mapItems(response.personal ?? []),
    shared: mapItems(response.shared ?? []),
  };
}

export function mapMatchModeFromApi(value: string | number): SearchMatchMode {
  if (typeof value === "number") {
    return value === 1 ? "any" : "all";
  }

  const normalized = String(value).trim().toLowerCase();

  return normalized === "any" || normalized === "1" ? "any" : "all";
}

export function mapSearchCultureModeFromApi(value: string | number): SearchCultureMode {
  const normalized =
    typeof value === "number"
      ? value === 1
        ? "CurrentCulture"
        : value === 2
          ? "SpecificCulture"
          : "AllCultures"
      : String(value).trim();

  switch (normalized) {
    case "CurrentCulture":
    case "currentculture":
    case "1":
      return "CurrentCulture";
    case "SpecificCulture":
    case "specificculture":
    case "2":
      return "SpecificCulture";
    default:
      return "AllCultures";
  }
}

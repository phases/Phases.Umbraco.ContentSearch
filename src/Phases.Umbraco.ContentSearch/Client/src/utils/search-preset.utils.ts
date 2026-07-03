import type { ContentSearchResultsGridColumn } from "../components/content-search-results/content-search-results.models.js";
import type { SearchCondition } from "../models/search-builder.models.js";
import type { SearchPreset } from "../models/search-preset.models.js";
import {
  mapMatchModeFromApi,
  mapSearchCultureModeFromApi,
  toEditableSearchConditions,
} from "./saved-search.utils.js";

const SORT_COLUMNS = new Set<ContentSearchResultsGridColumn>([
  "name",
  "contentType",
  "culture",
  "path",
  "createDate",
  "updateDate",
  "url",
  "actions",
]);

export function mapSearchPreset(
  preset: SearchPreset & {
    matchMode: string | number;
    searchCultureMode: string | number;
    sortColumn?: string;
  },
): SearchPreset {
  return {
    ...preset,
    matchMode: mapMatchModeFromApi(preset.matchMode),
    searchCultureMode: mapSearchCultureModeFromApi(preset.searchCultureMode),
    sortColumn: mapSortColumn(preset.sortColumn),
    conditions: (preset.conditions ?? []).map((condition) => ({
      ...condition,
      operator: normalizePresetOperator(condition.operator),
    })),
  };
}

export function mapSearchPresetListResponse(response: {
  readonly presets: readonly (SearchPreset & {
    matchMode: string | number;
    searchCultureMode: string | number;
    sortColumn?: string;
  })[];
}): readonly SearchPreset[] {
  return (response.presets ?? []).map(mapSearchPreset);
}

export function toEditableConditionsFromPreset(
  preset: SearchPreset,
): SearchCondition[] {
  return toEditableSearchConditions(preset.conditions);
}

export function getUniqueContentTypeAliasesFromPreset(
  preset: SearchPreset,
): readonly string[] {
  const aliases = new Set<string>();

  for (const condition of preset.conditions) {
    const alias = condition.contentTypeAlias?.trim();

    if (alias) {
      aliases.add(alias);
    }
  }

  return [...aliases];
}

function mapSortColumn(value?: string): ContentSearchResultsGridColumn | undefined {
  if (!value) {
    return undefined;
  }

  const normalized = value.trim() as ContentSearchResultsGridColumn;

  return SORT_COLUMNS.has(normalized) ? normalized : undefined;
}

const PRESET_OPERATOR_ALIASES: Record<string, SearchCondition["operator"]> = {
  equals: "equals",
  notequals: "notEquals",
  contains: "contains",
  notcontains: "notContains",
  startswith: "startsWith",
  endswith: "endsWith",
  greaterthan: "greaterThan",
  lessthan: "lessThan",
  before: "lessThan",
  after: "greaterThan",
  between: "between",
  isempty: "isEmpty",
  isnotempty: "isNotEmpty",
};

function normalizePresetOperator(
  operator: string | undefined,
): SearchCondition["operator"] {
  if (!operator) {
    return "";
  }

  const normalized = operator.trim().toLowerCase();

  return PRESET_OPERATOR_ALIASES[normalized] ?? (operator as SearchCondition["operator"]);
}

import type { SearchMatchMode } from "./search-builder.models.js";
import type { SearchCultureMode } from "./search-culture.models.js";
import type { ContentSearchResultsGridColumn } from "../components/content-search-results/content-search-results.models.js";
import type { SavedSearchCondition } from "./saved-search.models.js";

export interface SearchPreset {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly matchMode: SearchMatchMode;
  readonly searchCultureMode: SearchCultureMode;
  readonly conditions: readonly SavedSearchCondition[];
  readonly pageSize: number;
  readonly sortColumn?: ContentSearchResultsGridColumn;
  readonly sortDescending: boolean;
}

export interface SearchPresetListResponse {
  readonly presets: readonly SearchPreset[];
}

export const CONTENT_SEARCH_PRESET_RUN = "content-search-preset-run";

import type { NodeSearchResult } from "../../models/filter-models.js";

export type FilterResultsGridColumn =
  | "id"
  | "name"
  | "contentType"
  | "parentName"
  | "createDate"
  | "updateDate"
  | "matchedCulture"
  | "url"
  | "actions";

export type FilterResultsEmptyVariant = "initial" | "no-results";

export type FilterResultRow = NodeSearchResult;

export interface FilterResultsSortState {
  readonly column: FilterResultsGridColumn;
  readonly descending: boolean;
}

export interface FilterResultsPaginationState {
  readonly currentPage: number;
  readonly totalPages: number;
  readonly totalCount: number;
  readonly pageSize: number;
}

export const FILTER_RESULTS_PAGE_CHANGE = "filter-results-page-change";

export const FILTER_RESULTS_PAGE_SIZE_CHANGE = "filter-results-page-size-change";

export const FILTER_RESULTS_SORT_CHANGE = "filter-results-sort-change";

export const RESULTS_INITIAL_EMPTY_STATE_EXAMPLES = [
  "Find pages updated in the last 7 days",
  "Find pages created this month",
  "Search by content name",
  "Search for content with empty fields",
  "Search across the entire site",
] as const;

export type FilterResultsPageChangeEvent = CustomEvent<{ page: number }>;

export type FilterResultsPageSizeChangeEvent = CustomEvent<{ pageSize: number }>;

export type FilterResultsSortChangeEvent = CustomEvent<FilterResultsSortState>;

export const DEFAULT_FILTER_RESULTS_SORT: FilterResultsSortState = {
  column: "name",
  descending: false,
};

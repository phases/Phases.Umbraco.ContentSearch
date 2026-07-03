export type ContentSearchResultsGridColumn =
  | "name"
  | "match"
  | "contentType"
  | "culture"
  | "path"
  | "createDate"
  | "updateDate"
  | "url"
  | "actions";

export type ContentSearchResultsEmptyVariant = "initial" | "no-results";

export const CONTENT_SEARCH_RESULTS_SORT_CHANGE = "content-search-results-sort-change";
export const CONTENT_SEARCH_RESULTS_PAGE_CHANGE = "content-search-results-page-change";
export const CONTENT_SEARCH_RESULTS_PAGE_SIZE_CHANGE =
  "content-search-results-page-size-change";
export const CONTENT_SEARCH_CLEAR_SEARCH = "content-search-clear-search";
export const CONTENT_SEARCH_CLEAR_RESULTS = "content-search-clear-results";

export const DEFAULT_CONTENT_SEARCH_RESULTS_SORT = {
  column: "name" as ContentSearchResultsGridColumn,
  descending: false,
};

export interface ContentSearchResultsSortState {
  readonly column: ContentSearchResultsGridColumn;
  readonly descending: boolean;
}

import type { ContentSearchResultsGridColumn } from "./content-search-results.models.js";

export const RESULTS_TABLE_ICON_COLUMN_WIDTH_PX = 44;
export const RESULTS_TABLE_ACTIONS_COLUMN_WIDTH_PX = 88;
export const RESULTS_TABLE_NAME_MIN_WIDTH_PX = 160;
export const RESULTS_TABLE_ROW_HEIGHT_PX = 36;
export const RESULTS_TABLE_CELL_PADDING_BLOCK = "var(--uui-size-space-1)";
export const RESULTS_TABLE_CELL_PADDING_INLINE = "var(--uui-size-space-3)";
export const RESULTS_TABLE_MIN_RESIZABLE_COLUMN_WIDTH_PX = 80;
export const RESULTS_TABLE_COLUMN_WIDTHS_STORAGE_KEY =
  "phases.content-search.results.column-widths.v5";

export const RESULTS_TABLE_FIXED_WIDTH_COLUMNS = {
  contentType: 120,
  createDate: 108,
  updateDate: 104,
} as const satisfies Partial<
  Record<ContentSearchResultsGridColumn, number>
>;

export type ResultsTableFixedWidthColumn = keyof typeof RESULTS_TABLE_FIXED_WIDTH_COLUMNS;

export const RESULTS_TABLE_DEFAULT_COLUMN_WIDTHS_PX: Readonly<
  Record<ContentSearchResultsGridColumn, number>
> = {
  name: RESULTS_TABLE_NAME_MIN_WIDTH_PX,
  match: 220,
  contentType: RESULTS_TABLE_FIXED_WIDTH_COLUMNS.contentType,
  culture: 96,
  path: 280,
  createDate: RESULTS_TABLE_FIXED_WIDTH_COLUMNS.createDate,
  updateDate: RESULTS_TABLE_FIXED_WIDTH_COLUMNS.updateDate,
  url: 160,
  actions: RESULTS_TABLE_ACTIONS_COLUMN_WIDTH_PX,
};

export const RESULTS_TABLE_RESIZABLE_COLUMNS = new Set<ContentSearchResultsGridColumn>([
  "name",
  "match",
  "path",
  "culture",
  "url",
  "actions",
]);

export function isResultsTableFixedWidthColumn(
  alias: string,
): alias is ResultsTableFixedWidthColumn {
  return alias in RESULTS_TABLE_FIXED_WIDTH_COLUMNS;
}

export function getResultsTableFixedColumnWidthPx(alias: string): number | undefined {
  if (!isResultsTableFixedWidthColumn(alias)) {
    return undefined;
  }

  return RESULTS_TABLE_FIXED_WIDTH_COLUMNS[alias];
}

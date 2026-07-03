import type { FilterResultsGridColumn } from "../components/filter-results-grid/filter-results-grid.models.js";
import type { SortOptions } from "../models/filter-models.js";

const GRID_COLUMN_TO_SORT_FIELD: Partial<
  Record<FilterResultsGridColumn, string>
> = {
  id: "id",
  name: "nodeName",
  contentType: "__NodeTypeAlias",
  createDate: "createDate",
  updateDate: "updateDate",
};

export function toSortOptions(
  column: FilterResultsGridColumn,
  descending: boolean,
): SortOptions {
  return {
    field: GRID_COLUMN_TO_SORT_FIELD[column] ?? "nodeName",
    direction: descending ? "Descending" : "Ascending",
  };
}

export function isServerSortableColumn(
  column: FilterResultsGridColumn,
): boolean {
  return column in GRID_COLUMN_TO_SORT_FIELD;
}

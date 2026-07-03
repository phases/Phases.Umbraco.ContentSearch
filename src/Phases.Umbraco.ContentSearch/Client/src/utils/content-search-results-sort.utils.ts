import type { ContentSearchResultsGridColumn } from "../components/content-search-results/content-search-results.models.js";

export function isServerSortableColumn(
  column: ContentSearchResultsGridColumn,
): boolean {
  return (
    column === "name" ||
    column === "contentType" ||
    column === "path" ||
    column === "createDate" ||
    column === "updateDate" ||
    column === "url"
  );
}

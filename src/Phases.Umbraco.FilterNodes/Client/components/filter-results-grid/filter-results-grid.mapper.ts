import type { UmbTableColumn, UmbTableItem } from "@umbraco-cms/backoffice/components";
import type { EditableFilterCondition } from "../../controllers/filter-nodes-workspace.models.js";
import type { FilterablePropertyMetadata, SearchCultureMode } from "../../models/filter-models.js";
import { RESULTS_MATCHED_CULTURE_COLUMN_LABEL } from "../../constants/filter-nodes.constants.js";
import {
  formatResultUrlDisplay,
  isResolvableContentUrl,
} from "../../utils/content-url.utils.js";
import {
  buildHighlightedNameSegments,
  getNameHighlightRules,
} from "../../utils/filter-results-highlight.utils.js";
import type {
  FilterResultRow,
  FilterResultsGridColumn,
} from "./filter-results-grid.models.js";
import { getDocumentEditPath } from "./filter-results-grid.paths.js";
import type {
  FilterResultsActionsColumnValue,
  FilterResultsNameColumnValue,
} from "./column-layouts/filter-results-grid-column.models.js";

export const FILTER_RESULTS_GRID_COLUMNS: readonly UmbTableColumn[] = [
  {
    name: "Id",
    alias: "id",
    allowSorting: true,
    width: "6rem",
    align: "right",
  },
  {
    name: "Name",
    alias: "name",
    elementName: "filter-results-name-column",
    allowSorting: true,
  },
  {
    name: "Content type",
    alias: "contentType",
    allowSorting: true,
    width: "12rem",
  },
  {
    name: "Parent name",
    alias: "parentName",
    allowSorting: false,
    width: "12rem",
    clipText: true,
  },
  {
    name: "Created",
    alias: "createDate",
    allowSorting: true,
    width: "12rem",
  },
  {
    name: "Updated",
    alias: "updateDate",
    allowSorting: true,
    width: "12rem",
  },
  {
    name: RESULTS_MATCHED_CULTURE_COLUMN_LABEL,
    alias: "matchedCulture",
    allowSorting: false,
    width: "12rem",
    clipText: true,
  },
  {
    name: "URL",
    alias: "url",
    elementName: "filter-results-url-column",
    allowSorting: false,
    width: "14rem",
  },
  {
    name: "Actions",
    alias: "actions",
    elementName: "filter-results-actions-column",
    allowSorting: false,
    width: "11rem",
    align: "right",
  },
] as const;

export const FILTER_RESULTS_TABLE_CONFIG = {
  allowSelection: false,
  hideIcon: true,
} as const;

export function getFilterResultsGridColumns(
  searchCultureMode: SearchCultureMode,
  results: readonly FilterResultRow[],
): readonly UmbTableColumn[] {
  const showMatchedCulture =
    searchCultureMode !== "AllCultures" ||
    results.some((result) => Boolean(result.matchedCulture?.trim()));

  return FILTER_RESULTS_GRID_COLUMNS.filter(
    (column) => column.alias !== "matchedCulture" || showMatchedCulture,
  );
}

export function mapResultsToTableItems(
  results: readonly FilterResultRow[],
  conditions: readonly EditableFilterCondition[] = [],
  propertyMetadataByContentType: Readonly<
    Record<string, readonly FilterablePropertyMetadata[]>
  > = {},
): UmbTableItem[] {
  return results.map((result) =>
    mapResultToTableItem(result, conditions, propertyMetadataByContentType),
  );
}

export function mapResultToTableItem(
  result: FilterResultRow,
  conditions: readonly EditableFilterCondition[] = [],
  propertyMetadataByContentType: Readonly<
    Record<string, readonly FilterablePropertyMetadata[]>
  > = {},
): UmbTableItem {
  const editPath = getDocumentEditPath(result.key);
  const highlightRules = getNameHighlightRules(
    conditions,
    propertyMetadataByContentType,
    result.contentTypeAlias,
  );
  const nameValue: FilterResultsNameColumnValue = {
    name: result.name,
    editPath,
    nameSegments: buildHighlightedNameSegments(result.name, highlightRules),
  };
  const actionsValue: FilterResultsActionsColumnValue = {
    editPath,
    url: isResolvableContentUrl(result.url) ? result.url?.trim() : undefined,
  };

  return {
    id: result.key,
    entityType: "document",
    data: [
      { columnAlias: "id", value: String(result.id) },
      { columnAlias: "name", value: nameValue },
      {
        columnAlias: "contentType",
        value: result.contentTypeAlias ?? "—",
      },
      {
        columnAlias: "parentName",
        value: result.parentName?.trim() || "—",
      },
      {
        columnAlias: "createDate",
        value: formatResultDate(result.createDate),
      },
      {
        columnAlias: "updateDate",
        value: formatResultDate(result.updateDate),
      },
      {
        columnAlias: "matchedCulture",
        value: result.matchedCulture?.trim() || "—",
      },
      {
        columnAlias: "url",
        value: formatResultUrlDisplay(result.url),
      },
      { columnAlias: "actions", value: actionsValue },
    ],
  };
}

export function formatResultDate(value?: string): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

export function isFilterResultsGridColumn(
  value: string,
): value is FilterResultsGridColumn {
  return (
    value === "id" ||
    value === "name" ||
    value === "contentType" ||
    value === "parentName" ||
    value === "createDate" ||
    value === "updateDate" ||
    value === "matchedCulture" ||
    value === "url" ||
    value === "actions"
  );
}

export function buildTableItemsCacheKey(
  results: readonly FilterResultRow[],
  conditions: readonly EditableFilterCondition[] = [],
): string {
  if (results.length === 0) {
    return `empty:${buildConditionsCacheKey(conditions)}`;
  }

  const firstKey = results[0]?.key ?? "";
  const lastKey = results[results.length - 1]?.key ?? "";

  return `${results.length}:${firstKey}:${lastKey}:${buildConditionsCacheKey(conditions)}`;
}

function buildConditionsCacheKey(
  conditions: readonly EditableFilterCondition[],
): string {
  return conditions
    .map(
      (condition) =>
        `${condition.contentTypeAlias}|${condition.propertyAlias}|${condition.filterOperator}|${condition.propertyValue}`,
    )
    .join(";");
}

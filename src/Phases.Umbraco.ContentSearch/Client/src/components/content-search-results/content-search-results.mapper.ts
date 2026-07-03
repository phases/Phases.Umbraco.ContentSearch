import type { UmbTableColumn, UmbTableItem } from "@umbraco-cms/backoffice/components";
import type { ContentSearchResultRow } from "../../models/search-results.models.js";
import type { LanguageListItem } from "../../models/search-culture.models.js";
import { formatCultureDisplayName } from "../../utils/search-culture.utils.js";
import { buildContentSearchPathColumnValue } from "../../utils/content-path.utils.js";
import { buildContentSearchDateColumnValue } from "../../utils/content-date.utils.js";
import { buildUrlColumnValue } from "../../utils/content-url.utils.js";
import {
  type ContentTypeLookup,
  resolveContentTypeIcon,
  resolveContentTypeName,
} from "../../utils/content-type-lookup.utils.js";
import type { ContentSearchResultsGridColumn } from "./content-search-results.models.js";
import type { ContentSearchResultsDisplayPreferences } from "./content-search-results-display-preferences.js";
import { getDocumentEditPath } from "./content-search-results.paths.js";
import type {
  ContentSearchActionsColumnValue,
  ContentSearchContentTypeColumnValue,
  ContentSearchMatchColumnValue,
  ContentSearchNameColumnValue,
} from "./column-layouts/content-search-results-column.models.js";

export interface MapResultsToTableItemsOptions {
  readonly languages: readonly LanguageListItem[];
  readonly contentTypeLookup: ContentTypeLookup;
  readonly highlightTerms?: readonly string[];
  readonly showUrlColumn?: boolean;
}

export const CONTENT_SEARCH_RESULTS_TABLE_CONFIG = {
  allowSelection: false,
  hideIcon: true,
} as const;

const ALL_COLUMNS: readonly UmbTableColumn[] = [
  {
    name: "Name",
    alias: "name",
    elementName: "content-search-name-column",
    allowSorting: true,
    clipText: true,
  },
  {
    name: "Match",
    alias: "match",
    elementName: "content-search-match-column",
    allowSorting: false,
    clipText: true,
  },
  {
    name: "Content type",
    alias: "contentType",
    elementName: "content-search-content-type-column",
    allowSorting: true,
    clipText: true,
  },
  {
    name: "Culture",
    alias: "culture",
    allowSorting: false,
    clipText: true,
  },
  {
    name: "Path",
    alias: "path",
    elementName: "content-search-path-column",
    allowSorting: true,
    clipText: true,
  },
  {
    name: "Created",
    alias: "createDate",
    elementName: "content-search-date-column",
    allowSorting: true,
    clipText: true,
  },
  {
    name: "Updated",
    alias: "updateDate",
    elementName: "content-search-date-column",
    allowSorting: true,
    clipText: true,
  },
  {
    name: "URL",
    alias: "url",
    elementName: "content-search-url-column",
    allowSorting: true,
    clipText: true,
  },
  {
    name: "Actions",
    alias: "actions",
    elementName: "content-search-actions-column",
    allowSorting: false,
    align: "right",
  },
] as const;

const OPTIONAL_COLUMN_PREFERENCE: Partial<
  Record<ContentSearchResultsGridColumn, keyof ContentSearchResultsDisplayPreferences>
> = {
  path: "showPath",
  url: "showUrl",
  createDate: "showCreateDate",
  updateDate: "showUpdateDate",
};

export function getContentSearchResultsColumns(
  preferences: ContentSearchResultsDisplayPreferences,
  showCultureColumn = true,
): readonly UmbTableColumn[] {
  let columns: readonly UmbTableColumn[] = ALL_COLUMNS.filter((column) => {
    const preferenceKey = OPTIONAL_COLUMN_PREFERENCE[column.alias as ContentSearchResultsGridColumn];

    if (!preferenceKey) {
      return true;
    }

    return preferences[preferenceKey];
  });

  if (!showCultureColumn) {
    columns = columns.filter((column) => column.alias !== "culture");
  }

  return columns;
}

export function isContentSearchResultsGridColumn(
  value: string,
): value is ContentSearchResultsGridColumn {
  return (
    value === "name" ||
    value === "match" ||
    value === "contentType" ||
    value === "culture" ||
    value === "path" ||
    value === "createDate" ||
    value === "updateDate" ||
    value === "url" ||
    value === "actions"
  );
}

export function buildTableItemsCacheKey(
  results: readonly ContentSearchResultRow[],
  highlightTerms: readonly string[] = [],
): string {
  const highlightKey = highlightTerms.map((term) => term.trim().toLowerCase()).join("\u0001");
  return `${results.map((result) => `${result.key}:${result.matchedCulture ?? ""}:${result.updateDate ?? ""}`).join("|")}|${highlightKey}`;
}

export function mapResultsToTableItems(
  results: readonly ContentSearchResultRow[],
  options: MapResultsToTableItemsOptions,
): UmbTableItem[] {
  return results.map((result) => mapResultToTableItem(result, options));
}

export function buildContentSearchResultRowId(
  key: string,
  matchedCulture?: string | null,
): string {
  const culture = matchedCulture?.trim();

  return culture ? `${key}::${culture}` : key;
}

export function mapResultToTableItem(
  result: ContentSearchResultRow,
  options: MapResultsToTableItemsOptions,
): UmbTableItem {
  const { languages, contentTypeLookup, highlightTerms = [], showUrlColumn = true } = options;
  const contentTypeAlias = result.contentTypeAlias?.trim() || undefined;
  const editPath = getDocumentEditPath({
    key: result.key,
    cultureCode: result.matchedCulture,
  });
  const nameValue: ContentSearchNameColumnValue = {
    name: result.name,
    editPath,
    highlightTerms,
  };
  const contentTypeValue: ContentSearchContentTypeColumnValue = {
    name: resolveContentTypeName(contentTypeLookup, contentTypeAlias),
    alias: contentTypeAlias,
  };
  const actionsValue: ContentSearchActionsColumnValue = {
    url: result.url?.trim() || undefined,
    udi: result.udi?.trim() || undefined,
    key: result.key,
    nodeId: result.id,
    showOpenWebsite: !showUrlColumn,
  };
  const matchValue: ContentSearchMatchColumnValue = {
    matches: (result.matchedFields ?? []).map((match) => ({
      propertyName: match.propertyName,
      operatorLabel: match.operatorLabel,
      snippet: match.snippet,
      highlightTerms: match.highlightTerms,
    })),
  };

  return {
    id: buildContentSearchResultRowId(result.key, result.matchedCulture),
    entityType: "document",
    icon: resolveContentTypeIcon(contentTypeLookup, contentTypeAlias),
    data: [
      { columnAlias: "name", value: nameValue },
      { columnAlias: "match", value: matchValue },
      {
        columnAlias: "contentType",
        value: contentTypeValue,
      },
      {
        columnAlias: "culture",
        value: result.matchedCulture?.trim()
          ? formatCultureDisplayName(result.matchedCulture, languages)
          : "—",
      },
      {
        columnAlias: "path",
        value: buildContentSearchPathColumnValue(result.pathDisplay, result.path),
      },
      {
        columnAlias: "createDate",
        value: buildContentSearchDateColumnValue(result.createDate),
      },
      {
        columnAlias: "updateDate",
        value: buildContentSearchDateColumnValue(result.updateDate),
      },
      {
        columnAlias: "url",
        value: buildUrlColumnValue(result.url, result.urlDisplay),
      },
      { columnAlias: "actions", value: actionsValue },
    ],
  };
}


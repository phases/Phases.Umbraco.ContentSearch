import type { SearchCondition } from "../models/search-builder.models.js";
import type { SearchCultureMode } from "../models/search-culture.models.js";
import type { ContentSearchResultRow } from "../models/search-results.models.js";
import type { ContentSearchResultsGridColumn } from "../components/content-search-results/content-search-results.models.js";
import { toSavedSearchConditions } from "../utils/saved-search.utils.js";

export interface ContentSearchApiCondition {
  readonly contentTypeAlias: string;
  readonly propertyAlias: string;
  readonly operator: string;
  readonly value?: string | null;
}

export interface ContentSearchApiRequest {
  readonly matchMode: "All" | "Any";
  readonly searchCultureMode: SearchCultureMode;
  readonly culture?: string | null;
  readonly conditions: readonly ContentSearchApiCondition[];
  readonly pageIndex: number;
  readonly pageSize: number;
  readonly sortColumn?: string | null;
  readonly sortDescending?: boolean;
}

export interface ContentSearchApiResultItem {
  readonly id: number;
  readonly key: string;
  readonly name: string;
  readonly contentTypeAlias?: string | null;
  readonly path?: string | null;
  readonly pathDisplay?: string | null;
  readonly udi?: string | null;
  readonly createDate?: string | null;
  readonly updateDate?: string | null;
  readonly url?: string | null;
  readonly urlDisplay?: string | null;
  readonly matchedCulture?: string | null;
  readonly matchedFields?: readonly ContentSearchApiMatchInfo[];
}

export interface ContentSearchApiMatchInfo {
  readonly propertyAlias: string;
  readonly propertyName: string;
  readonly operatorLabel?: string | null;
  readonly snippet?: string | null;
  readonly highlightTerms?: readonly string[];
}

export interface ContentSearchApiResponse {
  readonly items: readonly ContentSearchApiResultItem[];
  readonly totalCount: number;
  readonly pageIndex: number;
  readonly pageSize: number;
  readonly totalPages: number;
  readonly hasPreviousPage: boolean;
  readonly hasNextPage: boolean;
  readonly executionTimeMs?: number | null;
}

export function toContentSearchApiRequest(input: {
  readonly matchMode: "all" | "any";
  readonly searchCultureMode: SearchCultureMode;
  readonly culture: string;
  readonly conditions: readonly SearchCondition[];
  readonly pageIndex?: number;
  readonly pageSize?: number;
  readonly sortColumn?: ContentSearchResultsGridColumn;
  readonly sortDescending?: boolean;
}): ContentSearchApiRequest {
  return {
    matchMode: input.matchMode === "any" ? "Any" : "All",
    searchCultureMode: input.searchCultureMode,
    culture: input.culture || null,
    pageIndex: input.pageIndex ?? 0,
    pageSize: input.pageSize ?? 20,
    sortColumn: input.sortColumn ?? "name",
    sortDescending: input.sortDescending ?? false,
    conditions: toSavedSearchConditions(input.conditions),
  };
}

export function mapApiResultToRow(
  item: ContentSearchApiResultItem,
): ContentSearchResultRow {
  return {
    id: item.id,
    key: item.key,
    name: item.name,
    contentTypeAlias: item.contentTypeAlias,
    path: item.path,
    pathDisplay: item.pathDisplay,
    udi: item.udi,
    createDate: item.createDate,
    updateDate: item.updateDate,
    url: item.url,
    urlDisplay: item.urlDisplay,
    matchedCulture: item.matchedCulture,
    matchedFields: item.matchedFields?.map((match) => ({
      propertyAlias: match.propertyAlias,
      propertyName: match.propertyName,
      operatorLabel: match.operatorLabel,
      snippet: match.snippet,
      highlightTerms: match.highlightTerms,
    })),
  };
}

import type { SearchMatchMode } from "./search-builder.models.js";
import type { SearchCultureMode } from "./search-culture.models.js";
import type { ContentSearchResultsGridColumn } from "../components/content-search-results/content-search-results.models.js";

export type SavedSearchScope = "personal" | "shared" | "recent";

export interface SavedSearchSummary {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly scope: SavedSearchScope;
  readonly lastUsed?: string;
  readonly created: string;
  readonly createdBy: string;
  readonly usageCount: number;
  readonly isPinned: boolean;
  readonly isFavourite: boolean;
  readonly isOwnedByCurrentUser: boolean;
}

export interface SavedSearchDetail extends SavedSearchSummary {
  readonly matchMode: SearchMatchMode;
  readonly searchCultureMode: SearchCultureMode;
  readonly culture?: string;
  readonly conditions: readonly SavedSearchCondition[];
  readonly pageSize: number;
  readonly sortColumn?: ContentSearchResultsGridColumn;
  readonly sortDescending: boolean;
  readonly linkedSavedSearchId?: string;
}

export interface SavedSearchCondition {
  readonly contentTypeAlias: string;
  readonly propertyAlias: string;
  readonly operator: string;
  readonly value?: string;
}

export interface SavedSearchListResponse {
  readonly items: readonly SavedSearchSummary[];
  readonly recent: readonly SavedSearchSummary[];
  readonly pinned: readonly SavedSearchSummary[];
  readonly personal: readonly SavedSearchSummary[];
  readonly shared: readonly SavedSearchSummary[];
}

export interface SaveSavedSearchRequest {
  readonly name: string;
  readonly description?: string;
  readonly isShared: boolean;
  readonly matchMode: SearchMatchMode;
  readonly searchCultureMode: SearchCultureMode;
  readonly culture?: string;
  readonly conditions: readonly SavedSearchCondition[];
  readonly pageSize: number;
  readonly sortColumn?: ContentSearchResultsGridColumn;
  readonly sortDescending: boolean;
}

export interface UpdateSavedSearchRequest {
  readonly name: string;
  readonly description?: string;
}

export interface RecordRecentSearchRequest {
  readonly name: string;
  readonly description?: string;
  readonly savedSearchId?: string;
  readonly matchMode: SearchMatchMode;
  readonly searchCultureMode: SearchCultureMode;
  readonly culture?: string;
  readonly conditions: readonly SavedSearchCondition[];
  readonly pageSize: number;
  readonly sortColumn?: ContentSearchResultsGridColumn;
  readonly sortDescending: boolean;
}

export type SavedSearchTab = "recent" | "pinned" | "personal" | "shared";

export const CONTENT_SEARCH_SAVED_SEARCH_LOAD = "content-search-saved-search-load";
export const CONTENT_SEARCH_SAVED_SEARCH_SAVE = "content-search-saved-search-save";
export const CONTENT_SEARCH_SAVED_SEARCH_DELETE = "content-search-saved-search-delete";
export const CONTENT_SEARCH_SAVED_SEARCH_RENAME = "content-search-saved-search-rename";
export const CONTENT_SEARCH_SAVED_SEARCH_DUPLICATE =
  "content-search-saved-search-duplicate";
export const CONTENT_SEARCH_SAVED_SEARCH_PIN = "content-search-saved-search-pin";
export const CONTENT_SEARCH_SAVED_SEARCH_FAVOURITE =
  "content-search-saved-search-favourite";
export const CONTENT_SEARCH_APPLY_DEFINITION = "content-search-apply-definition";

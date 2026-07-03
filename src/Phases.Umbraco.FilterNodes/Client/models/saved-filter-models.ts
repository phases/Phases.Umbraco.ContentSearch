import type { FilterOperator, FilterType, SearchCultureMode } from "./filter-models.js";

export interface SavedFilterCondition {
  readonly contentTypeAlias: string;
  readonly propertyAlias: string;
  readonly filterOperator: FilterOperator;
  readonly propertyValue: string;
  readonly fromDate?: string;
  readonly toDate?: string;
}

export interface SavedFilter {
  readonly id: string;
  readonly name: string;
  readonly updated: string;
  readonly filterType: FilterType;
  readonly conditions: readonly SavedFilterCondition[];
  readonly pageSize: number;
  readonly searchCultureMode?: SearchCultureMode;
  readonly culture?: string;
}

export interface SavedFilterListResponse {
  readonly filters: readonly SavedFilter[];
}

export interface SaveSavedFilterRequest {
  readonly name: string;
  readonly filterType: FilterType;
  readonly conditions: readonly SavedFilterCondition[];
  readonly pageSize: number;
  readonly searchCultureMode?: SearchCultureMode;
  readonly culture?: string;
}

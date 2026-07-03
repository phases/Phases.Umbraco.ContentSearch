import type {
  EditableFilterOperator,
  FilterType,
  LanguageListItem,
  NodeSearchResult,
  FilterablePropertyMetadata,
  SearchCultureMode,
  SearchScope,
  ContentTypeListItem,
} from "../models/filter-models.js";
import type { SavedFilter } from "../models/saved-filter-models.js";
import type { FilterResultsGridColumn } from "../components/filter-results-grid/filter-results-grid.models.js";

/**
 * Mutable filter condition used by the workspace UI before submitting a search.
 */
export interface EditableFilterCondition {
  readonly id: string;
  contentTypeAlias: string;
  propertyAlias: string;
  filterOperator: EditableFilterOperator;
  propertyValue: string;
  fromDate: string;
  toDate: string;
}

export function createEmptyCondition(): EditableFilterCondition {
  return {
    id: crypto.randomUUID(),
    contentTypeAlias: "",
    propertyAlias: "",
    filterOperator: "",
    propertyValue: "",
    fromDate: "",
    toDate: "",
  };
}

export type FilterNodesEmptyStateVariant = "initial" | "no-results";

/**
 * View state for the Filter Nodes workspace.
 */
export interface FilterNodesWorkspaceViewState {
  readonly loading: boolean;
  readonly loadingMetadata: boolean;
  readonly loadingPropertyContentTypeAliases: readonly string[];
  readonly contentTypes: readonly ContentTypeListItem[];
  readonly propertyMetadataByContentType: Readonly<
    Record<string, readonly FilterablePropertyMetadata[]>
  >;
  readonly filterType: FilterType;
  readonly searchScope: SearchScope;
  readonly searchCultureMode: SearchCultureMode;
  readonly culture: string;
  readonly languages: readonly LanguageListItem[];
  readonly loadingLanguages: boolean;
  readonly conditions: readonly EditableFilterCondition[];
  readonly appliedConditions: readonly EditableFilterCondition[];
  readonly appliedFilterType: FilterType;
  readonly results: readonly NodeSearchResult[];
  readonly page: number;
  readonly pageSize: number;
  readonly totalCount: number;
  readonly totalPages: number;
  readonly hasPreviousPage: boolean;
  readonly hasNextPage: boolean;
  readonly hasSearched: boolean;
  readonly errorMessage?: string;
  readonly savedFilters: readonly SavedFilter[];
  readonly loadingSavedFilters: boolean;
  readonly savingSavedFilter: boolean;
  readonly selectedSavedFilterId: string;
  readonly sortColumn: FilterResultsGridColumn;
  readonly sortDescending: boolean;
  readonly showSearchablePropertiesOnly: boolean;
}

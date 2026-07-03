import {
  DEFAULT_PAGE_SIZE,
  DEFAULT_SHOW_SEARCHABLE_PROPERTIES_ONLY,
  MAX_CONDITION_COUNT,
  PAGE_SIZE_OPTIONS,
  type PageSizeOption,
} from "../constants/filter-nodes.constants.js";
import {
  isReservedContentTypeAlias,
  filterDocumentTypeAliases,
  filterContentTypes,
  formatDocumentTypeLabel,
  isEntireSiteSearchScope,
  isEntireSiteSystemPropertyAlias,
} from "../utils/filter-condition.utils.js";
import { cloneConditions } from "../utils/filter-builder-guidance.utils.js";
import { toFilterCondition, applyActiveFilterBadgeRemoval, hasApplicableSearchConditions, type ActiveFilterBadgeKind } from "../utils/active-filter.utils.js";
import { validateFilterConditions } from "../utils/filter-validation.utils.js";
import {
  buildSaveSavedFilterRequest,
  clearSavedFilterLastUsed,
  getUniqueContentTypeAliases,
  recordSavedFilterLastUsed,
  toEditableConditions,
} from "../utils/saved-filter.utils.js";
import { primePropertySelectorCache } from "../utils/property-selector-cache.utils.js";
import { toSortOptions } from "../utils/filter-results-sort.utils.js";
import type { SavedFilter } from "../models/saved-filter-models.js";
import type {
  FilterCondition,
  FilterRequest,
  FilterType,
  SearchCultureMode,
  SearchScope,
  ContentTypeListItem,
} from "../models/filter-models.js";
import {
  DEFAULT_FILTER_RESULTS_SORT,
  type FilterResultsGridColumn,
} from "../components/filter-results-grid/filter-results-grid.models.js";
import { FilterApiError } from "../services/errors/filter-api-error.js";
import type { FilterApiService } from "../services/filter-api-service.js";
import type {
  EditableFilterCondition,
  FilterNodesWorkspaceViewState,
} from "./filter-nodes-workspace.models.js";
import { createEmptyCondition } from "./filter-nodes-workspace.models.js";

export const FILTER_NODES_WORKSPACE_STATE_CHANGED = "state-changed";

export type FilterNodesWorkspaceStateChangedEvent =
  CustomEvent<FilterNodesWorkspaceViewState>;

function createInitialState(): FilterNodesWorkspaceViewState {
  return {
    loading: false,
    loadingMetadata: false,
    loadingPropertyContentTypeAliases: [],
    contentTypes: [],
    propertyMetadataByContentType: {},
    filterType: "All",
    searchScope: "ContentType",
    searchCultureMode: "AllCultures",
    culture: "",
    languages: [],
    loadingLanguages: false,
    conditions: [createEmptyCondition()],
    appliedConditions: [],
    appliedFilterType: "All",
    results: [],
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    totalCount: 0,
    totalPages: 0,
    hasPreviousPage: false,
    hasNextPage: false,
    hasSearched: false,
    savedFilters: [],
    loadingSavedFilters: false,
    savingSavedFilter: false,
    selectedSavedFilterId: "",
    sortColumn: DEFAULT_FILTER_RESULTS_SORT.column,
    sortDescending: DEFAULT_FILTER_RESULTS_SORT.descending,
    showSearchablePropertiesOnly: DEFAULT_SHOW_SEARCHABLE_PROPERTIES_ONLY,
  };
}

/**
 * Coordinates Filter Nodes workspace state and delegates API calls to {@link FilterApiService}.
 */
export class FilterNodesWorkspaceController extends EventTarget {
  #api: FilterApiService;
  #metadataAbortController?: AbortController;
  #searchAbortController?: AbortController;
  #state: FilterNodesWorkspaceViewState = createInitialState();

  constructor(api: FilterApiService) {
    super();
    this.#api = api;
  }

  getState(): FilterNodesWorkspaceViewState {
    return this.#state;
  }

  async initialize(): Promise<void> {
    await Promise.all([
      this.#loadContentTypes(),
      this.#loadSavedFilters(),
      this.#loadLanguages(),
    ]);
  }

  setSearchCultureMode(searchCultureMode: SearchCultureMode): void {
    if (searchCultureMode === this.#state.searchCultureMode) {
      return;
    }

    const culture =
      searchCultureMode === "SpecificCulture"
        ? this.#state.culture || this.#state.languages[0]?.isoCode || ""
        : searchCultureMode === "CurrentCulture"
          ? this.#state.culture
          : "";

    this.#patchState({
      searchCultureMode,
      culture,
      errorMessage: undefined,
    });
  }

  setCulture(culture: string): void {
    if (culture === this.#state.culture) {
      return;
    }

    this.#patchState({ culture, errorMessage: undefined });
  }

  setCurrentBackofficeCulture(culture: string | null | undefined): void {
    const normalizedCulture = culture?.trim() ?? "";

    if (
      this.#state.searchCultureMode !== "CurrentCulture" ||
      normalizedCulture === this.#state.culture
    ) {
      return;
    }

    this.#patchState({ culture: normalizedCulture });
  }

  setFilterType(filterType: FilterType): void {
    this.#patchState({ filterType, errorMessage: undefined });
  }

  setShowSearchablePropertiesOnly(showSearchablePropertiesOnly: boolean): void {
    if (
      showSearchablePropertiesOnly === this.#state.showSearchablePropertiesOnly
    ) {
      return;
    }

    this.#patchState({ showSearchablePropertiesOnly, errorMessage: undefined });
  }

  setSearchScope(searchScope: SearchScope): void {
    if (searchScope === this.#state.searchScope) {
      return;
    }

    const nextConditions = this.#state.conditions.map((condition) => {
      if (searchScope === "EntireSite") {
        return {
          ...condition,
          contentTypeAlias: "",
          propertyAlias: isEntireSiteSystemPropertyAlias(condition.propertyAlias)
            ? condition.propertyAlias
            : "",
          propertyValue: "",
          fromDate: "",
          toDate: "",
          filterOperator: isEntireSiteSystemPropertyAlias(condition.propertyAlias)
            ? condition.filterOperator
            : "",
        };
      }

      return {
        ...createEmptyCondition(),
        id: condition.id,
      };
    });

    this.#patchState({
      searchScope,
      conditions: nextConditions,
      selectedSavedFilterId: "",
      errorMessage: undefined,
    });
  }

  addCondition(): void {
    if (this.#state.conditions.length >= MAX_CONDITION_COUNT) {
      this.#patchState({
        errorMessage: `A maximum of ${MAX_CONDITION_COUNT} conditions is allowed.`,
      });
      return;
    }

    this.#patchState({
      conditions: [...this.#state.conditions, createEmptyCondition()],
      errorMessage: undefined,
    });
  }

  removeCondition(conditionId: string): void {
    const nextConditions = this.#state.conditions.filter(
      (condition) => condition.id !== conditionId,
    );

    this.#patchState({
      conditions:
        nextConditions.length > 0 ? nextConditions : [createEmptyCondition()],
      errorMessage: undefined,
    });
  }

  async updateCondition(
    conditionId: string,
    patch: Partial<EditableFilterCondition>,
  ): Promise<void> {
    const normalizedPatch =
      patch.contentTypeAlias !== undefined &&
      isReservedContentTypeAlias(patch.contentTypeAlias)
        ? { ...patch, contentTypeAlias: "" }
        : patch;

    const nextConditions = this.#state.conditions.map((condition) => {
      if (condition.id !== conditionId) {
        return condition;
      }

      const updated = { ...condition, ...normalizedPatch };

      if (
        normalizedPatch.contentTypeAlias !== undefined &&
        normalizedPatch.contentTypeAlias !== condition.contentTypeAlias
      ) {
        updated.propertyAlias = "";
        updated.propertyValue = "";
        updated.fromDate = "";
        updated.toDate = "";
        updated.filterOperator = "";
      }

      if (
        normalizedPatch.propertyAlias !== undefined &&
        normalizedPatch.propertyAlias !== condition.propertyAlias
      ) {
        updated.propertyValue = "";
        updated.fromDate = "";
        updated.toDate = "";
        updated.filterOperator = "";
      }

      return updated;
    });

    this.#patchState({ conditions: nextConditions, errorMessage: undefined });

    const updatedCondition = nextConditions.find(
      (condition) => condition.id === conditionId,
    );

    if (
      !isEntireSiteSearchScope(this.#state.searchScope) &&
      updatedCondition?.contentTypeAlias &&
      !isReservedContentTypeAlias(updatedCondition.contentTypeAlias) &&
      (normalizedPatch.contentTypeAlias !== undefined ||
        normalizedPatch.propertyAlias === "")
    ) {
      await this.#ensureProperties(updatedCondition.contentTypeAlias);
    }
  }

  async search(): Promise<void> {
    await this.#executeSearch(1);
  }

  async goToPage(page: number): Promise<void> {
    if (page < 1 || page === this.#state.page) {
      return;
    }

    if (this.#state.totalPages > 0 && page > this.#state.totalPages) {
      return;
    }

    await this.#executeSearch(page);
  }

  async setPageSize(pageSize: PageSizeOption): Promise<void> {
    if (pageSize === this.#state.pageSize) {
      return;
    }

    if (!PAGE_SIZE_OPTIONS.includes(pageSize)) {
      return;
    }

    this.#patchState({ pageSize, page: 1 });

    if (this.#state.hasSearched) {
      await this.#executeSearch(1);
    }
  }

  async setSort(
    column: FilterResultsGridColumn,
    descending: boolean,
  ): Promise<void> {
    if (
      column === this.#state.sortColumn &&
      descending === this.#state.sortDescending
    ) {
      return;
    }

    this.#patchState({
      sortColumn: column,
      sortDescending: descending,
      page: 1,
    });

    if (this.#state.hasSearched) {
      await this.#executeSearch(1);
    }
  }

  clearAll(): void {
    this.#metadataAbortController?.abort();
    this.#metadataAbortController = undefined;
    this.#searchAbortController?.abort();
    this.#searchAbortController = undefined;

    this.#patchState({
      loading: false,
      loadingMetadata: false,
      loadingPropertyContentTypeAliases: [],
      filterType: "All",
      searchScope: "ContentType",
      searchCultureMode: "AllCultures",
      culture: "",
      conditions: [createEmptyCondition()],
      appliedConditions: [],
      appliedFilterType: "All",
      results: [],
      page: 1,
      totalCount: 0,
      totalPages: 0,
      hasPreviousPage: false,
      hasNextPage: false,
      hasSearched: false,
      selectedSavedFilterId: "",
      sortColumn: DEFAULT_FILTER_RESULTS_SORT.column,
      sortDescending: DEFAULT_FILTER_RESULTS_SORT.descending,
      errorMessage: undefined,
    });
  }

  async removeActiveFilterBadgeAndSearch(
    conditionId: string,
    kind: ActiveFilterBadgeKind,
  ): Promise<void> {
    const sourceConditions =
      this.#state.appliedConditions.length > 0
        ? this.#state.appliedConditions
        : this.#state.conditions;

    const nextConditions = applyActiveFilterBadgeRemoval(
      sourceConditions,
      conditionId,
      kind,
    );

    this.#patchState({
      conditions: nextConditions,
      appliedConditions: cloneConditions(nextConditions),
      filterType: this.#state.appliedFilterType,
      errorMessage: undefined,
    });

    if (!this.#state.hasSearched) {
      return;
    }

    await this.#executeSearch(1, { allowPartialConditions: true });
  }

  async saveCurrentFilter(name: string): Promise<void> {
    const trimmedName = name.trim();

    if (!trimmedName) {
      this.#patchState({ errorMessage: "Saved filter name is required." });
      return;
    }

    if (isEntireSiteSearchScope(this.#state.searchScope)) {
      this.#patchState({
        errorMessage:
          "Entire site searches cannot be saved. Switch to selected content type mode to save a filter.",
      });
      return;
    }

    this.#patchState({ savingSavedFilter: true, errorMessage: undefined });

    try {
      const request = buildSaveSavedFilterRequest(trimmedName, this.#state);
      const savedFilter = await this.#api.saveSavedFilter(request);

      this.#patchState({
        savingSavedFilter: false,
        selectedSavedFilterId: savedFilter.id,
        savedFilters: this.#sortSavedFilters([
          ...this.#state.savedFilters.filter((filter) => filter.id !== savedFilter.id),
          savedFilter,
        ]),
      });
    } catch (error) {
      this.#patchState({
        savingSavedFilter: false,
        errorMessage: this.#toErrorMessage(error),
      });
    }
  }

  async loadSavedFilter(savedFilterId: string): Promise<void> {
    const savedFilter = this.#state.savedFilters.find(
      (filter) => filter.id === savedFilterId,
    );

    if (!savedFilter) {
      return;
    }

    recordSavedFilterLastUsed(savedFilter.id);

    this.#searchAbortController?.abort();
    this.#searchAbortController = undefined;

    this.#patchState({
      selectedSavedFilterId: savedFilter.id,
      errorMessage: undefined,
    });

    try {
      await this.#ensurePropertiesBatch(getUniqueContentTypeAliases(savedFilter));

      this.#patchState({
        filterType: savedFilter.filterType,
        searchScope: "ContentType",
        searchCultureMode: savedFilter.searchCultureMode ?? "AllCultures",
        culture: savedFilter.culture ?? "",
        conditions: toEditableConditions(savedFilter.conditions),
        appliedConditions: [],
        appliedFilterType: "All",
        pageSize: savedFilter.pageSize,
        page: 1,
        results: [],
        totalCount: 0,
        totalPages: 0,
        hasPreviousPage: false,
        hasNextPage: false,
        sortColumn: DEFAULT_FILTER_RESULTS_SORT.column,
        sortDescending: DEFAULT_FILTER_RESULTS_SORT.descending,
      });

      await this.#executeSearch(1);
    } catch (error) {
      this.#patchState({
        errorMessage: this.#toErrorMessage(error),
      });
    }
  }

  async deleteSavedFilter(savedFilterId: string): Promise<void> {
    if (!savedFilterId) {
      return;
    }

    this.#patchState({ loadingSavedFilters: true, errorMessage: undefined });

    try {
      await this.#api.deleteSavedFilter(savedFilterId);
      clearSavedFilterLastUsed(savedFilterId);

      this.#patchState({
        loadingSavedFilters: false,
        selectedSavedFilterId:
          this.#state.selectedSavedFilterId === savedFilterId
            ? ""
            : this.#state.selectedSavedFilterId,
        savedFilters: this.#state.savedFilters.filter(
          (filter) => filter.id !== savedFilterId,
        ),
      });
    } catch (error) {
      this.#patchState({
        loadingSavedFilters: false,
        errorMessage: this.#toErrorMessage(error),
      });
    }
  }

  clearSelectedSavedFilter(): void {
    if (!this.#state.selectedSavedFilterId) {
      return;
    }

    this.#patchState({ selectedSavedFilterId: "" });
  }

  destroy(): void {
    this.#metadataAbortController?.abort();
    this.#metadataAbortController = undefined;
    this.#searchAbortController?.abort();
    this.#searchAbortController = undefined;
  }

  async #loadSavedFilters(): Promise<void> {
    this.#patchState({ loadingSavedFilters: true, errorMessage: undefined });

    try {
      const response = await this.#api.getSavedFilters();

      this.#patchState({
        loadingSavedFilters: false,
        savedFilters: this.#sortSavedFilters(response.filters ?? []),
      });
    } catch (error) {
      this.#patchState({
        loadingSavedFilters: false,
        errorMessage: this.#toErrorMessage(error),
      });
    }
  }

  #sortSavedFilters(savedFilters: readonly SavedFilter[]): readonly SavedFilter[] {
    return [...savedFilters].sort((left, right) =>
      left.name.localeCompare(right.name, undefined, { sensitivity: "base" }),
    );
  }

  async #loadContentTypes(): Promise<void> {
    this.#metadataAbortController?.abort();
    this.#metadataAbortController = new AbortController();

    this.#patchState({ loadingMetadata: true, errorMessage: undefined });

    try {
      const response = await this.#api.getContentTypes(
        this.#metadataAbortController.signal,
      );

      this.#patchState({
        contentTypes: this.#normalizeContentTypes(response),
        loadingMetadata: false,
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      this.#patchState({
        loadingMetadata: false,
        errorMessage: this.#toErrorMessage(error),
      });
    }
  }

  async #loadLanguages(): Promise<void> {
    this.#patchState({ loadingLanguages: true });

    try {
      const response = await this.#api.getLanguages();

      this.#patchState({
        languages: response.languages ?? [],
        loadingLanguages: false,
      });
    } catch (error) {
      this.#patchState({
        languages: [],
        loadingLanguages: false,
        errorMessage: this.#toErrorMessage(error),
      });
    }
  }

  async #ensureProperties(contentTypeAlias: string): Promise<void> {
    if (
      isReservedContentTypeAlias(contentTypeAlias) ||
      this.#state.propertyMetadataByContentType[contentTypeAlias]
    ) {
      return;
    }

    this.#addLoadingPropertyAlias(contentTypeAlias);

    try {
      const response = await this.#api.getProperties(
        contentTypeAlias,
        this.#metadataAbortController?.signal,
      );

      const properties = response.properties ?? [];
      primePropertySelectorCache(properties);

      this.#patchState({
        propertyMetadataByContentType: {
          ...this.#state.propertyMetadataByContentType,
          [contentTypeAlias]: properties,
        },
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      this.#patchState({
        errorMessage: this.#toErrorMessage(error),
      });
    } finally {
      this.#removeLoadingPropertyAlias(contentTypeAlias);
    }
  }

  async #ensurePropertiesBatch(contentTypeAliases: readonly string[]): Promise<void> {
    const missingAliases = contentTypeAliases.filter(
      (alias) =>
        !isReservedContentTypeAlias(alias) &&
        !this.#state.propertyMetadataByContentType[alias],
    );

    if (missingAliases.length === 0) {
      return;
    }

    this.#patchState({
      loadingPropertyContentTypeAliases: [
        ...new Set([
          ...this.#state.loadingPropertyContentTypeAliases,
          ...missingAliases,
        ]),
      ],
      errorMessage: undefined,
    });

    try {
      const response = await this.#api.getPropertiesBatch(
        missingAliases,
        this.#metadataAbortController?.signal,
      );

      const nextMetadata = { ...this.#state.propertyMetadataByContentType };

      for (const item of response.items ?? []) {
        const properties = item.properties ?? [];
        primePropertySelectorCache(properties);
        nextMetadata[item.contentTypeAlias] = properties;
      }

      this.#patchState({
        propertyMetadataByContentType: nextMetadata,
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      this.#patchState({
        errorMessage: this.#toErrorMessage(error),
      });
    } finally {
      this.#patchState({
        loadingPropertyContentTypeAliases:
          this.#state.loadingPropertyContentTypeAliases.filter(
            (alias) => !missingAliases.includes(alias),
          ),
      });
    }
  }

  #addLoadingPropertyAlias(contentTypeAlias: string): void {
    if (this.#state.loadingPropertyContentTypeAliases.includes(contentTypeAlias)) {
      return;
    }

    this.#patchState({
      loadingPropertyContentTypeAliases: [
        ...this.#state.loadingPropertyContentTypeAliases,
        contentTypeAlias,
      ],
      errorMessage: undefined,
    });
  }

  #removeLoadingPropertyAlias(contentTypeAlias: string): void {
    if (!this.#state.loadingPropertyContentTypeAliases.includes(contentTypeAlias)) {
      return;
    }

    this.#patchState({
      loadingPropertyContentTypeAliases:
        this.#state.loadingPropertyContentTypeAliases.filter(
          (alias) => alias !== contentTypeAlias,
        ),
    });
  }

  async #executeSearch(
    page: number,
    options: { allowPartialConditions?: boolean } = {},
  ): Promise<void> {
    const filterContext = this.#getFilterConditionContext();
    const allowPartialConditions = options.allowPartialConditions ?? false;

    if (allowPartialConditions) {
      if (!hasApplicableSearchConditions(this.#state.conditions, filterContext)) {
        this.#searchAbortController?.abort();
        this.#searchAbortController = undefined;

        this.#patchState({
          loading: false,
          hasSearched: true,
          appliedConditions: cloneConditions(this.#state.conditions),
          appliedFilterType: this.#state.filterType,
          results: [],
          page: 1,
          totalCount: 0,
          totalPages: 0,
          hasPreviousPage: false,
          hasNextPage: false,
          errorMessage: undefined,
        });
        return;
      }
    } else {
      const validation = validateFilterConditions(
        this.#state.conditions,
        filterContext,
        this.#state.filterType,
      );

      if (!validation.isValid) {
        return;
      }
    }

    this.#searchAbortController?.abort();
    this.#searchAbortController = new AbortController();

    const request = this.#buildFilterRequest(page);

    this.#patchState({
      loading: true,
      page,
      errorMessage: undefined,
    });

    try {
      const response = await this.#api.search(
        request,
        this.#searchAbortController.signal,
      );

      this.#patchState({
        loading: false,
        hasSearched: true,
        appliedConditions: cloneConditions(this.#state.conditions),
        appliedFilterType: this.#state.filterType,
        results: response.items,
        page: response.page,
        pageSize: response.pageSize,
        totalCount: response.totalCount,
        totalPages: response.totalPages,
        hasPreviousPage: response.hasPreviousPage,
        hasNextPage: response.hasNextPage,
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      this.#patchState({
        loading: false,
        hasSearched: true,
        results: [],
        totalCount: 0,
        totalPages: 0,
        hasPreviousPage: false,
        hasNextPage: false,
        errorMessage: this.#toErrorMessage(error),
      });
    }
  }

  #buildFilterRequest(page: number): FilterRequest {
    const filterContext = this.#getFilterConditionContext();

    return {
      filterType: this.#state.filterType,
      searchCultureMode: this.#state.searchCultureMode,
      culture: this.#resolveRequestCulture(),
      paging: {
        page,
        pageSize: this.#state.pageSize,
      },
      sort: toSortOptions(this.#state.sortColumn, this.#state.sortDescending),
      conditions: this.#state.conditions
        .map((condition) => toFilterCondition(condition, filterContext))
        .filter((condition): condition is FilterCondition => condition !== undefined),
    };
  }

  #getFilterConditionContext() {
    return {
      propertyMetadataByContentType: this.#state.propertyMetadataByContentType,
      searchScope: this.#state.searchScope,
      contentTypes: this.#state.contentTypes,
    };
  }

  #normalizeContentTypes(
    response: Awaited<ReturnType<FilterApiService["getContentTypes"]>>,
  ): readonly ContentTypeListItem[] {
    if (response.contentTypes?.length) {
      return filterContentTypes(response.contentTypes);
    }

    return filterDocumentTypeAliases(response.aliases ?? []).map((alias) => ({
      alias,
      name: formatDocumentTypeLabel(alias),
    }));
  }

  #resolveRequestCulture(): string | undefined {
    if (this.#state.searchCultureMode === "AllCultures") {
      return undefined;
    }

    const culture = this.#state.culture.trim();

    return culture || undefined;
  }

  #toErrorMessage(error: unknown): string {
    if (error instanceof FilterApiError) {
      if (error.validationErrors) {
        const messages = Object.values(error.validationErrors).flat();
        if (messages.length > 0) {
          return messages.join(" ");
        }
      }

      return error.detail ?? error.message;
    }

    if (error instanceof Error) {
      return error.message;
    }

    return "An unexpected error occurred.";
  }

  #patchState(patch: Partial<FilterNodesWorkspaceViewState>): void {
    this.#state = { ...this.#state, ...patch };
    this.dispatchEvent(
      new CustomEvent(FILTER_NODES_WORKSPACE_STATE_CHANGED, {
        detail: this.#state,
      }),
    );
  }
}

import { html, customElement, state, nothing } from "@umbraco-cms/backoffice/external/lit";
import { UmbTextStyles } from "@umbraco-cms/backoffice/style";
import { UmbLitElement } from "@umbraco-cms/backoffice/lit-element";
import { UMB_AUTH_CONTEXT } from "@umbraco-cms/backoffice/auth";
import { UMB_NOTIFICATION_CONTEXT } from "@umbraco-cms/backoffice/notification";
import { CONTENT_SEARCH_WORKSPACE_TITLE } from "../constants/content-search.constants.js";
import { DEFAULT_PAGE_SIZE } from "../constants/search-results.constants.js";
import type { SearchCondition, SearchMatchMode } from "../models/search-builder.models.js";
import type { LanguageListItem, SearchCultureMode } from "../models/search-culture.models.js";
import {
  mapApiResultToRow,
  toContentSearchApiRequest,
} from "../models/search-api.models.js";
import { extractNameHighlightTerms } from "../utils/search-highlight.utils.js";
import {
  createInitialResultsState,
  type ContentSearchResultsState,
} from "../models/search-results.models.js";
import {
  CONTENT_SEARCH_RESULTS_PAGE_CHANGE,
  CONTENT_SEARCH_RESULTS_PAGE_SIZE_CHANGE,
  CONTENT_SEARCH_RESULTS_SORT_CHANGE,
  CONTENT_SEARCH_CLEAR_SEARCH,
  CONTENT_SEARCH_CLEAR_RESULTS,
  DEFAULT_CONTENT_SEARCH_RESULTS_SORT,
  type ContentSearchResultsGridColumn,
} from "../components/content-search-results/content-search-results.models.js";
import {
  CONTENT_SEARCH_SAVED_SEARCH_DELETE,
  CONTENT_SEARCH_SAVED_SEARCH_LOAD,
  CONTENT_SEARCH_SAVED_SEARCH_RENAME,
  CONTENT_SEARCH_SAVED_SEARCH_SAVE,
  type SavedSearchSummary,
} from "../models/saved-search.models.js";
import {
  CONTENT_SEARCH_PRESET_RUN,
  type SearchPreset,
} from "../models/search-preset.models.js";
import { createSearchApiService } from "../services/search-api-service.js";
import { createSavedSearchApiService } from "../services/saved-search-api-service.js";
import { createSearchPresetApiService } from "../services/search-preset-api-service.js";
import { createExportApiService } from "../services/content-search-export-api-service.js";
import { triggerBrowserDownload } from "../utils/file-download.utils.js";
import {
  CONTENT_SEARCH_EXPORT,
  type ContentSearchExportEventDetail,
} from "../models/search-export.models.js";
import {
  buildSaveSavedSearchRequest,
  getUniqueContentTypeAliasesFromDetail,
  mapSavedSearchDetail,
  mapSavedSearchListResponse,
  toEditableSearchConditions,
  type SavedSearchWorkspaceSnapshot,
} from "../utils/saved-search.utils.js";
import {
  getUniqueContentTypeAliasesFromPreset,
  mapSearchPresetListResponse,
  toEditableConditionsFromPreset,
} from "../utils/search-preset.utils.js";
import type { ContentSearchBuilderElement } from "../components/content-search-builder/content-search-builder.element.js";
import type { ContentSearchSavedSearchesElement } from "../components/content-search-saved-searches/content-search-saved-searches.element.js";
import "../components/content-search-saved-searches/content-search-saved-searches.element.js";
import "../components/content-search-quick-presets/content-search-quick-presets.element.js";
import "../components/content-search-builder/content-search-builder.element.js";
import "../components/content-search-results/content-search-results.element.js";
import { clampPageNumber, resolveTotalPages } from "../utils/pagination.utils.js";
import { contentSearchWorkspaceStyles } from "./content-search-workspace.styles.js";

interface ContentSearchSubmitDetail {
  readonly matchMode: SearchMatchMode;
  readonly conditions: readonly SearchCondition[];
  readonly searchCultureMode: SearchCultureMode;
  readonly culture: string;
  readonly languages: readonly LanguageListItem[];
}

interface LastSearchContext {
  readonly matchMode: SearchMatchMode;
  readonly conditions: readonly SearchCondition[];
  readonly searchCultureMode: SearchCultureMode;
  readonly culture: string;
  readonly savedSearchId?: string;
}

@customElement("content-search-workspace")
export class ContentSearchWorkspaceElement extends UmbLitElement {
  @state()
  private _resultsState: ContentSearchResultsState = createInitialResultsState();

  @state()
  private _searchCultureMode: SearchCultureMode = "AllCultures";

  @state()
  private _culture = "";

  @state()
  private _languages: readonly LanguageListItem[] = [];

  @state()
  private _errorMessage = "";

  @state()
  private _currentPage = 1;

  @state()
  private _totalPages = 0;

  @state()
  private _pageSize = DEFAULT_PAGE_SIZE;

  @state()
  private _sortColumn: ContentSearchResultsGridColumn =
    DEFAULT_CONTENT_SEARCH_RESULTS_SORT.column;

  @state()
  private _sortDescending = DEFAULT_CONTENT_SEARCH_RESULTS_SORT.descending;

  @state()
  private _savedSearchItems: readonly SavedSearchSummary[] = [];

  @state()
  private _loadingSavedSearches = false;

  @state()
  private _savingSavedSearch = false;

  @state()
  private _searchPresets: readonly SearchPreset[] = [];

  @state()
  private _loadingSearchPresets = false;

  @state()
  private _selectedSavedSearchId = "";

  @state()
  private _nameHighlightTerms: readonly string[] = [];

  @state()
  private _resultsFocusToken = 0;

  @state()
  private _exporting = false;

  #searchApi = createSearchApiService();
  #savedSearchApi = createSavedSearchApiService();
  #presetApi = createSearchPresetApiService();
  #exportApi = createExportApiService();
  #searchAbortController?: AbortController;
  #savedSearchAbortController?: AbortController;
  #presetAbortController?: AbortController;
  #exportAbortController?: AbortController;
  #authContext?: typeof UMB_AUTH_CONTEXT.TYPE;
  #notificationContext?: typeof UMB_NOTIFICATION_CONTEXT.TYPE;
  #lastSearch?: LastSearchContext;

  override connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener("content-search-submit", this.#onSearchSubmit);
    this.addEventListener(CONTENT_SEARCH_RESULTS_PAGE_CHANGE, this.#onPageChange);
    this.addEventListener(
      CONTENT_SEARCH_RESULTS_PAGE_SIZE_CHANGE,
      this.#onPageSizeChange,
    );
    this.addEventListener(CONTENT_SEARCH_RESULTS_SORT_CHANGE, this.#onSortChange);
    this.addEventListener(CONTENT_SEARCH_SAVED_SEARCH_LOAD, this.#onSavedSearchLoad);
    this.addEventListener(CONTENT_SEARCH_SAVED_SEARCH_SAVE, this.#onSavedSearchSave);
    this.addEventListener(CONTENT_SEARCH_SAVED_SEARCH_DELETE, this.#onSavedSearchDelete);
    this.addEventListener(CONTENT_SEARCH_SAVED_SEARCH_RENAME, this.#onSavedSearchRename);
    this.addEventListener(CONTENT_SEARCH_PRESET_RUN, this.#onPresetRun);
    this.addEventListener(CONTENT_SEARCH_CLEAR_SEARCH, this.#onClearSearch);
    this.addEventListener(CONTENT_SEARCH_CLEAR_RESULTS, this.#onClearResults);
    this.addEventListener(CONTENT_SEARCH_EXPORT, this.#onExportRequest);

    this.consumeContext(UMB_AUTH_CONTEXT, (authContext) => {
      this.#authContext = authContext;
    });

    this.consumeContext(UMB_NOTIFICATION_CONTEXT, (notificationContext) => {
      this.#notificationContext = notificationContext;
    });

    void this.#loadSavedSearches();
    void this.#loadSearchPresets();
  }

  override disconnectedCallback(): void {
    this.removeEventListener("content-search-submit", this.#onSearchSubmit);
    this.removeEventListener(CONTENT_SEARCH_RESULTS_PAGE_CHANGE, this.#onPageChange);
    this.removeEventListener(
      CONTENT_SEARCH_RESULTS_PAGE_SIZE_CHANGE,
      this.#onPageSizeChange,
    );
    this.removeEventListener(CONTENT_SEARCH_RESULTS_SORT_CHANGE, this.#onSortChange);
    this.removeEventListener(CONTENT_SEARCH_SAVED_SEARCH_LOAD, this.#onSavedSearchLoad);
    this.removeEventListener(CONTENT_SEARCH_SAVED_SEARCH_SAVE, this.#onSavedSearchSave);
    this.removeEventListener(CONTENT_SEARCH_SAVED_SEARCH_DELETE, this.#onSavedSearchDelete);
    this.removeEventListener(CONTENT_SEARCH_SAVED_SEARCH_RENAME, this.#onSavedSearchRename);
    this.removeEventListener(CONTENT_SEARCH_PRESET_RUN, this.#onPresetRun);
    this.removeEventListener(CONTENT_SEARCH_CLEAR_SEARCH, this.#onClearSearch);
    this.removeEventListener(CONTENT_SEARCH_CLEAR_RESULTS, this.#onClearResults);
    this.removeEventListener(CONTENT_SEARCH_EXPORT, this.#onExportRequest);
    this.#searchAbortController?.abort();
    this.#savedSearchAbortController?.abort();
    this.#presetAbortController?.abort();
    this.#exportAbortController?.abort();
    super.disconnectedCallback();
  }

  #isWorkspaceBusy(): boolean {
    return this._resultsState.loading || this._exporting;
  }

  #renderBusyOverlay() {
    const label = this._exporting ? "Preparing export…" : "Searching content…";

    return html`
      <div class="workspace__busy-overlay" role="status" aria-live="polite" aria-busy="true">
        <uui-loader></uui-loader>
        <span class="workspace__busy-overlay-label">${label}</span>
      </div>
    `;
  }

  override render() {
    const busy = this.#isWorkspaceBusy();

    return html`
      <umb-body-layout main-no-padding>
        <div
          class="workspace ${busy ? "workspace--busy" : ""}"
          aria-label=${CONTENT_SEARCH_WORKSPACE_TITLE}
        >
          ${this._errorMessage
            ? html`<uui-alert-bar type="danger">${this._errorMessage}</uui-alert-bar>`
            : null}

          <div class="workspace__layout">
            <div class="cs-card cs-card--subtle workspace__saved">
              <content-search-saved-searches
                .items=${this._savedSearchItems}
                .selectedSavedSearchId=${this._selectedSavedSearchId}
                ?loading=${this._loadingSavedSearches}
                ?saving=${this._savingSavedSearch}
                ?saveDisabled=${!this.#lastSearch}
              ></content-search-saved-searches>
            </div>

            <div class="cs-card cs-card--subtle workspace__presets">
              <content-search-quick-presets
                .presets=${this._searchPresets}
                ?loading=${this._loadingSearchPresets}
              ></content-search-quick-presets>
            </div>

            <div class="cs-card cs-card--focus workspace__builder">
              <content-search-builder
                .searching=${this._resultsState.loading}
              ></content-search-builder>
            </div>

            <div class="cs-card cs-card--flat workspace__results">
              <content-search-results
                .resultsState=${this._resultsState}
                .searchCultureMode=${this._searchCultureMode}
                .culture=${this._culture}
                .languages=${this._languages}
                .currentPage=${this._currentPage}
                .totalPages=${this._totalPages}
                .pageSize=${this._pageSize}
                .sortColumn=${this._sortColumn}
                .sortDescending=${this._sortDescending}
                .highlightTerms=${this._nameHighlightTerms}
                .resultsFocusToken=${this._resultsFocusToken}
                .exporting=${this._exporting}
              ></content-search-results>
            </div>
          </div>
          ${busy ? this.#renderBusyOverlay() : nothing}
        </div>
      </umb-body-layout>
    `;
  }

  #onSearchSubmit = (event: Event): void => {
    const detail = (event as CustomEvent<ContentSearchSubmitDetail>).detail;

    this._searchCultureMode = detail.searchCultureMode;
    this._culture = detail.culture;
    this._languages = detail.languages;
    this._errorMessage = "";
    this._currentPage = 1;
    this._selectedSavedSearchId = "";

    this.#lastSearch = {
      matchMode: detail.matchMode,
      conditions: detail.conditions,
      searchCultureMode: detail.searchCultureMode,
      culture: detail.culture,
    };
    this.#setNameHighlightTerms(detail.conditions);
    this.#beginSearchExecution();

    void this.#executeSearch();
  };

  #setNameHighlightTerms(conditions: readonly SearchCondition[]): void {
    this._nameHighlightTerms = extractNameHighlightTerms(conditions);
  }

  #onPageChange = (event: Event): void => {
    const page = (event as CustomEvent<{ page: number }>).detail.page;
    if (page === this._currentPage) {
      return;
    }

    this._currentPage = page;
    void this.#executeSearch();
  };

  #onPageSizeChange = (event: Event): void => {
    const pageSize = (event as CustomEvent<{ pageSize: number }>).detail.pageSize;
    if (pageSize === this._pageSize) {
      return;
    }

    this._pageSize = pageSize;
    this._currentPage = 1;
    void this.#executeSearch();
  };

  #onSortChange = (event: Event): void => {
    const detail = (event as CustomEvent<{
      column: ContentSearchResultsGridColumn;
      descending: boolean;
    }>).detail;

    this._sortColumn = detail.column;
    this._sortDescending = detail.descending;
    this._currentPage = 1;
    void this.#executeSearch();
  };

  #onSavedSearchLoad = (event: Event): void => {
    const savedSearchId = (event as CustomEvent<{ savedSearchId: string }>).detail
      .savedSearchId;

    void this.#loadSavedSearch(savedSearchId);
  };

  #onSavedSearchSave = (event: Event): void => {
    const detail = (event as CustomEvent<{
      name: string;
      description?: string;
    }>).detail;

    if (!this.#lastSearch) {
      return;
    }

    void this.#saveCurrentSearch(detail.name, detail.description);
  };

  #onSavedSearchDelete = (event: Event): void => {
    const savedSearchId = (event as CustomEvent<{ savedSearchId: string }>).detail
      .savedSearchId;

    void this.#deleteSavedSearch(savedSearchId);
  };

  #onSavedSearchRename = (event: Event): void => {
    const detail = (event as CustomEvent<{
      savedSearchId: string;
      name: string;
      description?: string;
    }>).detail;

    void this.#renameSavedSearch(detail.savedSearchId, detail.name, detail.description);
  };

  #onPresetRun = (event: Event): void => {
    const presetId = (event as CustomEvent<{ presetId: string }>).detail.presetId;

    void this.#runSearchPreset(presetId);
  };

  #onClearSearch = (): void => {
    this.#searchAbortController?.abort();
    this.#lastSearch = undefined;
    this._resultsState = createInitialResultsState();
    this._currentPage = 1;
    this._totalPages = 0;
    this._nameHighlightTerms = [];
    this._selectedSavedSearchId = "";
    this._errorMessage = "";
    this.#getBuilderElement()?.resetBuilder();
  };

  #onClearResults = (): void => {
    this.#searchAbortController?.abort();
    this._resultsState = createInitialResultsState();
    this._currentPage = 1;
    this._totalPages = 0;
    this._nameHighlightTerms = [];
  };

  #onExportRequest = (event: Event): void => {
    const detail = (event as CustomEvent<ContentSearchExportEventDetail>).detail;
    void this.#executeExport(detail.format);
  };

  async #executeExport(
    format: ContentSearchExportEventDetail["format"],
  ): Promise<void> {
    if (!this.#lastSearch || this._exporting) {
      return;
    }

    if (!this.#authContext) {
      this._errorMessage = "Export is unavailable because the session is not ready.";
      return;
    }

    this.#exportAbortController?.abort();
    this.#exportAbortController = new AbortController();
    this._exporting = true;
    this._errorMessage = "";

    try {
      const search = toContentSearchApiRequest({
        matchMode: this.#lastSearch.matchMode,
        searchCultureMode: this.#lastSearch.searchCultureMode,
        culture: this.#lastSearch.culture,
        conditions: this.#lastSearch.conditions,
        sortColumn: this._sortColumn,
        sortDescending: this._sortDescending,
      });

      const config = this.#authContext.getOpenApiConfiguration();
      const exportFile = await this.#exportApi.export(
        { format, search },
        {
          base: config.base,
          credentials: config.credentials,
          token: config.token,
        },
        this.#exportAbortController.signal,
      );

      triggerBrowserDownload(exportFile.blob, exportFile.fileName);

      this.#notificationContext?.peek("positive", {
        data: {
          headline: "Export ready",
          message: `Your download "${exportFile.fileName}" has started.`,
        },
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      const message =
        error instanceof Error ? error.message : "Unable to export the results.";
      this._errorMessage = message;
      this.#notificationContext?.peek("danger", {
        data: {
          headline: "Export failed",
          message,
        },
      });
    } finally {
      this._exporting = false;
    }
  }

  async #loadSavedSearches(): Promise<void> {
    this.#savedSearchAbortController?.abort();
    this.#savedSearchAbortController = new AbortController();
    this._loadingSavedSearches = true;

    try {
      const response = await this.#savedSearchApi.getSavedSearches(
        this.#savedSearchAbortController.signal,
      );
      const mapped = mapSavedSearchListResponse(response);

      this._savedSearchItems = mapped.personal;
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      this._errorMessage =
        error instanceof Error
          ? error.message
          : "Unable to load saved searches.";
    } finally {
      this._loadingSavedSearches = false;
    }
  }

  async #loadSearchPresets(): Promise<void> {
    this.#presetAbortController?.abort();
    this.#presetAbortController = new AbortController();
    this._loadingSearchPresets = true;

    try {
      const response = await this.#presetApi.getPresets(
        this.#presetAbortController.signal,
      );
      this._searchPresets = mapSearchPresetListResponse(response);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      this._searchPresets = [];
      this._errorMessage =
        error instanceof Error ? error.message : "Unable to load quick presets.";
    } finally {
      this._loadingSearchPresets = false;
    }
  }

  async #runSearchPreset(presetId: string): Promise<void> {
    const preset = this._searchPresets.find((item) => item.id === presetId);

    if (!preset) {
      this._errorMessage = "The selected quick preset could not be found.";
      return;
    }

    this._errorMessage = "";
    this.#beginSearchExecution();

    try {
      await this.#applySearchPreset(preset);
      await this.#executeSearch();
    } catch (error) {
      this._errorMessage =
        error instanceof Error ? error.message : "Unable to run the quick preset.";
      this._resultsState = {
        ...this._resultsState,
        loading: false,
      };
    }
  }

  async #applySearchPreset(preset: SearchPreset): Promise<void> {
    await this.#ensureBuilderPropertiesForPreset(preset);

    this._selectedSavedSearchId = "";
    this._searchCultureMode = preset.searchCultureMode;
    this._culture = "";
    this._pageSize = preset.pageSize;
    this._sortColumn = preset.sortColumn ?? DEFAULT_CONTENT_SEARCH_RESULTS_SORT.column;
    this._sortDescending = preset.sortDescending;
    this._currentPage = 1;

    const conditions = toEditableConditionsFromPreset(preset);

    this.#lastSearch = {
      matchMode: preset.matchMode,
      conditions,
      searchCultureMode: preset.searchCultureMode,
      culture: "",
    };
    this.#setNameHighlightTerms(conditions);

    await this.#applyDefinitionToBuilder({
      matchMode: preset.matchMode,
      conditions,
      searchCultureMode: preset.searchCultureMode,
      culture: "",
    });
  }

  async #loadSavedSearch(savedSearchId: string): Promise<void> {
    this._errorMessage = "";
    this.#beginSearchExecution();

    try {
      const detail = mapSavedSearchDetail(
        await this.#savedSearchApi.getSavedSearch(savedSearchId),
      );

      await this.#ensureBuilderProperties(detail);

      this._selectedSavedSearchId = detail.id;
      this._searchCultureMode = detail.searchCultureMode;
      this._culture = detail.culture ?? "";
      this._pageSize = detail.pageSize;
      this._sortColumn = detail.sortColumn ?? DEFAULT_CONTENT_SEARCH_RESULTS_SORT.column;
      this._sortDescending = detail.sortDescending;
      this._currentPage = 1;

      const conditions = toEditableSearchConditions(detail.conditions);

      this.#lastSearch = {
        matchMode: detail.matchMode,
        conditions,
        searchCultureMode: detail.searchCultureMode,
        culture: detail.culture ?? "",
        savedSearchId,
      };

      this.#setNameHighlightTerms(conditions);
      await this.#applyDefinitionToBuilder({
        matchMode: detail.matchMode,
        conditions,
        searchCultureMode: detail.searchCultureMode,
        culture: detail.culture ?? "",
      });

      await this.#executeSearch();
      await this.#loadSavedSearches();
    } catch (error) {
      this._errorMessage =
        error instanceof Error ? error.message : "Unable to load the saved search.";
      this._resultsState = {
        ...this._resultsState,
        loading: false,
      };
    }
  }

  async #saveCurrentSearch(
    name: string,
    description: string | undefined,
  ): Promise<void> {
    if (!this.#lastSearch) {
      return;
    }

    this._savingSavedSearch = true;
    this._errorMessage = "";

    try {
      const request = buildSaveSavedSearchRequest(
        name,
        description,
        false,
        this.#getWorkspaceSnapshot(),
      );

      const saved = await this.#savedSearchApi.saveSavedSearch(request);
      this._selectedSavedSearchId = saved.id;
      this.#getSavedSearchesElement()?.resetSaveForm();
      await this.#loadSavedSearches();
    } catch (error) {
      this._errorMessage =
        error instanceof Error ? error.message : "Unable to save the search.";
    } finally {
      this._savingSavedSearch = false;
    }
  }

  async #deleteSavedSearch(savedSearchId: string): Promise<void> {
    this._errorMessage = "";

    try {
      await this.#savedSearchApi.deleteSavedSearch(savedSearchId);

      if (this._selectedSavedSearchId === savedSearchId) {
        this._selectedSavedSearchId = "";
      }

      await this.#loadSavedSearches();
    } catch (error) {
      this._errorMessage =
        error instanceof Error ? error.message : "Unable to delete the saved search.";
    }
  }

  async #renameSavedSearch(
    savedSearchId: string,
    name: string,
    description?: string,
  ): Promise<void> {
    this._errorMessage = "";

    try {
      await this.#savedSearchApi.updateSavedSearch(savedSearchId, { name, description });
      await this.#loadSavedSearches();
    } catch (error) {
      this._errorMessage =
        error instanceof Error ? error.message : "Unable to rename the saved search.";
    }
  }

  async #applyDefinitionToBuilder(detail: {
    matchMode: SearchMatchMode;
    conditions: readonly SearchCondition[];
    searchCultureMode: SearchCultureMode;
    culture: string;
  }): Promise<void> {
    const builder = this.#getBuilderElement();

    if (!builder) {
      return;
    }

    await builder.applySearchDefinition(detail);
  }

  async #ensureBuilderProperties(
    detail: ReturnType<typeof mapSavedSearchDetail>,
  ): Promise<void> {
    const aliases = getUniqueContentTypeAliasesFromDetail(detail);

    if (aliases.length === 0) {
      return;
    }

    const builder = this.#getBuilderElement();

    if (!builder) {
      return;
    }

    await builder.ensurePropertiesForContentTypes(aliases);
  }

  async #ensureBuilderPropertiesForPreset(preset: SearchPreset): Promise<void> {
    const aliases = getUniqueContentTypeAliasesFromPreset(preset);

    if (aliases.length === 0) {
      return;
    }

    const builder = this.#getBuilderElement();

    if (!builder) {
      return;
    }

    await builder.ensurePropertiesForContentTypes(aliases);
  }

  #getWorkspaceSnapshot(): SavedSearchWorkspaceSnapshot {
    const lastSearch = this.#lastSearch!;

    return {
      matchMode: lastSearch.matchMode,
      conditions: lastSearch.conditions,
      searchCultureMode: lastSearch.searchCultureMode,
      culture: lastSearch.culture,
      pageSize: this._pageSize,
      sortColumn: this._sortColumn,
      sortDescending: this._sortDescending,
    };
  }

  #beginSearchExecution(): void {
    this._resultsFocusToken += 1;
    this._totalPages = 0;
    this._resultsState = {
      hasSearched: true,
      loading: true,
      results: [],
      totalCount: 0,
      executionTimeMs: null,
    };
  }

  async #executeSearch(): Promise<void> {
    if (!this.#lastSearch) {
      return;
    }

    this.#searchAbortController?.abort();
    const searchController = new AbortController();
    this.#searchAbortController = searchController;

    this._resultsState = {
      ...this._resultsState,
      hasSearched: true,
      loading: true,
    };

    try {
      const response = await this.#searchApi.search(
        toContentSearchApiRequest({
          matchMode: this.#lastSearch.matchMode,
          searchCultureMode: this.#lastSearch.searchCultureMode,
          culture: this.#lastSearch.culture,
          conditions: this.#lastSearch.conditions,
          pageIndex: this._currentPage - 1,
          pageSize: this._pageSize,
          sortColumn: this._sortColumn,
          sortDescending: this._sortDescending,
        }),
        searchController.signal,
      );

      if (this.#searchAbortController !== searchController) {
        return;
      }

      this._pageSize = response.pageSize;
      this._totalPages = resolveTotalPages(
        response.totalCount,
        response.pageSize,
        response.totalPages,
      );
      this._currentPage = clampPageNumber(response.pageIndex + 1, this._totalPages);
      this._resultsState = {
        hasSearched: true,
        loading: false,
        results: response.items.map(mapApiResultToRow),
        totalCount: response.totalCount,
        executionTimeMs: response.executionTimeMs ?? null,
      };
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      if (this.#searchAbortController !== searchController) {
        return;
      }

      this._errorMessage =
        error instanceof Error ? error.message : "Search failed. Please try again.";
      this._resultsState = {
        hasSearched: true,
        loading: false,
        results: [],
        totalCount: 0,
        executionTimeMs: null,
      };
      this._totalPages = 0;
    }
  }

  #getBuilderElement(): ContentSearchBuilderElement | null {
    return this.shadowRoot?.querySelector("content-search-builder") ?? null;
  }

  #getSavedSearchesElement(): ContentSearchSavedSearchesElement | null {
    return this.shadowRoot?.querySelector("content-search-saved-searches") ?? null;
  }

  static override readonly styles = [
    UmbTextStyles,
    ...contentSearchWorkspaceStyles,
  ];
}

export { ContentSearchWorkspaceElement as element };

declare global {
  interface HTMLElementTagNameMap {
    "content-search-workspace": ContentSearchWorkspaceElement;
  }
}

import {
  html,
  customElement,
  state,
  query,
  nothing,
} from "@umbraco-cms/backoffice/external/lit";
import { UmbTextStyles } from "@umbraco-cms/backoffice/style";
import { UmbLitElement } from "@umbraco-cms/backoffice/lit-element";
import { umbConfirmModal } from "@umbraco-cms/backoffice/modal";
import { UMB_VARIANT_CONTEXT } from "@umbraco-cms/backoffice/variant";
import type { UmbVariantContext } from "@umbraco-cms/backoffice/variant";
import { UMB_AUTH_CONTEXT } from "@umbraco-cms/backoffice/auth";
import type { UmbAuthContext } from "@umbraco-cms/backoffice/auth";
import "../filter-nodes-saved-filters/filter-nodes-saved-filters.element.js";
import "../filter-nodes-filter-builder/filter-nodes-filter-builder.element.js";
import "../filter-active-filters/filter-active-filters.element.js";
import "../filter-results-grid/filter-results-grid.element.js";
import {
  DEFAULT_FILTER_RESULTS_SORT,
  type FilterResultsGridColumn,
} from "../filter-results-grid/filter-results-grid.models.js";
import {
  FilterNodesWorkspaceController,
  FILTER_NODES_WORKSPACE_STATE_CHANGED,
} from "../../controllers/filter-nodes-workspace.controller.js";
import type { FilterNodesWorkspaceViewState } from "../../controllers/filter-nodes-workspace.models.js";
import type { EditableFilterCondition } from "../../controllers/filter-nodes-workspace.models.js";
import type {
  FilterType,
  FilterablePropertyMetadata,
  SearchCultureMode,
  SearchScope,
  ContentTypeListItem,
} from "../../models/filter-models.js";
import { createFilterApiService } from "../../services/filter-api-service.js";
import { getActiveFilterBadges, type ActiveFilterBadgeKind } from "../../utils/active-filter.utils.js";
import { conditionsMatch } from "../../utils/filter-builder-guidance.utils.js";
import { conditionsContainValues } from "../../utils/filter-condition.utils.js";
import type { PageSizeOption } from "../../constants/filter-nodes.constants.js";
import type { SavedFilter } from "../../models/saved-filter-models.js";
import type { FilterNodesSavedFiltersElement } from "../filter-nodes-saved-filters/filter-nodes-saved-filters.element.js";
import { filterNodesWorkspaceViewStyles } from "./filter-nodes-workspace-view.styles.js";

@customElement("filter-nodes-workspace-view")
export class FilterNodesWorkspaceViewElement extends UmbLitElement {
  #authContext?: UmbAuthContext;
  #variantContext?: UmbVariantContext;
  #controller?: FilterNodesWorkspaceController;
  #stateListener = (event: Event): void => {
    const state = (event as CustomEvent<FilterNodesWorkspaceViewState>).detail;
    this.#applyState(state);
  };

  @state()
  private _loading = false;

  @state()
  private _loadingMetadata = false;

  @state()
  private _loadingPropertyContentTypeAliases: readonly string[] = [];

  @state()
  private _filterType: FilterType = "All";

  @state()
  private _searchScope: SearchScope = "ContentType";

  @state()
  private _searchCultureMode: SearchCultureMode = "AllCultures";

  @state()
  private _culture = "";

  @state()
  private _languages: FilterNodesWorkspaceViewState["languages"] = [];

  @state()
  private _loadingLanguages = false;

  @state()
  private _showSearchablePropertiesOnly = true;

  @state()
  private _conditions: readonly EditableFilterCondition[] = [];

  @state()
  private _appliedConditions: readonly EditableFilterCondition[] = [];

  @state()
  private _appliedFilterType: FilterType = "All";

  @state()
  private _contentTypes: readonly ContentTypeListItem[] = [];

  @state()
  private _propertyMetadataByContentType: Readonly<
    Record<string, readonly FilterablePropertyMetadata[]>
  > = {};

  @state()
  private _results: FilterNodesWorkspaceViewState["results"] = [];

  @state()
  private _page = 1;

  @state()
  private _pageSize = 20;

  @state()
  private _totalCount = 0;

  @state()
  private _totalPages = 0;

  @state()
  private _hasSearched = false;

  @state()
  private _errorMessage?: string;

  @state()
  private _sortColumn: FilterResultsGridColumn =
    DEFAULT_FILTER_RESULTS_SORT.column;

  @state()
  private _sortDescending = DEFAULT_FILTER_RESULTS_SORT.descending;

  @state()
  private _savedFilters: readonly SavedFilter[] = [];

  @state()
  private _loadingSavedFilters = false;

  @state()
  private _savingSavedFilter = false;

  @state()
  private _selectedSavedFilterId = "";

  @query("filter-nodes-saved-filters")
  private _savedFiltersElement?: FilterNodesSavedFiltersElement;

  override connectedCallback(): void {
    super.connectedCallback();

    this.consumeContext(UMB_AUTH_CONTEXT, (authContext) => {
      if (!authContext) {
        return;
      }

      this.#authContext = authContext;

      this.observe(authContext.isAuthorized, (isAuthorized) => {
        if (!isAuthorized) {
          this.#tearDownController();
          return;
        }

        void this.#initializeController();
      });
    });

    this.consumeContext(UMB_VARIANT_CONTEXT, (variantContext) => {
      if (!variantContext) {
        return;
      }

      this.#variantContext = variantContext;

      this.observe(variantContext.appCulture, (culture) => {
        this.#controller?.setCurrentBackofficeCulture(culture);
      });
    });
  }

  override disconnectedCallback(): void {
    this.#tearDownController();
    super.disconnectedCallback();
  }

  override render() {
    return html`
      <umb-body-layout main-no-padding>
        <div class="workspace-view">
          ${this._errorMessage ? this.#renderError() : nothing}

          <uui-box class="workspace-view__card">
            <filter-nodes-saved-filters
              .savedFilters=${this._savedFilters}
              .selectedSavedFilterId=${this._selectedSavedFilterId}
              .loading=${this._loadingSavedFilters}
              .saving=${this._savingSavedFilter}
              .disabled=${this._loading}
              .saveDisabled=${this._searchScope === "EntireSite"}
              @filter-nodes-saved-filter-load=${this.#onSavedFilterLoad}
              @filter-nodes-saved-filter-save=${this.#onSavedFilterSave}
              @filter-nodes-saved-filter-delete=${this.#onSavedFilterDelete}
            ></filter-nodes-saved-filters>
          </uui-box>

          <uui-box class="workspace-view__card">
            <filter-nodes-filter-builder
              .filterType=${this._filterType}
              .searchScope=${this._searchScope}
              .searchCultureMode=${this._searchCultureMode}
              .culture=${this._culture}
              .languages=${this._languages}
              .loadingLanguages=${this._loadingLanguages}
              .conditions=${this._conditions}
              .hasSearched=${this._hasSearched}
              .hasDraftChanges=${this.#hasDraftChanges()}
              .contentTypes=${this._contentTypes}
              .propertyMetadataByContentType=${this._propertyMetadataByContentType}
              .loading=${this._loading}
              .loadingMetadata=${this._loadingMetadata}
              .loadingPropertyContentTypeAliases=${this._loadingPropertyContentTypeAliases}
              .showSearchablePropertiesOnly=${this._showSearchablePropertiesOnly}
              @filter-nodes-filter-type-change=${this.#onFilterTypeChange}
              @filter-nodes-search-scope-change=${this.#onSearchScopeChange}
              @filter-nodes-search-culture-mode-change=${this.#onSearchCultureModeChange}
              @filter-nodes-culture-change=${this.#onCultureChange}
              @filter-nodes-show-searchable-properties-only-change=${this.#onShowSearchablePropertiesOnlyChange}
              @filter-nodes-condition-change=${this.#onConditionChange}
              @filter-nodes-condition-remove=${this.#onConditionRemove}
              @filter-nodes-condition-add=${this.#onConditionAdd}
              @filter-nodes-search=${this.#onSearch}
              @filter-nodes-clear-all=${this.#onClearAll}
            ></filter-nodes-filter-builder>
          </uui-box>

          <uui-box class="workspace-view__card workspace-view__card--results">
            ${this._hasSearched
              ? html`
                  <filter-active-filters
                    .badges=${getActiveFilterBadges(this._appliedConditions, {
                      propertyMetadataByContentType:
                        this._propertyMetadataByContentType,
                      searchScope: this._searchScope,
                      contentTypes: this._contentTypes,
                    })}
                    .loading=${this._loading}
                    @filter-active-filters-remove=${this.#onActiveFilterRemove}
                  ></filter-active-filters>
                `
              : nothing}
            <filter-results-grid
              .results=${this._results}
              .searchCultureMode=${this._searchCultureMode}
              .conditions=${this._appliedConditions}
              .propertyMetadataByContentType=${this._propertyMetadataByContentType}
              .loading=${this._loading}
              .hasSearched=${this._hasSearched}
              .currentPage=${this._page}
              .totalPages=${this._totalPages}
              .totalCount=${this._totalCount}
              .pageSize=${this._pageSize}
              .sortColumn=${this._sortColumn}
              .sortDescending=${this._sortDescending}
              @filter-results-page-change=${this.#onPageChange}
              @filter-results-page-size-change=${this.#onPageSizeChange}
              @filter-results-sort-change=${this.#onSortChange}
            ></filter-results-grid>
          </uui-box>
        </div>
      </umb-body-layout>
    `;
  }

  #renderError() {
    return html`
      <uui-alert
        class="workspace-view__error"
        headline="Something went wrong"
        .detail=${this._errorMessage}
        color="danger"
      ></uui-alert>
    `;
  }

  #initializeController(): void {
    if (!this.#authContext || this.#controller) {
      return;
    }

    const api = createFilterApiService();
    this.#controller = new FilterNodesWorkspaceController(api);
    this.#controller.addEventListener(
      FILTER_NODES_WORKSPACE_STATE_CHANGED,
      this.#stateListener,
    );
    this.#applyState(this.#controller.getState());
    void this.#controller.initialize();
  }

  #tearDownController(): void {
    this.#controller?.removeEventListener(
      FILTER_NODES_WORKSPACE_STATE_CHANGED,
      this.#stateListener,
    );
    this.#controller?.destroy();
    this.#controller = undefined;
  }

  #applyState(state: FilterNodesWorkspaceViewState): void {
    this._loading = state.loading;
    this._loadingMetadata = state.loadingMetadata;
    this._loadingPropertyContentTypeAliases =
      state.loadingPropertyContentTypeAliases;
    this._filterType = state.filterType;
    this._searchScope = state.searchScope;
    this._searchCultureMode = state.searchCultureMode;
    this._culture = state.culture;
    this._languages = state.languages;
    this._loadingLanguages = state.loadingLanguages;
    this._showSearchablePropertiesOnly = state.showSearchablePropertiesOnly;
    this._conditions = state.conditions;
    this._appliedConditions = state.appliedConditions;
    this._appliedFilterType = state.appliedFilterType;
    this._contentTypes = state.contentTypes;
    this._propertyMetadataByContentType = state.propertyMetadataByContentType;
    this._results = state.results;
    this._page = state.page;
    this._pageSize = state.pageSize;
    this._totalCount = state.totalCount;
    this._totalPages = state.totalPages;
    this._hasSearched = state.hasSearched;
    this._errorMessage = state.errorMessage;
    this._savedFilters = state.savedFilters;
    this._loadingSavedFilters = state.loadingSavedFilters;
    this._savingSavedFilter = state.savingSavedFilter;
    this._selectedSavedFilterId = state.selectedSavedFilterId;
    this._sortColumn = state.sortColumn;
    this._sortDescending = state.sortDescending;
  }

  #hasDraftChanges(): boolean {
    if (!this._hasSearched) {
      return false;
    }

    return (
      this._filterType !== this._appliedFilterType ||
      !conditionsMatch(this._conditions, this._appliedConditions)
    );
  }

  #onFilterTypeChange(event: CustomEvent<{ filterType: FilterType }>): void {
    this.#controller?.setFilterType(event.detail.filterType);
  }

  #onSearchScopeChange(event: CustomEvent<{ searchScope: SearchScope }>): void {
    this.#controller?.setSearchScope(event.detail.searchScope);
  }

  #onSearchCultureModeChange(
    event: CustomEvent<{ searchCultureMode: SearchCultureMode }>,
  ): void {
    this.#controller?.setSearchCultureMode(event.detail.searchCultureMode);

    if (event.detail.searchCultureMode === "CurrentCulture") {
      void this.#variantContext?.getAppCulture().then((culture) => {
        this.#controller?.setCurrentBackofficeCulture(culture);
      });
    }
  }

  #onCultureChange(event: CustomEvent<{ culture: string }>): void {
    this.#controller?.setCulture(event.detail.culture);
  }

  #onShowSearchablePropertiesOnlyChange(
    event: CustomEvent<{ showSearchablePropertiesOnly: boolean }>,
  ): void {
    this.#controller?.setShowSearchablePropertiesOnly(
      event.detail.showSearchablePropertiesOnly,
    );
  }

  #onConditionChange(
    event: CustomEvent<{
      conditionId: string;
      patch: Partial<EditableFilterCondition>;
    }>,
  ): void {
    void this.#controller?.updateCondition(
      event.detail.conditionId,
      event.detail.patch,
    );
  }

  #onConditionRemove(event: CustomEvent<{ conditionId: string }>): void {
    this.#controller?.removeCondition(event.detail.conditionId);
  }

  #onConditionAdd(): void {
    this.#controller?.addCondition();
  }

  #onSearch(): void {
    void this.#controller?.search();
  }

  #onActiveFilterRemove(
    event: CustomEvent<{ conditionId: string; kind: ActiveFilterBadgeKind }>,
  ): void {
    void this.#controller?.removeActiveFilterBadgeAndSearch(
      event.detail.conditionId,
      event.detail.kind,
    );
  }

  async #onClearAll(): Promise<void> {
    if (!this.#controller) {
      return;
    }

    const state = this.#controller.getState();
    const needsConfirmation = conditionsContainValues(
      state.conditions,
      state.filterType,
    );

    if (needsConfirmation) {
      const confirmed = await umbConfirmModal(this, {
        headline: "Clear search",
        content:
          "This will remove all conditions and clear your results. Are you sure?",
        color: "warning",
        confirmLabel: "Clear",
      }).catch(() => false);

      if (confirmed === false) {
        return;
      }
    }

    this.#controller.clearAll();
  }

  #onPageChange(event: CustomEvent<{ page: number }>): void {
    void this.#controller?.goToPage(event.detail.page);
  }

  #onPageSizeChange(event: CustomEvent<{ pageSize: number }>): void {
    void this.#controller?.setPageSize(event.detail.pageSize as PageSizeOption);
  }

  #onSortChange(
    event: CustomEvent<{ column: FilterResultsGridColumn; descending: boolean }>,
  ): void {
    void this.#controller?.setSort(event.detail.column, event.detail.descending);
  }

  #onSavedFilterLoad(
    event: CustomEvent<{ savedFilterId: string }>,
  ): void {
    void this.#controller?.loadSavedFilter(event.detail.savedFilterId);
  }

  async #onSavedFilterSave(
    event: CustomEvent<{ name: string }>,
  ): Promise<void> {
    if (!this.#controller) {
      return;
    }

    await this.#controller.saveCurrentFilter(event.detail.name);

    if (!this.#controller.getState().errorMessage) {
      this._savedFiltersElement?.resetSaveForm();
    }
  }

  #onSavedFilterDelete(
    event: CustomEvent<{ savedFilterId: string }>,
  ): void {
    void this.#controller?.deleteSavedFilter(event.detail.savedFilterId);
  }

  static override readonly styles = [
    UmbTextStyles,
    ...filterNodesWorkspaceViewStyles,
  ];
}

export { FilterNodesWorkspaceViewElement as element };

declare global {
  interface HTMLElementTagNameMap {
    "filter-nodes-workspace-view": FilterNodesWorkspaceViewElement;
  }
}

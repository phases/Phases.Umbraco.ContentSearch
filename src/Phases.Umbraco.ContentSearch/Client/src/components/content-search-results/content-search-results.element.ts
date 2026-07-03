import {
  html,
  customElement,
  property,
  state,
  nothing,
  type PropertyValues,
} from "@umbraco-cms/backoffice/external/lit";
import "./content-search-results-table.element.js";
import type { ContentSearchResultsTableElement } from "./content-search-results-table.element.js";
import { UmbTextStyles } from "@umbraco-cms/backoffice/style";
import { UmbLitElement } from "@umbraco-cms/backoffice/lit-element";
import { RESULTS_TITLE } from "../../constants/content-search.constants.js";
import {
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
  type PageSizeOption,
} from "../../constants/search-results.constants.js";
import type { LanguageListItem, SearchCultureMode } from "../../models/search-culture.models.js";
import type { SearchContentTypeOption } from "../../models/search-builder.models.js";
import type { ContentSearchResultsState } from "../../models/search-results.models.js";
import { createInitialResultsState } from "../../models/search-results.models.js";
import { createMetadataApiService } from "../../services/metadata-api-service.js";
import { buildContentTypeLookup } from "../../utils/content-type-lookup.utils.js";
import {
  contentSearchSectionHeaderStyles,
  contentSearchUiTokens,
  contentSearchSrOnlyStyles,
} from "../../styles/content-search-ui.styles.js";
import { formatSearchCultureSummary, shouldShowMatchedCultureColumn } from "../../utils/search-culture.utils.js";
import { isServerSortableColumn } from "../../utils/content-search-results-sort.utils.js";
import { clampPageNumber } from "../../utils/pagination.utils.js";
import { formatSearchResultsSummary } from "../../utils/search-results-summary.utils.js";
import {
  buildTableItemsCacheKey,
  CONTENT_SEARCH_RESULTS_TABLE_CONFIG,
  getContentSearchResultsColumns,
  isContentSearchResultsGridColumn,
  mapResultsToTableItems,
} from "./content-search-results.mapper.js";
import {
  CONTENT_SEARCH_RESULTS_PAGE_CHANGE,
  CONTENT_SEARCH_RESULTS_PAGE_SIZE_CHANGE,
  CONTENT_SEARCH_RESULTS_SORT_CHANGE,
  CONTENT_SEARCH_CLEAR_RESULTS,
  DEFAULT_CONTENT_SEARCH_RESULTS_SORT,
  type ContentSearchResultsGridColumn,
} from "./content-search-results.models.js";
import {
  CONTENT_SEARCH_EXPORT,
  type ContentExportFormat,
} from "../../models/search-export.models.js";
import { contentSearchResultsStyles } from "./content-search-results.styles.js";
import {
  loadContentSearchResultsDisplayPreferences,
  saveContentSearchResultsDisplayPreferences,
  type ContentSearchResultsDisplayPreferences,
} from "./content-search-results-display-preferences.js";
import "../content-search-empty-state/content-search-empty-state.element.js";
import "./column-layouts/content-search-name-column.element.js";
import "./column-layouts/content-search-match-column.element.js";
import "./column-layouts/content-search-content-type-column.element.js";
import "./column-layouts/content-search-url-column.element.js";
import "./column-layouts/content-search-actions-column.element.js";
import "./column-layouts/content-search-path-column.element.js";
import "./column-layouts/content-search-date-column.element.js";
import "../content-search-expandable-panel/content-search-expandable-panel.element.js";

@customElement("content-search-results")
export class ContentSearchResultsElement extends UmbLitElement {
  @property({ attribute: false })
  resultsState: ContentSearchResultsState = createInitialResultsState();

  @property({ type: String })
  searchCultureMode: SearchCultureMode = "AllCultures";

  @property({ type: String })
  culture = "";

  @property({ type: Array })
  languages: readonly LanguageListItem[] = [];

  @property({ type: Number })
  currentPage = 1;

  @property({ type: Number })
  totalPages = 0;

  @property({ type: Number })
  pageSize = DEFAULT_PAGE_SIZE;

  @property({ type: String })
  sortColumn: ContentSearchResultsGridColumn =
    DEFAULT_CONTENT_SEARCH_RESULTS_SORT.column;

  @property({ type: Boolean })
  sortDescending = DEFAULT_CONTENT_SEARCH_RESULTS_SORT.descending;

  @property({ type: Array })
  highlightTerms: readonly string[] = [];

  @property({ type: Number })
  resultsFocusToken = 0;

  @property({ type: Boolean })
  exporting = false;

  readonly #exportPopoverId = `cs-export-popover-${crypto.randomUUID()}`;

  @state()
  private _tableItems = mapResultsToTableItems([], {
    languages: [],
    contentTypeLookup: buildContentTypeLookup([]),
  });

  @state()
  private _contentTypes: readonly SearchContentTypeOption[] = [];

  @state()
  private _pageJumpValue = "1";

  @state()
  private _displayPreferences: ContentSearchResultsDisplayPreferences =
    loadContentSearchResultsDisplayPreferences();

  #tableItemsCacheKey = "";
  #metadataApi = createMetadataApiService();
  #pendingResultsFocus = false;

  override connectedCallback(): void {
    super.connectedCallback();
    this._displayPreferences = loadContentSearchResultsDisplayPreferences();
    void this.#loadContentTypes();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
  }

  protected override willUpdate(changedProperties: PropertyValues<this>): void {
    super.willUpdate(changedProperties);

    if (changedProperties.has("currentPage") || changedProperties.has("totalPages")) {
      this._pageJumpValue = String(this.currentPage);
    }

    if (
      changedProperties.has("resultsState") ||
      changedProperties.has("languages") ||
      changedProperties.has("highlightTerms")
    ) {
      this.#syncTableItems();
    }

    if (changedProperties.has("resultsFocusToken")) {
      this.#pendingResultsFocus = true;
    }
  }

  protected override updated(changedProperties: PropertyValues<this>): void {
    super.updated(changedProperties);

    const loading = this.resultsState.loading;

    if (
      this.#pendingResultsFocus &&
      this.resultsState.hasSearched &&
      !loading &&
      changedProperties.has("resultsState")
    ) {
      this.#pendingResultsFocus = false;
      this.#focusResultsArea();
    }
  }

  override render() {
    if (this.#shouldRenderInitialEmptyState()) {
      return this.#renderInitialEmptyState();
    }

    return this.#renderResults();
  }

  #shouldRenderInitialEmptyState(): boolean {
    return (
      !this.resultsState.hasSearched &&
      this.resultsState.results.length === 0 &&
      !this.resultsState.loading
    );
  }

  #shouldRenderNoResultsState(): boolean {
    return (
      this.resultsState.hasSearched &&
      this.resultsState.results.length === 0 &&
      !this.resultsState.loading
    );
  }

  #renderFocusAnchor() {
    return html`
      <div
        class="results-grid__focus-anchor"
        tabindex="-1"
        aria-label="Search results"
      ></div>
    `;
  }

  #renderHeader() {
    const meta = this.#renderHeaderMeta();
    const showClearResults =
      this.resultsState.hasSearched && !this.resultsState.loading;

    return html`
      <header class="cs-section-header results-grid__header">
        <div class="cs-section-header__leading results-grid__header-copy">
          <h2 class="cs-section-header__title">${RESULTS_TITLE}</h2>
        </div>
        <div class="results-grid__header-actions">
          ${this.#renderExportControl()}
          ${showClearResults
            ? html`
                <uui-button
                  look="outline"
                  compact
                  label="Clear results"
                  @click=${this.#onClearResults}
                >
                  Clear results
                </uui-button>
              `
            : nothing}
          ${meta ? html`<div class="results-grid__header-meta">${meta}</div>` : nothing}
        </div>
      </header>
    `;
  }

  #renderExportControl() {
    if (!this.resultsState.hasSearched) {
      return nothing;
    }

    const canExport =
      this.resultsState.totalCount > 0 &&
      !this.resultsState.loading &&
      !this.exporting;

    return html`
      <uui-button
        class="results-grid__export"
        look="secondary"
        compact
        popovertarget=${this.#exportPopoverId}
        label="Export results"
        ?disabled=${!canExport}
      >
        <uui-icon name="icon-document-spreadsheet"></uui-icon>
        Export
        <uui-symbol-expand class="results-grid__export-caret"></uui-symbol-expand>
      </uui-button>
      <uui-popover-container
        id=${this.#exportPopoverId}
        placement="bottom-end"
        margin="6"
      >
        <umb-popover-layout>
          <uui-menu-item
            label="Export CSV"
            @click-label=${() => this.#onExport("Csv")}
          ></uui-menu-item>
          <uui-menu-item
            label="Export Excel"
            @click-label=${() => this.#onExport("Excel")}
          ></uui-menu-item>
        </umb-popover-layout>
      </uui-popover-container>
    `;
  }

  #onExport(format: ContentExportFormat): void {
    if (this.resultsState.totalCount <= 0 || this.resultsState.loading || this.exporting) {
      return;
    }

    this.dispatchEvent(
      new CustomEvent(CONTENT_SEARCH_EXPORT, {
        detail: { format },
        bubbles: true,
        composed: true,
      }),
    );
  }

  #onClearResults(): void {
    this.dispatchEvent(
      new CustomEvent(CONTENT_SEARCH_CLEAR_RESULTS, {
        bubbles: true,
        composed: true,
      }),
    );
  }

  #renderHeaderMeta() {
    if (this.resultsState.loading) {
      return undefined;
    }

    const executionTimeMs = this.resultsState.executionTimeMs;

    if (
      !this.resultsState.hasSearched ||
      executionTimeMs === null ||
      executionTimeMs === undefined
    ) {
      return undefined;
    }

    return html`
      <span class="results-grid__meta" aria-live="polite">
        ${formatSearchResultsSummary(this.resultsState.totalCount, executionTimeMs)}
      </span>
    `;
  }

  #renderInitialEmptyState() {
    return html`
      <div class="results-grid">
        ${this.#renderFocusAnchor()}
        ${this.#renderHeader()}
        <div class="results-grid__empty">
          <content-search-empty-state variant="initial" compact></content-search-empty-state>
        </div>
      </div>
    `;
  }

  #renderResults() {
    return html`
      <div class="results-grid">
        ${this.#renderFocusAnchor()}
        ${this.#renderHeader()}
        <div class="results-grid__content">
          ${this.#renderResultsBody()}
        </div>
      </div>
    `;
  }

  #renderResultsBody() {
    if (this.resultsState.results.length > 0) {
      return this.#renderGridBody();
    }

    if (this.#shouldRenderNoResultsState()) {
      return this.#renderNoResultsBody();
    }

    return html`<div class="results-grid__placeholder" aria-hidden="true"></div>`;
  }

  #renderNoResultsBody() {
    return html`
      <div class="results-grid__empty">
        <content-search-empty-state
          variant="no-results"
          compact
          show-clear-button
        ></content-search-empty-state>
      </div>
    `;
  }

  #renderGridBody() {
    const showCultureColumn = shouldShowMatchedCultureColumn(
      this.searchCultureMode,
      this.resultsState.results,
    );
    const columns = getContentSearchResultsColumns(
      this._displayPreferences,
      showCultureColumn,
    );

    return html`
      <div class="results-grid__table-shell">
        ${this.#renderDisplayOptions()}

        <div class="results-grid__table-scroll">
          <content-search-results-table
            .config=${CONTENT_SEARCH_RESULTS_TABLE_CONFIG}
            .columns=${columns}
            .items=${this._tableItems}
            .orderingColumn=${this.sortColumn}
            .orderingDesc=${this.sortDescending}
            @ordered=${this.#onTableOrdered}
          ></content-search-results-table>
        </div>

        ${this.#renderPaginationControls()}
      </div>
    `;
  }

  #renderDisplayOptions() {
    if (!this.resultsState.hasSearched) {
      return undefined;
    }

    const cultureSummary = formatSearchCultureSummary(
      this.searchCultureMode,
      this.culture,
      this.languages,
    );

    return html`
      <content-search-expandable-panel
        label="Display options"
        triggerAlign="right"
        embedded
        ?defaultExpanded=${false}
      >
        <div class="results-grid__options">
          <p class="results-grid__options-line">
            <span class="results-grid__options-label">Culture</span>
            ${cultureSummary}
          </p>
          <div class="results-grid__options-checkboxes">
            ${this.#renderDisplayPreferenceCheckbox("showPath", "Show Path")}
            ${this.#renderDisplayPreferenceCheckbox("showUrl", "Show URL")}
            ${this.#renderDisplayPreferenceCheckbox("showCreateDate", "Show Created Date")}
            ${this.#renderDisplayPreferenceCheckbox("showUpdateDate", "Show Updated Date")}
          </div>
        </div>
      </content-search-expandable-panel>
    `;
  }

  #renderDisplayPreferenceCheckbox(
    key: keyof ContentSearchResultsDisplayPreferences,
    label: string,
  ) {
    return html`
      <uui-checkbox
        label=${label}
        .checked=${this._displayPreferences[key]}
        ?disabled=${this.resultsState.loading}
        @change=${(event: Event) => this.#onDisplayPreferenceChange(key, event)}
      ></uui-checkbox>
    `;
  }

  #onDisplayPreferenceChange(
    key: keyof ContentSearchResultsDisplayPreferences,
    event: Event,
  ): void {
    const checked = (event.target as HTMLInputElement).checked;
    this._displayPreferences = {
      ...this._displayPreferences,
      [key]: checked,
    };
    saveContentSearchResultsDisplayPreferences(this._displayPreferences);
    this.#tableItemsCacheKey = "";
    this.#syncTableItems();
  }

  #renderPageSizeSelect() {
    return html`
      <uui-select
        class="results-grid__page-size-select"
        label="Page size"
        .value=${String(this.pageSize)}
        .options=${PAGE_SIZE_OPTIONS.map((size) => ({
          name: String(size),
          value: String(size),
          selected: size === this.pageSize,
        }))}
        ?disabled=${this.resultsState.loading}
        @change=${this.#onPageSizeSelectChange}
      ></uui-select>
    `;
  }

  #onPageSizeSelectChange(event: Event): void {
    const select = event.target as { value?: string };
    const pageSize = Number.parseInt(select.value ?? "", 10);

    if (!PAGE_SIZE_OPTIONS.includes(pageSize as PageSizeOption)) {
      return;
    }

    this.#dispatchPageSizeChange(pageSize);
  }

  #renderPaginationControls() {
    if (!this.resultsState.hasSearched || this.resultsState.totalCount <= 0) {
      return undefined;
    }

    const effectiveTotalPages = this.#getEffectiveTotalPages();
    const showPageNavigation = effectiveTotalPages > 1;

    return html`
      <footer
        class="results-grid__pagination ${this.resultsState.loading
          ? "results-grid__pagination--loading"
          : ""}"
        aria-label="Results pagination"
      >
        <p class="results-grid__pagination-summary">${this.#renderPaginationSummary()}</p>

        <div class="results-grid__pagination-controls">
          ${this.#renderPageSizeSelect()}

          ${showPageNavigation
            ? html`
                <uui-pagination
                  .current=${this.currentPage}
                  .total=${effectiveTotalPages}
                  firstlabel="First"
                  previouslabel="Previous"
                  nextlabel="Next"
                  lastlabel="Last"
                  @change=${this.#onPageChange}
                ></uui-pagination>
                ${this.#renderPageJump(effectiveTotalPages)}
              `
            : nothing}
        </div>
      </footer>
    `;
  }

  #renderPageJump(totalPages: number) {
    return html`
      <div class="results-grid__page-jump">
        <uui-input
          class="results-grid__page-jump-input"
          label="Go to page"
          type="number"
          min="1"
          max=${totalPages}
          .value=${this._pageJumpValue}
          ?disabled=${this.resultsState.loading}
          @input=${this.#onPageJumpInput}
          @keydown=${this.#onPageJumpKeydown}
        ></uui-input>
        <uui-button
          look="secondary"
          label="Go to page"
          ?disabled=${this.resultsState.loading}
          @click=${this.#onPageJumpSubmit}
        >
          Go
        </uui-button>
      </div>
    `;
  }

  #renderPaginationSummary(): string {
    const effectiveTotalPages = this.#getEffectiveTotalPages();
    const pageLabel =
      effectiveTotalPages > 1
        ? `Page ${this.currentPage} of ${effectiveTotalPages}`
        : "Page 1";

    if (this.resultsState.totalCount <= 0) {
      return `${pageLabel} · No matches`;
    }

    const start = (this.currentPage - 1) * this.pageSize + 1;
    const end = Math.min(this.currentPage * this.pageSize, this.resultsState.totalCount);

    return `${pageLabel} · ${start}–${end} of ${this.resultsState.totalCount}`;
  }

  #getEffectiveTotalPages(): number {
    if (this.totalPages > 0) {
      return this.totalPages;
    }

    if (this.resultsState.totalCount <= 0 || this.pageSize <= 0) {
      return 0;
    }

    return Math.ceil(this.resultsState.totalCount / this.pageSize);
  }

  #onPageJumpInput(event: Event): void {
    this._pageJumpValue = (event.target as HTMLInputElement).value;
  }

  #onPageJumpKeydown(event: KeyboardEvent): void {
    if (event.key !== "Enter") {
      return;
    }

    event.preventDefault();
    this.#onPageJumpSubmit();
  }

  #onPageJumpSubmit(): void {
    const totalPages = this.#getEffectiveTotalPages();
    const page = Number.parseInt(this._pageJumpValue, 10);

    if (
      !Number.isFinite(page) ||
      page < 1 ||
      page > totalPages ||
      page === this.currentPage ||
      this.resultsState.loading
    ) {
      this._pageJumpValue = String(this.currentPage);
      return;
    }

    this.#dispatchPageChange(page);
  }

  #onTableOrdered(event: Event): void {
    if (this.resultsState.loading) {
      return;
    }

    const table = event.target as ContentSearchResultsTableElement;
    const column = table.orderingColumn;

    if (!isContentSearchResultsGridColumn(column) || !isServerSortableColumn(column)) {
      return;
    }

    this.dispatchEvent(
      new CustomEvent(CONTENT_SEARCH_RESULTS_SORT_CHANGE, {
        detail: {
          column,
          descending: table.orderingDesc,
        },
        bubbles: true,
        composed: true,
      }),
    );
  }

  #onPageChange(event: Event): void {
    if (this.resultsState.loading) {
      return;
    }

    const pagination = event.currentTarget as { current?: number } | null;
    const page = pagination?.current;

    if (!page || page === this.currentPage) {
      return;
    }

    const totalPages = this.#getEffectiveTotalPages();
    const nextPage = clampPageNumber(page, totalPages);

    if (nextPage === this.currentPage) {
      return;
    }

    this.#dispatchPageChange(nextPage);
  }

  #dispatchPageChange(page: number): void {
    this.dispatchEvent(
      new CustomEvent(CONTENT_SEARCH_RESULTS_PAGE_CHANGE, {
        detail: { page },
        bubbles: true,
        composed: true,
      }),
    );
  }

  #dispatchPageSizeChange(pageSize: number): void {
    if (pageSize === this.pageSize || this.resultsState.loading) {
      return;
    }

    this.dispatchEvent(
      new CustomEvent(CONTENT_SEARCH_RESULTS_PAGE_SIZE_CHANGE, {
        detail: { pageSize },
        bubbles: true,
        composed: true,
      }),
    );
  }

  #syncTableItems(): void {
    const cacheKey = [
      this.resultsState.loading ? "loading" : "idle",
      buildTableItemsCacheKey(this.resultsState.results, this.highlightTerms),
      this._displayPreferences.showUrl ? "url" : "no-url",
      this._contentTypes
        .map((contentType) => `${contentType.alias}:${contentType.icon ?? ""}`)
        .join("\u0002"),
    ].join("\u0003");

    if (cacheKey === this.#tableItemsCacheKey) {
      return;
    }

    this.#tableItemsCacheKey = cacheKey;
    this._tableItems = mapResultsToTableItems(this.resultsState.results, {
      languages: this.languages,
      contentTypeLookup: buildContentTypeLookup(this._contentTypes),
      highlightTerms: this.highlightTerms,
      showUrlColumn: this._displayPreferences.showUrl,
    });
  }

  async #loadContentTypes(): Promise<void> {
    try {
      const contentTypes = await this.#metadataApi.getContentTypes();
      this._contentTypes = contentTypes;
      this.#syncTableItems();
    } catch {
      this._contentTypes = [];
      this.#syncTableItems();
    }
  }

  #focusResultsArea(): void {
    requestAnimationFrame(() => {
      const anchor = this.renderRoot.querySelector<HTMLElement>(
        ".results-grid__focus-anchor",
      );

      anchor?.scrollIntoView({ behavior: "smooth", block: "start" });
      anchor?.focus({ preventScroll: true });
    });
  }

  static override readonly styles = [
    UmbTextStyles,
    contentSearchUiTokens,
    contentSearchSectionHeaderStyles,
    contentSearchSrOnlyStyles,
    ...contentSearchResultsStyles,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    "content-search-results": ContentSearchResultsElement;
  }
}

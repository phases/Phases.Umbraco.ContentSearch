import {
  html,
  customElement,
  property,
  state,
  nothing,
  type PropertyValues,
} from "@umbraco-cms/backoffice/external/lit";
import type { UmbTableElement } from "@umbraco-cms/backoffice/components";
import { UmbTextStyles } from "@umbraco-cms/backoffice/style";
import { UmbLitElement } from "@umbraco-cms/backoffice/lit-element";
import {
  buildTableItemsCacheKey,
  FILTER_RESULTS_TABLE_CONFIG,
  getFilterResultsGridColumns,
  isFilterResultsGridColumn,
  mapResultsToTableItems,
} from "./filter-results-grid.mapper.js";
import {
  DEFAULT_FILTER_RESULTS_SORT,
  FILTER_RESULTS_PAGE_CHANGE,
  FILTER_RESULTS_PAGE_SIZE_CHANGE,
  FILTER_RESULTS_SORT_CHANGE,
  RESULTS_INITIAL_EMPTY_STATE_EXAMPLES,
  type FilterResultRow,
  type FilterResultsEmptyVariant,
  type FilterResultsGridColumn,
} from "./filter-results-grid.models.js";
import type { EditableFilterCondition } from "../../controllers/filter-nodes-workspace.models.js";
import type { FilterablePropertyMetadata, SearchCultureMode } from "../../models/filter-models.js";
import { PAGE_SIZE_OPTIONS, type PageSizeOption } from "../../constants/filter-nodes.constants.js";
import { filterResultsGridStyles } from "./filter-results-grid.styles.js";
import "./column-layouts/filter-results-name-column.element.js";
import "./column-layouts/filter-results-url-column.element.js";
import "./column-layouts/filter-results-actions-column.element.js";

@customElement("filter-results-grid")
export class FilterResultsGridElement extends UmbLitElement {
  @property({ type: Array })
  results: readonly FilterResultRow[] = [];

  @property({ type: String })
  searchCultureMode: SearchCultureMode = "AllCultures";

  @property({ type: Boolean })
  loading = false;

  @property({ type: Boolean })
  hasSearched = false;

  @property({ type: Number })
  currentPage = 1;

  @property({ type: Number })
  totalPages = 0;

  @property({ type: Number })
  totalCount = 0;

  @property({ type: Number })
  pageSize = 20;

  @property({ type: String })
  sortColumn: FilterResultsGridColumn = DEFAULT_FILTER_RESULTS_SORT.column;

  @property({ type: Boolean })
  sortDescending = DEFAULT_FILTER_RESULTS_SORT.descending;

  @property({ type: Array })
  conditions: readonly EditableFilterCondition[] = [];

  @property({ attribute: false })
  propertyMetadataByContentType: Readonly<
    Record<string, readonly FilterablePropertyMetadata[]>
  > = {};

  @state()
  private _tableItems = mapResultsToTableItems([]);

  @state()
  private _pageJumpValue = "";

  #tableItemsCacheKey = "";

  protected override willUpdate(changedProperties: PropertyValues<this>): void {
    super.willUpdate(changedProperties);

    if (changedProperties.has("currentPage")) {
      this._pageJumpValue = String(this.currentPage);
    }

    if (
      changedProperties.has("results") ||
      changedProperties.has("conditions") ||
      changedProperties.has("propertyMetadataByContentType") ||
      changedProperties.has("searchCultureMode")
    ) {
      this.#syncTableItems();
    }
  }

  override render() {
    if (this.#shouldRenderInitialEmptyState()) {
      return this.#renderEmptyState("initial");
    }

    if (this.#shouldRenderLoadingState()) {
      return this.#renderLoadingState();
    }

    if (this.#shouldRenderNoResultsState()) {
      return html`
        <div class="results-grid">
          ${this.#renderSectionHeader("No matches for this search")}
          ${this.#renderSearchFeedback()}
          ${this.#renderEmptyState("no-results")}
        </div>
      `;
    }

    return this.#renderGrid();
  }

  #shouldRenderInitialEmptyState(): boolean {
    return !this.hasSearched && this.results.length === 0 && !this.loading;
  }

  #shouldRenderLoadingState(): boolean {
    return this.loading && this.results.length === 0;
  }

  #shouldRenderNoResultsState(): boolean {
    return this.hasSearched && this.results.length === 0 && !this.loading;
  }

  #renderSectionHeader(subtitle?: string) {
    return html`
      <header class="fn-section-header results-grid__header">
        <h3 class="fn-section-header__title">Results</h3>
        ${subtitle
          ? html`<p class="fn-section-header__description">${subtitle}</p>`
          : nothing}
      </header>
    `;
  }

  #renderLoadingState() {
    return html`
      <div class="results-grid">
        ${this.#renderSectionHeader()}
        <div class="loading-state" role="status" aria-live="polite" aria-busy="true">
          <uui-loader></uui-loader>
          <p class="loading-state__label">Searching your content…</p>
        </div>
      </div>
    `;
  }

  #renderEmptyState(variant: FilterResultsEmptyVariant) {
    if (variant === "initial") {
      return this.#renderInitialEmptyState();
    }

    const content = this.#getEmptyStateContent(variant);

    return html`
      <div class="empty-state">
        <h4 class="empty-state__title">${content.title}</h4>
        <p class="empty-state__description">${content.description}</p>
      </div>
    `;
  }

  #renderInitialEmptyState() {
    return html`
      <div class="results-grid">
        ${this.#renderSectionHeader()}
        <div class="empty-state empty-state--initial">
          <h4 class="empty-state__title">No search executed yet</h4>
          <p class="empty-state__description">
            Build a query above and click Search to view matching content.
          </p>
          <p class="empty-state__examples-label">Helpful examples:</p>
          <ul class="empty-state__examples">
            ${RESULTS_INITIAL_EMPTY_STATE_EXAMPLES.map(
              (example) => html`<li>${example}</li>`,
            )}
          </ul>
        </div>
      </div>
    `;
  }

  #renderGrid() {
    const subtitle =
      this.totalCount > 0
        ? `${this.totalCount} matching ${this.totalCount === 1 ? "item" : "items"} found`
        : "Matching content";
    const columns = getFilterResultsGridColumns(this.searchCultureMode, this.results);

    return html`
      <div class="results-grid">
        ${this.#renderSectionHeader(subtitle)}

        ${this.#renderSearchFeedback()}

        <div
          class="results-grid__table ${this.loading ? "results-grid__table--loading" : ""}"
        >
          ${this.loading ? this.#renderTableLoadingOverlay() : nothing}
          <umb-table
            .config=${FILTER_RESULTS_TABLE_CONFIG}
            .columns=${columns}
            .items=${this._tableItems}
            .orderingColumn=${this.sortColumn}
            .orderingDesc=${this.sortDescending}
            ?sortable=${!this.loading}
            @ordered=${this.#onTableOrdered}
          ></umb-table>
        </div>

        ${this.#renderPaginationControls()}
      </div>
    `;
  }

  #renderTableLoadingOverlay() {
    return html`
      <div class="results-grid__loading" role="status" aria-live="polite" aria-busy="true">
        <uui-loader></uui-loader>
      </div>
    `;
  }

  #renderSearchFeedback() {
    if (!this.hasSearched) {
      return undefined;
    }

    return html`
      <div class="results-grid__feedback" role="status" aria-live="polite">
        <p class="results-grid__summary">${this.#renderSearchSummary()}</p>
        <div class="results-grid__page-size">
          <span class="results-grid__page-size-label">Page size</span>
          <uui-button-group>
            ${PAGE_SIZE_OPTIONS.map((size) => this.#renderPageSizeButton(size))}
          </uui-button-group>
        </div>
      </div>
    `;
  }

  #renderPageSizeButton(size: PageSizeOption) {
    return html`
      <uui-button
        look=${this.pageSize === size ? "primary" : "secondary"}
        label=${`Show ${size} results per page`}
        ?disabled=${this.loading}
        @click=${() => this.#dispatchPageSizeChange(size)}
      >
        ${size}
      </uui-button>
    `;
  }

  #renderPaginationControls() {
    if (!this.hasSearched || this.totalPages <= 1) {
      return undefined;
    }

    return html`
      <div class="results-grid__pagination">
        <uui-pagination
          .current=${this.currentPage}
          .total=${this.totalPages}
          firstlabel="First"
          previouslabel="Previous"
          nextlabel="Next"
          lastlabel="Last"
          ?disabled=${this.loading}
          @change=${this.#onPageChange}
        ></uui-pagination>
        ${this.#renderPageJump()}
      </div>
    `;
  }

  #renderPageJump() {
    return html`
      <div class="results-grid__page-jump">
        <uui-input
          class="results-grid__page-jump-input"
          label="Go to page"
          type="number"
          min="1"
          max=${this.totalPages}
          .value=${this._pageJumpValue}
          ?disabled=${this.loading}
          @input=${this.#onPageJumpInput}
          @keydown=${this.#onPageJumpKeydown}
        ></uui-input>
        <uui-button
          look="secondary"
          label="Go to page"
          ?disabled=${this.loading}
          @click=${this.#onPageJumpSubmit}
        >
          Go
        </uui-button>
      </div>
    `;
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
    const page = Number.parseInt(this._pageJumpValue, 10);

    if (
      !Number.isFinite(page) ||
      page < 1 ||
      page > this.totalPages ||
      page === this.currentPage ||
      this.loading
    ) {
      return;
    }

    this.dispatchEvent(
      new CustomEvent(FILTER_RESULTS_PAGE_CHANGE, {
        detail: { page },
        bubbles: true,
        composed: true,
      }),
    );
  }

  #renderSearchSummary(): string {
    const pageLabel = `Page ${this.currentPage}`;
    const pageSizeLabel = `${this.pageSize} per page`;

    if (this.totalCount <= 0) {
      return `${pageLabel} · No matches · ${pageSizeLabel}`;
    }

    const start = (this.currentPage - 1) * this.pageSize + 1;
    const end = Math.min(this.currentPage * this.pageSize, this.totalCount);

    return `${pageLabel} · Showing ${start}–${end} of ${this.totalCount} · ${pageSizeLabel}`;
  }

  #dispatchPageSizeChange(pageSize: number): void {
    if (pageSize === this.pageSize || this.loading) {
      return;
    }

    this.dispatchEvent(
      new CustomEvent(FILTER_RESULTS_PAGE_SIZE_CHANGE, {
        detail: { pageSize },
        bubbles: true,
        composed: true,
      }),
    );
  }

  #getEmptyStateContent(variant: FilterResultsEmptyVariant): {
    title: string;
    description: string;
  } {
    if (variant === "no-results") {
      return {
        title: "No matches found",
        description:
          "Nothing matched your search. Try broadening your conditions or removing one, then search again.",
      };
    }

    return {
      title: "Find content faster",
      description: "Add conditions above to search your content.",
    };
  }

  #onTableOrdered(event: Event): void {
    if (this.loading) {
      return;
    }

    const table = event.target as UmbTableElement;
    const column = table.orderingColumn;

    if (!isFilterResultsGridColumn(column)) {
      return;
    }

    const sortState = {
      column,
      descending: table.orderingDesc,
    };

    this.dispatchEvent(
      new CustomEvent(FILTER_RESULTS_SORT_CHANGE, {
        detail: sortState,
        bubbles: true,
        composed: true,
      }),
    );
  }

  #onPageChange(event: Event): void {
    const target = event.target as { current?: number } | null;
    const page = target?.current;

    if (!page || page === this.currentPage || this.loading) {
      return;
    }

    this.dispatchEvent(
      new CustomEvent(FILTER_RESULTS_PAGE_CHANGE, {
        detail: { page },
        bubbles: true,
        composed: true,
      }),
    );
  }

  #syncTableItems(): void {
    const cacheKey = buildTableItemsCacheKey(this.results, this.conditions);

    if (cacheKey === this.#tableItemsCacheKey) {
      return;
    }

    this.#tableItemsCacheKey = cacheKey;
    this._tableItems = mapResultsToTableItems(
      this.results,
      this.conditions,
      this.propertyMetadataByContentType,
    );
  }

  static override readonly styles = [UmbTextStyles, ...filterResultsGridStyles];
}

declare global {
  interface HTMLElementTagNameMap {
    "filter-results-grid": FilterResultsGridElement;
  }
}

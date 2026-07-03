import {
  html,
  customElement,
  property,
  type PropertyValues,
} from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement } from "@umbraco-cms/backoffice/lit-element";
import { filterNodesPaginationStyles } from "./filter-nodes-pagination.styles.js";

export const FILTER_NODES_PAGE_CHANGE = "filter-nodes-page-change";

export type FilterNodesPageChangeEvent = CustomEvent<{ page: number }>;

@customElement("filter-nodes-pagination")
export class FilterNodesPaginationElement extends UmbLitElement {
  @property({ type: Number })
  currentPage = 1;

  @property({ type: Number })
  totalPages = 0;

  @property({ type: Number })
  totalCount = 0;

  @property({ type: Number })
  pageSize = 20;

  override render() {
    if (this.totalCount <= 0) {
      return undefined;
    }

    return html`
      <div class="pagination">
        <p class="pagination__summary">${this.#renderSummary()}</p>
        ${this.#renderPaginationControls()}
      </div>
    `;
  }

  #renderSummary(): string {
    if (this.totalCount === 0) {
      return "No results";
    }

    const start = (this.currentPage - 1) * this.pageSize + 1;
    const end = Math.min(this.currentPage * this.pageSize, this.totalCount);

    return `Showing ${start}–${end} of ${this.totalCount}`;
  }

  #renderPaginationControls() {
    if (this.totalPages <= 1) {
      return undefined;
    }

    return html`
      <uui-pagination
        .current=${this.currentPage}
        .total=${this.totalPages}
        firstlabel="First"
        previouslabel="Previous"
        nextlabel="Next"
        lastlabel="Last"
        @change=${this.#onPageChange}
      ></uui-pagination>
    `;
  }

  #onPageChange(event: Event): void {
    const target = event.target as { current?: number } | null;
    const page = target?.current;

    if (!page || page === this.currentPage) {
      return;
    }

    this.dispatchEvent(
      new CustomEvent(FILTER_NODES_PAGE_CHANGE, {
        detail: { page },
        bubbles: true,
        composed: true,
      }),
    );
  }

  protected override updated(changedProperties: PropertyValues<this>): void {
    super.updated(changedProperties);

    if (
      changedProperties.has("totalPages") &&
      this.totalPages > 0 &&
      this.currentPage > this.totalPages
    ) {
      this.currentPage = this.totalPages;
    }
  }

  static override readonly styles = [filterNodesPaginationStyles];
}

declare global {
  interface HTMLElementTagNameMap {
    "filter-nodes-pagination": FilterNodesPaginationElement;
  }
}

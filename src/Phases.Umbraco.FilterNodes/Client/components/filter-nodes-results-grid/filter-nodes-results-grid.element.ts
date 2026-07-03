import { html, customElement, property } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement } from "@umbraco-cms/backoffice/lit-element";
import type { UmbTableColumn, UmbTableItem } from "@umbraco-cms/backoffice/components";
import type { NodeSearchResult } from "../../models/filter-models.js";
import { filterNodesResultsGridStyles } from "./filter-nodes-results-grid.styles.js";

const RESULT_COLUMNS: UmbTableColumn[] = [
  { name: "Name", alias: "name", allowSorting: false },
  { name: "Content type", alias: "contentType", allowSorting: false },
  { name: "Updated", alias: "updateDate", allowSorting: false, width: "12rem" },
  { name: "URL", alias: "url", allowSorting: false },
];

@customElement("filter-nodes-results-grid")
export class FilterNodesResultsGridElement extends UmbLitElement {
  @property({ type: Array })
  results: readonly NodeSearchResult[] = [];

  @property({ type: Number })
  totalCount = 0;

  override render() {
    if (this.results.length === 0) {
      return undefined;
    }

    return html`
      <uui-box class="results-grid">
        <div class="results-grid__header">
          <h3 class="results-grid__title">Results</h3>
        </div>
        <umb-table
          .columns=${RESULT_COLUMNS}
          .items=${this.#mapResultsToTableItems()}
          .config=${{ allowSelection: false, hideIcon: false }}
        ></umb-table>
      </uui-box>
    `;
  }

  #mapResultsToTableItems(): UmbTableItem[] {
    return this.results.map((result) => ({
      id: result.key,
      icon: "icon-document",
      entityType: "document",
      data: [
        { columnAlias: "name", value: result.name },
        {
          columnAlias: "contentType",
          value: result.contentTypeAlias ?? "—",
        },
        {
          columnAlias: "updateDate",
          value: this.#formatDate(result.updateDate),
        },
        { columnAlias: "url", value: result.url ?? "—" },
      ],
    }));
  }

  #formatDate(value?: string): string {
    if (!value) {
      return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString();
  }

  static override readonly styles = [filterNodesResultsGridStyles];
}

declare global {
  interface HTMLElementTagNameMap {
    "filter-nodes-results-grid": FilterNodesResultsGridElement;
  }
}

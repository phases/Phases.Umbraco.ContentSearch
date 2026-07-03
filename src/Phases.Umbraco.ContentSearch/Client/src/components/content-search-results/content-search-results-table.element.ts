import {
  html,
  css,
  customElement,
  property,
  state,
  keyed,
  ifDefined,
  repeat,
  nothing,
} from "@umbraco-cms/backoffice/external/lit";
import type {
  UmbTableColumn,
  UmbTableColumnLayoutElement,
  UmbTableConfig,
  UmbTableItem,
} from "@umbraco-cms/backoffice/components";
import { UmbTextStyles } from "@umbraco-cms/backoffice/style";
import { UmbLitElement } from "@umbraco-cms/backoffice/lit-element";
import {
  applyColumnWidths,
  clampColumnWidth,
  getResultsTableMinWidthPx,
  loadPersistedColumnWidths,
  resolveColumnWidthPx,
  savePersistedColumnWidths,
  type ResultsTableColumnWidths,
} from "./content-search-results-table.column-widths.js";
import {
  RESULTS_TABLE_ICON_COLUMN_WIDTH_PX,
  RESULTS_TABLE_CELL_PADDING_BLOCK,
  RESULTS_TABLE_CELL_PADDING_INLINE,
  RESULTS_TABLE_RESIZABLE_COLUMNS,
} from "./content-search-results-table.constants.js";
import { contentSearchResultsTableStyles } from "./content-search-results-table.styles.js";
import type { ContentSearchResultsGridColumn } from "./content-search-results.models.js";

interface ActiveColumnResize {
  readonly alias: ContentSearchResultsGridColumn;
  readonly startX: number;
  readonly startWidth: number;
}

@customElement("content-search-results-table")
export class ContentSearchResultsTableElement extends UmbLitElement {
  @property({ type: Array, attribute: false })
  columns: readonly UmbTableColumn[] = [];

  @property({ type: Array, attribute: false })
  items: readonly UmbTableItem[] = [];

  @property({ type: Object, attribute: false })
  config: UmbTableConfig = {
    allowSelection: false,
    hideIcon: false,
  };

  @property({ type: String, attribute: false })
  orderingColumn = "";

  @property({ type: Boolean, attribute: false })
  orderingDesc = false;

  @state()
  private _columnWidthsPx: ResultsTableColumnWidths = loadPersistedColumnWidths();

  #activeResize?: ActiveColumnResize;
  #boundResizeMove = (event: MouseEvent) => this.#onResizeMove(event);
  #boundResizeEnd = () => this.#onResizeEnd();

  override disconnectedCallback(): void {
    this.#stopResizeListeners();
    super.disconnectedCallback();
  }

  override render() {
    const resolvedColumns = applyColumnWidths(this.columns, this._columnWidthsPx);
    const columnKey = this.#getColumnKey();
    const tableMinWidthPx = getResultsTableMinWidthPx(resolvedColumns, this._columnWidthsPx);

    return keyed(
      columnKey,
      html`
        <uui-table
          class="uui-text results-table"
          style=${`--cs-results-table-min-width: ${tableMinWidthPx}px; min-width: ${tableMinWidthPx}px`}
        >
          ${this.config.hideIcon
            ? nothing
            : html`
                <uui-table-column
                  style="width: ${RESULTS_TABLE_ICON_COLUMN_WIDTH_PX}px"
                ></uui-table-column>
              `}
          ${repeat(
            resolvedColumns,
            (column) => column.alias,
            (column) => html`
              <uui-table-column
                style=${ifDefined(this.#getTableColumnStyle(column))}
              ></uui-table-column>
            `,
          )}
          <uui-table-head>
            ${this.#renderHeaderIconCell()}
            ${repeat(
              resolvedColumns,
              (column) => column.alias,
              (column) => this.#renderHeaderCell(column),
            )}
          </uui-table-head>
          ${repeat(
            this.items,
            (item) => item.id,
            (item) => this.#renderRow(item, resolvedColumns),
          )}
        </uui-table>
      `,
    );
  }

  #getColumnKey(): string {
    return this.columns.map((column) => column.alias).join("|");
  }

  #getTableColumnStyle(column: UmbTableColumn): string | undefined {
    const widthPx = resolveColumnWidthPx(column.alias, this._columnWidthsPx);
    return widthPx === undefined ? undefined : `width: ${widthPx}px`;
  }

  #getCellStyle(column: UmbTableColumn): string {
    const widthPx = resolveColumnWidthPx(column.alias, this._columnWidthsPx);
    const widthRule = widthPx === undefined ? "auto" : `${widthPx}px`;
    const isActions = column.alias === "actions";
    const cellPadding = isActions
      ? RESULTS_TABLE_CELL_PADDING_BLOCK
      : `${RESULTS_TABLE_CELL_PADDING_BLOCK} ${RESULTS_TABLE_CELL_PADDING_INLINE}`;

    return [
      `--uui-table-cell-padding: ${cellPadding}`,
      `text-align:${column.align ?? "left"}`,
      `width: ${widthRule}`,
      isActions ? "overflow: visible" : "",
    ]
      .filter(Boolean)
      .join("; ");
  }

  #renderHeaderIconCell() {
    if (this.config.hideIcon) {
      return undefined;
    }

    return html`
      <uui-table-head-cell style="--uui-table-cell-padding: 0; text-align: center;">
      </uui-table-head-cell>
    `;
  }

  #renderHeaderCell(column: UmbTableColumn) {
    const isResizable = RESULTS_TABLE_RESIZABLE_COLUMNS.has(
      column.alias as ContentSearchResultsGridColumn,
    );
    const isActions = column.alias === "actions";

    return html`
      <uui-table-head-cell
        class=${isActions ? "results-table__head-cell--actions" : ""}
        style="--uui-table-cell-padding: ${RESULTS_TABLE_CELL_PADDING_BLOCK} ${RESULTS_TABLE_CELL_PADDING_INLINE}"
        aria-sort=${ifDefined(this.#getAriaSort(column))}
      >
        <div
          class="results-table__header-cell ${isActions
            ? "results-table__header-cell--actions"
            : ""}"
        >
          ${column.allowSorting
            ? html`
                <button
                  class="results-table__sort-button"
                  type="button"
                  aria-label=${`Sort by ${column.name}`}
                  @click=${() => this.#onOrderingChange(column)}
                >
                  <span>${column.name}</span>
                  <uui-symbol-sort
                    ?active=${this.orderingColumn === column.alias}
                    ?descending=${this.orderingDesc}
                  ></uui-symbol-sort>
                </button>
              `
            : html`<span
                class="results-table__header-label ${isActions
                  ? "results-table__header-label--actions"
                  : ""}"
                >${column.name}</span
              >`}
          ${isResizable
            ? html`
                <div
                  class="results-table__resize-handle"
                  role="separator"
                  aria-orientation="vertical"
                  aria-label=${`Resize ${column.name} column`}
                  tabindex="0"
                  @mousedown=${(event: MouseEvent) =>
                    this.#onResizeStart(column.alias as ContentSearchResultsGridColumn, event)}
                  @keydown=${(event: KeyboardEvent) =>
                    this.#onResizeKeydown(column.alias as ContentSearchResultsGridColumn, event)}
                ></div>
              `
            : undefined}
        </div>
      </uui-table-head-cell>
    `;
  }

  #renderRow(item: UmbTableItem, columns: readonly UmbTableColumn[]) {
    return html`
      <uui-table-row data-sortable-id=${item.id}>
        ${this.#renderRowIconCell(item)}
        ${repeat(
          columns,
          (column) => column.alias,
          (column) => this.#renderRowCell(column, item),
        )}
      </uui-table-row>
    `;
  }

  #renderRowIconCell(item: UmbTableItem) {
    if (this.config.hideIcon) {
      return undefined;
    }

    return html`
      <uui-table-cell style="text-align: center; width: ${RESULTS_TABLE_ICON_COLUMN_WIDTH_PX}px">
        <umb-icon name="${ifDefined(item.icon ?? undefined)}"></umb-icon>
      </uui-table-cell>
    `;
  }

  #renderRowCell(column: UmbTableColumn, item: UmbTableItem) {
    const value = item.data.find((data) => data.columnAlias === column.alias)?.value;
    const usesCustomElement = Boolean(column.elementName);
    const shouldClip = !usesCustomElement && Boolean(column.clipText);
    const isActions = column.alias === "actions";

    return html`
      <uui-table-cell
        class=${isActions ? "results-table__cell--actions" : ""}
        style=${this.#getCellStyle(column)}
        ?clip-text=${shouldClip}
      >
        <div
          class="results-table__cell-inner ${isActions
            ? "results-table__cell-inner--actions"
            : ""}"
        >
          ${this.#renderCellContent(column, item, value)}
        </div>
      </uui-table-cell>
    `;
  }

  #renderCellContent(column: UmbTableColumn, item: UmbTableItem, value: unknown) {
    if (column.elementName) {
      const element = document.createElement(
        column.elementName,
      ) as UmbTableColumnLayoutElement;
      element.column = column;
      element.item = item;
      element.value = value;
      return element;
    }

    return value;
  }

  #onOrderingChange(column: UmbTableColumn): void {
    this.orderingDesc =
      this.orderingColumn === column.alias ? !this.orderingDesc : false;
    this.orderingColumn = column.alias;
    this.dispatchEvent(new Event("ordered", { bubbles: true, composed: true }));
  }

  #getAriaSort(
    column: UmbTableColumn,
  ): "ascending" | "descending" | "none" | undefined {
    if (!column.allowSorting) {
      return undefined;
    }

    if (this.orderingColumn !== column.alias) {
      return "none";
    }

    return this.orderingDesc ? "descending" : "ascending";
  }

  #onResizeStart(alias: ContentSearchResultsGridColumn, event: MouseEvent): void {
    if (event.button !== 0) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const startWidth = resolveColumnWidthPx(alias, this._columnWidthsPx);
    if (startWidth === undefined) {
      return;
    }

    this.#activeResize = {
      alias,
      startX: event.clientX,
      startWidth,
    };
    this.setAttribute("resizing", "");

    window.addEventListener("mousemove", this.#boundResizeMove);
    window.addEventListener("mouseup", this.#boundResizeEnd);
  }

  #onResizeKeydown(alias: ContentSearchResultsGridColumn, event: KeyboardEvent): void {
    const step = event.shiftKey ? 24 : 12;
    let nextWidth = resolveColumnWidthPx(alias, this._columnWidthsPx);

    if (nextWidth === undefined) {
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      nextWidth = clampColumnWidth(alias, nextWidth - step);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      nextWidth = clampColumnWidth(alias, nextWidth + step);
    } else {
      return;
    }

    this._columnWidthsPx = {
      ...this._columnWidthsPx,
      [alias]: nextWidth,
    };
    savePersistedColumnWidths(this._columnWidthsPx);
  }

  #onResizeMove(event: MouseEvent): void {
    if (!this.#activeResize) {
      return;
    }

    const delta = event.clientX - this.#activeResize.startX;
    const nextWidth = clampColumnWidth(
      this.#activeResize.alias,
      this.#activeResize.startWidth + delta,
    );

    this._columnWidthsPx = {
      ...this._columnWidthsPx,
      [this.#activeResize.alias]: nextWidth,
    };
  }

  #onResizeEnd(): void {
    if (!this.#activeResize) {
      return;
    }

    savePersistedColumnWidths(this._columnWidthsPx);
    this.#activeResize = undefined;
    this.removeAttribute("resizing");
    this.#stopResizeListeners();
  }

  #stopResizeListeners(): void {
    window.removeEventListener("mousemove", this.#boundResizeMove);
    window.removeEventListener("mouseup", this.#boundResizeEnd);
  }

  static override readonly styles = [
    UmbTextStyles,
    contentSearchResultsTableStyles,
    css`
      :host {
        display: block;
        width: 100%;
      }
    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    "content-search-results-table": ContentSearchResultsTableElement;
  }
}

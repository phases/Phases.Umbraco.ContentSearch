import {
  html,
  css,
  customElement,
  property,
  state,
  query,
  repeat,
  nothing,
} from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement } from "@umbraco-cms/backoffice/lit-element";
import {
  buildContentSearchPathColumnValue,
  estimateContentSearchPathDisplayLength,
  truncateContentSearchBreadcrumb,
  type ContentSearchPathColumnValue,
} from "../../../utils/content-path.utils.js";

@customElement("content-search-path-column")
export class ContentSearchPathColumnElement extends UmbLitElement {
  @property({ attribute: false })
  value?: ContentSearchPathColumnValue | string;

  @state()
  private _containerWidthPx = 0;

  @query(".path-breadcrumb")
  private _breadcrumbElement?: HTMLElement;

  #resizeObserver?: ResizeObserver;

  override connectedCallback(): void {
    super.connectedCallback();
    this.#resizeObserver = new ResizeObserver(() => this.#syncContainerWidth());
  }

  override disconnectedCallback(): void {
    this.#resizeObserver?.disconnect();
    this.#resizeObserver = undefined;
    super.disconnectedCallback();
  }

  protected override firstUpdated(): void {
    if (this._breadcrumbElement) {
      this.#resizeObserver?.observe(this._breadcrumbElement);
    }

    this.#syncContainerWidth();
  }

  protected override updated(changedProperties: Map<PropertyKey, unknown>): void {
    super.updated(changedProperties);

    if (changedProperties.has("value")) {
      this.#syncContainerWidth();
    }
  }

  override render() {
    const columnValue = this.#normalizeValue(this.value);

    if (columnValue.isMuted) {
      return html`<span class="path-text path-text--muted" aria-label="Path unavailable">—</span>`;
    }

    const maxLength = estimateContentSearchPathDisplayLength(this._containerWidthPx);
    const { displaySegments, showEllipsis } = truncateContentSearchBreadcrumb(
      columnValue.segments,
      maxLength,
    );

    return html`
      <span
        class="path-breadcrumb"
        title=${columnValue.tooltip}
        aria-label=${columnValue.display}
      >
        ${repeat(
          displaySegments,
          (segment, index) => `${index}:${segment}`,
          (segment, index) => html`
            ${index > 0
              ? html`<span class="path-separator" aria-hidden="true"> > </span>`
              : nothing}
            <span class="path-segment">${segment}</span>
          `,
        )}
        ${showEllipsis
          ? html`
              <span class="path-separator" aria-hidden="true"> > </span>
              <span class="path-ellipsis" aria-hidden="true">...</span>
            `
          : nothing}
      </span>
    `;
  }

  #normalizeValue(
    value?: ContentSearchPathColumnValue | string,
  ): ContentSearchPathColumnValue {
    if (!value || typeof value === "string") {
      return buildContentSearchPathColumnValue(value);
    }

    if (!value.segments?.length && value.display && value.display !== "—") {
      return buildContentSearchPathColumnValue(value.display);
    }

    return value;
  }

  #syncContainerWidth(): void {
    const nextWidth = this._breadcrumbElement?.clientWidth ?? this.clientWidth;

    if (nextWidth !== this._containerWidthPx) {
      this._containerWidthPx = nextWidth;
    }
  }

  static override readonly styles = [
    css`
      :host {
        display: flex;
        align-items: center;
        min-width: 0;
        max-width: 100%;
        width: 100%;
        height: 100%;
        overflow: hidden;
      }

      .path-breadcrumb {
        display: block;
        min-width: 0;
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        line-height: 1.2;
        color: var(--uui-color-text-alt);
      }

      .path-segment,
      .path-separator,
      .path-ellipsis {
        white-space: nowrap;
      }

      .path-separator,
      .path-ellipsis {
        color: color-mix(in srgb, var(--uui-color-text-alt) 72%, transparent);
      }

      .path-text--muted {
        color: var(--uui-color-text-alt);
      }
    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    "content-search-path-column": ContentSearchPathColumnElement;
  }
}

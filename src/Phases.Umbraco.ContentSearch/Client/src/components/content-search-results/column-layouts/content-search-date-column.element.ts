import { html, css, customElement, property } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement } from "@umbraco-cms/backoffice/lit-element";
import {
  buildContentSearchDateColumnValue,
  type ContentSearchDateColumnValue,
} from "../../../utils/content-date.utils.js";

@customElement("content-search-date-column")
export class ContentSearchDateColumnElement extends UmbLitElement {
  @property({ attribute: false })
  value?: ContentSearchDateColumnValue | string;

  override render() {
    const columnValue = this.#normalizeValue(this.value);

    return html`
      <span
        class="date-text ${columnValue.isMuted ? "date-text--muted" : ""}"
        title=${columnValue.tooltip}
        aria-label=${columnValue.tooltip}
      >
        ${columnValue.display}
      </span>
    `;
  }

  #normalizeValue(
    value?: ContentSearchDateColumnValue | string,
  ): ContentSearchDateColumnValue {
    if (!value || typeof value === "string") {
      return buildContentSearchDateColumnValue(value);
    }

    return value;
  }

  static override readonly styles = [
    css`
      :host {
        display: flex;
        align-items: center;
        min-width: 0;
        max-width: 100%;
        height: 100%;
        overflow: hidden;
      }

      .date-text {
        display: block;
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        line-height: var(--cs-results-line-height, 1.3);
      }

      .date-text--muted {
        color: var(--uui-color-text-alt);
      }
    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    "content-search-date-column": ContentSearchDateColumnElement;
  }
}

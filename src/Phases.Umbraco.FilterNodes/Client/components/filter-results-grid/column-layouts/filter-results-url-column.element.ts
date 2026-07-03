import { html, css, customElement, property } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement } from "@umbraco-cms/backoffice/lit-element";
import {
  CONTENT_URL_NOT_PUBLISHED,
  CONTENT_URL_UNAVAILABLE,
  formatResultUrlDisplay,
  isResolvableContentUrl,
} from "../../../utils/content-url.utils.js";
import { FILTER_RESULTS_OPEN_URL_TOOLTIP } from "../filter-results-grid.tooltips.js";

@customElement("filter-results-url-column")
export class FilterResultsUrlColumnElement extends UmbLitElement {
  @property({ attribute: false })
  value?: string;

  override render() {
    const displayValue = formatResultUrlDisplay(this.value);

    if (!isResolvableContentUrl(displayValue)) {
      return html`
        <span
          class="url-status ${this.#getStatusClass(displayValue)}"
          title=${displayValue}
        >
          ${displayValue}
        </span>
      `;
    }

    return html`
      <a
        class="url-link"
        href=${displayValue}
        target="_blank"
        rel="noopener noreferrer"
        title=${FILTER_RESULTS_OPEN_URL_TOOLTIP}
        aria-label=${`${FILTER_RESULTS_OPEN_URL_TOOLTIP}: ${displayValue}`}
      >
        ${displayValue}
      </a>
    `;
  }

  #getStatusClass(displayValue: string): string {
    if (displayValue === CONTENT_URL_NOT_PUBLISHED) {
      return "url-status--not-published";
    }

    if (displayValue === CONTENT_URL_UNAVAILABLE) {
      return "url-status--unavailable";
    }

    return "";
  }

  static override readonly styles = [
    css`
      :host {
        display: block;
        min-width: 0;
        max-width: 16rem;
      }

      .url-link,
      .url-status {
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .url-link {
        color: var(--uui-color-interactive);
        text-decoration: none;
      }

      .url-link:hover {
        text-decoration: underline;
      }

      .url-status {
        color: var(--uui-color-text-alt);
        font-style: italic;
      }

      .url-status--not-published,
      .url-status--unavailable {
        cursor: help;
      }
    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    "filter-results-url-column": FilterResultsUrlColumnElement;
  }
}

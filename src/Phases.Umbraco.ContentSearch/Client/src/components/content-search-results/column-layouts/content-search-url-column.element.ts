import { html, css, customElement, property } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement } from "@umbraco-cms/backoffice/lit-element";
import {
  CONTENT_URL_UNAVAILABLE,
  buildUrlColumnValue,
  type ContentSearchUrlColumnValue,
} from "../../../utils/content-url.utils.js";
import { contentSearchResultsRowTokens } from "../content-search-results-row.tokens.js";

const NEW_TAB_LINK_REL = "noopener noreferrer";

@customElement("content-search-url-column")
export class ContentSearchUrlColumnElement extends UmbLitElement {
  @property({ attribute: false })
  value?: ContentSearchUrlColumnValue | string;

  override render() {
    const columnValue = this.#normalizeValue(this.value);

    if (columnValue.isMuted || !columnValue.href) {
      const unavailableLabel =
        columnValue.tooltip === CONTENT_URL_UNAVAILABLE
          ? "URL not available"
          : `URL not available: ${columnValue.tooltip}`;

      return html`
        <span
          class="url-empty"
          title=${columnValue.tooltip}
          aria-label=${unavailableLabel}
        >
          ${CONTENT_URL_UNAVAILABLE}
        </span>
      `;
    }

    const openLabel = `Open frontend URL: ${columnValue.display}`;

    return html`
      <a
        class="url-link"
        href=${columnValue.href}
        target="_blank"
        rel=${NEW_TAB_LINK_REL}
        title=${columnValue.tooltip}
        aria-label=${openLabel}
      >
        <span class="url-text">${columnValue.display}</span>
      </a>
    `;
  }

  #normalizeValue(
    value?: ContentSearchUrlColumnValue | string,
  ): ContentSearchUrlColumnValue {
    if (!value) {
      return buildUrlColumnValue();
    }

    if (typeof value === "string") {
      return buildUrlColumnValue(value);
    }

    return buildUrlColumnValue(value.href, value.display);
  }

  static override readonly styles = [
    contentSearchResultsRowTokens,
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

      .url-link {
        display: inline-flex;
        align-items: center;
        min-width: 0;
        max-width: 100%;
        color: var(--uui-color-interactive);
        text-decoration: none;
        cursor: pointer;
        border-radius: var(--uui-border-radius, 3px);
        transition: color var(--cs-results-transition);
      }

      .url-text {
        display: block;
        min-width: 0;
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-weight: 500;
        line-height: 1.2;
        text-underline-offset: 2px;
        transition: text-decoration-color var(--cs-results-transition),
          color var(--cs-results-transition);
      }

      .url-link:hover .url-text,
      .url-link:focus-visible .url-text {
        text-decoration: underline;
        color: color-mix(in srgb, var(--uui-color-interactive) 88%, var(--uui-color-text));
      }

      .url-link:focus-visible {
        outline: 2px solid var(--uui-color-focus);
        outline-offset: 1px;
      }

      .url-empty {
        display: block;
        color: var(--uui-color-text-alt);
        line-height: 1.2;
        cursor: default;
      }
    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    "content-search-url-column": ContentSearchUrlColumnElement;
  }
}

import {
  html,
  css,
  customElement,
  property,
  repeat,
  nothing,
} from "@umbraco-cms/backoffice/external/lit";
import type { UmbTableItem } from "@umbraco-cms/backoffice/components";
import { UmbLitElement } from "@umbraco-cms/backoffice/lit-element";
import { splitTextByHighlightTerms } from "../../../utils/search-highlight.utils.js";
import type { ContentSearchNameColumnValue } from "./content-search-results-column.models.js";
import { contentSearchResultsRowTokens } from "../content-search-results-row.tokens.js";

@customElement("content-search-name-column")
export class ContentSearchNameColumnElement extends UmbLitElement {
  @property({ attribute: false })
  value?: ContentSearchNameColumnValue;

  @property({ attribute: false })
  item?: UmbTableItem;

  override render() {
    const name = this.value?.name?.trim();

    if (!name) {
      return html`—`;
    }

    const content = this.#renderNameContent(name);
    const editPath = this.value?.editPath?.trim();
    const icon = this.item?.icon?.trim() || undefined;
    const openLabel = `Open in Umbraco: ${name}`;

    const nameContent = editPath
      ? html`
          <a
            class="name-link"
            href=${editPath}
            target="_blank"
            rel="noopener noreferrer"
            title=${openLabel}
            aria-label=${openLabel}
          >
            <span class="name-text">${content}</span>
          </a>
        `
      : html`<span class="name-text" title=${name}>${content}</span>`;

    return html`
      <div class="name-cell">
        ${icon
          ? html`<umb-icon class="name-icon" name=${icon} aria-hidden="true"></umb-icon>`
          : nothing}
        ${nameContent}
      </div>
    `;
  }

  #renderNameContent(name: string) {
    const segments = splitTextByHighlightTerms(name, this.value?.highlightTerms ?? []);

    if (segments.length === 1 && !segments[0]?.highlight) {
      return segments[0]?.text ?? name;
    }

    return repeat(
      segments,
      (_segment, index) => index,
      (segment) =>
        segment.highlight
          ? html`<mark class="name-highlight">${segment.text}</mark>`
          : segment.text,
    );
  }

  static override readonly styles = [
    contentSearchResultsRowTokens,
    css`
      :host {
        display: flex;
        align-items: center;
        min-width: 0;
        max-width: 100%;
        height: 100%;
        overflow: hidden;
      }

      .name-cell {
        display: inline-flex;
        align-items: center;
        gap: var(--uui-size-space-2);
        min-width: 0;
        max-width: 100%;
        line-height: var(--cs-results-line-height, 1.3);
      }

      .name-icon {
        flex: 0 0 auto;
        width: var(--cs-results-icon-size);
        height: var(--cs-results-icon-size);
        color: var(--uui-color-text-alt);
        font-size: var(--cs-results-icon-size);
        transition: color var(--cs-results-transition);
      }

      .name-link {
        display: inline-flex;
        align-items: center;
        min-width: 0;
        flex: 1 1 auto;
        color: var(--uui-color-interactive);
        text-decoration: none;
        cursor: pointer;
        border-radius: var(--uui-border-radius, 3px);
        transition: color var(--cs-results-transition);
      }

      .name-link .name-text {
        text-decoration: var(--cs-results-name-decoration, none);
        text-underline-offset: 2px;
        text-decoration-thickness: 1px;
        transition: text-decoration-color var(--cs-results-transition),
          color var(--cs-results-transition);
      }

      .name-link:hover .name-text,
      .name-link:focus-visible .name-text {
        text-decoration: underline;
        color: color-mix(in srgb, var(--uui-color-interactive) 88%, var(--uui-color-text));
      }

      .name-link:focus-visible {
        outline: 2px solid var(--uui-color-focus);
        outline-offset: 1px;
      }

      .name-text {
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-weight: 600;
        line-height: var(--cs-results-line-height, 1.3);
      }

      .name-highlight {
        padding: 0;
        border-radius: var(--uui-border-radius, 2px);
        background: color-mix(in srgb, var(--uui-color-selected) 28%, transparent);
        color: inherit;
        font-weight: 600;
      }
    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    "content-search-name-column": ContentSearchNameColumnElement;
  }
}

import {
  html,
  css,
  customElement,
  property,
  repeat,
  nothing,
} from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement } from "@umbraco-cms/backoffice/lit-element";
import { splitTextByHighlightTerms } from "../../../utils/search-highlight.utils.js";
import type { ContentSearchMatchColumnValue } from "./content-search-results-column.models.js";
import { contentSearchResultsRowTokens } from "../content-search-results-row.tokens.js";

@customElement("content-search-match-column")
export class ContentSearchMatchColumnElement extends UmbLitElement {
  @property({ attribute: false })
  value?: ContentSearchMatchColumnValue;

  override render() {
    const matches = this.value?.matches ?? [];

    if (matches.length === 0) {
      return html`—`;
    }

    return html`
      <div class="match-cell">
        ${repeat(
          matches,
          (match, index) => `${match.propertyName}:${index}`,
          (match) => this.#renderMatch(match),
        )}
      </div>
    `;
  }

  #renderMatch(match: ContentSearchMatchColumnValue["matches"][number]) {
    const propertyName = match.propertyName?.trim();

    if (!propertyName) {
      return nothing;
    }

    if (match.snippet?.trim()) {
      return html`
        <div class="match-row">
          <span class="match-property">${propertyName}</span>
          <span class="match-separator" aria-hidden="true">·</span>
          <span class="match-snippet">${this.#renderSnippet(match.snippet, match.highlightTerms ?? [])}</span>
        </div>
      `;
    }

    if (match.operatorLabel?.trim()) {
      return html`
        <div class="match-row">
          <span class="match-property">${propertyName}</span>
          <span class="match-separator" aria-hidden="true">·</span>
          <span class="match-operator">${match.operatorLabel}</span>
        </div>
      `;
    }

    return html`
      <div class="match-row">
        <span class="match-property">${propertyName}</span>
        <span class="match-separator" aria-hidden="true">·</span>
        <span class="match-operator">—</span>
      </div>
    `;
  }

  #renderSnippet(snippet: string, highlightTerms: readonly string[]) {
    const segments = splitTextByHighlightTerms(snippet, highlightTerms);

    if (segments.length === 1 && !segments[0]?.highlight) {
      return segments[0]?.text ?? snippet;
    }

    return repeat(
      segments,
      (_segment, index) => index,
      (segment) =>
        segment.highlight
          ? html`<mark class="match-highlight">${segment.text}</mark>`
          : segment.text,
    );
  }

  static override readonly styles = [
    contentSearchResultsRowTokens,
    css`
      :host {
        display: block;
        min-width: 0;
        max-width: 100%;
        overflow: hidden;
      }

      .match-cell {
        display: flex;
        flex-direction: column;
        gap: var(--uui-size-space-1);
        min-width: 0;
        line-height: var(--cs-results-line-height, 1.3);
      }

      .match-row {
        display: flex;
        align-items: baseline;
        gap: var(--uui-size-space-1);
        min-width: 0;
        overflow: hidden;
      }

      .match-property {
        flex: 0 0 auto;
        font-weight: 600;
        color: var(--uui-color-text-alt);
      }

      .match-separator {
        flex: 0 0 auto;
        color: var(--uui-color-text-alt);
      }

      .match-snippet,
      .match-operator {
        flex: 1 1 auto;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .match-operator {
        color: var(--uui-color-text-alt);
      }

      .match-highlight {
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
    "content-search-match-column": ContentSearchMatchColumnElement;
  }
}

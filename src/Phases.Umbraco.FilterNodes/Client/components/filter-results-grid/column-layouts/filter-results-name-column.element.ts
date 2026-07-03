import { html, css, customElement, property, repeat } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement } from "@umbraco-cms/backoffice/lit-element";
import { FILTER_RESULTS_EDIT_NODE_TOOLTIP } from "../filter-results-grid.tooltips.js";
import type { FilterResultsNameColumnValue } from "./filter-results-grid-column.models.js";

@customElement("filter-results-name-column")
export class FilterResultsNameColumnElement extends UmbLitElement {
  @property({ attribute: false })
  value?: FilterResultsNameColumnValue;

  override render() {
    const name = this.value?.name?.trim();

    if (!name) {
      return html`—`;
    }

    const editPath = this.value?.editPath;
    const segments = this.value?.nameSegments ?? [{ text: name, highlight: false }];

    if (!editPath) {
      return this.#renderNameContent(segments);
    }

    return html`
      <a
        class="name-link"
        href=${editPath}
        target="_blank"
        rel="noopener noreferrer"
        title=${FILTER_RESULTS_EDIT_NODE_TOOLTIP}
        aria-label=${`${FILTER_RESULTS_EDIT_NODE_TOOLTIP}: ${name}`}
      >
        ${this.#renderNameContent(segments)}
      </a>
    `;
  }

  #renderNameContent(
    segments: FilterResultsNameColumnValue["nameSegments"],
  ) {
    return repeat(
      segments,
      (_, index) => index,
      (segment) =>
        segment.highlight
          ? html`<mark class="name-highlight">${segment.text}</mark>`
          : segment.text,
    );
  }

  static override readonly styles = [
    css`
      :host {
        display: block;
        min-width: 0;
      }

      .name-link {
        display: inline-block;
        max-width: 100%;
        color: var(--uui-color-interactive);
        font-weight: 500;
        text-decoration: none;
      }

      .name-link:hover {
        text-decoration: underline;
      }

      .name-link:focus-visible {
        outline: 2px solid var(--uui-color-focus);
        outline-offset: 2px;
        border-radius: 2px;
      }

      .name-highlight {
        background-color: var(--uui-color-focus, #ffd966);
        color: inherit;
        font-weight: 600;
        padding: 0 0.1em;
        border-radius: 2px;
      }
    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    "filter-results-name-column": FilterResultsNameColumnElement;
  }
}

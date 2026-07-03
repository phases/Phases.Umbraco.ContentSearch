import { html, customElement, property, nothing } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement } from "@umbraco-cms/backoffice/lit-element";
import { CONTENT_SEARCH_CLEAR_RESULTS } from "../content-search-results/content-search-results.models.js";
import { contentSearchEmptyStateStyles } from "./content-search-empty-state.styles.js";

export type ContentSearchEmptyStateVariant = "initial" | "no-results" | "saved-searches" | "loading";

@customElement("content-search-empty-state")
export class ContentSearchEmptyStateElement extends UmbLitElement {
  @property({ type: String })
  variant: ContentSearchEmptyStateVariant = "initial";

  @property({ type: Boolean })
  compact = false;

  @property({ type: Boolean })
  showClearButton = false;

  override render() {
    const content = this.#getContent();

    return html`
      <div
        class="empty-state ${this.compact && this.variant !== "loading"
          ? "empty-state--compact"
          : ""} ${this.variant === "loading" ? "empty-state--loading" : ""}"
        role=${this.variant === "loading" ? "status" : nothing}
        aria-live=${this.variant === "loading" ? "polite" : nothing}
        aria-busy=${this.variant === "loading" ? "true" : nothing}
      >
        ${this.variant === "loading"
          ? html`<uui-loader class="empty-state__loader"></uui-loader>`
          : html`<uui-icon class="empty-state__icon" name=${content.icon}></uui-icon>`}
        <div class="empty-state__copy">
          <p class="empty-state__title">${content.title}</p>
          ${!this.compact && content.description
            ? html`<p class="empty-state__description">${content.description}</p>`
            : this.variant === "loading" && content.description
              ? html`<p class="empty-state__description">${content.description}</p>`
              : null}
          ${this.showClearButton
            ? html`
                <uui-button
                  class="empty-state__action"
                  look="secondary"
                  label="Clear results"
                  @click=${this.#onClearResults}
                >
                  Clear results
                </uui-button>
              `
            : null}
        </div>
      </div>
    `;
  }

  #onClearResults(): void {
    this.dispatchEvent(
      new CustomEvent(CONTENT_SEARCH_CLEAR_RESULTS, {
        bubbles: true,
        composed: true,
      }),
    );
  }

  #getContent(): { icon: string; title: string; description?: string } {
    if (this.variant === "loading") {
      return {
        icon: "icon-search",
        title: "Searching content…",
        description: "Please wait while results are loaded.",
      };
    }

    if (this.variant === "no-results") {
      return {
        icon: "icon-search",
        title: "No content matched your search.",
      };
    }

    if (this.variant === "saved-searches") {
      return {
        icon: "icon-bookmark",
        title: "Nothing saved yet",
      };
    }

    return {
      icon: "icon-search",
      title: "Build a search using the condition builder.",
    };
  }

  static override readonly styles = [contentSearchEmptyStateStyles];
}

declare global {
  interface HTMLElementTagNameMap {
    "content-search-empty-state": ContentSearchEmptyStateElement;
  }
}

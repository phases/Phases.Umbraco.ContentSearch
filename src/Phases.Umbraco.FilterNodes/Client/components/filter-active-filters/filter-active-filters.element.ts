import { html, customElement, property } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement } from "@umbraco-cms/backoffice/lit-element";
import type { ActiveFilterBadge } from "../../utils/active-filter.utils.js";
import { FILTER_ACTIVE_FILTERS_REMOVE } from "./filter-active-filters.models.js";
import { filterActiveFiltersStyles } from "./filter-active-filters.styles.js";

@customElement("filter-active-filters")
export class FilterActiveFiltersElement extends UmbLitElement {
  @property({ type: Array })
  badges: readonly ActiveFilterBadge[] = [];

  @property({ type: Boolean })
  loading = false;

  override render() {
    if (this.badges.length === 0) {
      return undefined;
    }

    return html`
      <div class="active-filters" role="region" aria-label="Active filters">
        <p class="active-filters__label">Active filters</p>
        <div class="active-filters__chips">
          ${this.badges.map((badge) => this.#renderChip(badge))}
        </div>
      </div>
    `;
  }

  #renderChip(badge: ActiveFilterBadge) {
    return html`
      <uui-tag look="secondary" class="active-filters__chip">
        <span class="active-filters__chip-label">${badge.label}</span>
        <button
          type="button"
          class="active-filters__remove"
          aria-label=${`Remove filter ${badge.label}`}
          title="Remove filter"
          ?disabled=${this.loading}
          @click=${() => this.#onRemove(badge.conditionId, badge.kind)}
        >
          <span aria-hidden="true">×</span>
        </button>
      </uui-tag>
    `;
  }

  #onRemove(conditionId: string, kind: ActiveFilterBadge["kind"]): void {
    this.dispatchEvent(
      new CustomEvent(FILTER_ACTIVE_FILTERS_REMOVE, {
        detail: { conditionId, kind },
        bubbles: true,
        composed: true,
      }),
    );
  }

  static override readonly styles = [...filterActiveFiltersStyles];
}

declare global {
  interface HTMLElementTagNameMap {
    "filter-active-filters": FilterActiveFiltersElement;
  }
}

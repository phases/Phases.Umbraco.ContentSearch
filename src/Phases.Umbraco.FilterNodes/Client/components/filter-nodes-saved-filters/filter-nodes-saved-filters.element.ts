import {
  html,
  customElement,
  property,
  state,
  nothing,
} from "@umbraco-cms/backoffice/external/lit";
import { UmbTextStyles } from "@umbraco-cms/backoffice/style";
import { UmbLitElement } from "@umbraco-cms/backoffice/lit-element";
import { umbConfirmModal } from "@umbraco-cms/backoffice/modal";
import type { SavedFilter } from "../../models/saved-filter-models.js";
import { SAVED_FILTER_MAX_NAME_LENGTH } from "../../constants/filter-nodes.constants.js";
import { getSavedFilterUsageLabel } from "../../utils/saved-filter.utils.js";
import "../filter-saved-filter-combobox/filter-saved-filter-combobox.element.js";
import { filterNodesSavedFiltersStyles } from "./filter-nodes-saved-filters.styles.js";

export const FILTER_NODES_SAVED_FILTER_LOAD = "filter-nodes-saved-filter-load";
export const FILTER_NODES_SAVED_FILTER_SAVE = "filter-nodes-saved-filter-save";
export const FILTER_NODES_SAVED_FILTER_DELETE = "filter-nodes-saved-filter-delete";

@customElement("filter-nodes-saved-filters")
export class FilterNodesSavedFiltersElement extends UmbLitElement {
  @property({ type: Array })
  savedFilters: readonly SavedFilter[] = [];

  @property({ type: String })
  selectedSavedFilterId = "";

  @property({ type: Boolean })
  loading = false;

  @property({ type: Boolean })
  saving = false;

  @property({ type: Boolean })
  disabled = false;

  @property({ type: Boolean })
  saveDisabled = false;

  @state()
  private _showSaveForm = false;

  @state()
  private _saveName = "";

  override render() {
    const count = this.savedFilters.length;
    const hasSavedFilters = count > 0;
    const selectedFilter = this.#getSelectedFilter();
    const usageLabel = selectedFilter
      ? getSavedFilterUsageLabel(selectedFilter.id)
      : undefined;

    return html`
      <div class="saved-filters">
        ${this.#renderHeader(count)}
        ${!this.loading && !hasSavedFilters ? this.#renderEmptyState() : nothing}
        <div class="saved-filters__toolbar">
          <div class="saved-filters__primary">
            <filter-saved-filter-combobox
              class="saved-filters__select"
              .savedFilters=${this.savedFilters}
              .value=${this.selectedSavedFilterId}
              ?loading=${this.loading}
              ?disabled=${this.disabled}
              @filter-saved-filter-change=${this.#onSavedFilterChange}
            ></filter-saved-filter-combobox>
            ${usageLabel
              ? html`
                  <p class="saved-filters__usage">${usageLabel}</p>
                `
              : nothing}
          </div>

          <div class="saved-filters__actions">
            ${this.selectedSavedFilterId
              ? html`
                  <uui-button
                    look="secondary"
                    label="Delete saved search"
                    ?disabled=${this.#isDeleteDisabled()}
                    @click=${this.#onDeleteSavedFilter}
                  >
                    <uui-icon name="icon-trash"></uui-icon>
                    Delete
                  </uui-button>
                `
              : nothing}
            <uui-button
              look="primary"
              label="Save current search"
              ?disabled=${this.disabled || this.saving || this.saveDisabled}
              @click=${this.#onToggleSaveForm}
            >
              <uui-icon name="icon-save"></uui-icon>
              Save current search
            </uui-button>
          </div>
        </div>

        ${this._showSaveForm ? this.#renderSaveForm() : nothing}
      </div>
    `;
  }

  #renderHeader(count: number) {
    return html`
      <header class="fn-section-header saved-filters__header">
        <h3 class="fn-section-header__title">
          Saved searches
          <span class="fn-section-header__meta">(${this.loading ? "…" : count})</span>
        </h3>
        <p class="fn-section-header__description">
          Load a search you have saved before, or save the conditions below for next time.
        </p>
      </header>
    `;
  }

  #renderEmptyState() {
    return html`
      <div class="saved-filters__empty">
        <p class="saved-filters__empty-title">No saved searches yet</p>
        <p class="saved-filters__empty-text">
          Build a search below, then choose
          <strong>Save current search</strong> to reuse it later.
        </p>
      </div>
    `;
  }

  #renderSaveForm() {
    return html`
      <div class="saved-filters__save-form">
        <uui-input
          label="Search name"
          placeholder="e.g. Published articles from last month"
          maxlength=${SAVED_FILTER_MAX_NAME_LENGTH}
          .value=${this._saveName}
          ?disabled=${this.saving}
          @input=${(event: Event) => {
            this._saveName = (event.target as HTMLInputElement).value;
          }}
        ></uui-input>
        <div class="saved-filters__save-actions">
          <uui-button
            look="secondary"
            label="Cancel"
            ?disabled=${this.saving}
            @click=${this.#onCancelSave}
          >
            Cancel
          </uui-button>
          <uui-button
            look="primary"
            label="Save search"
            ?disabled=${this.saving || !this._saveName.trim()}
            @click=${this.#onSaveFilter}
          >
            ${this.saving ? "Saving…" : "Save"}
          </uui-button>
        </div>
      </div>
    `;
  }

  #getSelectedFilter(): SavedFilter | undefined {
    if (!this.selectedSavedFilterId) {
      return undefined;
    }

    return this.savedFilters.find(
      (filter) => filter.id === this.selectedSavedFilterId,
    );
  }

  #isDeleteDisabled(): boolean {
    return this.disabled || this.loading || this.saving;
  }

  #onSavedFilterChange(event: CustomEvent<{ value: string }>): void {
    const savedFilterId = event.detail.value;

    if (!savedFilterId) {
      return;
    }

    this.dispatchEvent(
      new CustomEvent(FILTER_NODES_SAVED_FILTER_LOAD, {
        detail: { savedFilterId },
        bubbles: true,
        composed: true,
      }),
    );
  }

  #onToggleSaveForm(): void {
    this._showSaveForm = !this._showSaveForm;

    if (!this._showSaveForm) {
      this._saveName = "";
    }
  }

  #onCancelSave(): void {
    this._showSaveForm = false;
    this._saveName = "";
  }

  #onSaveFilter(): void {
    const name = this._saveName.trim();

    if (!name) {
      return;
    }

    this.dispatchEvent(
      new CustomEvent(FILTER_NODES_SAVED_FILTER_SAVE, {
        detail: { name },
        bubbles: true,
        composed: true,
      }),
    );
  }

  async #onDeleteSavedFilter(): Promise<void> {
    const savedFilterId = this.selectedSavedFilterId;

    if (!savedFilterId) {
      return;
    }

    const savedFilter = this.#getSelectedFilter();
    const filterName = savedFilter?.name ?? "this search";

    const confirmed = await umbConfirmModal(this, {
      headline: "Delete saved search",
      content: `Delete "${filterName}"? This cannot be undone.`,
      color: "warning",
      confirmLabel: "Delete",
    }).catch(() => false);

    if (confirmed === false) {
      return;
    }

    this.dispatchEvent(
      new CustomEvent(FILTER_NODES_SAVED_FILTER_DELETE, {
        detail: { savedFilterId },
        bubbles: true,
        composed: true,
      }),
    );
  }

  resetSaveForm(): void {
    this._showSaveForm = false;
    this._saveName = "";
  }

  static override readonly styles = [UmbTextStyles, ...filterNodesSavedFiltersStyles];
}

declare global {
  interface HTMLElementTagNameMap {
    "filter-nodes-saved-filters": FilterNodesSavedFiltersElement;
  }
}

import {
  html,
  customElement,
  property,
  query,
  repeat,
  state,
  nothing,
} from "@umbraco-cms/backoffice/external/lit";
import { debounce } from "@umbraco-cms/backoffice/utils";
import { UmbLitElement } from "@umbraco-cms/backoffice/lit-element";
import { COMBOBOX_SEARCH_DEBOUNCE_MS } from "../../constants/filter-nodes.constants.js";
import type { SavedFilter } from "../../models/saved-filter-models.js";
import {
  buildComboboxLimitMessage,
  limitVisibleListItems,
} from "../../utils/combobox-list.utils.js";
import {
  formatSavedFilterOptionLabel,
  matchesSavedFilterSearch,
} from "../../utils/saved-filter.utils.js";
import { filterSavedFilterComboboxStyles } from "./filter-saved-filter-combobox.styles.js";

@customElement("filter-saved-filter-combobox")
export class FilterSavedFilterComboboxElement extends UmbLitElement {
  @property({ type: Array })
  savedFilters: readonly SavedFilter[] = [];

  @property({ type: String })
  value = "";

  @property({ type: String })
  label = "Saved search";

  @property({ type: String })
  placeholder = "Search saved searches...";

  @property({ type: Boolean })
  disabled = false;

  @property({ type: Boolean })
  loading = false;

  @state()
  private _filteredSavedFilters: readonly SavedFilter[] = [];

  @state()
  private _searchStatusMessage = "";

  @state()
  private _isSearching = false;

  @query("#saved-filter-combobox")
  private _combobox?: HTMLElement & { focus?: () => Promise<void> | void };

  readonly #debouncedFilter = debounce((searchTerm: string) => {
    this.#applySearch(searchTerm);
  }, COMBOBOX_SEARCH_DEBOUNCE_MS);

  override updated(changedProperties: Map<string, unknown>): void {
    if (changedProperties.has("savedFilters")) {
      this.#applySearch("");
    }
  }

  override disconnectedCallback(): void {
    this.#debouncedFilter.cancel();
    super.disconnectedCallback();
  }

  async focus(): Promise<void> {
    await this.updateComplete;
    await this._combobox?.focus?.();
  }

  override render() {
    const comboboxPlaceholder = this.loading
      ? "Loading saved searches…"
      : this.placeholder;

    return html`
      <div class="saved-filter-combobox">
        <uui-combobox
          id="saved-filter-combobox"
          class="saved-filters__select"
          label=${this.label}
          .value=${this.value}
          placeholder=${comboboxPlaceholder}
          ?disabled=${this.disabled || this.loading || this.savedFilters.length === 0}
          @search=${this.#onSearch}
          @change=${this.#onChange}
        >
          <uui-combobox-list>
            ${repeat(
              this._filteredSavedFilters,
              (savedFilter) => savedFilter.id,
              (savedFilter) => this.#renderOption(savedFilter),
            )}
            ${this._filteredSavedFilters.length === 0
              ? html`
                  <uui-combobox-list-option disabled value="">
                    <span class="saved-filter-option__empty">No matching saved searches</span>
                  </uui-combobox-list-option>
                `
              : nothing}
          </uui-combobox-list>
        </uui-combobox>
        <span class="saved-filter-combobox__status" aria-live="polite">
          ${this._searchStatusMessage}
        </span>
      </div>
    `;
  }

  #renderOption(savedFilter: SavedFilter) {
    const label = formatSavedFilterOptionLabel(savedFilter);

    return html`
      <uui-combobox-list-option .value=${savedFilter.id} .displayValue=${label}>
        <span class="saved-filter-option">
          <span class="saved-filter-option__name">${savedFilter.name}</span>
          <span class="saved-filter-option__meta">
            ${savedFilter.conditions.length}
            ${savedFilter.conditions.length === 1 ? "condition" : "conditions"}
          </span>
        </span>
      </uui-combobox-list-option>
    `;
  }

  #onSearch(event: Event): void {
    const searchTerm =
      (event.currentTarget as HTMLElement & { search?: string }).search ?? "";

    this.#debouncedFilter(searchTerm);
  }

  #onChange(event: Event): void {
    const nextValue = String(
      (event.currentTarget as HTMLElement & { value?: string }).value ?? "",
    );

    if (!nextValue) {
      return;
    }

    this.dispatchEvent(
      new CustomEvent("filter-saved-filter-change", {
        detail: { value: nextValue },
        bubbles: true,
        composed: true,
      }),
    );
  }

  #applySearch(searchTerm: string): void {
    const trimmed = searchTerm.trim();
    this._isSearching = Boolean(trimmed);
    const matched = this.savedFilters.filter((savedFilter) =>
      matchesSavedFilterSearch(savedFilter, searchTerm),
    );
    const limited = limitVisibleListItems(matched, this._isSearching);

    this._filteredSavedFilters = limited.items;
    this._searchStatusMessage = buildComboboxLimitMessage(
      limited.totalCount,
      limited.items.length,
      limited.truncated,
      this._isSearching,
      "saved searches",
    );
  }

  static override readonly styles = [filterSavedFilterComboboxStyles];
}

declare global {
  interface HTMLElementTagNameMap {
    "filter-saved-filter-combobox": FilterSavedFilterComboboxElement;
  }
}

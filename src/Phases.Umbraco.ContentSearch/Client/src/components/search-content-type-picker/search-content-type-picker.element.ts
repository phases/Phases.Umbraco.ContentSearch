import {
  html,
  customElement,
  property,
  repeat,
  state,
  nothing,
} from "@umbraco-cms/backoffice/external/lit";
import { debounce } from "@umbraco-cms/backoffice/utils";
import { UmbLitElement } from "@umbraco-cms/backoffice/lit-element";
import {
  CONTENT_TYPE_SEARCH_PLACEHOLDER,
  PICKER_SEARCH_DEBOUNCE_MS,
  PROPERTY_SEARCH_MAX_RENDERED_OPTIONS,
  PROPERTY_VIRTUAL_WINDOW_SIZE,
} from "../../constants/property-picker.constants.js";
import type { SearchContentTypeOption } from "../../models/search-builder.models.js";
import { buildPickerLimitMessage } from "../../utils/picker-list.utils.js";
import {
  createVirtualListWindow,
  getNextVirtualListVisibleCount,
  shouldLoadMoreVirtualListItems,
} from "../../utils/virtual-list.utils.js";
import { searchContentTypePickerStyles } from "./search-content-type-picker.styles.js";

export const SEARCH_CONTENT_TYPE_CHANGE = "search-content-type-change";

@customElement("search-content-type-picker")
export class SearchContentTypePickerElement extends UmbLitElement {
  @property({ type: String })
  value = "";

  @property({ type: Array })
  contentTypes: readonly SearchContentTypeOption[] = [];

  @property({ type: String })
  label = "Content type";

  @property({ type: String })
  placeholder = CONTENT_TYPE_SEARCH_PLACEHOLDER;

  @property({ type: Boolean })
  disabled = false;

  @property({ type: Boolean })
  error = false;

  @property({ type: Boolean })
  loading = false;

  @property({ type: String, attribute: "aria-describedby" })
  ariaDescribedBy = "";

  @state()
  private _visibleItems: readonly SearchContentTypeOption[] = [];

  @state()
  private _searchStatusMessage = "";

  @state()
  private _isSearching = false;

  #allMatches: readonly SearchContentTypeOption[] = [];
  #searchVisibleCount = PROPERTY_VIRTUAL_WINDOW_SIZE;
  #searchMatchCount = 0;

  readonly #debouncedFilter = debounce((searchTerm: string) => {
    this.#applySearch(searchTerm);
  }, PICKER_SEARCH_DEBOUNCE_MS);

  override updated(changedProperties: Map<string, unknown>): void {
    if (changedProperties.has("contentTypes")) {
      this.#applySearch("");
    }
  }

  override disconnectedCallback(): void {
    this.#debouncedFilter.cancel();
    super.disconnectedCallback();
  }

  override render() {
    const comboboxPlaceholder = this.loading ? "Loading…" : this.placeholder;

    return html`
      <div class="content-type-picker">
        <uui-combobox
          class="condition-row__control"
          label=${this.label}
          .value=${this.value}
          placeholder=${comboboxPlaceholder}
          aria-describedby=${this.ariaDescribedBy || nothing}
          ?disabled=${this.disabled || this.loading}
          ?error=${this.error}
          @search=${this.#onSearch}
          @change=${this.#onChange}
        >
          <uui-combobox-list @scroll=${this.#onListScroll}>
            ${this._visibleItems.length > 0
              ? repeat(
                  this._visibleItems,
                  (item) => item.alias,
                  (item) => this.#renderOption(item),
                )
              : html`
                  <uui-combobox-list-option disabled value="">
                    <span class="content-type-option__empty">
                      ${this._isSearching
                        ? "No matching content types."
                        : "No content types available."}
                    </span>
                  </uui-combobox-list-option>
                `}
          </uui-combobox-list>
        </uui-combobox>
        <span class="content-type-picker__status" aria-live="polite">
          ${this._searchStatusMessage}
        </span>
      </div>
    `;
  }

  #renderOption(item: SearchContentTypeOption) {
    const showAlias = item.name.localeCompare(item.alias, undefined, {
      sensitivity: "accent",
    }) !== 0;

    return html`
      <uui-combobox-list-option .value=${item.alias} .displayValue=${item.name}>
        <span class="content-type-option">
          <uui-icon
            class="content-type-option__icon"
            name=${item.icon?.trim() || "icon-document"}
          ></uui-icon>
          <span class="content-type-option__name">${item.name}</span>
          ${showAlias
            ? html`<span class="content-type-option__alias">${item.alias}</span>`
            : nothing}
        </span>
      </uui-combobox-list-option>
    `;
  }

  #onSearch(event: Event): void {
    const searchTerm =
      (event.currentTarget as HTMLElement & { search?: string }).search ?? "";
    this.#debouncedFilter(searchTerm);
  }

  #applySearch(searchTerm: string): void {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    this._isSearching = Boolean(normalizedSearch);

    const matches = normalizedSearch
      ? this.contentTypes.filter(
          (item) =>
            item.name.toLowerCase().includes(normalizedSearch) ||
            item.alias.toLowerCase().includes(normalizedSearch),
        )
      : [...this.contentTypes];

    this.#allMatches = matches;
    const virtualWindow = createVirtualListWindow(
      matches,
      PROPERTY_VIRTUAL_WINDOW_SIZE,
      PROPERTY_SEARCH_MAX_RENDERED_OPTIONS,
    );

    this.#searchMatchCount = virtualWindow.totalCount;
    this.#searchVisibleCount = virtualWindow.visibleCount;
    this._visibleItems = virtualWindow.items;
    this._searchStatusMessage =
      virtualWindow.totalCount === 0
        ? this._isSearching
          ? "No matching content types."
          : ""
        : buildPickerLimitMessage(
            virtualWindow.totalCount,
            virtualWindow.visibleCount,
            virtualWindow.truncated || virtualWindow.hasMore,
            this._isSearching,
            "content types",
          );
  }

  #loadMoreSearchResults(): void {
    const nextVisibleCount = getNextVirtualListVisibleCount(
      this.#searchVisibleCount,
      this.#searchMatchCount,
      PROPERTY_VIRTUAL_WINDOW_SIZE,
      PROPERTY_SEARCH_MAX_RENDERED_OPTIONS,
    );

    if (nextVisibleCount === this.#searchVisibleCount) {
      return;
    }

    const virtualWindow = createVirtualListWindow(
      this.#allMatches,
      nextVisibleCount,
      PROPERTY_SEARCH_MAX_RENDERED_OPTIONS,
    );

    this.#searchVisibleCount = virtualWindow.visibleCount;
    this._visibleItems = virtualWindow.items;
    this._searchStatusMessage = buildPickerLimitMessage(
      virtualWindow.totalCount,
      virtualWindow.visibleCount,
      virtualWindow.truncated || virtualWindow.hasMore,
      this._isSearching,
      "content types",
    );
  }

  #onListScroll(event: Event): void {
    const scrollElement = event.currentTarget as HTMLElement;

    if (
      shouldLoadMoreVirtualListItems(
        scrollElement.scrollTop,
        scrollElement.clientHeight,
        scrollElement.scrollHeight,
      )
    ) {
      this.#loadMoreSearchResults();
    }
  }

  #onChange(event: Event): void {
    const nextValue = String(
      (event.currentTarget as HTMLElement & { value?: string }).value ?? "",
    );

    this.dispatchEvent(
      new CustomEvent(SEARCH_CONTENT_TYPE_CHANGE, {
        detail: { value: nextValue },
        bubbles: true,
        composed: true,
      }),
    );
  }

  static override readonly styles = searchContentTypePickerStyles;
}

declare global {
  interface HTMLElementTagNameMap {
    "search-content-type-picker": SearchContentTypePickerElement;
  }
}

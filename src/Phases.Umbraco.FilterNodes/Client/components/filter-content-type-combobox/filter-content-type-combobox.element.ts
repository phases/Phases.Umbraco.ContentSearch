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
import type { ContentTypeListItem } from "../../models/filter-models.js";
import {
  filterContentTypes,
  formatContentTypeDisplayValue,
  matchesContentTypeSearch,
  shouldShowContentTypeAlias,
} from "../../utils/filter-condition.utils.js";
import {
  buildComboboxLimitMessage,
  limitVisibleListItems,
} from "../../utils/combobox-list.utils.js";
import { filterContentTypeComboboxStyles } from "./filter-content-type-combobox.styles.js";

@customElement("filter-content-type-combobox")
export class FilterContentTypeComboboxElement extends UmbLitElement {
  @property({ type: String })
  value = "";

  @property({ type: Array })
  contentTypes: readonly ContentTypeListItem[] = [];

  @property({ type: String })
  label = "Content type";

  @property({ type: String })
  placeholder = "Search content type...";

  @property({ type: Boolean })
  disabled = false;

  @property({ type: Boolean })
  error = false;

  @property({ type: Boolean })
  loading = false;

  @property({ type: String, attribute: "aria-describedby" })
  ariaDescribedBy = "";

  @state()
  private _filteredContentTypes: readonly ContentTypeListItem[] = [];

  @state()
  private _searchStatusMessage = "";

  @query("#content-type-combobox")
  private _combobox?: HTMLElement & { focus?: () => Promise<void> | void };

  readonly #debouncedFilter = debounce((searchTerm: string) => {
    this.#applySearch(searchTerm);
  }, COMBOBOX_SEARCH_DEBOUNCE_MS);

  override updated(changedProperties: Map<string, unknown>): void {
    if (changedProperties.has("contentTypes")) {
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
    const comboboxPlaceholder = this.loading ? "Loading…" : this.placeholder;

    return html`
      <div class="content-type-combobox">
        <uui-combobox
          id="content-type-combobox"
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
          <uui-combobox-list>
            ${repeat(
              this._filteredContentTypes,
              (contentType) => contentType.alias,
              (contentType) => this.#renderOption(contentType),
            )}
            ${this._filteredContentTypes.length === 0
              ? html`
                  <uui-combobox-list-option disabled value="">
                    <span class="content-type-option__empty">No matching content types</span>
                  </uui-combobox-list-option>
                `
              : ""}
          </uui-combobox-list>
        </uui-combobox>
        <span class="content-type-combobox__status" aria-live="polite">
          ${this._searchStatusMessage}
        </span>
      </div>
    `;
  }

  #renderOption(contentType: ContentTypeListItem) {
    const showAlias = shouldShowContentTypeAlias(contentType);

    return html`
      <uui-combobox-list-option
        .value=${contentType.alias}
        .displayValue=${formatContentTypeDisplayValue(contentType)}
      >
        <span class="content-type-option">
          <span class="content-type-option__name">${contentType.name}</span>
          ${showAlias
            ? html`<span class="content-type-option__alias">${contentType.alias}</span>`
            : ""}
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

    this.dispatchEvent(
      new CustomEvent("filter-content-type-change", {
        detail: { value: nextValue },
        bubbles: true,
        composed: true,
      }),
    );
  }

  #filterContentTypes(searchTerm: string): readonly ContentTypeListItem[] {
    return filterContentTypes(this.contentTypes).filter((contentType) =>
      matchesContentTypeSearch(contentType, searchTerm),
    );
  }

  #applySearch(searchTerm: string): void {
    const isSearching = Boolean(searchTerm.trim());
    const matched = this.#filterContentTypes(searchTerm);
    const limited = limitVisibleListItems(matched, isSearching);

    this._filteredContentTypes = limited.items;
    this._searchStatusMessage =
      matched.length === 0 && isSearching
        ? "No matching document types."
        : buildComboboxLimitMessage(
            limited.totalCount,
            limited.items.length,
            limited.truncated,
            isSearching,
            "document types",
          );
  }

  static override readonly styles = [filterContentTypeComboboxStyles];
}

declare global {
  interface HTMLElementTagNameMap {
    "filter-content-type-combobox": FilterContentTypeComboboxElement;
  }
}

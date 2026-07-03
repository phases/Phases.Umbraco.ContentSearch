import { html, customElement, property, state, nothing } from "@umbraco-cms/backoffice/external/lit";
import type { UUISelectEvent } from "@umbraco-cms/backoffice/external/uui";
import { UmbTextStyles } from "@umbraco-cms/backoffice/style";
import { UmbLitElement } from "@umbraco-cms/backoffice/lit-element";
import { MAX_CONDITION_COUNT, SHOW_SEARCHABLE_PROPERTIES_ONLY_LABEL, SEARCH_CULTURE_LABEL, SEARCH_CULTURE_LANGUAGE_LABEL, SEARCH_CULTURE_ALL_LABEL, SEARCH_CULTURE_CURRENT_LABEL, SEARCH_CULTURE_SPECIFIC_LABEL } from "../../constants/filter-nodes.constants.js";
import type { EditableFilterCondition } from "../../controllers/filter-nodes-workspace.models.js";
import type {
  FilterType,
  FilterablePropertyMetadata,
  LanguageListItem,
  SearchCultureMode,
  SearchScope,
  ContentTypeListItem,
} from "../../models/filter-models.js";
import { getBuilderHelperText } from "../../utils/filter-builder-guidance.utils.js";
import {
  countPropertySearchability,
  formatHiddenPropertiesHint,
  formatToolbarSearchabilitySummary,
} from "../../utils/property-searchability.utils.js";
import { getFilterQuerySummary, type FilterQuerySummaryPart } from "../../utils/filter-query-summary.utils.js";
import {
  filterPropertiesForPropertySelector,
  getEntireSitePropertyMetadata,
  isEntireSiteSearchScope,
  isReservedContentTypeAlias,
} from "../../utils/filter-condition.utils.js";
import {
  getFieldErrorsByConditionId,
  validateFilterConditions,
  type FilterConditionField,
  type FilterConditionFieldErrors,
} from "../../utils/filter-validation.utils.js";
import type { FilterConditionRowElement } from "../filter-condition-row/filter-condition-row.element.js";
import type {
  FilterConditionChangeEvent,
  FilterConditionLoadPropertiesEvent,
  FilterConditionRemoveEvent,
} from "../filter-condition-row/filter-condition-row.models.js";
import "../filter-condition-row/filter-condition-row.element.js";
import { filterNodesFilterBuilderStyles } from "./filter-nodes-filter-builder.styles.js";

const FILTER_TYPE_OPTIONS: ReadonlyArray<{
  value: FilterType;
  label: string;
}> = [
  { value: "All", label: "All conditions" },
  { value: "Any", label: "Any condition" },
];

function toFilterTypeSelectOptions(filterType: FilterType) {
  return FILTER_TYPE_OPTIONS.map((option) => ({
    name: option.label,
    value: option.value,
    selected: option.value === filterType,
  }));
}

const SEARCH_SCOPE_OPTIONS: ReadonlyArray<{
  value: SearchScope;
  label: string;
}> = [
  { value: "ContentType", label: "Selected content types" },
  { value: "EntireSite", label: "Entire site" },
];

function toSearchScopeSelectOptions(searchScope: SearchScope) {
  return SEARCH_SCOPE_OPTIONS.map((option) => ({
    name: option.label,
    value: option.value,
    selected: option.value === searchScope,
  }));
}

const SEARCH_CULTURE_OPTIONS: ReadonlyArray<{
  value: SearchCultureMode;
  label: string;
}> = [
  { value: "AllCultures", label: SEARCH_CULTURE_ALL_LABEL },
  { value: "CurrentCulture", label: SEARCH_CULTURE_CURRENT_LABEL },
  { value: "SpecificCulture", label: SEARCH_CULTURE_SPECIFIC_LABEL },
];

function toSearchCultureSelectOptions(searchCultureMode: SearchCultureMode) {
  return SEARCH_CULTURE_OPTIONS.map((option) => ({
    name: option.label,
    value: option.value,
    selected: option.value === searchCultureMode,
  }));
}

function toLanguageSelectOptions(
  languages: readonly LanguageListItem[],
  culture: string,
) {
  return languages.map((language) => ({
    name: language.name,
    value: language.isoCode,
    selected: language.isoCode === culture,
  }));
}

export const FILTER_NODES_FILTER_TYPE_CHANGE = "filter-nodes-filter-type-change";
export const FILTER_NODES_SEARCH_SCOPE_CHANGE = "filter-nodes-search-scope-change";
export const FILTER_NODES_SEARCH_CULTURE_MODE_CHANGE =
  "filter-nodes-search-culture-mode-change";
export const FILTER_NODES_CULTURE_CHANGE = "filter-nodes-culture-change";
export const FILTER_NODES_SHOW_SEARCHABLE_PROPERTIES_ONLY_CHANGE =
  "filter-nodes-show-searchable-properties-only-change";
export const FILTER_NODES_CONDITION_CHANGE = "filter-nodes-condition-change";
export const FILTER_NODES_CONDITION_REMOVE = "filter-nodes-condition-remove";
export const FILTER_NODES_CONDITION_ADD = "filter-nodes-condition-add";
export const FILTER_NODES_SEARCH = "filter-nodes-search";
export const FILTER_NODES_CLEAR_ALL = "filter-nodes-clear-all";

@customElement("filter-nodes-filter-builder")
export class FilterNodesFilterBuilderElement extends UmbLitElement {
  @property({ type: String })
  filterType: FilterType = "All";

  @property({ type: String })
  searchScope: SearchScope = "ContentType";

  @property({ type: String })
  searchCultureMode: SearchCultureMode = "AllCultures";

  @property({ type: String })
  culture = "";

  @property({ type: Array })
  languages: readonly LanguageListItem[] = [];

  @property({ type: Boolean })
  loadingLanguages = false;

  @property({ type: Array })
  conditions: readonly EditableFilterCondition[] = [];

  @property({ type: Array })
  contentTypes: readonly ContentTypeListItem[] = [];

  @property({ type: Object })
  propertyMetadataByContentType: Readonly<
    Record<string, readonly FilterablePropertyMetadata[]>
  > = {};

  @property({ type: Boolean })
  loading = false;

  @property({ type: Boolean })
  loadingMetadata = false;

  @property({ type: Array })
  loadingPropertyContentTypeAliases: readonly string[] = [];

  @property({ type: Boolean })
  hasSearched = false;

  @property({ type: Boolean })
  hasDraftChanges = false;

  @property({ type: Boolean })
  showSearchablePropertiesOnly = true;

  @state()
  private _showValidation = false;

  @state()
  private _fieldErrorsByConditionId: Readonly<
    Record<string, FilterConditionFieldErrors>
  > = {};

  #getFilterContext() {
    return {
      propertyMetadataByContentType: this.propertyMetadataByContentType,
      searchScope: this.searchScope,
      contentTypes: this.contentTypes,
    };
  }

  override render() {
    const filterContext = this.#getFilterContext();
    const validation = validateFilterConditions(
      this.conditions,
      filterContext,
      this.filterType,
    );
    const canSearch = validation.isValid;

    return html`
      <div class="filter-builder" @keydown=${this.#onKeydown}>
        ${this.#renderHeader()}
        ${this.#renderDraftBanner()}
        ${this.#renderControls()}
        ${this.#renderHelperText(canSearch)}
        <div class="filter-builder__query">
          ${this.conditions.map((condition, index) =>
            this.#renderConditionClause(condition, index),
          )}
        </div>
        ${this.#renderQuerySummary()}
        ${this.#renderAddCondition()}
        ${this.#renderActionBar(canSearch, validation.message)}
      </div>
    `;
  }

  #renderConditionClause(condition: EditableFilterCondition, index: number) {
    const connector = index === 0 ? "WHERE" : this.#getConnectorLabel();

    return html`
      <div class="filter-builder__clause">
        <filter-condition-row
          .conditionId=${condition.id}
          .connectorLabel=${connector}
          .searchScope=${this.searchScope}
          .contentTypes=${this.contentTypes}
          .propertyMetadata=${this.#getPropertyOptions(condition)}
          .propertyMetadataByContentType=${this.propertyMetadataByContentType}
          .propertyHiddenHint=${this.#getPropertyHiddenHint(condition)}
          .loadingProperties=${this.#isConditionLoadingProperties(condition)}
          .loadingContentTypes=${this.loadingMetadata &&
          (isEntireSiteSearchScope(this.searchScope) || !condition.contentTypeAlias)}
          .disabled=${this.loading}
          .removeDisabled=${this.conditions.length === 1}
          .showValidation=${this._showValidation}
          .fieldErrors=${this._fieldErrorsByConditionId[condition.id] ?? {}}
          .seed=${condition}
          @filter-condition-change=${this.#onConditionChange}
          @filter-condition-load-properties=${this.#onLoadProperties}
          @filter-condition-remove=${this.#onConditionRemove}
        ></filter-condition-row>
      </div>
    `;
  }

  #getConnectorLabel(): string {
    return this.filterType === "Any" ? "OR" : "AND";
  }

  #renderQuerySummary() {
    const summary = getFilterQuerySummary(
      this.conditions,
      this.filterType,
      this.#getFilterContext(),
    );

    return html`
      <div
        class="filter-builder__summary"
        role="region"
        aria-label="Search summary"
        aria-live="polite"
      >
        <p class="filter-builder__summary-heading">Search summary</p>
        ${summary.parts.length === 0
          ? html`
              <p class="filter-builder__summary-placeholder">
                ${summary.placeholder}
              </p>
            `
          : html`
              <div class="filter-builder__query-preview">
                ${summary.parts.map((part) => this.#renderQuerySummaryPart(part))}
              </div>
            `}
      </div>
    `;
  }

  #renderQuerySummaryPart(part: FilterQuerySummaryPart) {
    if (part.kind === "keyword") {
      return html`
        <p class="filter-builder__query-keyword">${part.keyword}</p>
      `;
    }

    return html`
      <p class="filter-builder__query-condition">${part.text}</p>
    `;
  }

  #isSearchReady(canSearch: boolean): boolean {
    if (!canSearch || this.loading || this.loadingMetadata) {
      return false;
    }

    if (this._showValidation && Object.keys(this._fieldErrorsByConditionId).length > 0) {
      return false;
    }

    return true;
  }

  #renderActionBar(canSearch: boolean, validationMessage?: string) {
    const searchReady = this.#isSearchReady(canSearch);

    return html`
      <div class="filter-builder__action-bar" role="toolbar" aria-label="Search actions">
        <div class="filter-builder__action-status">
          ${searchReady
            ? html`
                <uui-icon
                  class="filter-builder__action-status-icon"
                  name="icon-check"
                ></uui-icon>
                <p class="filter-builder__ready" role="status">
                  Your search is ready to run. Press Ctrl+Enter to search.
                </p>
              `
            : html`
                <p class="filter-builder__action-hint" role="status">
                  ${this._showValidation
                    ? "Please fix the highlighted fields below."
                    : validationMessage ??
                      getBuilderHelperText(this.conditions, this.searchScope)}
                </p>
              `}
        </div>
        <div class="filter-builder__actions">
          <uui-button
            look="secondary"
            label="Clear search"
            ?disabled=${this.loading}
            @click=${this.#dispatchClearAll}
          >
            Clear
          </uui-button>
          <uui-button
            look="primary"
            color="positive"
            label=${searchReady
              ? "Search content"
              : "Search content (complete your conditions first)"}
            ?disabled=${!searchReady}
            @click=${this.#onSearchClick}
          >
            <uui-icon name="icon-search"></uui-icon>
            Search
          </uui-button>
        </div>
      </div>
    `;
  }

  #renderDraftBanner() {
    if (!this.hasSearched || !this.hasDraftChanges) {
      return nothing;
    }

    return html`
      <uui-alert
        class="filter-builder__draft-banner"
        headline="Search not up to date"
        detail="Your conditions have changed. Click Search to refresh the results."
        color="warning"
      ></uui-alert>
    `;
  }

  #renderHelperText(canSearch: boolean) {
    if (canSearch || this._showValidation) {
      return nothing;
    }

    return nothing;
  }

  #renderControls() {
    return html`
      <div
        class="filter-builder__toolbar"
        role="toolbar"
        aria-label="Search builder options"
      >
        <div class="filter-builder__toolbar-group filter-builder__toolbar-group--match">
          <span class="filter-builder__control-label">Match</span>
          <uui-select
            class="filter-builder__toolbar-select filter-builder__toolbar-select--match"
            label="Match mode"
            .value=${this.filterType}
            .options=${toFilterTypeSelectOptions(this.filterType)}
            @change=${this.#onFilterTypeChange}
          ></uui-select>
        </div>
        <div class="filter-builder__toolbar-divider" aria-hidden="true"></div>
        <div class="filter-builder__toolbar-group filter-builder__toolbar-group--scope">
          <span class="filter-builder__control-label">Search scope</span>
          <uui-select
            class="filter-builder__toolbar-select filter-builder__toolbar-select--scope"
            label="Search scope"
            .value=${this.searchScope}
            .options=${toSearchScopeSelectOptions(this.searchScope)}
            @change=${this.#onSearchScopeChange}
          ></uui-select>
        </div>
        <div class="filter-builder__toolbar-divider" aria-hidden="true"></div>
        <div class="filter-builder__toolbar-group filter-builder__toolbar-group--culture">
          <span class="filter-builder__control-label">${SEARCH_CULTURE_LABEL}</span>
          <uui-select
            class="filter-builder__toolbar-select filter-builder__toolbar-select--culture"
            label=${SEARCH_CULTURE_LABEL}
            .value=${this.searchCultureMode}
            .options=${toSearchCultureSelectOptions(this.searchCultureMode)}
            @change=${this.#onSearchCultureModeChange}
          ></uui-select>
          ${this.searchCultureMode === "SpecificCulture"
            ? html`
                <uui-select
                  class="filter-builder__toolbar-select filter-builder__toolbar-select--language"
                  label=${SEARCH_CULTURE_LANGUAGE_LABEL}
                  .value=${this.culture}
                  .options=${toLanguageSelectOptions(this.languages, this.culture)}
                  ?disabled=${this.loadingLanguages || this.languages.length === 0}
                  @change=${this.#onCultureChange}
                ></uui-select>
              `
            : nothing}
        </div>
        <div class="filter-builder__toolbar-divider" aria-hidden="true"></div>
        <div
          class="filter-builder__toolbar-group filter-builder__toolbar-group--properties"
        >
          <uui-checkbox
            class="filter-builder__toolbar-checkbox"
            label=${SHOW_SEARCHABLE_PROPERTIES_ONLY_LABEL}
            .checked=${this.showSearchablePropertiesOnly}
            ?disabled=${this.loading}
            @change=${this.#onShowSearchablePropertiesOnlyChange}
          ></uui-checkbox>
          ${this.#getToolbarSearchabilitySummary()
            ? html`
                <span class="filter-builder__toolbar-summary"
                  >${this.#getToolbarSearchabilitySummary()}</span
                >
              `
            : nothing}
        </div>
      </div>
    `;
  }

  #onShowSearchablePropertiesOnlyChange(event: Event): void {
    const showSearchablePropertiesOnly = Boolean(
      (event.target as HTMLInputElement).checked,
    );

    if (showSearchablePropertiesOnly === this.showSearchablePropertiesOnly) {
      return;
    }

    this.#dispatchShowSearchablePropertiesOnlyChange(
      showSearchablePropertiesOnly,
    );
  }

  #onFilterTypeChange(event: UUISelectEvent): void {
    const filterType = String(event.target.value ?? "") as FilterType;

    if (filterType !== "All" && filterType !== "Any") {
      return;
    }

    if (filterType === this.filterType) {
      return;
    }

    this.#dispatchFilterTypeChange(filterType);
  }

  #onSearchScopeChange(event: UUISelectEvent): void {
    const searchScope = String(event.target.value ?? "") as SearchScope;

    if (searchScope !== "ContentType" && searchScope !== "EntireSite") {
      return;
    }

    if (searchScope === this.searchScope) {
      return;
    }

    this.#dispatchSearchScopeChange(searchScope);
  }

  #onSearchCultureModeChange(event: UUISelectEvent): void {
    const searchCultureMode = String(event.target.value ?? "") as SearchCultureMode;

    if (
      searchCultureMode !== "AllCultures" &&
      searchCultureMode !== "CurrentCulture" &&
      searchCultureMode !== "SpecificCulture"
    ) {
      return;
    }

    if (searchCultureMode === this.searchCultureMode) {
      return;
    }

    this.dispatchEvent(
      new CustomEvent(FILTER_NODES_SEARCH_CULTURE_MODE_CHANGE, {
        detail: { searchCultureMode },
        bubbles: true,
        composed: true,
      }),
    );
  }

  #onCultureChange(event: UUISelectEvent): void {
    const culture = String(event.target.value ?? "");

    if (!culture || culture === this.culture) {
      return;
    }

    this.dispatchEvent(
      new CustomEvent(FILTER_NODES_CULTURE_CHANGE, {
        detail: { culture },
        bubbles: true,
        composed: true,
      }),
    );
  }

  #renderHeader() {
    return html`
      <header class="fn-section-header filter-builder__header">
        <h3 class="fn-section-header__title">Search builder</h3>
        <p class="fn-section-header__description">
          Add conditions, review the summary, then search your content.
        </p>
      </header>
    `;
  }

  #renderAddCondition() {
    const canAddMore = this.conditions.length < MAX_CONDITION_COUNT;

    return html`
      <div class="filter-builder__add">
        <uui-button
          look="secondary"
          label="Add condition"
          ?disabled=${!canAddMore || this.loading}
          @click=${this.#dispatchConditionAdd}
        >
          <uui-icon name="icon-add"></uui-icon>
          Add condition
        </uui-button>
      </div>
    `;
  }

  async #onSearchClick(): Promise<void> {
    const filterContext = this.#getFilterContext();
    const validation = validateFilterConditions(
      this.conditions,
      filterContext,
      this.filterType,
    );

    if (!validation.isValid) {
      this._showValidation = true;
      this._fieldErrorsByConditionId = getFieldErrorsByConditionId(
        validation.errors,
      );

      await this.updateComplete;
      this.#focusFirstInvalidField(validation.firstError);
      return;
    }

    this.#clearValidation();
    this.#dispatchSearch();
  }

  #onKeydown(event: KeyboardEvent): void {
    if (event.key !== "Enter" || !(event.ctrlKey || event.metaKey)) {
      return;
    }

    const filterContext = this.#getFilterContext();
    const canSearch = validateFilterConditions(
      this.conditions,
      filterContext,
      this.filterType,
    ).isValid;

    if (!this.#isSearchReady(canSearch)) {
      return;
    }

    event.preventDefault();
    void this.#onSearchClick();
  }

  #getPropertyHiddenHint(
    condition: EditableFilterCondition,
  ): string {
    if (!this.showSearchablePropertiesOnly) {
      return "";
    }

    const properties = isEntireSiteSearchScope(this.searchScope)
      ? getEntireSitePropertyMetadata(this.contentTypes)
      : this.#getContentTypePropertyMetadata(condition);

    if (properties.length === 0) {
      return "";
    }

    return (
      formatHiddenPropertiesHint(countPropertySearchability(properties)) ?? ""
    );
  }

  #getToolbarSearchabilitySummary(): string | undefined {
    if (!this.showSearchablePropertiesOnly) {
      return undefined;
    }

    const properties = isEntireSiteSearchScope(this.searchScope)
      ? getEntireSitePropertyMetadata(this.contentTypes)
      : [
          ...new Set(
            this.conditions
              .map((condition) => condition.contentTypeAlias.trim())
              .filter(
                (alias) => alias && !isReservedContentTypeAlias(alias),
              ),
          ),
        ].flatMap(
          (alias) => this.propertyMetadataByContentType[alias] ?? [],
        );

    if (properties.length === 0) {
      return undefined;
    }

    return formatToolbarSearchabilitySummary(
      countPropertySearchability(properties),
    );
  }

  #getPropertyOptions(
    condition: EditableFilterCondition,
  ): readonly FilterablePropertyMetadata[] {
    const properties = isEntireSiteSearchScope(this.searchScope)
      ? getEntireSitePropertyMetadata(this.contentTypes)
      : this.#getContentTypePropertyMetadata(condition);

    return filterPropertiesForPropertySelector(
      properties,
      this.showSearchablePropertiesOnly,
      condition.propertyAlias,
    );
  }

  #getContentTypePropertyMetadata(
    condition: EditableFilterCondition,
  ): readonly FilterablePropertyMetadata[] {
    const contentTypeAlias = condition.contentTypeAlias;

    if (!contentTypeAlias || isReservedContentTypeAlias(contentTypeAlias)) {
      return [];
    }

    return this.propertyMetadataByContentType[contentTypeAlias] ?? [];
  }

  #isConditionLoadingProperties(condition: EditableFilterCondition): boolean {
    if (isEntireSiteSearchScope(this.searchScope)) {
      return false;
    }

    const alias = condition.contentTypeAlias.trim();

    if (!alias || isReservedContentTypeAlias(alias)) {
      return false;
    }

    return this.loadingPropertyContentTypeAliases.includes(alias);
  }

  #onConditionChange(event: FilterConditionChangeEvent): void {
    const { conditionId, ...patch } = event.detail;

    this.#clearValidation();
    this.#dispatchConditionChange(conditionId, patch);
  }

  #onLoadProperties(event: FilterConditionLoadPropertiesEvent): void {
    const { conditionId, contentTypeAlias } = event.detail;

    this.#dispatchConditionChange(conditionId, { contentTypeAlias });
  }

  #onConditionRemove(event: FilterConditionRemoveEvent): void {
    this.#dispatchConditionRemove(event.detail.conditionId);
  }

  #dispatchFilterTypeChange(filterType: FilterType): void {
    this.dispatchEvent(
      new CustomEvent(FILTER_NODES_FILTER_TYPE_CHANGE, {
        detail: { filterType },
        bubbles: true,
        composed: true,
      }),
    );
  }

  #dispatchSearchScopeChange(searchScope: SearchScope): void {
    this.#clearValidation();
    this.dispatchEvent(
      new CustomEvent(FILTER_NODES_SEARCH_SCOPE_CHANGE, {
        detail: { searchScope },
        bubbles: true,
        composed: true,
      }),
    );
  }

  #dispatchShowSearchablePropertiesOnlyChange(
    showSearchablePropertiesOnly: boolean,
  ): void {
    this.dispatchEvent(
      new CustomEvent(FILTER_NODES_SHOW_SEARCHABLE_PROPERTIES_ONLY_CHANGE, {
        detail: { showSearchablePropertiesOnly },
        bubbles: true,
        composed: true,
      }),
    );
  }

  #dispatchConditionChange(
    conditionId: string,
    patch: Partial<EditableFilterCondition>,
  ): void {
    this.dispatchEvent(
      new CustomEvent(FILTER_NODES_CONDITION_CHANGE, {
        detail: { conditionId, patch },
        bubbles: true,
        composed: true,
      }),
    );
  }

  #dispatchConditionRemove(conditionId: string): void {
    this.dispatchEvent(
      new CustomEvent(FILTER_NODES_CONDITION_REMOVE, {
        detail: { conditionId },
        bubbles: true,
        composed: true,
      }),
    );
  }

  #dispatchConditionAdd(): void {
    this.dispatchEvent(
      new CustomEvent(FILTER_NODES_CONDITION_ADD, {
        bubbles: true,
        composed: true,
      }),
    );
  }

  #dispatchSearch(): void {
    this.dispatchEvent(
      new CustomEvent(FILTER_NODES_SEARCH, {
        bubbles: true,
        composed: true,
      }),
    );
  }

  #focusFirstInvalidField(
    firstError?: { conditionId: string; field: FilterConditionField },
  ): void {
    if (!firstError) {
      return;
    }

    const row = this.renderRoot.querySelector(
      `filter-condition-row[data-condition-id="${firstError.conditionId}"]`,
    ) as FilterConditionRowElement | null;

    row?.focusField(firstError.field);
  }

  #clearValidation(): void {
    this._showValidation = false;
    this._fieldErrorsByConditionId = {};
  }

  #dispatchClearAll(): void {
    this.#clearValidation();
    this.dispatchEvent(
      new CustomEvent(FILTER_NODES_CLEAR_ALL, {
        bubbles: true,
        composed: true,
      }),
    );
  }

  static override readonly styles = [UmbTextStyles, ...filterNodesFilterBuilderStyles];
}

declare global {
  interface HTMLElementTagNameMap {
    "filter-nodes-filter-builder": FilterNodesFilterBuilderElement;
  }
}

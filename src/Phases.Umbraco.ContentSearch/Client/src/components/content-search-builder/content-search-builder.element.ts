import {
  html,
  customElement,
  property,
  state,
  nothing,
} from "@umbraco-cms/backoffice/external/lit";
import type { UUISelectEvent } from "@umbraco-cms/backoffice/external/uui";
import { UmbTextStyles } from "@umbraco-cms/backoffice/style";
import { UmbLitElement } from "@umbraco-cms/backoffice/lit-element";
import { UMB_VARIANT_CONTEXT } from "@umbraco-cms/backoffice/variant";
import type { UmbVariantContext } from "@umbraco-cms/backoffice/variant";
import { SEARCH_BUILDER_TITLE } from "../../constants/content-search.constants.js";
import {
  MAX_SEARCH_CONDITIONS,
  SEARCH_BUILDER_SINGLE_CONDITION_MODE,
  SEARCH_BUILDER_UI_MAX_CONDITIONS,
  SEARCH_MATCH_MODE_OPTIONS,
} from "../../constants/search-builder.constants.js";
import {
  SEARCH_CULTURE_LABEL,
  SEARCH_CULTURE_LANGUAGE_LABEL,
  SEARCH_CULTURE_MODE_OPTIONS,
} from "../../constants/search-culture.constants.js";
import {
  createEmptySearchCondition,
  type SearchCondition,
  type SearchMatchMode,
  type SearchContentTypeOption,
} from "../../models/search-builder.models.js";
import type {
  LanguageListItem,
  SearchCultureMode,
} from "../../models/search-culture.models.js";
import type { SearchPropertyMetadata } from "../../models/metadata.models.js";
import { createMetadataApiService } from "../../services/metadata-api-service.js";
import {
  cloneSearchCondition,
  createDefaultBuilderConditions,
  getConditionConnectorLabel,
  isSearchConditionEmpty,
  normalizeConditionsForBuilder,
  reorderConditions,
} from "../../utils/search-condition.utils.js";
import {
  getFieldErrorsByConditionId,
  validateSearchConditions,
} from "../../utils/search-condition-validation.utils.js";
import type { SearchConditionChangeEvent } from "../search-condition-row/search-condition-row.models.js";
import "../search-condition-row/search-condition-row.element.js";
import {
  contentSearchSectionHeaderStyles,
  contentSearchSrOnlyStyles,
  contentSearchUiTokens,
} from "../../styles/content-search-ui.styles.js";
import { contentSearchBuilderStyles } from "./content-search-builder.styles.js";
import { CONTENT_SEARCH_APPLY_DEFINITION } from "../../models/saved-search.models.js";
import {
  createWildcardContentTypeOption,
  getWildcardPropertyMetadata,
  isWildcardContentTypeAlias,
} from "../../utils/wildcard-content-type.utils.js";
import "../content-search-expandable-panel/content-search-expandable-panel.element.js";

interface ApplySearchDefinitionDetail {
  readonly matchMode: SearchMatchMode;
  readonly conditions: readonly SearchCondition[];
  readonly searchCultureMode: SearchCultureMode;
  readonly culture: string;
}

@customElement("content-search-builder")
export class ContentSearchBuilderElement extends UmbLitElement {
  @property({ type: Boolean, reflect: true })
  searching = false;

  @state()
  private _conditions: SearchCondition[] = createDefaultBuilderConditions();

  @state()
  private _matchMode: SearchMatchMode = "all";

  @state()
  private _showValidation = false;

  @state()
  private _draggingId: string | null = null;

  @state()
  private _dropTargetId: string | null = null;

  @state()
  private _contentTypes: readonly SearchContentTypeOption[] = [];

  @state()
  private _propertyMetadataByContentType: Record<
    string,
    readonly SearchPropertyMetadata[]
  > = {};

  @state()
  private _loadingContentTypes = false;

  @state()
  private _loadingPropertiesFor: string[] = [];

  @state()
  private _searchCultureMode: SearchCultureMode = "AllCultures";

  @state()
  private _culture = "";

  @state()
  private _languages: readonly LanguageListItem[] = [];

  @state()
  private _loadingLanguages = false;

  #metadataApi = createMetadataApiService();
  #contentTypesAbortController?: AbortController;
  #languagesAbortController?: AbortController;
  #variantContext?: UmbVariantContext;

  #keyboardListener = (event: KeyboardEvent): void => {
    if (event.key !== "Enter" || !(event.ctrlKey || event.metaKey)) {
      return;
    }

    if (!this.contains(document.activeElement)) {
      return;
    }

    event.preventDefault();
    this.#onSearch();
  };

  override connectedCallback(): void {
    super.connectedCallback();
    this.#ensureUiConditions();
    window.addEventListener("keydown", this.#keyboardListener);
    this.addEventListener(CONTENT_SEARCH_APPLY_DEFINITION, this.#onApplyDefinition);
    void this.#loadContentTypes();
    void this.#loadLanguages();

    this.consumeContext(UMB_VARIANT_CONTEXT, (variantContext) => {
      if (!variantContext) {
        return;
      }

      this.#variantContext = variantContext;

      this.observe(variantContext.appCulture, (culture) => {
        this.#setCurrentBackofficeCulture(culture);
      });
    });
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    window.removeEventListener("keydown", this.#keyboardListener);
    this.removeEventListener(CONTENT_SEARCH_APPLY_DEFINITION, this.#onApplyDefinition);
    this.#contentTypesAbortController?.abort();
    this.#languagesAbortController?.abort();
  }

  async applySearchDefinition(detail: ApplySearchDefinitionDetail): Promise<void> {
    this._matchMode = SEARCH_BUILDER_SINGLE_CONDITION_MODE ? "all" : detail.matchMode;
    this._conditions = normalizeConditionsForBuilder(detail.conditions);
    this._searchCultureMode = detail.searchCultureMode;
    this._culture = detail.culture;
    this._showValidation = false;
    this.#ensureUiConditions();
    await this.#preloadPropertiesForConditions();
    await this.updateComplete;
  }

  resetBuilder(): void {
    this._conditions = createDefaultBuilderConditions();
    this._matchMode = "all";
    this._searchCultureMode = "AllCultures";
    this._culture = "";
    this._showValidation = false;
    this._draggingId = null;
    this._dropTargetId = null;
  }

  async ensurePropertiesForContentTypes(
    contentTypeAliases: readonly string[],
  ): Promise<void> {
    await Promise.all(
      contentTypeAliases.map((alias) => this.#ensurePropertiesLoaded(alias)),
    );
  }

  #onApplyDefinition = (event: Event): void => {
    this.applySearchDefinition(
      (event as CustomEvent<ApplySearchDefinitionDetail>).detail,
    );
  };

  override render() {
    return SEARCH_BUILDER_SINGLE_CONDITION_MODE
      ? this.#renderSingleConditionBuilder()
      : this.#renderMultiConditionBuilder();
  }

  #renderSingleConditionBuilder() {
    const condition = this._conditions[0];
    const fieldErrorsByConditionId = getFieldErrorsByConditionId(
      validateSearchConditions(
        this._conditions,
        this.#getValidationProperties(),
      ).errors,
    );
    const canClear = condition ? !isSearchConditionEmpty(condition) : false;

    return html`
      <div class="search-builder search-builder--single">
        <header class="search-builder__header cs-section-header">
          <h2 class="cs-section-header__title search-builder__title">${SEARCH_BUILDER_TITLE}</h2>
          <div class="search-builder__header-actions">
            ${this.#renderCultureControls()}
          </div>
        </header>

        <div class="search-builder__form-panel" role="region" aria-label="Search condition">
          ${condition
            ? html`
                <search-condition-row
                  single-mode
                  data-condition-id=${condition.id}
                  .conditionId=${condition.id}
                  .seed=${condition}
                  .contentTypes=${this._contentTypes}
                  .properties=${this._propertyMetadataByContentType[
                    condition.contentTypeAlias
                  ] ?? []}
                  .contentTypesLoading=${this._loadingContentTypes}
                  .propertiesLoading=${this._loadingPropertiesFor.includes(
                    condition.contentTypeAlias,
                  )}
                  .showValidation=${this._showValidation}
                  .fieldErrors=${fieldErrorsByConditionId[condition.id] ?? {}}
                  @search-condition-change=${this.#onConditionChange}
                ></search-condition-row>
              `
            : nothing}
        </div>

        <div class="search-builder__action-bar" role="toolbar" aria-label="Search actions">
          <content-search-expandable-panel label="Shortcuts">
            <ul class="search-builder__tips">
              <li>Use <kbd>Ctrl</kbd>+<kbd>Enter</kbd> to run a search.</li>
            </ul>
          </content-search-expandable-panel>
          <div class="search-builder__actions">
            <uui-button
              look="secondary"
              label="Clear"
              ?disabled=${!canClear}
              @click=${this.#onClear}
            >
              Clear
            </uui-button>
            <uui-button look="primary" label="Search" ?disabled=${this.searching} ?loading=${this.searching} @click=${this.#onSearch}>
              <uui-icon name="icon-search"></uui-icon>
              Search
            </uui-button>
          </div>
        </div>
      </div>
    `;
  }

  #renderMultiConditionBuilder() {
    const fieldErrorsByConditionId = getFieldErrorsByConditionId(
      validateSearchConditions(
        this._conditions,
        this.#getValidationProperties(),
      ).errors,
    );
    const canSearch = this._conditions.length > 0;
    const atLimit = this._conditions.length >= MAX_SEARCH_CONDITIONS;

    return html`
      <div class="search-builder">
        <header class="search-builder__header cs-section-header">
          <h2 class="cs-section-header__title search-builder__title">${SEARCH_BUILDER_TITLE}</h2>
          <div class="search-builder__header-actions">
            ${this.#renderCultureControls()}
            <uui-select
              class="search-builder__match"
              label="Match"
              .value=${this._matchMode}
              .options=${SEARCH_MATCH_MODE_OPTIONS.map((option) => ({
                name: option.label,
                value: option.value,
                selected: option.value === this._matchMode,
              }))}
              @change=${this.#onMatchModeChange}
            ></uui-select>
            <uui-button
              look="outline"
              label="Add condition"
              ?disabled=${atLimit}
              @click=${this.#onAddCondition}
            >
              <uui-icon name="icon-add"></uui-icon>
              Add condition
            </uui-button>
          </div>
        </header>

        ${atLimit
          ? html`
              <p class="search-builder__limit cs-sr-only" role="status">
                Maximum of ${MAX_SEARCH_CONDITIONS} conditions reached.
              </p>
            `
          : nothing}

        <div
          class="search-builder__canvas"
          role="region"
          aria-label="Search conditions"
          @dragover=${this.#onListDragOver}
          @drop=${this.#onListDrop}
        >
          ${this._conditions.length === 0
            ? html`
                <div class="search-builder__canvas-empty">
                  <uui-button
                    look="placeholder"
                    label="Add condition"
                    class="search-builder__add"
                    @click=${this.#onAddCondition}
                  >
                    <uui-icon name="icon-add"></uui-icon>
                    Add condition
                  </uui-button>
                </div>
              `
            : html`
                <div class="condition-list">
                  ${this._conditions.map((condition, index) => html`
                    <div
                      class="condition-list__item"
                      data-condition-id=${condition.id}
                      @dragover=${this.#onItemDragOver}
                      @dragleave=${this.#onItemDragLeave}
                    >
                      <search-condition-row
                        data-condition-id=${condition.id}
                        .conditionId=${condition.id}
                        .connectorLabel=${getConditionConnectorLabel(
                          index,
                          this._matchMode,
                        )}
                        .seed=${condition}
                        .contentTypes=${this._contentTypes}
                        .properties=${this._propertyMetadataByContentType[
                          condition.contentTypeAlias
                        ] ?? []}
                        .contentTypesLoading=${this._loadingContentTypes}
                        .propertiesLoading=${this._loadingPropertiesFor.includes(
                          condition.contentTypeAlias,
                        )}
                        .showValidation=${this._showValidation}
                        .fieldErrors=${fieldErrorsByConditionId[condition.id] ?? {}}
                        .removeDisabled=${false}
                        .duplicateDisabled=${atLimit}
                        ?dragging=${this._draggingId === condition.id}
                        ?drop-target=${this._dropTargetId === condition.id}
                        @search-condition-change=${this.#onConditionChange}
                        @search-condition-remove=${this.#onConditionRemove}
                        @search-condition-duplicate=${this.#onConditionDuplicate}
                        @search-condition-reorder=${this.#onConditionReorder}
                        @search-condition-drag-start=${this.#onConditionDragStart}
                        @search-condition-drag-end=${this.#onConditionDragEnd}
                      ></search-condition-row>
                    </div>
                  `)}
                </div>
              `}
        </div>

        <div class="search-builder__action-bar" role="toolbar" aria-label="Search actions">
          <content-search-expandable-panel label="Shortcuts">
            <ul class="search-builder__tips">
              <li>Use <kbd>Ctrl</kbd>+<kbd>Enter</kbd> to run a search.</li>
              <li>Up to ${MAX_SEARCH_CONDITIONS} conditions per search.</li>
            </ul>
          </content-search-expandable-panel>
          <div class="search-builder__actions">
            <uui-button
              look="secondary"
              label="Clear"
              ?disabled=${!canSearch}
              @click=${this.#onClear}
            >
              Clear
            </uui-button>
            <uui-button
              look="primary"
              label="Search"
              ?disabled=${!canSearch || this.searching}
              ?loading=${this.searching}
              @click=${this.#onSearch}
            >
              <uui-icon name="icon-search"></uui-icon>
              Search
            </uui-button>
          </div>
        </div>
      </div>
    `;
  }

  #renderCultureControls() {
    return html`
      <div class="search-builder__culture-group">
        <span class="search-builder__control-label">${SEARCH_CULTURE_LABEL}</span>
        <uui-select
          class="search-builder__culture-mode"
          label=${SEARCH_CULTURE_LABEL}
          .value=${this._searchCultureMode}
          .options=${SEARCH_CULTURE_MODE_OPTIONS.map((option) => ({
            name: option.label,
            value: option.value,
            selected: option.value === this._searchCultureMode,
          }))}
          @change=${this.#onSearchCultureModeChange}
        ></uui-select>
        ${this._searchCultureMode === "SpecificCulture"
          ? html`
              <uui-select
                class="search-builder__culture-language"
                label=${SEARCH_CULTURE_LANGUAGE_LABEL}
                .value=${this._culture}
                .options=${this._languages.map((language) => ({
                  name: language.name,
                  value: language.isoCode,
                  selected: language.isoCode === this._culture,
                }))}
                ?disabled=${this._loadingLanguages || this._languages.length === 0}
                @change=${this.#onCultureChange}
              ></uui-select>
            `
          : nothing}
      </div>
    `;
  }

  #ensureUiConditions(): void {
    if (!SEARCH_BUILDER_SINGLE_CONDITION_MODE) {
      return;
    }

    this._conditions = normalizeConditionsForBuilder(this._conditions);
  }

  async #preloadPropertiesForConditions(): Promise<void> {
    const aliases = [
      ...new Set(
        this._conditions
          .map((condition) => condition.contentTypeAlias.trim())
          .filter(Boolean),
      ),
    ];

    await Promise.all(aliases.map((alias) => this.#ensurePropertiesLoaded(alias)));
  }

  #onMatchModeChange(event: UUISelectEvent): void {
    const value = String(event.target.value ?? "");

    if (value !== "all" && value !== "any") {
      return;
    }

    this._matchMode = value;
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

    if (searchCultureMode === this._searchCultureMode) {
      return;
    }

    const culture =
      searchCultureMode === "SpecificCulture"
        ? this._culture || this._languages[0]?.isoCode || ""
        : searchCultureMode === "CurrentCulture"
          ? this._culture
          : "";

    this._searchCultureMode = searchCultureMode;
    this._culture = culture;

    if (searchCultureMode === "CurrentCulture") {
      void this.#variantContext?.getAppCulture().then((currentCulture) => {
        this.#setCurrentBackofficeCulture(currentCulture);
      });
    }
  }

  #onCultureChange(event: UUISelectEvent): void {
    const culture = String(event.target.value ?? "");

    if (!culture || culture === this._culture) {
      return;
    }

    this._culture = culture;
  }

  #setCurrentBackofficeCulture(culture: string | null | undefined): void {
    const normalizedCulture = culture?.trim() ?? "";

    if (
      this._searchCultureMode !== "CurrentCulture" ||
      normalizedCulture === this._culture
    ) {
      return;
    }

    this._culture = normalizedCulture;
  }

  async #loadLanguages(): Promise<void> {
    this._loadingLanguages = true;
    this.#languagesAbortController?.abort();
    this.#languagesAbortController = new AbortController();

    try {
      this._languages = await this.#metadataApi.getLanguages(
        this.#languagesAbortController.signal,
      );

      if (
        this._searchCultureMode === "SpecificCulture" &&
        !this._culture &&
        this._languages.length > 0
      ) {
        this._culture = this._languages[0]?.isoCode ?? "";
      }
    } catch {
      this._languages = [];
    } finally {
      this._loadingLanguages = false;
    }
  }

  #onAddCondition(): void {
    const limit = SEARCH_BUILDER_SINGLE_CONDITION_MODE
      ? SEARCH_BUILDER_UI_MAX_CONDITIONS
      : MAX_SEARCH_CONDITIONS;

    if (this._conditions.length >= limit) {
      return;
    }

    this._conditions = [...this._conditions, createEmptySearchCondition()];
    this._showValidation = false;
  }

  #onConditionChange(event: SearchConditionChangeEvent): void {
    const { conditionId, contentTypeAlias, propertyAlias, operator, value } =
      event.detail;

    const previous = this._conditions.find(
      (condition) => condition.id === conditionId,
    );
    const contentTypeChanged =
      previous?.contentTypeAlias !== contentTypeAlias && Boolean(contentTypeAlias);

    this._conditions = this._conditions.map((condition) =>
      condition.id === conditionId
        ? { ...condition, contentTypeAlias, propertyAlias, operator, value }
        : condition,
    );

    if (contentTypeChanged) {
      void this.#ensurePropertiesLoaded(contentTypeAlias);
    }
  }

  async #loadContentTypes(): Promise<void> {
    this._loadingContentTypes = true;
    this.#contentTypesAbortController?.abort();
    this.#contentTypesAbortController = new AbortController();

    try {
      const contentTypes = await this.#metadataApi.getContentTypes(
        this.#contentTypesAbortController.signal,
      );
      this._contentTypes = [createWildcardContentTypeOption(), ...contentTypes];
    } catch {
      this._contentTypes = [];
    } finally {
      this._loadingContentTypes = false;
    }
  }

  async #ensurePropertiesLoaded(contentTypeAlias: string): Promise<void> {
    const normalizedAlias = contentTypeAlias.trim();

    if (!normalizedAlias || this._propertyMetadataByContentType[normalizedAlias]) {
      return;
    }

    if (isWildcardContentTypeAlias(normalizedAlias)) {
      this._propertyMetadataByContentType = {
        ...this._propertyMetadataByContentType,
        [normalizedAlias]: getWildcardPropertyMetadata(),
      };
      return;
    }

    if (this._loadingPropertiesFor.includes(normalizedAlias)) {
      return;
    }

    this._loadingPropertiesFor = [...this._loadingPropertiesFor, normalizedAlias];

    try {
      const properties = await this.#metadataApi.getPropertyMetadata(normalizedAlias);
      this._propertyMetadataByContentType = {
        ...this._propertyMetadataByContentType,
        [normalizedAlias]: properties,
      };
    } catch {
      this._propertyMetadataByContentType = {
        ...this._propertyMetadataByContentType,
        [normalizedAlias]: [],
      };
    } finally {
      this._loadingPropertiesFor = this._loadingPropertiesFor.filter(
        (alias) => alias !== normalizedAlias,
      );
    }
  }

  #onConditionRemove(event: CustomEvent<{ conditionId: string }>): void {
    this._conditions = this._conditions.filter(
      (condition) => condition.id !== event.detail.conditionId,
    );

    if (this._conditions.length === 0) {
      this._showValidation = false;
    }
  }

  #onConditionDuplicate(event: CustomEvent<{ conditionId: string }>): void {
    const limit = SEARCH_BUILDER_SINGLE_CONDITION_MODE
      ? SEARCH_BUILDER_UI_MAX_CONDITIONS
      : MAX_SEARCH_CONDITIONS;

    if (this._conditions.length >= limit) {
      return;
    }

    const source = this._conditions.find(
      (condition) => condition.id === event.detail.conditionId,
    );

    if (!source) {
      return;
    }

    const duplicate = cloneSearchCondition(source);
    const index = this._conditions.findIndex(
      (condition) => condition.id === source.id,
    );
    const next = [...this._conditions];
    next.splice(index + 1, 0, duplicate);
    this._conditions = next;

    if (duplicate.contentTypeAlias) {
      void this.#ensurePropertiesLoaded(duplicate.contentTypeAlias);
    }
  }

  #onConditionReorder(
    event: CustomEvent<{ conditionId: string; direction: "up" | "down" }>,
  ): void {
    const index = this._conditions.findIndex(
      (condition) => condition.id === event.detail.conditionId,
    );

    if (index < 0) {
      return;
    }

    const targetIndex =
      event.detail.direction === "up" ? index - 1 : index + 1;

    this._conditions = reorderConditions(this._conditions, index, targetIndex);
  }

  #onConditionDragStart(event: CustomEvent<{ conditionId: string }>): void {
    this._draggingId = event.detail.conditionId;
  }

  #onConditionDragEnd(): void {
    this._draggingId = null;
    this._dropTargetId = null;
  }

  #onListDragOver(event: DragEvent): void {
    event.preventDefault();

    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = "move";
    }
  }

  #onItemDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();

    const targetId = (event.currentTarget as HTMLElement).dataset.conditionId;

    if (targetId && targetId !== this._draggingId) {
      this._dropTargetId = targetId;
    }

    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = "move";
    }
  }

  #onItemDragLeave(event: DragEvent): void {
    const related = event.relatedTarget as Node | null;
    const current = event.currentTarget as HTMLElement;

    if (related && current.contains(related)) {
      return;
    }

    this._dropTargetId = null;
  }

  #onListDrop(event: DragEvent): void {
    event.preventDefault();

    const draggedId =
      event.dataTransfer?.getData("text/plain") || this._draggingId;

    if (!draggedId) {
      return;
    }

    const targetElement = (event.target as HTMLElement | null)?.closest(
      "[data-condition-id]",
    ) as HTMLElement | null;
    const targetId = targetElement?.dataset.conditionId;

    if (!targetId || targetId === draggedId) {
      this.#onConditionDragEnd();
      return;
    }

    const fromIndex = this._conditions.findIndex(
      (condition) => condition.id === draggedId,
    );
    const toIndex = this._conditions.findIndex(
      (condition) => condition.id === targetId,
    );

    this._conditions = reorderConditions(this._conditions, fromIndex, toIndex);
    this.#onConditionDragEnd();
  }

  #getValidationProperties(): SearchPropertyMetadata[] {
    const properties: SearchPropertyMetadata[] = [];

    for (const condition of this._conditions) {
      const contentTypeAlias = condition.contentTypeAlias.trim();

      if (!contentTypeAlias) {
        continue;
      }

      properties.push(
        ...(this._propertyMetadataByContentType[contentTypeAlias] ?? []),
      );
    }

    return properties;
  }

  #onClear(): void {
    if (SEARCH_BUILDER_SINGLE_CONDITION_MODE) {
      this._conditions = [createEmptySearchCondition()];
    } else {
      this._conditions = [];
    }

    this._showValidation = false;
  }

  #onSearch(): void {
    this.#ensureUiConditions();

    const validation = validateSearchConditions(
      this._conditions,
      this.#getValidationProperties(),
    );
    this._showValidation = true;

    if (!validation.isValid) {
      return;
    }

    this.dispatchEvent(
      new CustomEvent("content-search-submit", {
        detail: {
          matchMode: this._matchMode,
          conditions: this._conditions,
          searchCultureMode: this._searchCultureMode,
          culture: this._culture,
          languages: this._languages,
        },
        bubbles: true,
        composed: true,
      }),
    );
  }

  static override readonly styles = [
    UmbTextStyles,
    contentSearchUiTokens,
    contentSearchSectionHeaderStyles,
    contentSearchSrOnlyStyles,
    ...contentSearchBuilderStyles,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    "content-search-builder": ContentSearchBuilderElement;
  }
}

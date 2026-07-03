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
import {
  BLOCK_ELEMENT_NOT_SEARCHABLE_LABEL,
  BLOCK_ELEMENT_SEARCHABLE_LABEL,
  BLOCK_ELEMENT_TYPE_ICON,
  BLOCK_GRID_CONTAINER_SEARCH_AVAILABLE_LABEL,
  BLOCK_GRID_ELEMENT_NOT_INDIVIDUALLY_INDEXED_BADGE_LABEL,
  BLOCK_GRID_ELEMENT_NOT_INDIVIDUALLY_INDEXED_LABEL,
  BLOCK_GRID_ELEMENT_NOT_INDIVIDUALLY_INDEXED_TOOLTIP,
  BLOCK_GRID_PROPERTY_GROUP_NAME,
  HIDDEN_PROPERTIES_TOGGLE_HINT,
  COMBOBOX_SEARCH_DEBOUNCE_MS,
  PROPERTY_GROUP_COLLAPSE_THRESHOLD,
  PROPERTY_SEARCH_MAX_RENDERED_OPTIONS,
  PROPERTY_SEARCH_PLACEHOLDER,
  PROPERTY_VIRTUAL_WINDOW_SIZE,
} from "../../constants/filter-nodes.constants.js";
import type { FilterablePropertyMetadata } from "../../models/filter-models.js";
import {
  getPropertyGroupSourceIcon,
  getPropertyGroupSourceLabel,
  getPropertySourceIcon,
  getPropertySourceLabel,
} from "../../utils/property-source.utils.js";
import {
  countContainerBlockProperties,
  formatBlockContainerDisplayLabel,
  formatBlockElementBrowseBreadcrumb,
  formatBlockElementPropertyLabel,
  formatPropertyLabel,
  formatPropertySearchResultLabel,
  getBlockContainerIcon,
  getBlockElementIndexStatus,
  isBlockGridContainerProperty,
  isBlockGridElementProperty,
  isPropertyFilterable,
  searchFilterableProperties,
  shouldShowPropertyAlias,
  shouldShowPropertySearchContext,
  formatPropertySearchContextLabel,
  type FilterablePropertyContainerGroup,
  type FilterablePropertyElementTypeGroup,
  type FilterablePropertyGroup,
} from "../../utils/filter-condition.utils.js";
import {
  buildComboboxLimitMessage,
  limitVisiblePropertyGroups,
} from "../../utils/combobox-list.utils.js";
import {
  getPropertySelectorCache,
  type PropertySelectorCache,
} from "../../utils/property-selector-cache.utils.js";
import {
  createVirtualListWindow,
  getNextVirtualListVisibleCount,
  shouldLoadMoreVirtualListItems,
} from "../../utils/virtual-list.utils.js";
import { filterPropertyComboboxStyles } from "./filter-property-combobox.styles.js";
import {
  BLOCK_ELEMENT_NOT_SEARCHABLE_TOOLTIP_GUIDANCE,
  BLOCK_ELEMENT_NOT_SEARCHABLE_TOOLTIP_MESSAGE,
  getBlockElementNotSearchableTooltipText,
  getBlockElementSearchableTooltipText,
} from "./filter-property-combobox.tooltips.js";

@customElement("filter-property-combobox")
export class FilterPropertyComboboxElement extends UmbLitElement {
  @property({ type: String })
  value = "";

  @property({ type: Array })
  properties: readonly FilterablePropertyMetadata[] = [];

  @property({ type: String })
  label = "Field";

  @property({ type: String })
  placeholder = PROPERTY_SEARCH_PLACEHOLDER;

  @property({ type: Boolean })
  disabled = false;

  @property({ type: Boolean })
  error = false;

  @property({ type: Boolean })
  loading = false;

  @property({ type: String, attribute: "aria-describedby" })
  ariaDescribedBy = "";

  @property({ type: String })
  hiddenPropertiesHint = "";

  @state()
  private _filteredGroups: readonly FilterablePropertyGroup[] = [];

  @state()
  private _flatSearchResults: readonly FilterablePropertyMetadata[] = [];

  @state()
  private _searchMatchCount = 0;

  @state()
  private _searchVisibleCount = PROPERTY_VIRTUAL_WINDOW_SIZE;

  @state()
  private _hydratedContainers = new Set<string>();

  @state()
  private _collapsedGroups = new Set<string>();

  @state()
  private _collapsedContainers = new Set<string>();

  @state()
  private _collapsedElementTypes = new Set<string>();

  @state()
  private _isSearching = false;

  @state()
  private _searchStatusMessage = "";

  @query("#property-combobox")
  private _combobox?: HTMLElement & { focus?: () => Promise<void> | void };

  #selectorCache: PropertySelectorCache | undefined;

  #allSearchMatches: readonly FilterablePropertyMetadata[] = [];

  readonly #debouncedFilter = debounce((searchTerm: string) => {
    this.#applySearch(searchTerm);
  }, COMBOBOX_SEARCH_DEBOUNCE_MS);

  override updated(changedProperties: Map<string, unknown>): void {
    if (changedProperties.has("properties")) {
      this.#selectorCache = getPropertySelectorCache(this.properties);
      this._isSearching = false;
      this._flatSearchResults = [];
      this._searchMatchCount = 0;
      this._searchVisibleCount = PROPERTY_VIRTUAL_WINDOW_SIZE;

      const collapseState = this.#selectorCache.createCollapseState(
        this.value,
        PROPERTY_GROUP_COLLAPSE_THRESHOLD,
      );

      this._collapsedGroups = new Set(collapseState.collapsedGroups);
      this._collapsedContainers = new Set(collapseState.collapsedContainers);
      this._collapsedElementTypes = new Set(collapseState.collapsedElementTypes);
      this._hydratedContainers = new Set(collapseState.hydratedContainers);
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
    const hasResults = this._isSearching
      ? this._flatSearchResults.length > 0
      : this._filteredGroups.some((group) => this.#groupHasItems(group));

    return html`
      <div class="property-combobox">
        <uui-combobox
          id="property-combobox"
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
          <uui-combobox-list
            id="property-combobox-list"
            class="property-combobox__list"
            @scroll=${this.#onComboboxListScroll}
          >
            ${this._isSearching
              ? repeat(
                  this._flatSearchResults,
                  (property) => property.alias,
                  (property) => this.#renderSearchResultOption(property),
                )
              : repeat(
                  this._filteredGroups,
                  (group) => group.name,
                  (group) => this.#renderGroup(group),
                )}
            ${!hasResults
              ? html`
                  <uui-combobox-list-option disabled value="">
                    <span class="property-option__empty">
                      ${this.#getEmptyResultsMessage()}
                    </span>
                  </uui-combobox-list-option>
                `
              : nothing}
          </uui-combobox-list>
        </uui-combobox>
        ${this.hiddenPropertiesHint
          ? html`<p class="property-combobox__hint">${this.hiddenPropertiesHint}</p>`
          : nothing}
        <span class="property-combobox__status" aria-live="polite">
          ${this._searchStatusMessage}
        </span>
      </div>
    `;
  }

  #renderGroup(group: FilterablePropertyGroup) {
    if (!this.#groupHasItems(group)) {
      return nothing;
    }

    const collapsed = this.#isGroupCollapsed(group.name);

    return html`
      <div class="property-group">
        <button
          type="button"
          class="property-group__header"
          aria-expanded=${!collapsed}
          @click=${(event: Event) => this.#toggleGroup(event, group.name)}
          @keydown=${(event: KeyboardEvent) =>
            this.#onCollapsibleHeaderKeydown(event, () =>
              this.#toggleGroup(event, group.name),
            )}
        >
          <span class="property-group__title">
            <uui-icon
              class="property-source-icon"
              name=${getPropertyGroupSourceIcon(group.name)}
              title=${getPropertyGroupSourceLabel(group.name)}
            ></uui-icon>
            <span class="property-group__name">${group.name}</span>
          </span>
          <span class="property-group__count">(${this.#countGroupItems(group)})</span>
          <uui-symbol-expand .open=${!collapsed}></uui-symbol-expand>
        </button>
        ${collapsed
          ? nothing
          : html`
              ${repeat(
                group.properties,
                (property) => property.alias,
                (property) => this.#renderOption(property),
              )}
              ${repeat(
                group.containers,
                (container) => container.containerKey,
                (container) => this.#renderContainer(container),
              )}
            `}
      </div>
    `;
  }

  #renderContainer(container: FilterablePropertyContainerGroup) {
    if (this.#isBlockGridContainer(container)) {
      return this.#renderBlockGridContainer(container);
    }

    const collapsed = this.#isContainerCollapsed(container.containerKey);
    const containerLabel = formatBlockContainerDisplayLabel(container);
    const containerIcon = getBlockContainerIcon(container);

    return html`
      <div class="property-container">
        <button
          type="button"
          class="property-container__header"
          aria-expanded=${!collapsed}
          @click=${(event: Event) =>
            this.#toggleContainer(event, container.containerKey)}
          @keydown=${(event: KeyboardEvent) =>
            this.#onCollapsibleHeaderKeydown(event, () =>
              this.#toggleContainer(event, container.containerKey),
            )}
        >
          <span class="property-container__title">
            <uui-icon
              class="property-container__icon"
              name=${containerIcon}
            ></uui-icon>
            <span class="property-container__name">${containerLabel}</span>
          </span>
          <span class="property-container__count"
            >(${this.#countContainerItems(container)})</span
          >
          <uui-symbol-expand .open=${!collapsed}></uui-symbol-expand>
        </button>
        ${collapsed
          ? nothing
          : html`
              ${container.containerProperty
                ? html`
                    <div class="property-container__container-option">
                      ${this.#renderOption(container.containerProperty, {
                        isContainer: true,
                      })}
                    </div>
                  `
                : nothing}
              ${repeat(
                this.#getContainerElementTypes(container),
                (elementType) => elementType.elementTypeKey,
                (elementType) => this.#renderElementType(elementType),
              )}
            `}
      </div>
    `;
  }

  #isBlockGridContainer(container: FilterablePropertyContainerGroup): boolean {
    if (container.containerProperty) {
      return isBlockGridContainerProperty(container.containerProperty);
    }

    return container.containerEditorLabel === BLOCK_GRID_PROPERTY_GROUP_NAME;
  }

  #renderBlockGridContainer(container: FilterablePropertyContainerGroup) {
    const collapsed = this.#isContainerCollapsed(container.containerKey);
    const containerLabel = formatBlockContainerDisplayLabel(container);
    const containerIcon = getBlockContainerIcon(container);
    const elementTypes = this.#getContainerElementTypes(container);

    return html`
      <div class="property-container property-container--block-grid">
        <button
          type="button"
          class="property-container__header"
          aria-expanded=${!collapsed}
          @click=${(event: Event) =>
            this.#toggleContainer(event, container.containerKey)}
          @keydown=${(event: KeyboardEvent) =>
            this.#onCollapsibleHeaderKeydown(event, () =>
              this.#toggleContainer(event, container.containerKey),
            )}
        >
          <span class="property-container__title">
            <uui-icon
              class="property-container__icon"
              name=${containerIcon}
            ></uui-icon>
            <span class="property-container__name">${containerLabel}</span>
          </span>
          <span class="property-container__count"
            >(${this.#countContainerItems(container)})</span
          >
          <uui-symbol-expand .open=${!collapsed}></uui-symbol-expand>
        </button>
        ${collapsed
          ? nothing
          : html`
              <div class="property-block-grid-tree" role="tree">
                ${repeat(
                  elementTypes,
                  (elementType) => elementType.elementTypeKey,
                  (elementType) => this.#renderBlockGridElementTypeBranch(elementType),
                )}
                ${this.#renderBlockGridContainerSearchAvailable(container)}
              </div>
            `}
      </div>
    `;
  }

  #renderBlockGridElementTypeBranch(
    elementType: FilterablePropertyElementTypeGroup,
  ) {
    const properties = elementType.properties;

    return html`
      <div
        class="property-block-grid-tree__element-type"
        role="group"
        aria-label=${elementType.elementTypeName}
      >
        <div class="property-block-grid-tree__element-type-name">
          ${elementType.elementTypeName}
        </div>
        <div class="property-block-grid-tree__properties" role="group">
          ${repeat(
            properties,
            (property) => property.alias,
            (property, index) =>
              this.#renderBlockGridTreeProperty(
                property,
                index,
                properties.length,
              ),
          )}
        </div>
      </div>
    `;
  }

  #renderBlockGridTreeProperty(
    property: FilterablePropertyMetadata,
    index: number,
    total: number,
  ) {
    const isLast = index === total - 1;
    const branchGlyph = isLast ? "└" : "├";
    const continuationGlyph = isLast ? " " : "│";

    if (isPropertyFilterable(property)) {
      return this.#renderBlockGridTreeSelectableProperty(
        property,
        branchGlyph,
      );
    }

    const propertyName = formatBlockElementPropertyLabel(property);
    const tooltipId = this.#getBlockElementTooltipId(property.alias);

    return html`
      <div
        class="property-block-grid-tree__property property-block-grid-tree__property--info"
        role="treeitem"
        aria-disabled="true"
        aria-describedby=${tooltipId}
        title=${getBlockElementNotSearchableTooltipText(property)}
      >
        <div class="property-block-grid-tree__property-line">
          <span class="property-block-grid-tree__glyph" aria-hidden="true"
            >${branchGlyph}</span
          >
          <span class="property-block-grid-tree__property-name"
            >${propertyName}</span
          >
        </div>
        <div class="property-block-grid-tree__property-line">
          <span
            class="property-block-grid-tree__glyph property-block-grid-tree__glyph--continuation"
            aria-hidden="true"
            >${continuationGlyph}</span
          >
          ${this.#renderBlockGridTreeIndexingBadge(property)}
        </div>
        <span id=${tooltipId} class="property-option__tooltip" role="tooltip">
          <span class="property-option__tooltip-message"
            >${BLOCK_GRID_ELEMENT_NOT_INDIVIDUALLY_INDEXED_TOOLTIP}</span
          >
        </span>
      </div>
    `;
  }

  #renderBlockGridTreeSelectableProperty(
    property: FilterablePropertyMetadata,
    branchGlyph: string,
  ) {
    const selectionLabel = formatPropertyLabel(property);
    const propertyName = formatBlockElementPropertyLabel(property);
    const showAlias = shouldShowPropertyAlias(property);

    return html`
      <uui-combobox-list-option
        class="property-block-grid-tree__selectable-option"
        .value=${property.alias}
        .displayValue=${selectionLabel}
        role="treeitem"
        title=${getBlockElementSearchableTooltipText()}
      >
        <span class="property-block-grid-tree__property property-block-grid-tree__property--selectable">
          <span class="property-block-grid-tree__property-line">
            <span class="property-block-grid-tree__glyph" aria-hidden="true"
              >${branchGlyph}</span
            >
            <span class="property-block-grid-tree__property-name"
              >${propertyName}</span
            >
            ${this.#renderBlockElementSearchabilityBadge(property)}
          </span>
          ${showAlias
            ? html`<span class="property-block-grid-tree__property-alias"
                >${property.alias}</span
              >`
            : nothing}
        </span>
      </uui-combobox-list-option>
    `;
  }

  #renderBlockGridTreeIndexingBadge(property: FilterablePropertyMetadata) {
    return html`
      <span
        class="property-block-grid-tree__index-badge"
        title=${getBlockElementNotSearchableTooltipText(property)}
      >
        ${BLOCK_GRID_ELEMENT_NOT_INDIVIDUALLY_INDEXED_BADGE_LABEL}
      </span>
    `;
  }

  #renderBlockGridContainerSearchAvailable(
    container: FilterablePropertyContainerGroup,
  ) {
    const containerProperty = container.containerProperty;

    if (!containerProperty) {
      return nothing;
    }

    const selectionLabel = formatPropertyLabel(containerProperty);
    const containerName = formatPropertyLabel(containerProperty);

    return html`
      <div class="property-block-grid-tree__container-search" role="group">
        <p class="property-block-grid-tree__container-search-label">
          ${BLOCK_GRID_CONTAINER_SEARCH_AVAILABLE_LABEL}
        </p>
        <uui-combobox-list-option
          class="property-block-grid-tree__selectable-option"
          .value=${containerProperty.alias}
          .displayValue=${selectionLabel}
          role="treeitem"
        >
          <span
            class="property-block-grid-tree__container-search-item property-block-grid-tree__property--selectable"
          >
            <span
              class="property-block-grid-tree__marker property-block-grid-tree__marker--positive"
              aria-hidden="true"
              >✓</span
            >
            <span class="property-block-grid-tree__property-name"
              >${containerName}</span
            >
          </span>
        </uui-combobox-list-option>
      </div>
    `;
  }

  #renderElementType(elementType: FilterablePropertyElementTypeGroup) {
    const collapsed = this.#isElementTypeCollapsed(elementType.elementTypeKey);

    return html`
      <div class="property-element-type">
        <button
          type="button"
          class="property-element-type__header"
          aria-expanded=${!collapsed}
          @click=${(event: Event) =>
            this.#toggleElementType(event, elementType.elementTypeKey)}
          @keydown=${(event: KeyboardEvent) =>
            this.#onCollapsibleHeaderKeydown(event, () =>
              this.#toggleElementType(event, elementType.elementTypeKey),
            )}
        >
          <span class="property-element-type__title">
            <uui-icon
              class="property-element-type__icon"
              name=${BLOCK_ELEMENT_TYPE_ICON}
            ></uui-icon>
            <span class="property-element-type__name"
              >${elementType.elementTypeName}</span
            >
          </span>
          <span class="property-element-type__count"
            >(${elementType.properties.length})</span
          >
          <uui-symbol-expand .open=${!collapsed}></uui-symbol-expand>
        </button>
        ${collapsed
          ? nothing
          : html`
              <div class="property-element-type__properties">
                ${repeat(
                  elementType.properties,
                  (property) => property.alias,
                  (property) =>
                    this.#renderOption(property, { nestedInBlock: true }),
                )}
              </div>
            `}
      </div>
    `;
  }

  #renderSearchResultOption(property: FilterablePropertyMetadata) {
    const label = formatPropertySearchResultLabel(property);
    const selectionLabel = formatPropertyLabel(property);
    const showContext = shouldShowPropertySearchContext(property);
    const contextLabel = showContext
      ? formatPropertySearchContextLabel(property)
      : undefined;
    const showAlias = shouldShowPropertyAlias(property);
    const filterable = isPropertyFilterable(property);
    const showNotSearchableTooltip =
      getBlockElementIndexStatus(property) === "notIndexed";
    const showSearchableTooltip =
      getBlockElementIndexStatus(property) === "indexed";
    const tooltipId = showNotSearchableTooltip
      ? this.#getBlockElementTooltipId(property.alias)
      : undefined;
    const tooltipText = showNotSearchableTooltip
      ? getBlockElementNotSearchableTooltipText(property)
      : showSearchableTooltip
        ? getBlockElementSearchableTooltipText()
        : undefined;

    return html`
      <uui-combobox-list-option
        .value=${property.alias}
        .displayValue=${selectionLabel}
        ?disabled=${!filterable}
        title=${tooltipText ?? nothing}
      >
        <span
          class="property-option property-option--search-result ${!filterable ? "property-option--disabled" : ""} ${showNotSearchableTooltip ? "property-option--tooltip" : ""}"
          aria-describedby=${tooltipId ?? nothing}
        >
          <span class="property-option__header">
            ${this.#renderPropertySourceIcon(property)}
            <span class="property-option__label">
              <span class="property-option__name">${label}</span>
              ${this.#renderBlockElementSearchabilityBadge(property)}
            </span>
          </span>
          ${showContext && contextLabel
            ? html`<span class="property-option__context">${contextLabel}</span>`
            : nothing}
          ${showAlias
            ? html`<span class="property-option__alias">${property.alias}</span>`
            : nothing}
          ${showNotSearchableTooltip && tooltipId
            ? this.#renderNotSearchableTooltip(property, tooltipId)
            : nothing}
        </span>
      </uui-combobox-list-option>
    `;
  }

  #renderOption(
    property: FilterablePropertyMetadata,
    options: { isContainer?: boolean; nestedInBlock?: boolean } = {},
  ) {
    const { isContainer = false, nestedInBlock = false } = options;
    const selectionLabel = formatPropertyLabel(property);
    const showAlias = shouldShowPropertyAlias(property);
    const filterable = isPropertyFilterable(property);
    const showNotSearchableTooltip =
      getBlockElementIndexStatus(property) === "notIndexed";
    const showSearchableTooltip =
      getBlockElementIndexStatus(property) === "indexed";
    const tooltipId = showNotSearchableTooltip
      ? this.#getBlockElementTooltipId(property.alias)
      : undefined;
    const tooltipText = showNotSearchableTooltip
      ? getBlockElementNotSearchableTooltipText(property)
      : showSearchableTooltip
        ? getBlockElementSearchableTooltipText()
        : undefined;

    return html`
      <uui-combobox-list-option
        .value=${property.alias}
        .displayValue=${selectionLabel}
        ?disabled=${!filterable}
        title=${tooltipText ?? nothing}
      >
        <span
          class="property-option ${isContainer ? "property-option--container" : ""} ${nestedInBlock ? "property-option--nested" : ""} ${!filterable ? "property-option--disabled" : ""} ${showNotSearchableTooltip ? "property-option--tooltip" : ""}"
          aria-describedby=${tooltipId ?? nothing}
        >
          <span class="property-option__header">
            ${this.#renderPropertySourceIcon(property, nestedInBlock)}
            <span class="property-option__label">
              ${this.#renderPropertyName(property, { nestedInBlock, isContainer })}
              ${this.#renderBlockElementSearchabilityBadge(property)}
            </span>
          </span>
          ${showAlias
            ? html`<span class="property-option__alias">${property.alias}</span>`
            : ""}
          ${showNotSearchableTooltip && tooltipId
            ? this.#renderNotSearchableTooltip(property, tooltipId)
            : nothing}
        </span>
      </uui-combobox-list-option>
    `;
  }

  #renderPropertySourceIcon(
    property: FilterablePropertyMetadata,
    nestedInBlock = false,
  ) {
    return html`
      <uui-icon
        class="property-source-icon ${nestedInBlock
          ? "property-source-icon--nested"
          : ""}"
        name=${getPropertySourceIcon(property)}
        title=${getPropertySourceLabel(property)}
      ></uui-icon>
    `;
  }

  #renderPropertyName(
    property: FilterablePropertyMetadata,
    options: { nestedInBlock?: boolean; isContainer?: boolean } = {},
  ) {
    const { nestedInBlock = false, isContainer = false } = options;

    if (nestedInBlock) {
      const breadcrumb = formatBlockElementBrowseBreadcrumb(property);

      if (breadcrumb.prefix) {
        return html`
          <span class="property-option__breadcrumb">
            <span class="property-option__breadcrumb-prefix"
              >${breadcrumb.prefix} › </span
            >
            <span class="property-option__name">${breadcrumb.leaf}</span>
          </span>
        `;
      }
    }

    const label = isContainer
      ? formatPropertyLabel(property)
      : nestedInBlock
        ? formatBlockElementPropertyLabel(property)
        : formatPropertyLabel(property);

    return html`<span class="property-option__name">${label}</span>`;
  }

  #renderNotSearchableTooltip(
    property: FilterablePropertyMetadata,
    tooltipId: string,
  ) {
    if (isBlockGridElementProperty(property)) {
      return html`
        <span id=${tooltipId} class="property-option__tooltip" role="tooltip">
          <span class="property-option__tooltip-message"
            >${BLOCK_GRID_ELEMENT_NOT_INDIVIDUALLY_INDEXED_TOOLTIP}</span
          >
        </span>
      `;
    }

    return html`
      <span id=${tooltipId} class="property-option__tooltip" role="tooltip">
        <span class="property-option__tooltip-message"
          >${BLOCK_ELEMENT_NOT_SEARCHABLE_TOOLTIP_MESSAGE}</span
        >
        <span class="property-option__tooltip-guidance"
          >${BLOCK_ELEMENT_NOT_SEARCHABLE_TOOLTIP_GUIDANCE}</span
        >
      </span>
    `;
  }

  #getEmptyResultsMessage(): string {
    if (this._isSearching) {
      return "No matching properties.";
    }

    if (this.hiddenPropertiesHint) {
      return `No searchable properties shown. ${HIDDEN_PROPERTIES_TOGGLE_HINT}`;
    }

    return "No matching properties.";
  }

  #getBlockElementTooltipId(alias: string): string {
    return `block-property-tooltip-${alias.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
  }

  #renderBlockElementSearchabilityBadge(property: FilterablePropertyMetadata) {
    const status = getBlockElementIndexStatus(property);

    if (status === "indexed") {
      return html`
        <uui-badge
          class="property-option__index-badge"
          color="positive"
          look="secondary"
          label=${BLOCK_ELEMENT_SEARCHABLE_LABEL}
          title=${getBlockElementSearchableTooltipText()}
        >
          ${BLOCK_ELEMENT_SEARCHABLE_LABEL}
        </uui-badge>
      `;
    }

    if (status === "notIndexed") {
      if (isBlockGridElementProperty(property)) {
        return html`
          <uui-badge
            class="property-option__index-badge"
            color="warning"
            look="secondary"
            label=${BLOCK_GRID_ELEMENT_NOT_INDIVIDUALLY_INDEXED_LABEL}
            title=${getBlockElementNotSearchableTooltipText(property)}
          >
            ${BLOCK_GRID_ELEMENT_NOT_INDIVIDUALLY_INDEXED_BADGE_LABEL}
          </uui-badge>
        `;
      }

      return html`
        <uui-badge
          class="property-option__index-badge"
          look="placeholder"
          label=${BLOCK_ELEMENT_NOT_SEARCHABLE_LABEL}
          title=${getBlockElementNotSearchableTooltipText(property)}
        >
          ${BLOCK_ELEMENT_NOT_SEARCHABLE_LABEL}
        </uui-badge>
      `;
    }

    return nothing;
  }

  #onSearch(event: Event): void {
    const searchTerm =
      (event.currentTarget as HTMLElement & { search?: string }).search ?? "";

    this.#debouncedFilter(searchTerm);
  }

  #applySearch(searchTerm: string): void {
    this.#selectorCache ??= getPropertySelectorCache(this.properties);
    this._isSearching = Boolean(searchTerm.trim());

    if (this._isSearching) {
      const matches = searchFilterableProperties(
        this.properties,
        searchTerm,
        this.#selectorCache,
      );
      this.#allSearchMatches = matches;
      const virtualWindow = createVirtualListWindow(
        matches,
        PROPERTY_VIRTUAL_WINDOW_SIZE,
        PROPERTY_SEARCH_MAX_RENDERED_OPTIONS,
      );

      this._searchMatchCount = virtualWindow.totalCount;
      this._searchVisibleCount = virtualWindow.visibleCount;
      this._flatSearchResults = virtualWindow.items;
      this._filteredGroups = [];
      this._searchStatusMessage =
        virtualWindow.totalCount === 0
          ? "No matching properties."
          : buildComboboxLimitMessage(
              virtualWindow.totalCount,
              virtualWindow.visibleCount,
              virtualWindow.truncated || virtualWindow.hasMore,
              true,
              "properties",
            );
      return;
    }

    this._flatSearchResults = [];
    this._searchMatchCount = 0;
    this._searchVisibleCount = PROPERTY_VIRTUAL_WINDOW_SIZE;
    this.#allSearchMatches = [];
    this.#refreshBrowseGroups();
  }

  #refreshBrowseGroups(): void {
    this.#selectorCache ??= getPropertySelectorCache(this.properties);
    const grouped = this.#selectorCache.getBrowseGroups(this._hydratedContainers);
    const limited = limitVisiblePropertyGroups(grouped);
    this._filteredGroups = limited.groups;
    const visibleCount = limited.groups.reduce(
      (count, group) => count + this.#countGroupItems(group),
      0,
    );
    this._searchStatusMessage =
      limited.totalPropertyCount === 0
        ? ""
        : buildComboboxLimitMessage(
            limited.totalPropertyCount,
            visibleCount,
            limited.truncated,
            false,
            "properties",
          );
  }

  #loadMoreSearchResults(): void {
    if (!this._isSearching || !this.#selectorCache) {
      return;
    }

    const nextVisibleCount = getNextVirtualListVisibleCount(
      this._searchVisibleCount,
      this._searchMatchCount,
      PROPERTY_VIRTUAL_WINDOW_SIZE,
      PROPERTY_SEARCH_MAX_RENDERED_OPTIONS,
    );

    if (nextVisibleCount === this._searchVisibleCount) {
      return;
    }

    const virtualWindow = createVirtualListWindow(
      this.#allSearchMatches,
      nextVisibleCount,
      PROPERTY_SEARCH_MAX_RENDERED_OPTIONS,
    );

    this._searchVisibleCount = virtualWindow.visibleCount;
    this._flatSearchResults = virtualWindow.items;
    this._searchStatusMessage = buildComboboxLimitMessage(
      virtualWindow.totalCount,
      virtualWindow.visibleCount,
      virtualWindow.truncated || virtualWindow.hasMore,
      true,
      "properties",
    );
  }

  #onComboboxListScroll(event: Event): void {
    if (!this._isSearching) {
      return;
    }

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

  #onCollapsibleHeaderKeydown(
    event: KeyboardEvent,
    toggle: () => void,
  ): void {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    toggle();
  }

  #getContainerElementTypes(
    container: FilterablePropertyContainerGroup,
  ): readonly FilterablePropertyElementTypeGroup[] {
    if (this._hydratedContainers.has(container.containerKey)) {
      return (
        this.#selectorCache?.getContainerElementTypes(container.containerKey) ??
        container.elementTypes
      );
    }

    return container.elementTypes;
  }

  #hydrateContainer(containerKey: string): void {
    if (this._hydratedContainers.has(containerKey)) {
      return;
    }

    const nextHydrated = new Set(this._hydratedContainers);
    nextHydrated.add(containerKey);
    this._hydratedContainers = nextHydrated;

    if (!this._isSearching) {
      this.#refreshBrowseGroups();
    }
  }

  #onChange(event: Event): void {
    const nextValue = String(
      (event.currentTarget as HTMLElement & { value?: string }).value ?? "",
    );

    const selected = this.properties.find(
      (property) => property.alias === nextValue,
    );

    if (selected && !isPropertyFilterable(selected)) {
      return;
    }

    this.dispatchEvent(
      new CustomEvent("filter-property-change", {
        detail: { value: nextValue },
        bubbles: true,
        composed: true,
      }),
    );
  }

  #toggleGroup(event: Event, groupName: string): void {
    event.preventDefault();
    event.stopPropagation();

    const nextCollapsed = new Set(this._collapsedGroups);

    if (nextCollapsed.has(groupName)) {
      nextCollapsed.delete(groupName);
    } else {
      nextCollapsed.add(groupName);
    }

    this._collapsedGroups = nextCollapsed;
  }

  #toggleContainer(event: Event, containerKey: string): void {
    event.preventDefault();
    event.stopPropagation();

    const nextCollapsed = new Set(this._collapsedContainers);

    if (nextCollapsed.has(containerKey)) {
      nextCollapsed.delete(containerKey);
      this.#hydrateContainer(containerKey);
    } else {
      nextCollapsed.add(containerKey);
    }

    this._collapsedContainers = nextCollapsed;
  }

  #toggleElementType(event: Event, elementTypeKey: string): void {
    event.preventDefault();
    event.stopPropagation();

    const nextCollapsed = new Set(this._collapsedElementTypes);

    if (nextCollapsed.has(elementTypeKey)) {
      nextCollapsed.delete(elementTypeKey);
    } else {
      nextCollapsed.add(elementTypeKey);
    }

    this._collapsedElementTypes = nextCollapsed;
  }

  #isGroupCollapsed(groupName: string): boolean {
    return this._collapsedGroups.has(groupName);
  }

  #isContainerCollapsed(containerKey: string): boolean {
    return this._collapsedContainers.has(containerKey);
  }

  #isElementTypeCollapsed(elementTypeKey: string): boolean {
    return this._collapsedElementTypes.has(elementTypeKey);
  }

  #groupHasItems(group: FilterablePropertyGroup): boolean {
    return this.#countGroupItems(group) > 0;
  }

  #countGroupItems(group: FilterablePropertyGroup): number {
    const containerPropertyCount = group.containers.filter(
      (container) => container.containerProperty,
    ).length;
    const elementPropertyCount = group.containers.reduce(
      (count, container) => count + this.#countContainerItems(container),
      0,
    );

    return (
      group.properties.length + containerPropertyCount + elementPropertyCount
    );
  }

  #countContainerItems(container: FilterablePropertyContainerGroup): number {
    const nestedCount = this._hydratedContainers.has(container.containerKey)
      ? countContainerBlockProperties(container)
      : (this.#selectorCache?.getContainerNestedPropertyCount(
          container.containerKey,
        ) ?? countContainerBlockProperties(container));

    return (container.containerProperty ? 1 : 0) + nestedCount;
  }

  static override readonly styles = [filterPropertyComboboxStyles];
}

declare global {
  interface HTMLElementTagNameMap {
    "filter-property-combobox": FilterPropertyComboboxElement;
  }
}

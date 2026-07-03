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
  BLOCK_ELEMENT_TYPE_ICON,
  PICKER_SEARCH_DEBOUNCE_MS,
  PROPERTY_GROUP_COLLAPSE_THRESHOLD,
  PROPERTY_SEARCH_MAX_RENDERED_OPTIONS,
  PROPERTY_SEARCH_PLACEHOLDER,
  PROPERTY_VIRTUAL_WINDOW_SIZE,
} from "../../constants/property-picker.constants.js";
import type { SearchPropertyMetadata } from "../../models/metadata.models.js";
import { buildPickerLimitMessage, limitVisiblePropertyGroups } from "../../utils/picker-list.utils.js";
import {
  getPropertyGroupSourceIcon,
  getPropertySourceIcon,
} from "../../utils/property-source.utils.js";
import {
  getPropertySelectorCache,
  type PropertySelectorCache,
} from "../../utils/property-selector-cache.utils.js";
import {
  countContainerBlockProperties,
  formatBlockContainerDisplayLabel,
  formatBlockElementBrowseBreadcrumb,
  formatBlockElementPropertyLabel,
  formatPropertyLabel,
  formatPropertySearchContextLabel,
  formatPropertySearchResultLabel,
  getBlockContainerIcon,
  isBlockGridGroup,
  isPropertySelectable,
  shouldShowPropertyAlias,
  shouldShowPropertySearchContext,
  type PropertyCompositionSection,
  type PropertyContainerGroup,
  type PropertyElementTypeGroup,
  type PropertyTreeGroup,
} from "../../utils/property-tree.utils.js";
import { getPropertyCultureLabel } from "../../utils/search-culture.utils.js";
import {
  createVirtualListWindow,
  getNextVirtualListVisibleCount,
  shouldLoadMoreVirtualListItems,
} from "../../utils/virtual-list.utils.js";
import { searchPropertyPickerStyles } from "./search-property-picker.styles.js";

export const SEARCH_PROPERTY_CHANGE = "search-property-change";

@customElement("search-property-picker")
export class SearchPropertyPickerElement extends UmbLitElement {
  @property({ type: String })
  value = "";

  @property({ type: Array })
  properties: readonly SearchPropertyMetadata[] = [];

  @property({ type: String })
  label = "Property";

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

  @state()
  private _filteredGroups: readonly PropertyTreeGroup[] = [];

  @state()
  private _flatSearchResults: readonly SearchPropertyMetadata[] = [];

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
  private _collapsedCompositions = new Set<string>();

  @state()
  private _isSearching = false;

  @state()
  private _searchStatusMessage = "";

  @query("#property-picker-combobox")
  private _combobox?: HTMLElement & { focus?: () => Promise<void> | void };

  #selectorCache: PropertySelectorCache | undefined;
  #allSearchMatches: readonly SearchPropertyMetadata[] = [];

  readonly #debouncedFilter = debounce((searchTerm: string) => {
    this.#applySearch(searchTerm);
  }, PICKER_SEARCH_DEBOUNCE_MS);

  override updated(changedProperties: Map<string, unknown>): void {
    if (changedProperties.has("properties") || changedProperties.has("value")) {
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
    const displayValue = this.#getDisplayValue();
    const hasResults = this._isSearching
      ? this._flatSearchResults.length > 0
      : this._filteredGroups.some((group) => this.#groupHasItems(group));

    return html`
      <div class="property-picker">
        <uui-combobox
          id="property-picker-combobox"
          class="condition-row__control"
          label=${this.label}
          .value=${this.value}
          .displayValue=${displayValue}
          placeholder=${comboboxPlaceholder}
          aria-describedby=${this.ariaDescribedBy || nothing}
          ?disabled=${this.disabled || this.loading}
          ?error=${this.error}
          @search=${this.#onSearch}
          @change=${this.#onChange}
        >
          <uui-combobox-list
            id="property-picker-list"
            class="property-picker__list"
            role="tree"
            @scroll=${this.#onListScroll}
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
                      ${this._isSearching
                        ? "No matching properties."
                        : "No properties available."}
                    </span>
                  </uui-combobox-list-option>
                `
              : nothing}
          </uui-combobox-list>
        </uui-combobox>
        <span class="property-picker__status" aria-live="polite">
          ${this._searchStatusMessage}
        </span>
      </div>
    `;
  }

  #getDisplayValue(): string {
    if (!this.value) {
      return "";
    }

    const selected = this.properties.find((property) => property.alias === this.value);

    if (!selected) {
      return this.value;
    }

    return formatPropertyLabel(selected);
  }

  #renderGroup(group: PropertyTreeGroup) {
    if (!this.#groupHasItems(group)) {
      return nothing;
    }

    const collapsed = this._collapsedGroups.has(group.name);

    return html`
      <div class="property-group" role="group" aria-label=${group.displayName}>
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
            ></uui-icon>
            <span class="property-group__name">${group.displayName}</span>
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
                group.compositionSections,
                (section) => section.name,
                (section) => this.#renderCompositionSection(section),
              )}
              ${repeat(
                group.containers,
                (container) => container.containerKey,
                (container) => this.#renderContainer(group, container),
              )}
            `}
      </div>
    `;
  }

  #renderCompositionSection(section: PropertyCompositionSection) {
    const collapsed = this._collapsedCompositions.has(section.name);

    return html`
      <div class="property-composition" role="group" aria-label=${section.name}>
        <button
          type="button"
          class="property-composition__header"
          aria-expanded=${!collapsed}
          @click=${(event: Event) => this.#toggleComposition(event, section.name)}
          @keydown=${(event: KeyboardEvent) =>
            this.#onCollapsibleHeaderKeydown(event, () =>
              this.#toggleComposition(event, section.name),
            )}
        >
          <span class="property-composition__name">${section.name}</span>
          <span class="property-composition__count"
            >(${section.properties.length})</span
          >
          <uui-symbol-expand .open=${!collapsed}></uui-symbol-expand>
        </button>
        ${collapsed
          ? nothing
          : html`
              <div class="property-composition__properties">
                ${repeat(
                  section.properties,
                  (property) => property.alias,
                  (property) => this.#renderOption(property),
                )}
              </div>
            `}
      </div>
    `;
  }

  #renderContainer(group: PropertyTreeGroup, container: PropertyContainerGroup) {
    if (isBlockGridGroup(group.name)) {
      return this.#renderBlockGridContainer(container);
    }

    const collapsed = this._collapsedContainers.has(container.containerKey);
    const containerLabel = formatBlockContainerDisplayLabel(container);

    return html`
      <div class="property-container" role="group" aria-label=${containerLabel}>
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
              name=${getBlockContainerIcon(container)}
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
              ${repeat(
                this.#getContainerElementTypes(container),
                (elementType) => elementType.elementTypeKey,
                (elementType) => this.#renderElementType(elementType),
              )}
            `}
      </div>
    `;
  }

  #renderBlockGridContainer(container: PropertyContainerGroup) {
    const collapsed = this._collapsedContainers.has(container.containerKey);
    const containerLabel = formatBlockContainerDisplayLabel(container);
    const elementTypes = this.#getContainerElementTypes(container);

    return html`
      <div
        class="property-container property-container--block-grid"
        role="group"
        aria-label=${containerLabel}
      >
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
              name=${getBlockContainerIcon(container)}
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
              <div class="property-block-grid-tree" role="group">
                ${repeat(
                  elementTypes,
                  (elementType) => elementType.elementTypeKey,
                  (elementType) => this.#renderBlockGridElementType(elementType),
                )}
              </div>
            `}
      </div>
    `;
  }

  #renderBlockGridElementType(elementType: PropertyElementTypeGroup) {
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
            elementType.properties,
            (property) => property.alias,
            (property, index) =>
              this.#renderBlockGridTreeProperty(
                property,
                index,
                elementType.properties.length,
              ),
          )}
        </div>
      </div>
    `;
  }

  #renderBlockGridTreeProperty(
    property: SearchPropertyMetadata,
    index: number,
    total: number,
  ) {
    const isLast = index === total - 1;
    const branchGlyph = isLast ? "└" : "├";
    const selectionLabel = formatPropertyLabel(property);
    const propertyName = formatBlockElementPropertyLabel(property);
    const showAlias = shouldShowPropertyAlias(property);

    return html`
      <uui-combobox-list-option
        class="property-block-grid-tree__selectable-option"
        .value=${property.alias}
        .displayValue=${selectionLabel}
        role="treeitem"
      >
        <span class="property-block-grid-tree__property property-block-grid-tree__property--selectable">
          <span class="property-block-grid-tree__property-line">
            <span class="property-block-grid-tree__glyph" aria-hidden="true"
              >${branchGlyph}</span
            >
            <span class="property-block-grid-tree__property-name"
              >${propertyName}</span
            >
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

  #renderElementType(elementType: PropertyElementTypeGroup) {
    const collapsed = this._collapsedElementTypes.has(elementType.elementTypeKey);

    return html`
      <div
        class="property-element-type"
        role="group"
        aria-label=${elementType.elementTypeName}
      >
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
                  (property) => this.#renderOption(property, { nestedInBlock: true }),
                )}
              </div>
            `}
      </div>
    `;
  }

  #renderSearchResultOption(property: SearchPropertyMetadata) {
    const label = formatPropertySearchResultLabel(property);
    const selectionLabel = formatPropertyLabel(property);
    const showContext = shouldShowPropertySearchContext(property);
    const contextLabel = showContext
      ? formatPropertySearchContextLabel(property)
      : undefined;
    const showAlias = shouldShowPropertyAlias(property);

    return html`
      <uui-combobox-list-option
        .value=${property.alias}
        .displayValue=${selectionLabel}
        role="treeitem"
      >
        <span class="property-option property-option--search-result">
          <span class="property-option__header">
            <uui-icon
              class="property-source-icon"
              name=${getPropertySourceIcon(property)}
            ></uui-icon>
            <span class="property-option__name">${label}</span>
            <span class="property-option__culture">${getPropertyCultureLabel(property)}</span>
          </span>
          ${showContext && contextLabel
            ? html`<span class="property-option__context">${contextLabel}</span>`
            : nothing}
          ${showAlias
            ? html`<span class="property-option__alias">${property.alias}</span>`
            : nothing}
        </span>
      </uui-combobox-list-option>
    `;
  }

  #renderOption(
    property: SearchPropertyMetadata,
    options: { nestedInBlock?: boolean } = {},
  ) {
    const { nestedInBlock = false } = options;
    const selectionLabel = formatPropertyLabel(property);
    const showAlias = shouldShowPropertyAlias(property);

    return html`
      <uui-combobox-list-option
        .value=${property.alias}
        .displayValue=${selectionLabel}
        role="treeitem"
      >
        <span class="property-option ${nestedInBlock ? "property-option--nested" : ""}">
          <span class="property-option__header">
            <uui-icon
              class="property-source-icon"
              name=${getPropertySourceIcon(property)}
            ></uui-icon>
            <span class="property-option__name">
              ${nestedInBlock
                ? this.#renderNestedPropertyName(property)
                : formatPropertyLabel(property)}
            </span>
            <span class="property-option__culture">${getPropertyCultureLabel(property)}</span>
          </span>
          ${showAlias
            ? html`<span class="property-option__alias">${property.alias}</span>`
            : nothing}
        </span>
      </uui-combobox-list-option>
    `;
  }

  #renderNestedPropertyName(property: SearchPropertyMetadata) {
    const breadcrumb = formatBlockElementBrowseBreadcrumb(property);

    if (breadcrumb.prefix) {
      return html`${breadcrumb.prefix} › ${breadcrumb.leaf}`;
    }

    return formatBlockElementPropertyLabel(property);
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
      const matches = this.#selectorCache.search(searchTerm);
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
          : buildPickerLimitMessage(
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
        : buildPickerLimitMessage(
            limited.totalPropertyCount,
            visibleCount,
            limited.truncated,
            false,
            "properties",
          );
  }

  #loadMoreSearchResults(): void {
    if (!this._isSearching) {
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
    this._searchStatusMessage = buildPickerLimitMessage(
      virtualWindow.totalCount,
      virtualWindow.visibleCount,
      virtualWindow.truncated || virtualWindow.hasMore,
      true,
      "properties",
    );
  }

  #onListScroll(event: Event): void {
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

  #onCollapsibleHeaderKeydown(event: KeyboardEvent, toggle: () => void): void {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    toggle();
  }

  #onChange(event: Event): void {
    const nextValue = String(
      (event.currentTarget as HTMLElement & { value?: string }).value ?? "",
    );

    const selected = this.properties.find((property) => property.alias === nextValue);

    if (selected && !isPropertySelectable(selected)) {
      return;
    }

    this.dispatchEvent(
      new CustomEvent(SEARCH_PROPERTY_CHANGE, {
        detail: { value: nextValue },
        bubbles: true,
        composed: true,
      }),
    );
  }

  #toggleGroup(event: Event, groupName: string): void {
    event.preventDefault();
    event.stopPropagation();
    this.#toggleSet(this._collapsedGroups, groupName, (next) => {
      this._collapsedGroups = next;
    });
  }

  #toggleComposition(event: Event, sectionName: string): void {
    event.preventDefault();
    event.stopPropagation();
    this.#toggleSet(this._collapsedCompositions, sectionName, (next) => {
      this._collapsedCompositions = next;
    });
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
    this.#toggleSet(this._collapsedElementTypes, elementTypeKey, (next) => {
      this._collapsedElementTypes = next;
    });
  }

  #toggleSet(
    current: Set<string>,
    key: string,
    assign: (next: Set<string>) => void,
  ): void {
    const next = new Set(current);

    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }

    assign(next);
  }

  #getContainerElementTypes(
    container: PropertyContainerGroup,
  ): readonly PropertyElementTypeGroup[] {
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

  #groupHasItems(group: PropertyTreeGroup): boolean {
    return this.#countGroupItems(group) > 0;
  }

  #countGroupItems(group: PropertyTreeGroup): number {
    const compositionCount = group.compositionSections.reduce(
      (count, section) => count + section.properties.length,
      0,
    );
    const elementPropertyCount = group.containers.reduce(
      (count, container) => count + this.#countContainerItems(container),
      0,
    );

    return group.properties.length + compositionCount + elementPropertyCount;
  }

  #countContainerItems(container: PropertyContainerGroup): number {
    const nestedCount = this._hydratedContainers.has(container.containerKey)
      ? countContainerBlockProperties(container)
      : (this.#selectorCache?.getContainerNestedPropertyCount(
          container.containerKey,
        ) ?? countContainerBlockProperties(container));

    return nestedCount;
  }

  static override readonly styles = searchPropertyPickerStyles;
}

declare global {
  interface HTMLElementTagNameMap {
    "search-property-picker": SearchPropertyPickerElement;
  }
}

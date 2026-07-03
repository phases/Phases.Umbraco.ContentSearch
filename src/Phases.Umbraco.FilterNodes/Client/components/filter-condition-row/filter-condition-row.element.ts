import {
  html,
  customElement,
  property,
  state,
  nothing,
  type PropertyValues,
} from "@umbraco-cms/backoffice/external/lit";
import type { UUISelectEvent } from "@umbraco-cms/backoffice/external/uui";
import { UmbLitElement } from "@umbraco-cms/backoffice/lit-element";
import type {
  FilterConditionField,
  FilterConditionFieldErrors,
} from "../../utils/filter-validation.utils.js";
import {
  formatMultiSelectValue,
  filterContentTypes,
  getEntireSitePropertyMetadata,
  getOperatorOptions,
  getPropertyFilterType,
  isDateFilterControl,
  isEntireSiteSearchScope,
  isMultiSelectValueSelected,
  isReservedContentTypeAlias,
  parseMultiSelectValue,
  resolvePropertyMetadata,
  shouldShowValueInput,
  shouldQuoteFilterValue,
  toFilterValueSelectOptions,
  toOperatorSelectOptions,
  toSelectOptions,
  usesDateRangeFields,
} from "../../utils/filter-condition.utils.js";
import {
  CONTENT_TYPE_ALIAS_PROPERTY_ALIAS,
  PROPERTY_SEARCH_PLACEHOLDER,
} from "../../constants/filter-nodes.constants.js";
import type {
  EditableFilterOperator,
  FilterOperator,
  FilterablePropertyMetadata,
  SearchScope,
  ContentTypeListItem,
} from "../../models/filter-models.js";
import {
  detectDateShortcut,
  resolveDateShortcutRange,
  showsCustomDateRangePickers,
  toDateShortcutSelectOptions,
  DATE_RANGE_PLACEHOLDER,
  type DateShortcutId,
  type DateShortcutRange,
} from "../../utils/date-shortcut.utils.js";
import { buildPropertyDetails } from "../../utils/property-details.utils.js";
import { buildBlockDiagnostics } from "../../utils/block-diagnostics.utils.js";
import {
  createDefaultFilterConditionRowValue,
  FILTER_CONDITION_CHANGE,
  FILTER_CONDITION_LOAD_PROPERTIES,
  FILTER_CONDITION_REMOVE,
  type FilterConditionRowValue,
} from "./filter-condition-row.models.js";
import { filterConditionRowStyles } from "./filter-condition-row.styles.js";
import "../filter-content-type-combobox/filter-content-type-combobox.element.js";
import "../filter-property-combobox/filter-property-combobox.element.js";
import "../filter-property-information/filter-property-information.element.js";

@customElement("filter-condition-row")
export class FilterConditionRowElement extends UmbLitElement {
  @property({ type: String, attribute: "data-condition-id" })
  conditionId = "";

  @property({ type: String })
  connectorLabel = "WHERE";

  @property({ type: String })
  searchScope: SearchScope = "ContentType";

  @property({ type: Array })
  contentTypes: readonly ContentTypeListItem[] = [];

  @property({ type: Array })
  propertyMetadata: readonly FilterablePropertyMetadata[] = [];

  @property({ type: String })
  propertyHiddenHint = "";

  @property({ type: Object })
  propertyMetadataByContentType: Readonly<
    Record<string, readonly FilterablePropertyMetadata[]>
  > = {};

  @property({ type: Boolean })
  loadingProperties = false;

  @property({ type: Boolean })
  loadingContentTypes = false;

  @property({ type: Boolean })
  disabled = false;

  @property({ type: Boolean })
  removeDisabled = false;

  @property({ type: Object, attribute: false })
  seed?: FilterConditionRowValue;

  @property({ type: Boolean })
  showValidation = false;

  @property({ type: Object, attribute: false })
  fieldErrors: FilterConditionFieldErrors = {};

  @state()
  private _contentTypeAlias = "";

  @state()
  private _propertyAlias = "";

  @state()
  private _filterOperator: EditableFilterOperator = "";

  @state()
  private _propertyValue = "";

  @state()
  private _fromDate = "";

  @state()
  private _toDate = "";

  @state()
  private _dateShortcut: DateShortcutId = "";

  #hydratedSeedSignature?: string;

  override connectedCallback(): void {
    super.connectedCallback();
    this.#hydrateFromSeed();
  }

  protected override willUpdate(changedProperties: PropertyValues<this>): void {
    super.willUpdate(changedProperties);

    if (
      changedProperties.has("conditionId") ||
      changedProperties.has("seed") ||
      changedProperties.has("searchScope")
    ) {
      this.#hydrateFromSeed();
    }
  }

  override render() {
    const selectedProperty = this.#getSelectedProperty();
    const selectedPropertyDetails = this.#getSelectedPropertyDetails();
    const blockDiagnostics = this.#getBlockDiagnostics();
    const operatorOptions = getOperatorOptions(
      selectedProperty,
      this._propertyAlias,
    );
    const showValueInput = shouldShowValueInput(
      selectedProperty,
      this._propertyAlias,
      this._filterOperator,
    );
    const showDateValue = isDateFilterControl(selectedProperty, this._propertyAlias);

    const documentTypes = filterContentTypes(this.contentTypes);
    const entireSite = isEntireSiteSearchScope(this.searchScope);

    return html`
      <div
        class="condition-row${entireSite ? " condition-row--entire-site" : ""}"
        data-condition-id=${this.conditionId}
      >
        <div
          class="condition-row__sentence"
          role="group"
          aria-label="Filter condition"
        >
          <span
            class="condition-row__keyword ${this.#getKeywordClass()}"
            aria-hidden="true"
          >
            ${this.connectorLabel}
          </span>
          <div
            class="condition-row__fields${entireSite
              ? " condition-row__fields--entire-site"
              : ""}"
          >
            ${entireSite
              ? nothing
              : this.#renderContentTypeField(
                this._contentTypeAlias,
                documentTypes,
                this.loadingContentTypes,
              )}
            ${this.#renderPropertyField(
              this._propertyAlias,
              entireSite
                ? this.loadingProperties || this.propertyMetadata.length === 0
                : !this._contentTypeAlias ||
                  this.loadingProperties ||
                  this.propertyMetadata.length === 0,
            )}
            ${this._propertyAlias
              ? this.#renderSelectField(
                  "filterOperator",
                  "Comparison",
                  this._filterOperator,
                  toOperatorSelectOptions(
                    operatorOptions,
                    this._filterOperator,
                    "operator",
                  ),
                  (event) =>
                    this.#onOperatorChange(
                      this.#readSelectValue(event) as EditableFilterOperator,
                    ),
                  false,
                  "condition-row__token--operator",
                )
              : this.#renderGhostToken("field", "condition-row__token--operator")}
            ${!this._propertyAlias
              ? this.#renderGhostToken("value", "condition-row__token--value")
              : html`
                  <div class="condition-row__token condition-row__token--value">
                    ${this.#renderValueSelector(
                      selectedProperty,
                      showDateValue,
                      showValueInput,
                    )}
                  </div>
                `}
          </div>
          ${!this.removeDisabled
            ? html`
                <div class="condition-row__remove">
                  <uui-button
                    look="default"
                    compact
                    label="Remove condition"
                    ?disabled=${this.disabled}
                    @click=${this.#onRemove}
                  >
                    <uui-icon name="icon-wrong"></uui-icon>
                  </uui-button>
                </div>
              `
            : nothing}
        </div>
        ${selectedPropertyDetails
          ? html`
              <filter-property-information
                .details=${selectedPropertyDetails}
                .blockDiagnostics=${blockDiagnostics}
              ></filter-property-information>
            `
          : nothing}
      </div>
    `;
  }

  #getKeywordClass(): string {
    return this.connectorLabel === "WHERE"
      ? "condition-row__keyword--where"
      : "condition-row__keyword--join";
  }

  #renderGhostToken(label: string, tokenClass = "") {
    return html`
      <div class="condition-row__token condition-row__token--ghost ${tokenClass}">
        <span class="condition-row__ghost">${label}</span>
      </div>
    `;
  }

  #renderContentTypeField(
    value: string,
    contentTypes: readonly ContentTypeListItem[],
    loading = false,
  ) {
    const errorMessage = this.#getFieldError("contentTypeAlias");
    const filled = Boolean(value);

    return html`
      <div
        class="condition-row__token condition-row__token--content-type ${filled
          ? "condition-row__token--filled"
          : "condition-row__token--empty"}"
      >
        <filter-content-type-combobox
          data-field="contentTypeAlias"
          .value=${value}
          .contentTypes=${contentTypes}
          label="Content type"
          placeholder=${loading ? "Loading…" : "Search content type..."}
          aria-describedby=${errorMessage ? this.#fieldErrorId("contentTypeAlias") : nothing}
          ?disabled=${this.disabled}
          ?error=${Boolean(errorMessage)}
          ?loading=${loading}
          @filter-content-type-change=${this.#onContentTypeComboboxChange}
        ></filter-content-type-combobox>
        ${errorMessage
          ? html`<p id=${this.#fieldErrorId("contentTypeAlias")} class="condition-row__field-error">${errorMessage}</p>`
          : nothing}
      </div>
    `;
  }

  #onContentTypeComboboxChange(event: CustomEvent<{ value: string }>): void {
    this.#onContentTypeChange(event.detail.value);
  }

  #renderPropertyField(value: string, fieldDisabled = false) {
    const errorMessage = this.#getFieldError("propertyAlias");
    const filled = Boolean(value);
    const loading = this.loadingProperties;

    return html`
      <div
        class="condition-row__token condition-row__token--property ${filled
          ? "condition-row__token--filled"
          : "condition-row__token--empty"}"
      >
        <filter-property-combobox
          data-field="propertyAlias"
          .value=${value}
          .properties=${this.propertyMetadata}
          .hiddenPropertiesHint=${this.propertyHiddenHint}
          label="Field"
          placeholder=${loading ? "Loading…" : PROPERTY_SEARCH_PLACEHOLDER}
          aria-describedby=${errorMessage ? this.#fieldErrorId("propertyAlias") : nothing}
          ?disabled=${this.disabled || fieldDisabled}
          ?error=${Boolean(errorMessage)}
          ?loading=${loading}
          @filter-property-change=${this.#onPropertyComboboxChange}
        ></filter-property-combobox>
        ${errorMessage
          ? html`<p id=${this.#fieldErrorId("propertyAlias")} class="condition-row__field-error">${errorMessage}</p>`
          : nothing}
      </div>
    `;
  }

  #onPropertyComboboxChange(event: CustomEvent<{ value: string }>): void {
    this.#onPropertyChange(event.detail.value);
  }

  #renderSelectField(
    field: FilterConditionField,
    label: string,
    value: string,
    options: ReturnType<typeof toSelectOptions>,
    onChange: (event: UUISelectEvent) => void,
    fieldDisabled = false,
    tokenClass = "",
  ) {
    const errorMessage = this.#getFieldError(field);
    const filled = Boolean(value);

    return html`
      <div
        class="condition-row__token ${tokenClass} ${filled
          ? "condition-row__token--filled"
          : "condition-row__token--empty"}"
      >
        <uui-select
          class="condition-row__control"
          data-field=${field}
          label=${label}
          .value=${value}
          .options=${options}
          ?disabled=${this.disabled || fieldDisabled}
          ?error=${Boolean(errorMessage)}
          @change=${onChange}
        ></uui-select>
        ${errorMessage
          ? html`<p id=${this.#fieldErrorId(field)} class="condition-row__field-error">${errorMessage}</p>`
          : nothing}
      </div>
    `;
  }

  #renderValueField(
    field: FilterConditionField,
    content: ReturnType<typeof html>,
    options: { literal?: boolean } = {},
  ) {
    const errorMessage = this.#getFieldError(field);
    const literal = options.literal ?? false;

    return html`
      <div
        class="condition-row__value${literal
          ? " condition-row__value--literal"
          : ""}"
      >
        ${literal
          ? html`<span class="condition-row__quote" aria-hidden="true">"</span>`
          : nothing}
        ${content}
        ${literal
          ? html`<span class="condition-row__quote" aria-hidden="true">"</span>`
          : nothing}
        ${errorMessage
          ? html`<p id=${this.#fieldErrorId(field)} class="condition-row__field-error">${errorMessage}</p>`
          : nothing}
      </div>
    `;
  }

  #getFieldError(field: FilterConditionField): string | undefined {
    if (!this.showValidation) {
      return undefined;
    }

    return this.fieldErrors[field];
  }

  #fieldErrorId(field: FilterConditionField): string {
    return `condition-${this.conditionId}-${field}-error`;
  }

  focusField(field: FilterConditionField): void {
    const element = this.renderRoot.querySelector(
      `[data-field="${field}"]`,
    ) as HTMLElement & { focus?: () => Promise<void> | void };

    void element?.focus?.();
  }

  #renderValueSelector(
    propertyMetadata: FilterablePropertyMetadata | undefined,
    showDateValue: boolean,
    showValueInput: boolean,
  ) {
    if (!this._filterOperator) {
      return this.#renderGhostToken("value");
    }

    if (showDateValue) {
      return this.#renderDateValueSelector(propertyMetadata);
    }

    if (!showValueInput) {
      return this.#renderGhostToken("—");
    }

    const filterType = getPropertyFilterType(propertyMetadata);

    switch (filterType) {
      case "Dropdown":
        return this.#renderDropdownValueSelector(propertyMetadata);
      case "MultiSelect":
        return this.#renderMultiSelectValueSelector(propertyMetadata);
      case "Number":
        return this.#renderNumberValueInput();
      default:
        return this.#renderTextValueInput(propertyMetadata);
    }
  }

  #renderTextValueInput(
    propertyMetadata: FilterablePropertyMetadata | undefined,
  ) {
    const errorMessage = this.#getFieldError("propertyValue");
    const filterType = getPropertyFilterType(propertyMetadata);
    const showQuotes = shouldQuoteFilterValue(
      this._filterOperator as FilterOperator,
      filterType,
    );

    return this.#renderValueField(
      "propertyValue",
      html`
        <uui-input
          class="condition-row__control"
          data-field="propertyValue"
          label="Value"
          placeholder="value"
          .value=${this._propertyValue}
          ?disabled=${this.disabled}
          ?error=${Boolean(errorMessage)}
          @change=${this.#onPropertyValueChange}
        >
          ${this.#renderValueClearButton()}
        </uui-input>
      `,
      { literal: showQuotes },
    );
  }

  #renderNumberValueInput() {
    const errorMessage = this.#getFieldError("propertyValue");

    return this.#renderValueField(
      "propertyValue",
      html`
        <uui-input
          class="condition-row__control"
          data-field="propertyValue"
          type="number"
          label="Value"
          placeholder="value"
          .value=${this._propertyValue}
          ?disabled=${this.disabled}
          ?error=${Boolean(errorMessage)}
          @change=${this.#onPropertyValueChange}
        >
          ${this.#renderValueClearButton()}
        </uui-input>
      `,
    );
  }

  #renderDropdownValueSelector(
    propertyMetadata: FilterablePropertyMetadata | undefined,
  ) {
    if (propertyMetadata?.alias === CONTENT_TYPE_ALIAS_PROPERTY_ALIAS) {
      return this.#renderContentTypeValueField();
    }

    const options = propertyMetadata?.options ?? [];

    if (options.length === 0) {
      return this.#renderTextValueInput(propertyMetadata);
    }

    const errorMessage = this.#getFieldError("propertyValue");

    return this.#renderValueField(
      "propertyValue",
      html`
        <uui-select
          class="condition-row__control"
          data-field="propertyValue"
          label="Value"
          placeholder="value"
          .value=${this._propertyValue}
          .options=${toFilterValueSelectOptions(
            propertyMetadata,
            this._propertyValue,
          )}
          ?disabled=${this.disabled}
          ?error=${Boolean(errorMessage)}
          @change=${(event: UUISelectEvent) =>
            this.#patchLocalState({
              propertyValue: this.#readSelectValue(event),
            })}
        ></uui-select>
      `,
    );
  }

  #renderContentTypeValueField() {
    const errorMessage = this.#getFieldError("propertyValue");
    const documentTypes = filterContentTypes(this.contentTypes);

    return this.#renderValueField(
      "propertyValue",
      html`
        <filter-content-type-combobox
          data-field="propertyValue"
          .value=${this._propertyValue}
          .contentTypes=${documentTypes}
          label="Value"
          placeholder="Search document type..."
          aria-describedby=${errorMessage ? this.#fieldErrorId("propertyValue") : nothing}
          ?disabled=${this.disabled}
          ?error=${Boolean(errorMessage)}
          ?loading=${this.loadingContentTypes}
          @filter-content-type-change=${this.#onContentTypeValueChange}
        ></filter-content-type-combobox>
      `,
    );
  }

  #onContentTypeValueChange(event: CustomEvent<{ value: string }>): void {
    this.#patchLocalState({ propertyValue: event.detail.value });
  }

  #renderMultiSelectValueSelector(
    propertyMetadata: FilterablePropertyMetadata | undefined,
  ) {
    const options = propertyMetadata?.options ?? [];

    if (options.length === 0) {
      return this.#renderTextValueInput(propertyMetadata);
    }

    const errorMessage = this.#getFieldError("propertyValue");

    return this.#renderValueField(
      "propertyValue",
      html`
        <div
          class="condition-row__multi-select${errorMessage
            ? " condition-row__multi-select--error"
            : ""}"
          data-field="propertyValue"
        >
          ${options.map(
            (option) => html`
              <label class="condition-row__multi-select-option">
                <uui-checkbox
                  .checked=${isMultiSelectValueSelected(
                    this._propertyValue,
                    option.value,
                  )}
                  ?disabled=${this.disabled}
                  @change=${(event: Event) =>
                    this.#onMultiSelectChange(
                      option.value,
                      (event.target as HTMLInputElement).checked,
                    )}
                ></uui-checkbox>
                <span>${option.label}</span>
              </label>
            `,
          )}
        </div>
      `,
    );
  }

  #renderDateValueSelector(
    propertyMetadata: FilterablePropertyMetadata | undefined,
  ) {
    if (this._filterOperator === "Between") {
      return this.#renderDateRangeWorkflow();
    }

    return this.#renderSingleDateValueInput(propertyMetadata);
  }

  #renderSingleDateValueInput(
    propertyMetadata: FilterablePropertyMetadata | undefined,
  ) {
    const isSystemDate = usesDateRangeFields(
      propertyMetadata,
      this._propertyAlias,
    );
    const usesToDate =
      this._filterOperator === "LessThan" ||
      this._filterOperator === "LessThanOrEqual";
    const field: FilterConditionField = usesToDate ? "toDate" : isSystemDate
      ? "fromDate"
      : "propertyValue";
    const label = "Date";
    const value = usesToDate
      ? this._toDate
      : isSystemDate
        ? this._fromDate
        : this._propertyValue;
    const errorMessage = this.#getFieldError(field);

    return this.#renderValueField(
      field,
      html`
        <uui-input
          class="condition-row__control"
          data-field=${field}
          type="date"
          label=${label}
          .value=${value}
          ?disabled=${this.disabled}
          ?error=${Boolean(errorMessage)}
          @change=${(event: Event) => this.#onSingleDateChange(event, field)}
        ></uui-input>
      `,
    );
  }

  #onSingleDateChange(
    event: Event,
    field: FilterConditionField,
  ): void {
    const value = (event.target as HTMLInputElement).value;
    this._dateShortcut = "";

    if (field === "toDate") {
      this.#patchLocalState({ toDate: value, fromDate: "", propertyValue: "" });
      return;
    }

    if (field === "fromDate") {
      this.#patchLocalState({ fromDate: value, toDate: "", propertyValue: "" });
      return;
    }

    this.#patchLocalState({ propertyValue: value, fromDate: "", toDate: "" });
  }

  #renderDateRangeWorkflow() {
    const dateRangeError = this.#getFieldError("dateRange");
    const fromDateError = this.#getFieldError("fromDate");
    const toDateError = this.#getFieldError("toDate");
    const showCustomPickers = showsCustomDateRangePickers(this._dateShortcut);

    return html`
      <div class="condition-row__value">
        <div class="condition-row__date-value">
          <div class="condition-row__date-range-select">
            <uui-select
              class="condition-row__control"
              data-field="dateRange"
              label="Date range"
              placeholder=${DATE_RANGE_PLACEHOLDER}
              .value=${this._dateShortcut}
              .options=${toDateShortcutSelectOptions(this._dateShortcut)}
              ?disabled=${this.disabled}
              ?error=${Boolean(dateRangeError)}
              @change=${this.#onDateShortcutChange}
            ></uui-select>
            ${dateRangeError
              ? html`<p class="condition-row__field-error">${dateRangeError}</p>`
              : nothing}
          </div>
          ${showCustomPickers
            ? html`
                <div class="condition-row__date-range">
                  <div class="condition-row__date-field">
                    <uui-input
                      class="condition-row__control"
                      data-field="fromDate"
                      type="date"
                      label="From date"
                      .value=${this._fromDate}
                      ?disabled=${this.disabled}
                      ?error=${Boolean(fromDateError)}
                      @change=${this.#onFromDateChange}
                    ></uui-input>
                    ${fromDateError
                      ? html`<p class="condition-row__field-error">${fromDateError}</p>`
                      : nothing}
                  </div>
                  <div class="condition-row__date-field">
                    <uui-input
                      class="condition-row__control"
                      data-field="toDate"
                      type="date"
                      label="To date"
                      .value=${this._toDate}
                      ?disabled=${this.disabled}
                      ?error=${Boolean(toDateError)}
                      @change=${this.#onToDateChange}
                    ></uui-input>
                    ${toDateError
                      ? html`<p class="condition-row__field-error">${toDateError}</p>`
                      : nothing}
                  </div>
                </div>
              `
            : nothing}
        </div>
      </div>
    `;
  }

  #getSelectedProperty(): FilterablePropertyMetadata | undefined {
    return this.propertyMetadata.find(
      (property) => property.alias === this._propertyAlias,
    );
  }

  #getSelectedPropertyDetails() {
    if (!this._propertyAlias) {
      return undefined;
    }

    const property = resolvePropertyMetadata(
      this.propertyMetadataByContentType,
      this._contentTypeAlias,
      this._propertyAlias,
      this.searchScope,
      this.contentTypes,
    );

    if (!property) {
      return undefined;
    }

    return buildPropertyDetails(property);
  }

  #getBlockDiagnostics() {
    if (!this._propertyAlias) {
      return undefined;
    }

    const property = resolvePropertyMetadata(
      this.propertyMetadataByContentType,
      this._contentTypeAlias,
      this._propertyAlias,
      this.searchScope,
      this.contentTypes,
    );

    if (!property) {
      return undefined;
    }

    const allProperties = isEntireSiteSearchScope(this.searchScope)
      ? getEntireSitePropertyMetadata(this.contentTypes)
      : (this.propertyMetadataByContentType[this._contentTypeAlias] ?? []);

    return buildBlockDiagnostics(allProperties, property);
  }

  #hydrateFromSeed(): void {
    if (!this.conditionId) {
      return;
    }

    const seed = this.seed ?? createDefaultFilterConditionRowValue();
    const seedSignature = JSON.stringify({
      conditionId: this.conditionId,
      searchScope: this.searchScope,
      contentTypeAlias: seed.contentTypeAlias,
      propertyAlias: seed.propertyAlias,
      filterOperator: seed.filterOperator,
      propertyValue: seed.propertyValue,
      fromDate: seed.fromDate,
      toDate: seed.toDate,
    });

    if (this.#hydratedSeedSignature === seedSignature) {
      return;
    }

    this._contentTypeAlias = seed.contentTypeAlias;
    this._propertyAlias = seed.propertyAlias;
    this._filterOperator = seed.filterOperator;
    this._propertyValue = seed.propertyValue;
    this._fromDate = seed.fromDate;
    this._toDate = seed.toDate;
    this._dateShortcut = this.#detectCurrentShortcut();
    this.#hydratedSeedSignature = seedSignature;
  }

  #onContentTypeChange(contentTypeAlias: string): void {
    if (isReservedContentTypeAlias(contentTypeAlias)) {
      contentTypeAlias = "";
    }

    if (contentTypeAlias === this._contentTypeAlias) {
      return;
    }

    this.#patchLocalState({
      contentTypeAlias,
      propertyAlias: "",
      propertyValue: "",
      fromDate: "",
      toDate: "",
      filterOperator: "",
    });
    this._dateShortcut = "";

    if (contentTypeAlias) {
      this.#dispatchLoadProperties(contentTypeAlias);
    }
  }

  #onPropertyChange(propertyAlias: string): void {
    if (propertyAlias === this._propertyAlias) {
      return;
    }

    const patch: Partial<FilterConditionRowValue> = {
      propertyAlias,
      propertyValue: "",
      fromDate: "",
      toDate: "",
      filterOperator: "",
    };

    this.#patchLocalState(patch);
    this._dateShortcut = "";
  }

  #onOperatorChange(filterOperator: EditableFilterOperator): void {
    if (filterOperator === this._filterOperator) {
      return;
    }

    const selectedProperty = this.#getSelectedProperty();
    const isCustomDate =
      isDateFilterControl(selectedProperty, this._propertyAlias) &&
      !usesDateRangeFields(selectedProperty, this._propertyAlias);
    const patch: Partial<FilterConditionRowValue> = { filterOperator };

    if (!filterOperator) {
      patch.propertyValue = "";
      patch.fromDate = "";
      patch.toDate = "";
    } else if (filterOperator === "IsEmpty" || filterOperator === "IsNotEmpty") {
      patch.propertyValue = "";
      patch.fromDate = "";
      patch.toDate = "";
    } else if (isCustomDate) {
      if (filterOperator === "Between") {
        const dateValue = this._propertyValue.trim();

        if (dateValue) {
          patch.fromDate = dateValue;
          patch.toDate = dateValue;
          patch.propertyValue = "";
        }
      } else if (this._filterOperator === "Between") {
        const fromDate = this._fromDate.trim();
        const toDate = this._toDate.trim();

        if (fromDate && fromDate === toDate) {
          patch.propertyValue = fromDate;
        } else if (fromDate) {
          patch.propertyValue = fromDate;
        }

        patch.fromDate = "";
        patch.toDate = "";
      }
    }

    this.#patchLocalState(patch);
    this._dateShortcut = this.#detectCurrentShortcut();
  }

  #onPropertyValueChange(event: Event): void {
    this.#patchLocalState({
      propertyValue: (event.target as HTMLInputElement).value,
    });
  }

  #renderValueClearButton() {
    if (!this._propertyValue.trim() || this.disabled) {
      return nothing;
    }

    return html`
      <uui-button
        slot="append"
        type="button"
        compact
        label="Clear value"
        ?disabled=${this.disabled}
        @click=${this.#onClearPropertyValue}
      >
        <uui-icon name="icon-delete"></uui-icon>
      </uui-button>
    `;
  }

  #onClearPropertyValue(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.#patchLocalState({ propertyValue: "" });
  }

  #onMultiSelectChange(optionValue: string, checked: boolean): void {
    const currentValues = [...parseMultiSelectValue(this._propertyValue)];

    if (checked) {
      if (!currentValues.includes(optionValue)) {
        currentValues.push(optionValue);
      }
    } else {
      const index = currentValues.indexOf(optionValue);
      if (index >= 0) {
        currentValues.splice(index, 1);
      }
    }

    this.#patchLocalState({
      propertyValue: formatMultiSelectValue(currentValues),
    });
  }

  #onFromDateChange(event: Event): void {
    this._dateShortcut = "custom";
    this.#patchLocalState({
      fromDate: (event.target as HTMLInputElement).value,
    });
  }

  #onToDateChange(event: Event): void {
    this._dateShortcut = "custom";
    this.#patchLocalState({
      toDate: (event.target as HTMLInputElement).value,
    });
  }

  #onDateShortcutChange(event: UUISelectEvent): void {
    const shortcutId = this.#readSelectValue(event) as DateShortcutId;

    if (!shortcutId) {
      this._dateShortcut = "";
      this.#patchLocalState({
        fromDate: "",
        toDate: "",
        propertyValue: "",
      });
      return;
    }

    if (shortcutId === "custom") {
      this._dateShortcut = "custom";
      return;
    }

    const range = resolveDateShortcutRange(shortcutId);

    if (!range) {
      return;
    }

    const selectedProperty = this.#getSelectedProperty();
    const isSystemDate = usesDateRangeFields(
      selectedProperty,
      this._propertyAlias,
    );

    this._dateShortcut = shortcutId;
    this.#patchLocalState(this.#buildShortcutPatch(range, isSystemDate));
  }

  #buildShortcutPatch(
    range: DateShortcutRange,
    isSystemDate: boolean,
  ): Partial<FilterConditionRowValue> {
    if (isSystemDate) {
      if (this._filterOperator === "Between") {
        return { fromDate: range.fromDate, toDate: range.toDate };
      }

      if (
        this._filterOperator === "LessThan" ||
        this._filterOperator === "LessThanOrEqual"
      ) {
        return { toDate: range.toDate, fromDate: "" };
      }

      return { fromDate: range.fromDate, toDate: "" };
    }

    if (this._filterOperator === "Between") {
      return {
        fromDate: range.fromDate,
        toDate: range.toDate,
        propertyValue: "",
      };
    }

    if (range.isSingleDay) {
      return {
        propertyValue: range.fromDate,
        fromDate: "",
        toDate: "",
      };
    }

    return {
      fromDate: range.fromDate,
      toDate: "",
      propertyValue: "",
    };
  }

  #detectCurrentShortcut(): DateShortcutId {
    const selectedProperty = this.#getSelectedProperty();
    const isSystemDate = usesDateRangeFields(
      selectedProperty,
      this._propertyAlias,
    );

    return detectDateShortcut(
      this._fromDate,
      this._toDate,
      this._propertyValue,
      this._filterOperator,
      isSystemDate ? "system" : "custom",
    );
  }

  #onRemove(): void {
    this.dispatchEvent(
      new CustomEvent(FILTER_CONDITION_REMOVE, {
        detail: { conditionId: this.conditionId },
        bubbles: true,
        composed: true,
      }),
    );
  }

  #patchLocalState(patch: Partial<FilterConditionRowValue>): void {
    if (patch.contentTypeAlias !== undefined) {
      this._contentTypeAlias = patch.contentTypeAlias;
    }

    if (patch.propertyAlias !== undefined) {
      this._propertyAlias = patch.propertyAlias;
    }

    if (patch.filterOperator !== undefined) {
      this._filterOperator = patch.filterOperator;
    }

    if (patch.propertyValue !== undefined) {
      this._propertyValue = patch.propertyValue;
    }

    if (patch.fromDate !== undefined) {
      this._fromDate = patch.fromDate;
    }

    if (patch.toDate !== undefined) {
      this._toDate = patch.toDate;
    }

    this.#dispatchChange();
  }

  #dispatchChange(): void {
    this.dispatchEvent(
      new CustomEvent(FILTER_CONDITION_CHANGE, {
        detail: {
          conditionId: this.conditionId,
          contentTypeAlias: this._contentTypeAlias,
          propertyAlias: this._propertyAlias,
          filterOperator: this._filterOperator,
          propertyValue: this._propertyValue,
          fromDate: this._fromDate,
          toDate: this._toDate,
        },
        bubbles: true,
        composed: true,
      }),
    );
  }

  #dispatchLoadProperties(contentTypeAlias: string): void {
    this.dispatchEvent(
      new CustomEvent(FILTER_CONDITION_LOAD_PROPERTIES, {
        detail: {
          conditionId: this.conditionId,
          contentTypeAlias,
        },
        bubbles: true,
        composed: true,
      }),
    );
  }

  #readSelectValue(event: UUISelectEvent): string {
    return String(event.target.value ?? "");
  }

  static override readonly styles = [...filterConditionRowStyles];
}

declare global {
  interface HTMLElementTagNameMap {
    "filter-condition-row": FilterConditionRowElement;
  }
}

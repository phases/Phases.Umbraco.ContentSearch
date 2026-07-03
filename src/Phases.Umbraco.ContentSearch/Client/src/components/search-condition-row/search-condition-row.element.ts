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
import { UmbInputDateElement } from "@umbraco-cms/backoffice/components";
import {
  isDateProperty,
  normalizeLegacyDateOperator,
  operatorRequiresRangeValue,
  operatorRequiresValue,
  toSelectOptions,
} from "../../utils/search-condition.utils.js";
import {
  isPublishStatusPropertyAlias,
  PUBLISH_STATUS_VALUE_OPTIONS,
} from "../../constants/publish-status.constants.js";
import {
  encodeDateRangeValue,
  parseDateRangeValue,
} from "../../utils/search-condition-date-value.utils.js";
import { getOperatorOptionsForProperty } from "../../utils/property-operator.utils.js";
import type { SearchPropertyMetadata } from "../../models/metadata.models.js";
import type {
  SearchConditionOperator,
  SearchContentTypeOption,
} from "../../models/search-builder.models.js";
import type { SearchConditionFieldErrors } from "../../utils/search-condition-validation.utils.js";
import "../search-content-type-picker/search-content-type-picker.element.js";
import "../search-property-picker/search-property-picker.element.js";
import {
  SEARCH_CONDITION_CHANGE,
  SEARCH_CONDITION_DUPLICATE,
  SEARCH_CONDITION_REMOVE,
  SEARCH_CONDITION_REORDER,
  type SearchConditionRowValue,
} from "./search-condition-row.models.js";
import { searchConditionRowStyles } from "./search-condition-row.styles.js";

@customElement("search-condition-row")
export class SearchConditionRowElement extends UmbLitElement {
  @property({ type: String, attribute: "data-condition-id" })
  conditionId = "";

  @property({ type: String })
  connectorLabel = "WHERE";

  @property({ type: Array })
  contentTypes: readonly SearchContentTypeOption[] = [];

  @property({ type: Array })
  properties: readonly SearchPropertyMetadata[] = [];

  @property({ type: Boolean })
  contentTypesLoading = false;

  @property({ type: Boolean })
  propertiesLoading = false;

  @property({ type: Boolean })
  disabled = false;

  @property({ type: Boolean })
  removeDisabled = false;

  @property({ type: Boolean })
  duplicateDisabled = false;

  @property({ type: Boolean, reflect: true, attribute: "single-mode" })
  singleMode = false;

  @property({ type: Boolean })
  showValidation = false;

  @property({ type: Object, attribute: false })
  fieldErrors: SearchConditionFieldErrors = {};

  @property({ type: Object, attribute: false })
  seed?: SearchConditionRowValue;

  @property({ type: Boolean, reflect: true })
  dragging = false;

  @property({ type: Boolean, reflect: true, attribute: "drop-target" })
  dropTarget = false;

  @state()
  private _contentTypeAlias = "";

  @state()
  private _propertyAlias = "";

  @state()
  private _operator: SearchConditionOperator = "";

  @state()
  private _value = "";

  #hydratedSeedSignature?: string;

  override connectedCallback(): void {
    super.connectedCallback();
    this.#hydrateFromSeed();
  }

  protected override willUpdate(changedProperties: PropertyValues<this>): void {
    super.willUpdate(changedProperties);

    if (changedProperties.has("conditionId") || changedProperties.has("seed")) {
      this.#hydrateFromSeed();
    }
  }

  override render() {
    return this.singleMode ? this.#renderSingleMode() : this.#renderListMode();
  }

  #renderSingleMode() {
    const showValue = operatorRequiresValue(this._operator);

    return html`
      <div class="condition-row condition-row--single" data-condition-id=${this.conditionId}>
        <div
          class="condition-row__form"
          role="group"
          aria-label="Search condition"
        >
          ${this.#renderContentTypePicker()}
          ${this._contentTypeAlias
            ? this.#renderPropertyPicker()
            : this.#renderGhostToken("Property")}
          ${this._propertyAlias
            ? this.#renderSelectField(
                "operator",
                "Operator",
                this._operator,
                toSelectOptions(
                  this.#getOperatorOptions(),
                  this._operator,
                  "Operator",
                ),
                (event) =>
                  this.#onOperatorChange(
                    this.#readSelectValue(event) as SearchConditionOperator,
                  ),
              )
            : this.#renderGhostToken("Operator")}
          ${this._propertyAlias && this._operator
            ? showValue
              ? this.#renderValueField()
              : this.#renderGhostToken("—")
            : this.#renderGhostToken("Value")}
        </div>
      </div>
    `;
  }

  #renderListMode() {
    const showValue = operatorRequiresValue(this._operator);

    return html`
      <div class="condition-row" data-condition-id=${this.conditionId}>
        <div class="condition-row__sentence" role="group" aria-label=${`Search condition: ${this.connectorLabel}`}>
          <span
            class="condition-row__keyword ${this.#getKeywordClass()}"
            aria-hidden="true"
          >
            ${this.connectorLabel}
          </span>

          <div class="condition-row__fields">
            ${this.#renderContentTypePicker()}
            ${this._contentTypeAlias
              ? this.#renderPropertyPicker()
              : this.#renderGhostToken("Property")}
            ${this._propertyAlias
              ? this.#renderSelectField(
                  "operator",
                  "Operator",
                  this._operator,
                  toSelectOptions(
                    this.#getOperatorOptions(),
                    this._operator,
                    "Operator",
                  ),
                  (event) =>
                    this.#onOperatorChange(
                      this.#readSelectValue(event) as SearchConditionOperator,
                    ),
                )
              : this.#renderGhostToken("Operator")}
            ${this._propertyAlias && this._operator
              ? showValue
                ? this.#renderValueField()
                : this.#renderGhostToken("—")
              : this.#renderGhostToken("Value")}
          </div>

          <div class="condition-row__actions">
            <uui-button
              class="condition-row__drag"
              look="reset"
              compact
              label="Drag to reorder"
              ?disabled=${this.disabled}
              draggable=${!this.disabled}
              @dragstart=${this.#onDragStart}
              @dragend=${this.#onDragEnd}
              @keydown=${this.#onDragHandleKeydown}
            >
              <uui-icon name="icon-navigation"></uui-icon>
            </uui-button>
            <uui-button
              look="reset"
              compact
              label="Duplicate condition"
              ?disabled=${this.disabled || this.duplicateDisabled}
              @click=${this.#onDuplicate}
            >
              <uui-icon name="icon-copy"></uui-icon>
            </uui-button>
            <uui-button
              look="reset"
              compact
              label="Remove condition"
              ?disabled=${this.disabled || this.removeDisabled}
              @click=${this.#onRemove}
            >
              <uui-icon name="icon-wrong"></uui-icon>
            </uui-button>
          </div>
        </div>
      </div>
    `;
  }

  #getKeywordClass(): string {
    return this.connectorLabel === "WHERE"
      ? "condition-row__keyword--where"
      : "condition-row__keyword--join";
  }

  #renderContentTypePicker() {
    const errorMessage = this.#getFieldError("contentTypeAlias");

    return html`
      <div class="condition-row__token">
        <search-content-type-picker
          class="condition-row__control"
          label="Content type"
          .value=${this._contentTypeAlias}
          .contentTypes=${this.contentTypes}
          .loading=${this.contentTypesLoading}
          ?disabled=${this.disabled}
          ?error=${Boolean(errorMessage)}
          aria-describedby=${errorMessage ? this.#fieldErrorId("contentTypeAlias") : nothing}
          @search-content-type-change=${this.#onContentTypePickerChange}
        ></search-content-type-picker>
        ${errorMessage
          ? html`<p id=${this.#fieldErrorId("contentTypeAlias")} class="condition-row__field-error">
              ${errorMessage}
            </p>`
          : nothing}
      </div>
    `;
  }

  #renderPropertyPicker() {
    const errorMessage = this.#getFieldError("propertyAlias");

    return html`
      <div class="condition-row__token">
        <search-property-picker
          class="condition-row__control"
          label="Property"
          .value=${this._propertyAlias}
          .properties=${this.properties}
          .loading=${this.propertiesLoading}
          ?disabled=${this.disabled}
          ?error=${Boolean(errorMessage)}
          aria-describedby=${errorMessage ? this.#fieldErrorId("propertyAlias") : nothing}
          @search-property-change=${this.#onPropertyPickerChange}
        ></search-property-picker>
        ${errorMessage
          ? html`<p id=${this.#fieldErrorId("propertyAlias")} class="condition-row__field-error">
              ${errorMessage}
            </p>`
          : nothing}
      </div>
    `;
  }

  #renderGhostToken(label: string) {
    return html`
      <div class="condition-row__token">
        <span class="condition-row__ghost">${label}</span>
      </div>
    `;
  }

  #renderSelectField(
    field: keyof SearchConditionFieldErrors,
    label: string,
    value: string,
    options: Array<{ name: string; value: string; selected?: boolean }>,
    onChange: (event: UUISelectEvent) => void,
    isDisabled = this.disabled,
  ) {
    const errorMessage = this.#getFieldError(field);

    return html`
      <div class="condition-row__token">
        <uui-select
          class="condition-row__control"
          label=${label}
          .value=${value}
          .options=${options}
          ?disabled=${isDisabled}
          ?error=${Boolean(errorMessage)}
          aria-describedby=${errorMessage ? this.#fieldErrorId(field) : nothing}
          @change=${onChange}
        ></uui-select>
        ${errorMessage
          ? html`<p id=${this.#fieldErrorId(field)} class="condition-row__field-error">
              ${errorMessage}
            </p>`
          : nothing}
      </div>
    `;
  }

  #renderValueField() {
    const property = this.#getSelectedProperty();

    if (isPublishStatusPropertyAlias(this._propertyAlias) && operatorRequiresValue(this._operator)) {
      return this.#renderPublishStatusValueField();
    }

    if (isDateProperty(property)) {
      return operatorRequiresRangeValue(this._operator)
        ? this.#renderDateRangeValueField()
        : this.#renderDateValueField();
    }

    return this.#renderTextValueField();
  }

  #getOperatorOptions() {
    return getOperatorOptionsForProperty(this.#getSelectedProperty()).map(
      (item) => ({
        value: item.value,
        label: item.label,
      }),
    );
  }

  #getSelectedProperty(): SearchPropertyMetadata | undefined {
    return this.properties.find((property) => property.alias === this._propertyAlias);
  }

  #renderPublishStatusValueField() {
    return this.#renderSelectField(
      "value",
      "Publish status",
      this._value,
      toSelectOptions(PUBLISH_STATUS_VALUE_OPTIONS, this._value, "Select status"),
      (event: UUISelectEvent) => {
        this._value = event.target.value as string;
        this.#emitChange();
      },
    );
  }

  #renderTextValueField() {
    const errorMessage = this.#getFieldError("value");

    return html`
      <div class="condition-row__token">
        <uui-input
          class="condition-row__control"
          label="Value"
          placeholder="Value"
          .value=${this._value}
          ?disabled=${this.disabled}
          ?required=${true}
          ?error=${Boolean(errorMessage)}
          aria-describedby=${errorMessage ? this.#fieldErrorId("value") : nothing}
          @input=${(event: Event) => {
            this._value = (event.target as HTMLInputElement).value;
            this.#emitChange();
          }}
        ></uui-input>
        ${errorMessage
          ? html`<p id=${this.#fieldErrorId("value")} class="condition-row__field-error">
              ${errorMessage}
            </p>`
          : nothing}
      </div>
    `;
  }

  #renderDateValueField() {
    const errorMessage = this.#getFieldError("value");

    return html`
      <div class="condition-row__token">
        <umb-input-date
          class="condition-row__control"
          type="date"
          label="Date"
          .value=${this._value}
          ?disabled=${this.disabled}
          ?required=${true}
          ?error=${Boolean(errorMessage)}
          aria-describedby=${errorMessage ? this.#fieldErrorId("value") : nothing}
          @change=${(event: Event) => {
            this._value = String((event.target as UmbInputDateElement).value ?? "");
            this.#emitChange();
          }}
        ></umb-input-date>
        ${errorMessage
          ? html`<p id=${this.#fieldErrorId("value")} class="condition-row__field-error">
              ${errorMessage}
            </p>`
          : nothing}
      </div>
    `;
  }

  #renderDateRangeValueField() {
    const errorMessage = this.#getFieldError("value");
    const { from, to } = parseDateRangeValue(this._value);

    return html`
      <div class="condition-row__token condition-row__token--date-range">
        <div class="condition-row__date-range">
          <umb-input-date
            class="condition-row__control"
            type="date"
            label="From"
            .value=${from}
            ?disabled=${this.disabled}
            ?required=${true}
            ?error=${Boolean(errorMessage)}
            @change=${(event: Event) => {
              this._value = encodeDateRangeValue(
                String((event.target as UmbInputDateElement).value ?? ""),
                to,
              );
              this.#emitChange();
            }}
          ></umb-input-date>
          <span class="condition-row__date-range-separator" aria-hidden="true">–</span>
          <umb-input-date
            class="condition-row__control"
            type="date"
            label="To"
            .value=${to}
            .min=${from || nothing}
            ?disabled=${this.disabled}
            ?required=${true}
            ?error=${Boolean(errorMessage)}
            aria-describedby=${errorMessage ? this.#fieldErrorId("value") : nothing}
            @change=${(event: Event) => {
              this._value = encodeDateRangeValue(
                from,
                String((event.target as UmbInputDateElement).value ?? ""),
              );
              this.#emitChange();
            }}
          ></umb-input-date>
        </div>
        ${errorMessage
          ? html`<p id=${this.#fieldErrorId("value")} class="condition-row__field-error">
              ${errorMessage}
            </p>`
          : nothing}
      </div>
    `;
  }

  #hydrateFromSeed(): void {
    const seed = this.seed;
    const signature = seed
      ? `${this.conditionId}:${seed.contentTypeAlias}:${seed.propertyAlias}:${seed.operator}:${seed.value}`
      : this.conditionId;

    if (this.#hydratedSeedSignature === signature) {
      return;
    }

    this.#hydratedSeedSignature = signature;
    this._contentTypeAlias = seed?.contentTypeAlias ?? "";
    this._propertyAlias = seed?.propertyAlias ?? "";
    this._operator = normalizeLegacyDateOperator(seed?.operator ?? "");
    this._value = seed?.value ?? "";
  }

  #onContentTypePickerChange(event: CustomEvent<{ value: string }>): void {
    const value = event.detail.value;

    if (value === this._contentTypeAlias) {
      return;
    }

    this._contentTypeAlias = value;
    this._propertyAlias = "";
    this._operator = "";
    this._value = "";
    this.#emitChange();
  }

  #onPropertyPickerChange(event: CustomEvent<{ value: string }>): void {
    const value = event.detail.value;

    if (value === this._propertyAlias) {
      return;
    }

    this._propertyAlias = value;
    this._operator = "";
    this._value = "";
    this.#emitChange();
  }

  #onOperatorChange(value: SearchConditionOperator): void {
    if (value === this._operator) {
      return;
    }

    this._operator = value;

    if (!operatorRequiresValue(value)) {
      this._value = "";
    }

    this.#emitChange();
  }

  #onRemove(): void {
    this.dispatchEvent(
      new CustomEvent(SEARCH_CONDITION_REMOVE, {
        detail: { conditionId: this.conditionId },
        bubbles: true,
        composed: true,
      }),
    );
  }

  #onDuplicate(): void {
    this.dispatchEvent(
      new CustomEvent(SEARCH_CONDITION_DUPLICATE, {
        detail: { conditionId: this.conditionId },
        bubbles: true,
        composed: true,
      }),
    );
  }

  #onDragStart(event: DragEvent): void {
    if (!event.dataTransfer) {
      return;
    }

    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", this.conditionId);
    this.dispatchEvent(
      new CustomEvent("search-condition-drag-start", {
        detail: { conditionId: this.conditionId },
        bubbles: true,
        composed: true,
      }),
    );
  }

  #onDragEnd(): void {
    this.dispatchEvent(
      new CustomEvent("search-condition-drag-end", {
        bubbles: true,
        composed: true,
      }),
    );
  }

  #onDragHandleKeydown(event: KeyboardEvent): void {
    if (event.key !== "ArrowUp" && event.key !== "ArrowDown") {
      return;
    }

    event.preventDefault();
    this.dispatchEvent(
      new CustomEvent(SEARCH_CONDITION_REORDER, {
        detail: {
          conditionId: this.conditionId,
          direction: event.key === "ArrowUp" ? "up" : "down",
        },
        bubbles: true,
        composed: true,
      }),
    );
  }

  #emitChange(): void {
    this.dispatchEvent(
      new CustomEvent(SEARCH_CONDITION_CHANGE, {
        detail: {
          conditionId: this.conditionId,
          contentTypeAlias: this._contentTypeAlias,
          propertyAlias: this._propertyAlias,
          operator: this._operator,
          value: this._value,
        },
        bubbles: true,
        composed: true,
      }),
    );
  }

  #readSelectValue(event: UUISelectEvent): string {
    return String(event.target.value ?? "");
  }

  #getFieldError(field: keyof SearchConditionFieldErrors): string | undefined {
    return this.showValidation ? this.fieldErrors[field] : undefined;
  }

  #fieldErrorId(field: string): string {
    return `${this.conditionId}-${field}-error`;
  }

  static override readonly styles = searchConditionRowStyles;
}

declare global {
  interface HTMLElementTagNameMap {
    "search-condition-row": SearchConditionRowElement;
  }
}

import {
  html,
  customElement,
  property,
  state,
  nothing,
} from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement } from "@umbraco-cms/backoffice/lit-element";
import { PROPERTY_TECHNICAL_DETAILS_LABEL } from "../../constants/filter-nodes.constants.js";
import type { PropertyDetailsDisplay } from "../../utils/property-details.utils.js";
import {
  PROPERTY_CAN_BE_SEARCHED_LABEL,
  PROPERTY_SEARCH_MODE_LABEL,
  PROPERTY_SEARCH_FIELD_LABEL,
} from "../../utils/property-details.utils.js";
import { filterPropertyDetailsStyles } from "./filter-property-details.styles.js";

@customElement("filter-property-details")
export class FilterPropertyDetailsElement extends UmbLitElement {
  @property({ attribute: false })
  details?: PropertyDetailsDisplay;

  @state()
  private _technicalDetailsOpen = false;

  override render() {
    const details = this.details;

    if (!details) {
      return nothing;
    }

    return html`
      <section
        class="property-details"
        aria-label="Property details"
      >
        <h4 class="property-details__title">Property details</h4>
        <dl class="property-details__list">
          ${this.#renderRow("Property", details.propertyName)}
          ${this.#renderRow("Property Type", details.propertyType)}
          ${this.#renderSourceRow("Source", details.source, details.sourceIcon)}
          ${details.blockType
            ? this.#renderRow("Block type", details.blockType)
            : nothing}
          ${details.searchMode ? this.#renderSearchModeRow(details) : nothing}
          ${this.#renderSearchabilityRow(details)}
        </dl>
        ${details.showTechnicalDetails
          ? this.#renderTechnicalDetails(details)
          : nothing}
      </section>
    `;
  }

  #renderSearchModeRow(details: PropertyDetailsDisplay) {
    const searchMode = details.searchMode;

    if (!searchMode) {
      return nothing;
    }

    return html`
      <dt class="property-details__term">${PROPERTY_SEARCH_MODE_LABEL}</dt>
      <dd class="property-details__value">
        <span class="property-details__value property-details__value--mode">
          ${searchMode.label}
        </span>
        <p class="property-details__description">${searchMode.description}</p>
      </dd>
    `;
  }

  #renderSearchabilityRow(details: PropertyDetailsDisplay) {
    return html`
      <dt class="property-details__term">${PROPERTY_CAN_BE_SEARCHED_LABEL}</dt>
      <dd class="property-details__value">
        <span
          class="property-details__value ${details.searchable
            ? "property-details__value--positive"
            : "property-details__value--muted"}"
        >
          ${details.searchableLabel}
        </span>
        <p class="property-details__description">${details.searchableDescription}</p>
      </dd>
    `;
  }

  #renderTechnicalDetails(details: PropertyDetailsDisplay) {
    return html`
      <div class="property-details__technical">
        <button
          type="button"
          class="property-details__technical-toggle"
          aria-expanded=${this._technicalDetailsOpen}
          @click=${this.#toggleTechnicalDetails}
        >
          <uui-symbol-expand .open=${this._technicalDetailsOpen}></uui-symbol-expand>
          <span>${PROPERTY_TECHNICAL_DETAILS_LABEL}</span>
        </button>
        ${this._technicalDetailsOpen
          ? html`
              <dl class="property-details__technical-list">
                ${details.searchField
                  ? this.#renderRow(
                      PROPERTY_SEARCH_FIELD_LABEL,
                      details.searchField,
                      true,
                    )
                  : nothing}
              </dl>
            `
          : nothing}
      </div>
    `;
  }

  #toggleTechnicalDetails(): void {
    this._technicalDetailsOpen = !this._technicalDetailsOpen;
  }

  #renderSourceRow(label: string, source: string, icon: string) {
    return html`
      <dt class="property-details__term">${label}</dt>
      <dd class="property-details__value property-details__value--source">
        <uui-icon
          class="property-details__source-icon"
          name=${icon}
          title=${source}
        ></uui-icon>
        <span>${source}</span>
      </dd>
    `;
  }

  #renderRow(label: string, value: string, mono = false) {
    return html`
      <dt class="property-details__term">${label}</dt>
      <dd
        class="property-details__value ${mono ? "property-details__value--mono" : ""}"
      >
        ${value}
      </dd>
    `;
  }

  static override readonly styles = [filterPropertyDetailsStyles];
}

declare global {
  interface HTMLElementTagNameMap {
    "filter-property-details": FilterPropertyDetailsElement;
  }
}

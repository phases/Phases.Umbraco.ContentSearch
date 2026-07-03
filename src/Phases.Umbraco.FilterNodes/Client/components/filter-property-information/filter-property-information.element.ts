import {
  html,
  customElement,
  property,
  state,
  nothing,
} from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement } from "@umbraco-cms/backoffice/lit-element";
import {
  BLOCK_DIAGNOSTICS_ALLOWED_BLOCKS_COUNT_LABEL,
  BLOCK_DIAGNOSTICS_CONFIGURATION_LOADED_LABEL,
  BLOCK_DIAGNOSTICS_CONTAINER_LABEL,
  BLOCK_DIAGNOSTICS_CONTAINER_TIP,
  BLOCK_DIAGNOSTICS_ELEMENT_TYPES_LABEL,
  BLOCK_DIAGNOSTICS_NOT_INDIVIDUALLY_INDEXED_LABEL,
  BLOCK_DIAGNOSTICS_NOT_SEARCHABLE_LABEL,
  BLOCK_DIAGNOSTICS_PROPERTIES_FOUND_LABEL,
  BLOCK_DIAGNOSTICS_RESOLVED_ALIASES_LABEL,
  BLOCK_DIAGNOSTICS_RESOLVED_ELEMENT_TYPES_COUNT_LABEL,
  BLOCK_DIAGNOSTICS_RESOLVED_PROPERTIES_COUNT_LABEL,
  BLOCK_DIAGNOSTICS_SEARCHABLE_LABEL,
  BLOCK_EXAMINE_ANALYSIS_TITLE,
  BLOCK_EXAMINE_CONTAINER_FIELD_LABEL,
  BLOCK_EXAMINE_CONTAINER_INDEXED_LABEL,
  BLOCK_EXAMINE_DEDICATED_PROPERTY_FIELDS_LABEL,
  BLOCK_EXAMINE_ELEMENT_FIELDS_DETECTED_LABEL,
  BLOCK_EXAMINE_EXPLANATION_LABEL,
  BLOCK_GRID_CONTAINER_EXAMPLE_INTRO,
  BLOCK_GRID_CONTAINER_EXAMPLE_OUTCOME,
  BLOCK_GRID_CONTAINER_OPERATORS_INTRO,
  BLOCK_GRID_CONTAINER_SEARCH_OPERATORS,
  BLOCK_GRID_CONTAINER_SEARCHABLE_INTRO,
  BLOCK_PROPERTY_SEARCH_SUMMARY_TITLE,
  DEVELOPER_DIAGNOSTICS_SECTION_TITLE,
  PROPERTY_INDEXED_FIELD_INFORMATION_LABEL,
  PROPERTY_INFORMATION_SECTION_TITLE,
  PROPERTY_SEARCH_FIELD_LABEL,
  PROPERTY_SEARCH_MODE_LABEL,
  PROPERTY_SUMMARY_PROPERTY_TYPE_LABEL,
  PROPERTY_SUMMARY_SEARCHABLE_LABEL,
  PROPERTY_SUMMARY_SOURCE_LABEL,
  PROPERTY_SUMMARY_CULTURE_LABEL,
} from "../../constants/filter-nodes.constants.js";
import type { BlockDiagnosticsDisplay } from "../../utils/block-diagnostics.utils.js";
import { resolveBlockContainerExamineSearchMode } from "../../utils/block-search-mode.utils.js";
import type { PropertyDetailsDisplay } from "../../utils/property-details.utils.js";
import { filterPropertyInformationStyles } from "./filter-property-information.styles.js";

@customElement("filter-property-information")
export class FilterPropertyInformationElement extends UmbLitElement {
  @property({ attribute: false })
  details?: PropertyDetailsDisplay;

  @property({ attribute: false })
  blockDiagnostics?: BlockDiagnosticsDisplay;

  @state()
  private _propertyInformationOpen = false;

  @state()
  private _developerDiagnosticsOpen = false;

  override render() {
    const details = this.details;

    if (!details) {
      return nothing;
    }

    const diagnostics = this.blockDiagnostics;
    const hasDeveloperDiagnostics = this.#hasDeveloperDiagnostics(
      details,
      diagnostics,
    );

    return html`
      <section class="property-information" aria-label="Property information">
        ${this.#renderSummaryCard(details)}
        ${diagnostics ? this.#renderSearchSummary(diagnostics) : nothing}
        ${this.#renderCollapsibleSection(
          PROPERTY_INFORMATION_SECTION_TITLE,
          this._propertyInformationOpen,
          () => this.#togglePropertyInformation(),
          this.#renderPropertyInformationContent(details, diagnostics),
        )}
        ${hasDeveloperDiagnostics
          ? this.#renderCollapsibleSection(
              DEVELOPER_DIAGNOSTICS_SECTION_TITLE,
              this._developerDiagnosticsOpen,
              () => this.#toggleDeveloperDiagnostics(),
              this.#renderDeveloperDiagnosticsContent(details, diagnostics),
            )
          : nothing}
      </section>
    `;
  }

  #renderSummaryCard(details: PropertyDetailsDisplay) {
    return html`
      <div class="property-information__summary" aria-label="Property summary">
        <div class="property-information__summary-item">
          <p class="property-information__summary-label">
            ${PROPERTY_SUMMARY_SEARCHABLE_LABEL}
          </p>
          <p
            class="property-information__summary-value ${details.searchable
              ? "property-information__summary-value--positive"
              : "property-information__summary-value--muted"}"
          >
            ${details.searchable ? "✓ Searchable" : details.searchableLabel}
          </p>
        </div>
        <div class="property-information__summary-item">
          <p class="property-information__summary-label">
            ${PROPERTY_SUMMARY_PROPERTY_TYPE_LABEL}
          </p>
          <p class="property-information__summary-value">${details.propertyType}</p>
        </div>
        <div class="property-information__summary-item">
          <p class="property-information__summary-label">
            ${PROPERTY_SUMMARY_SOURCE_LABEL}
          </p>
          <p
            class="property-information__summary-value property-information__summary-value--source"
          >
            <uui-icon
              class="property-information__source-icon"
              name=${details.sourceIcon}
              title=${details.source}
            ></uui-icon>
            <span>${details.source}</span>
          </p>
        </div>
        <div class="property-information__summary-item">
          <p class="property-information__summary-label">
            ${PROPERTY_SUMMARY_CULTURE_LABEL}
          </p>
          <p class="property-information__summary-value">${details.cultureLabel}</p>
        </div>
        ${details.searchMode
          ? html`
              <div class="property-information__summary-item">
                <p class="property-information__summary-label">
                  ${PROPERTY_SEARCH_MODE_LABEL}
                </p>
                <p class="property-information__summary-value">
                  ${details.searchMode.label}
                </p>
              </div>
            `
          : nothing}
      </div>
    `;
  }

  #renderSearchSummary(diagnostics: BlockDiagnosticsDisplay) {
    return html`
      <div
        class="property-information__search-summary"
        aria-label=${BLOCK_PROPERTY_SEARCH_SUMMARY_TITLE}
      >
        <p class="property-information__search-summary-title">
          ${BLOCK_PROPERTY_SEARCH_SUMMARY_TITLE}
        </p>
        <div class="property-information__search-summary-sections">
          ${this.#renderItemSection(
            BLOCK_DIAGNOSTICS_SEARCHABLE_LABEL,
            diagnostics.searchableProperties,
            "positive",
          )}
          ${this.#renderItemSection(
            diagnostics.isBlockGrid
              ? BLOCK_DIAGNOSTICS_NOT_INDIVIDUALLY_INDEXED_LABEL
              : BLOCK_DIAGNOSTICS_NOT_SEARCHABLE_LABEL,
            diagnostics.nonSearchableProperties,
            diagnostics.isBlockGrid ? "warning" : "negative",
          )}
        </div>
      </div>
    `;
  }

  #renderCollapsibleSection(
    title: string,
    open: boolean,
    onToggle: () => void,
    content: ReturnType<typeof html>,
  ) {
    return html`
      <button
        type="button"
        class="property-information__section-toggle"
        aria-expanded=${open}
        @click=${onToggle}
      >
        <uui-symbol-expand .open=${open}></uui-symbol-expand>
        <span>${title}</span>
      </button>
      ${open
        ? html`<div class="property-information__section-panel">${content}</div>`
        : nothing}
    `;
  }

  #renderPropertyInformationContent(
    details: PropertyDetailsDisplay,
    diagnostics: BlockDiagnosticsDisplay | undefined,
  ) {
    return html`
      <dl class="property-information__list">
        ${this.#renderRow("Property", details.propertyName)}
        ${details.blockType ? this.#renderRow("Block type", details.blockType) : nothing}
        <dt class="property-information__term">Details</dt>
        <dd class="property-information__value">
          <p class="property-information__description">
            ${details.searchableDescription}
          </p>
        </dd>
        ${details.searchMode
          ? html`
              <dt class="property-information__term">${PROPERTY_SEARCH_MODE_LABEL}</dt>
              <dd class="property-information__value">
                <p class="property-information__description">
                  ${details.searchMode.description}
                </p>
              </dd>
            `
          : nothing}
      </dl>
      ${diagnostics ? this.#renderBlockPropertyInformation(diagnostics) : nothing}
    `;
  }

  #renderBlockPropertyInformation(diagnostics: BlockDiagnosticsDisplay) {
    return html`
      <dl class="property-information__list">
        <dt class="property-information__term">${BLOCK_DIAGNOSTICS_CONTAINER_LABEL}</dt>
        <dd class="property-information__value">
          ${diagnostics.containerName}
          <span class="property-information__editor-label"
            >(${diagnostics.blockEditorLabel})</span
          >
        </dd>
      </dl>
      ${diagnostics.isBlockGrid && diagnostics.isContainerSelected
        ? this.#renderBlockGridSearchGuidance(diagnostics)
        : !diagnostics.isBlockGrid
          ? html`<p class="property-information__tip">${BLOCK_DIAGNOSTICS_CONTAINER_TIP}</p>`
          : nothing}
      ${diagnostics.propertySearchMode &&
      !(
        diagnostics.isBlockGrid &&
        diagnostics.isContainerSelected &&
        diagnostics.examineDiagnostics
      )
        ? html`
            <p class="property-information__subsection-title">
              ${PROPERTY_SEARCH_MODE_LABEL}
            </p>
            <p class="property-information__description">
              ${diagnostics.propertySearchMode.description}
            </p>
          `
        : nothing}
    `;
  }

  #renderBlockGridSearchGuidance(diagnostics: BlockDiagnosticsDisplay) {
    const exampleValue = diagnostics.blockGridExampleValue ?? "value";

    return html`
      <div class="property-information__guidance">
        <p class="property-information__guidance-intro">
          ${BLOCK_GRID_CONTAINER_SEARCHABLE_INTRO}
        </p>
        <p class="property-information__guidance-lead">
          ${BLOCK_GRID_CONTAINER_OPERATORS_INTRO}
        </p>
        <ul class="property-information__operator-list">
          ${BLOCK_GRID_CONTAINER_SEARCH_OPERATORS.map(
            (operator) => html`<li>${operator}</li>`,
          )}
        </ul>
        <p class="property-information__guidance-lead">
          ${BLOCK_GRID_CONTAINER_EXAMPLE_INTRO}
        </p>
        <div class="property-information__example" aria-label="Example Block Grid filter">
          <span class="property-information__example-line"
            >${diagnostics.containerName}</span
          >
          <span class="property-information__example-line">Contains</span>
          <span
            class="property-information__example-line property-information__example-line--value"
            >"${exampleValue}"</span
          >
        </div>
        <p class="property-information__guidance-outcome">
          ${BLOCK_GRID_CONTAINER_EXAMPLE_OUTCOME}
        </p>
      </div>
    `;
  }

  #renderDeveloperDiagnosticsContent(
    details: PropertyDetailsDisplay,
    diagnostics: BlockDiagnosticsDisplay | undefined,
  ) {
    return html`
      ${diagnostics?.discoveryDiagnostics
        ? html`
            <dl class="property-information__list">
              <dt class="property-information__term">
                ${BLOCK_DIAGNOSTICS_CONFIGURATION_LOADED_LABEL}
              </dt>
              <dd class="property-information__value">
                ${diagnostics.discoveryDiagnostics.configurationLoaded ? "Yes" : "No"}
              </dd>
              <dt class="property-information__term">
                ${BLOCK_DIAGNOSTICS_ALLOWED_BLOCKS_COUNT_LABEL}
              </dt>
              <dd class="property-information__value">
                ${diagnostics.discoveryDiagnostics.allowedBlocksCount}
              </dd>
              <dt class="property-information__term">
                ${BLOCK_DIAGNOSTICS_RESOLVED_ELEMENT_TYPES_COUNT_LABEL}
              </dt>
              <dd class="property-information__value">
                ${diagnostics.discoveryDiagnostics.resolvedElementTypesCount}
              </dd>
              <dt class="property-information__term">
                ${BLOCK_DIAGNOSTICS_RESOLVED_PROPERTIES_COUNT_LABEL}
              </dt>
              <dd class="property-information__value">
                ${diagnostics.discoveryDiagnostics.resolvedPropertiesCount}
              </dd>
            </dl>
          `
        : nothing}
      ${this.#renderIndexedFieldInformation(details, diagnostics)}
      ${diagnostics?.isBlockGrid && diagnostics.examineDiagnostics
        ? this.#renderExamineAnalysis(diagnostics.examineDiagnostics)
        : nothing}
      ${diagnostics ? this.#renderResolvedAliasInformation(diagnostics) : nothing}
    `;
  }

  #renderIndexedFieldInformation(
    details: PropertyDetailsDisplay,
    diagnostics: BlockDiagnosticsDisplay | undefined,
  ) {
    const examine = diagnostics?.examineDiagnostics;
    const hasIndexedFields = Boolean(details.searchField) || Boolean(examine);

    if (!hasIndexedFields) {
      return nothing;
    }

    return html`
      <p class="property-information__subsection-title">
        ${PROPERTY_INDEXED_FIELD_INFORMATION_LABEL}
      </p>
      <dl class="property-information__list">
        ${details.searchField
          ? html`
              <dt class="property-information__term">${PROPERTY_SEARCH_FIELD_LABEL}</dt>
              <dd
                class="property-information__value property-information__value--mono"
              >
                ${details.searchField}
              </dd>
            `
          : nothing}
        ${examine
          ? html`
              <dt class="property-information__term">
                ${BLOCK_EXAMINE_CONTAINER_FIELD_LABEL}
              </dt>
              <dd
                class="property-information__value property-information__value--mono"
              >
                ${examine.containerField}
              </dd>
              <dt class="property-information__term">
                ${BLOCK_EXAMINE_CONTAINER_INDEXED_LABEL}
              </dt>
              <dd class="property-information__value">
                ${examine.containerIndexed ? "Yes" : "No"}
              </dd>
              <dt class="property-information__term">
                ${BLOCK_EXAMINE_ELEMENT_FIELDS_DETECTED_LABEL}
              </dt>
              <dd class="property-information__value">${examine.elementFieldsDetected}</dd>
              <dt class="property-information__term">
                ${BLOCK_EXAMINE_DEDICATED_PROPERTY_FIELDS_LABEL}
              </dt>
              <dd class="property-information__value">${examine.dedicatedPropertyFields}</dd>
            `
          : nothing}
      </dl>
    `;
  }

  #renderExamineAnalysis(
    examine: NonNullable<BlockDiagnosticsDisplay["examineDiagnostics"]>,
  ) {
    const searchMode = resolveBlockContainerExamineSearchMode();

    return html`
      <p
        class="property-information__subsection-title property-information__subsection-title--examine"
      >
        ${BLOCK_EXAMINE_ANALYSIS_TITLE}
      </p>
      <dl class="property-information__list">
        <dt class="property-information__term">${PROPERTY_SEARCH_MODE_LABEL}</dt>
        <dd class="property-information__value">${searchMode.label}</dd>
        <dt class="property-information__term">${BLOCK_EXAMINE_EXPLANATION_LABEL}</dt>
        <dd class="property-information__value">
          <p class="property-information__description">${examine.explanation}</p>
        </dd>
      </dl>
    `;
  }

  #renderResolvedAliasInformation(diagnostics: BlockDiagnosticsDisplay) {
    return html`
      <p class="property-information__subsection-title">
        ${BLOCK_DIAGNOSTICS_RESOLVED_ALIASES_LABEL}
      </p>
      ${this.#renderItemSection(
        BLOCK_DIAGNOSTICS_ELEMENT_TYPES_LABEL,
        diagnostics.elementTypes,
        "neutral",
      )}
      ${this.#renderItemSection(
        BLOCK_DIAGNOSTICS_PROPERTIES_FOUND_LABEL,
        diagnostics.propertiesFound,
        "neutral",
      )}
    `;
  }

  #renderItemSection(
    title: string,
    items: readonly string[],
    tone: "positive" | "negative" | "warning" | "neutral",
  ) {
    return html`
      <section aria-label=${title}>
        <p class="property-information__subsection-title">${title}</p>
        ${items.length === 0
          ? html`<p class="property-information__empty">None</p>`
          : html`
              <ul class="property-information__item-list">
                ${items.map(
                  (item) => html`
                    <li
                      class="property-information__item property-information__item--${tone}"
                    >
                      ${tone === "positive"
                        ? html`<span class="property-information__marker" aria-hidden="true"
                            >✓</span
                          >`
                        : tone === "negative"
                          ? html`<span class="property-information__marker" aria-hidden="true"
                              >✗</span
                            >`
                          : tone === "warning"
                            ? html`<span class="property-information__marker" aria-hidden="true"
                                >⚠</span
                              >`
                            : nothing}
                      <span>${item}</span>
                    </li>
                  `,
                )}
              </ul>
            `}
      </section>
    `;
  }

  #renderRow(label: string, value: string) {
    return html`
      <dt class="property-information__term">${label}</dt>
      <dd class="property-information__value">${value}</dd>
    `;
  }

  #hasDeveloperDiagnostics(
    details: PropertyDetailsDisplay,
    diagnostics: BlockDiagnosticsDisplay | undefined,
  ): boolean {
    if (diagnostics?.discoveryDiagnostics) {
      return true;
    }

    if (diagnostics?.isBlockGrid && diagnostics.examineDiagnostics) {
      return true;
    }

    if (details.searchField) {
      return true;
    }

    if (
      diagnostics &&
      (diagnostics.elementTypes.length > 0 || diagnostics.propertiesFound.length > 0)
    ) {
      return true;
    }

    return false;
  }

  #togglePropertyInformation(): void {
    this._propertyInformationOpen = !this._propertyInformationOpen;
  }

  #toggleDeveloperDiagnostics(): void {
    this._developerDiagnosticsOpen = !this._developerDiagnosticsOpen;
  }

  static override readonly styles = [filterPropertyInformationStyles];
}

declare global {
  interface HTMLElementTagNameMap {
    "filter-property-information": FilterPropertyInformationElement;
  }
}

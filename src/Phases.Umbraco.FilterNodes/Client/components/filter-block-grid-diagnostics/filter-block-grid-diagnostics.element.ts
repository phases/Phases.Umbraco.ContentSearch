import { html, customElement, property, nothing } from "@umbraco-cms/backoffice/external/lit";
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
  BLOCK_SEARCH_STATUS_TITLE,
  PROPERTY_SEARCH_MODE_LABEL,
} from "../../constants/filter-nodes.constants.js";
import type { BlockDiagnosticsDisplay } from "../../utils/block-diagnostics.utils.js";
import { resolveBlockContainerExamineSearchMode } from "../../utils/block-search-mode.utils.js";
import { filterBlockGridDiagnosticsStyles } from "./filter-block-grid-diagnostics.styles.js";

@customElement("filter-block-diagnostics")
export class FilterBlockDiagnosticsElement extends UmbLitElement {
  @property({ attribute: false })
  diagnostics?: BlockDiagnosticsDisplay;

  override render() {
    const diagnostics = this.diagnostics;

    if (!diagnostics) {
      return nothing;
    }

    return html`
      <section
        class="block-diagnostics"
        aria-label=${BLOCK_SEARCH_STATUS_TITLE}
      >
        <h4 class="block-diagnostics__title">${BLOCK_SEARCH_STATUS_TITLE}</h4>
        <dl class="block-diagnostics__summary">
          <dt class="block-diagnostics__term">${BLOCK_DIAGNOSTICS_CONTAINER_LABEL}</dt>
          <dd class="block-diagnostics__value">
            ${diagnostics.containerName}
            <span class="block-diagnostics__editor-label"
              >(${diagnostics.blockEditorLabel})</span
            >
          </dd>
        </dl>
        ${diagnostics.isBlockGrid && diagnostics.isContainerSelected
          ? this.#renderBlockGridSearchGuidance(diagnostics)
          : !diagnostics.isBlockGrid
            ? html`<p class="block-diagnostics__tip">${BLOCK_DIAGNOSTICS_CONTAINER_TIP}</p>`
            : nothing}
        ${diagnostics.discoveryDiagnostics
          ? html`
              <dl class="block-diagnostics__summary">
                <dt class="block-diagnostics__term">
                  ${BLOCK_DIAGNOSTICS_CONFIGURATION_LOADED_LABEL}
                </dt>
                <dd class="block-diagnostics__value">
                  ${diagnostics.discoveryDiagnostics.configurationLoaded
                    ? "Yes"
                    : "No"}
                </dd>
                <dt class="block-diagnostics__term">
                  ${BLOCK_DIAGNOSTICS_ALLOWED_BLOCKS_COUNT_LABEL}
                </dt>
                <dd class="block-diagnostics__value">
                  ${diagnostics.discoveryDiagnostics.allowedBlocksCount}
                </dd>
                <dt class="block-diagnostics__term">
                  ${BLOCK_DIAGNOSTICS_RESOLVED_ELEMENT_TYPES_COUNT_LABEL}
                </dt>
                <dd class="block-diagnostics__value">
                  ${diagnostics.discoveryDiagnostics.resolvedElementTypesCount}
                </dd>
                <dt class="block-diagnostics__term">
                  ${BLOCK_DIAGNOSTICS_RESOLVED_PROPERTIES_COUNT_LABEL}
                </dt>
                <dd class="block-diagnostics__value">
                  ${diagnostics.discoveryDiagnostics.resolvedPropertiesCount}
                </dd>
              </dl>
            `
          : nothing}
        ${diagnostics.isBlockGrid && diagnostics.examineDiagnostics
          ? this.#renderExamineAnalysis(diagnostics.examineDiagnostics)
          : nothing}
        ${diagnostics.propertySearchMode &&
        !(
          diagnostics.isBlockGrid &&
          diagnostics.isContainerSelected &&
          diagnostics.examineDiagnostics
        )
          ? this.#renderPropertySearchMode(diagnostics.propertySearchMode)
          : nothing}
        <div class="block-diagnostics__sections">
          ${this.#renderSection(
            BLOCK_DIAGNOSTICS_ELEMENT_TYPES_LABEL,
            diagnostics.elementTypes,
            "neutral",
          )}
          ${this.#renderSection(
            BLOCK_DIAGNOSTICS_PROPERTIES_FOUND_LABEL,
            diagnostics.propertiesFound,
            "neutral",
          )}
          ${this.#renderSection(
            BLOCK_DIAGNOSTICS_SEARCHABLE_LABEL,
            diagnostics.searchableProperties,
            "positive",
          )}
          ${this.#renderSection(
            diagnostics.isBlockGrid
              ? BLOCK_DIAGNOSTICS_NOT_INDIVIDUALLY_INDEXED_LABEL
              : BLOCK_DIAGNOSTICS_NOT_SEARCHABLE_LABEL,
            diagnostics.nonSearchableProperties,
            diagnostics.isBlockGrid ? "warning" : "negative",
          )}
        </div>
      </section>
    `;
  }

  #renderBlockGridSearchGuidance(diagnostics: BlockDiagnosticsDisplay) {
    const exampleValue = diagnostics.blockGridExampleValue ?? "value";

    return html`
      <div class="block-diagnostics__guidance">
        <p class="block-diagnostics__guidance-intro">
          ${BLOCK_GRID_CONTAINER_SEARCHABLE_INTRO}
        </p>
        <p class="block-diagnostics__guidance-lead">
          ${BLOCK_GRID_CONTAINER_OPERATORS_INTRO}
        </p>
        <ul class="block-diagnostics__operator-list">
          ${BLOCK_GRID_CONTAINER_SEARCH_OPERATORS.map(
            (operator) => html`<li>${operator}</li>`,
          )}
        </ul>
        <p class="block-diagnostics__guidance-lead">
          ${BLOCK_GRID_CONTAINER_EXAMPLE_INTRO}
        </p>
        <div
          class="block-diagnostics__example"
          aria-label="Example Block Grid filter"
        >
          <span class="block-diagnostics__example-line"
            >${diagnostics.containerName}</span
          >
          <span class="block-diagnostics__example-line">Contains</span>
          <span class="block-diagnostics__example-line block-diagnostics__example-line--value"
            >"${exampleValue}"</span
          >
        </div>
        <p class="block-diagnostics__guidance-outcome">
          ${BLOCK_GRID_CONTAINER_EXAMPLE_OUTCOME}
        </p>
      </div>
    `;
  }

  #renderExamineAnalysis(examine: NonNullable<BlockDiagnosticsDisplay["examineDiagnostics"]>) {
    const searchMode = resolveBlockContainerExamineSearchMode();

    return html`
      <section
        class="block-diagnostics__examine"
        aria-label=${BLOCK_EXAMINE_ANALYSIS_TITLE}
      >
        <h5 class="block-diagnostics__section-title block-diagnostics__section-title--examine">
          ${BLOCK_EXAMINE_ANALYSIS_TITLE}
        </h5>
        <dl class="block-diagnostics__summary block-diagnostics__summary--examine">
          <dt class="block-diagnostics__term">${BLOCK_EXAMINE_CONTAINER_FIELD_LABEL}</dt>
          <dd class="block-diagnostics__value block-diagnostics__value--mono">
            ${examine.containerField}
          </dd>
          <dt class="block-diagnostics__term">${BLOCK_EXAMINE_CONTAINER_INDEXED_LABEL}</dt>
          <dd class="block-diagnostics__value">
            ${examine.containerIndexed ? "Yes" : "No"}
          </dd>
          <dt class="block-diagnostics__term">
            ${BLOCK_EXAMINE_ELEMENT_FIELDS_DETECTED_LABEL}
          </dt>
          <dd class="block-diagnostics__value">${examine.elementFieldsDetected}</dd>
          <dt class="block-diagnostics__term">
            ${BLOCK_EXAMINE_DEDICATED_PROPERTY_FIELDS_LABEL}
          </dt>
          <dd class="block-diagnostics__value">${examine.dedicatedPropertyFields}</dd>
          <dt class="block-diagnostics__term">${PROPERTY_SEARCH_MODE_LABEL}</dt>
          <dd class="block-diagnostics__value">${searchMode.label}</dd>
        </dl>
        <div class="block-diagnostics__examine-explanation">
          <p class="block-diagnostics__examine-explanation-label">
            ${BLOCK_EXAMINE_EXPLANATION_LABEL}
          </p>
          <p class="block-diagnostics__examine-explanation-text">
            ${examine.explanation}
          </p>
        </div>
      </section>
    `;
  }

  #renderPropertySearchMode(
    searchMode: NonNullable<BlockDiagnosticsDisplay["propertySearchMode"]>,
  ) {
    return html`
      <section
        class="block-diagnostics__search-mode"
        aria-label=${PROPERTY_SEARCH_MODE_LABEL}
      >
        <h5 class="block-diagnostics__section-title">${PROPERTY_SEARCH_MODE_LABEL}</h5>
        <p class="block-diagnostics__search-mode-label">${searchMode.label}</p>
        <p class="block-diagnostics__search-mode-description">
          ${searchMode.description}
        </p>
      </section>
    `;
  }

  #renderSection(
    title: string,
    items: readonly string[],
    tone: "positive" | "negative" | "warning" | "neutral",
  ) {
    return html`
      <section aria-label=${title}>
        <h5 class="block-diagnostics__section-title">${title}</h5>
        ${items.length === 0
          ? html`<p class="block-diagnostics__empty">None</p>`
          : html`
              <ul class="block-diagnostics__list">
                ${items.map(
                  (item) => html`
                    <li
                      class="block-diagnostics__item block-diagnostics__item--${tone}"
                    >
                      ${tone === "positive"
                        ? html`<span
                            class="block-diagnostics__marker"
                            aria-hidden="true"
                            >✓</span
                          >`
                        : tone === "negative"
                          ? html`<span
                              class="block-diagnostics__marker"
                              aria-hidden="true"
                              >✗</span
                            >`
                          : tone === "warning"
                            ? html`<span
                                class="block-diagnostics__marker"
                                aria-hidden="true"
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

  static override readonly styles = [filterBlockGridDiagnosticsStyles];
}

declare global {
  interface HTMLElementTagNameMap {
    "filter-block-diagnostics": FilterBlockDiagnosticsElement;
  }
}

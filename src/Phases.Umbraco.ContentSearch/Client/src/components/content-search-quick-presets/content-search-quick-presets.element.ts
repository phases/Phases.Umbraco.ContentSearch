import { html, customElement, property, state, nothing } from "@umbraco-cms/backoffice/external/lit";
import { UmbTextStyles } from "@umbraco-cms/backoffice/style";
import { UmbLitElement } from "@umbraco-cms/backoffice/lit-element";
import { QUICK_SEARCH_PRESETS_TITLE } from "../../constants/search-preset.constants.js";
import type { SearchPreset } from "../../models/search-preset.models.js";
import { CONTENT_SEARCH_PRESET_RUN } from "../../models/search-preset.models.js";
import {
  contentSearchEmptyStateStyles,
  contentSearchSectionHeaderStyles,
  contentSearchUiTokens,
} from "../../styles/content-search-ui.styles.js";
import { contentSearchQuickPresetsStyles } from "./content-search-quick-presets.styles.js";

@customElement("content-search-quick-presets")
export class ContentSearchQuickPresetsElement extends UmbLitElement {
  @property({ type: Array })
  presets: readonly SearchPreset[] = [];

  @property({ type: Boolean })
  loading = false;

  @state()
  private _expanded = false;

  override render() {
    return html`
      <div class="quick-presets">
        ${this.#renderHeader()}
        ${this._expanded ? this.#renderBody() : nothing}
      </div>
    `;
  }

  #renderHeader() {
    const count = this.loading ? "…" : this.presets.length;

    return html`
      <div class="cs-section-header quick-presets__header">
        <div class="cs-section-header__leading">
          <h2 class="cs-section-header__title">${QUICK_SEARCH_PRESETS_TITLE}</h2>
          <span class="cs-section-header__badge">${count}</span>
        </div>
        <uui-button
          class="cs-section-header__toggle"
          look="reset"
          compact
          label=${this._expanded ? "Collapse quick presets" : "Expand quick presets"}
          aria-expanded=${this._expanded ? "true" : "false"}
          @click=${this.#onToggleExpanded}
        >
          <uui-icon name=${this._expanded ? "icon-navigation-up" : "icon-navigation-down"}></uui-icon>
        </uui-button>
      </div>
    `;
  }

  #renderBody() {
    if (this.loading) {
      return html`
        <div class="cs-empty">
          <uui-loader></uui-loader>
        </div>
      `;
    }

    if (this.presets.length === 0) {
      return html`
        <div class="cs-empty">
          <p class="cs-empty__label">No presets available.</p>
        </div>
      `;
    }

    return html`
      <div class="quick-presets__grid" role="list">
        ${this.presets.map((preset) => this.#renderPresetCard(preset))}
      </div>
    `;
  }

  #renderPresetCard(preset: SearchPreset) {
    return html`
      <article class="quick-presets__card" role="listitem">
        <h3 class="quick-presets__card-title">${preset.name}</h3>
        <p class="quick-presets__card-description" title=${preset.description}>
          ${preset.description}
        </p>
        <div class="quick-presets__card-actions">
          <uui-button
            look="primary"
            compact
            label="Run preset"
            @click=${() => this.#onRun(preset.id)}
          >
            Run
          </uui-button>
        </div>
      </article>
    `;
  }

  #onToggleExpanded(): void {
    this._expanded = !this._expanded;
  }

  #onRun(presetId: string): void {
    this.dispatchEvent(
      new CustomEvent(CONTENT_SEARCH_PRESET_RUN, {
        detail: { presetId },
        bubbles: true,
        composed: true,
      }),
    );
  }

  static override readonly styles = [
    UmbTextStyles,
    contentSearchUiTokens,
    contentSearchSectionHeaderStyles,
    contentSearchEmptyStateStyles,
    ...contentSearchQuickPresetsStyles,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    "content-search-quick-presets": ContentSearchQuickPresetsElement;
  }
}

import {
  html,
  customElement,
  property,
  state,
} from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement } from "@umbraco-cms/backoffice/lit-element";
import { contentSearchExpandablePanelStyles } from "./content-search-expandable-panel.styles.js";

@customElement("content-search-expandable-panel")
export class ContentSearchExpandablePanelElement extends UmbLitElement {
  @property({ type: String })
  label = "Details";

  @property({ type: Boolean })
  defaultExpanded = false;

  @property({ type: Boolean, reflect: true })
  embedded = false;

  @property({ type: String, reflect: true })
  triggerAlign: "left" | "right" = "left";

  @state()
  private _expanded = false;

  #panelId = `cs-panel-${crypto.randomUUID()}`;

  override connectedCallback(): void {
    super.connectedCallback();
    this._expanded = this.defaultExpanded;
  }

  #toggleExpanded(): void {
    this._expanded = !this._expanded;
  }

  override render() {
    return html`
      <div class="expandable ${this._expanded ? "expandable--open" : ""} ${this.embedded ? "expandable--embedded" : ""}">
        <uui-button
          class="expandable__trigger expandable__trigger--${this.triggerAlign}"
          look="reset"
          compact
          label=${this.label}
          aria-expanded=${this._expanded ? "true" : "false"}
          aria-controls=${this.#panelId}
          @click=${this.#toggleExpanded}
        >
          <uui-icon
            name=${this._expanded ? "icon-navigation-up" : "icon-navigation-right"}
          ></uui-icon>
          ${this.label}
        </uui-button>
        <div class="expandable__body" id=${this.#panelId} ?hidden=${!this._expanded}>
          <slot></slot>
        </div>
      </div>
    `;
  }

  static override readonly styles = [contentSearchExpandablePanelStyles];
}

declare global {
  interface HTMLElementTagNameMap {
    "content-search-expandable-panel": ContentSearchExpandablePanelElement;
  }
}

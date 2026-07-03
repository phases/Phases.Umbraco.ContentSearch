import { html, customElement, property } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement } from "@umbraco-cms/backoffice/lit-element";
import { filterNodesLoadingIndicatorStyles } from "./filter-nodes-loading-indicator.styles.js";

@customElement("filter-nodes-loading-indicator")
export class FilterNodesLoadingIndicatorElement extends UmbLitElement {
  @property({ type: String })
  label = "Loading results…";

  override render() {
    return html`
      <div class="loading-content" role="status" aria-live="polite" aria-busy="true">
        <uui-loader></uui-loader>
        <p class="loading-label">${this.label}</p>
      </div>
    `;
  }

  static override readonly styles = [filterNodesLoadingIndicatorStyles];
}

declare global {
  interface HTMLElementTagNameMap {
    "filter-nodes-loading-indicator": FilterNodesLoadingIndicatorElement;
  }
}

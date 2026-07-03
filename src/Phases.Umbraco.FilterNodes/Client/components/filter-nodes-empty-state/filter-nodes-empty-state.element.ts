import { html, customElement, property } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement } from "@umbraco-cms/backoffice/lit-element";
import type { FilterNodesEmptyStateVariant } from "../../controllers/filter-nodes-workspace.models.js";
import { filterNodesEmptyStateStyles } from "./filter-nodes-empty-state.styles.js";

@customElement("filter-nodes-empty-state")
export class FilterNodesEmptyStateElement extends UmbLitElement {
  @property({ type: String })
  variant: FilterNodesEmptyStateVariant = "initial";

  override render() {
    const content = this.#getContent();

    return html`
      <uui-box>
        <div class="empty-state">
          <uui-icon class="empty-state__icon" name=${content.icon}></uui-icon>
          <h3 class="empty-state__title">${content.title}</h3>
          <p class="empty-state__description">${content.description}</p>
        </div>
      </uui-box>
    `;
  }

  #getContent(): { icon: string; title: string; description: string } {
    if (this.variant === "no-results") {
      return {
        icon: "icon-search",
        title: "No matching nodes",
        description:
          "No content nodes matched the current filter. Adjust your conditions and search again.",
      };
    }

    return {
      icon: "icon-filter",
      title: "Start filtering",
      description:
        "Add one or more filter conditions above, then run a search to see matching content nodes.",
    };
  }

  static override readonly styles = [filterNodesEmptyStateStyles];
}

declare global {
  interface HTMLElementTagNameMap {
    "filter-nodes-empty-state": FilterNodesEmptyStateElement;
  }
}

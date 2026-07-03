import { css, html, customElement } from "@umbraco-cms/backoffice/external/lit";
import { UmbTextStyles } from "@umbraco-cms/backoffice/style";
import { UmbLitElement } from "@umbraco-cms/backoffice/lit-element";
import { filterNodesWorkspaceStyles } from "./filter-nodes-workspace.styles.js";

@customElement("filter-nodes-workspace")
export class FilterNodesWorkspaceElement extends UmbLitElement {
  override render() {
    return html`
      <umb-workspace-editor
        headline="Filter Nodes"
        .enforceNoFooter=${true}
      ></umb-workspace-editor>
    `;
  }

  static override readonly styles = [
    UmbTextStyles,
    filterNodesWorkspaceStyles,
    css`
      :host {
        display: block;
        width: 100%;
        height: 100%;
      }
    `,
  ];
}

export { FilterNodesWorkspaceElement as element };

declare global {
  interface HTMLElementTagNameMap {
    "filter-nodes-workspace": FilterNodesWorkspaceElement;
  }
}

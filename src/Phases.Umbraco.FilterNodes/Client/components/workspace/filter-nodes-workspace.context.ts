import { UmbContextBase } from "@umbraco-cms/backoffice/class-api";
import type { UmbControllerHost } from "@umbraco-cms/backoffice/controller-api";
import { UMB_WORKSPACE_CONTEXT } from "@umbraco-cms/backoffice/workspace";
import { UmbViewContext } from "@umbraco-cms/backoffice/view";
import {
  FILTER_NODES_ENTITY_TYPE,
  FILTER_NODES_WORKSPACE_ALIAS,
} from "./constants.js";
import { FILTER_NODES_WORKSPACE_CONTEXT } from "./filter-nodes-workspace.context-token.js";

export class FilterNodesWorkspaceContext extends UmbContextBase {
  readonly workspaceAlias = FILTER_NODES_WORKSPACE_ALIAS;
  readonly view: UmbViewContext;

  constructor(host: UmbControllerHost) {
    super(host, FILTER_NODES_WORKSPACE_CONTEXT);
    this.view = new UmbViewContext(this, null);
    this.view.setTitle("Filter Nodes");
    this.provideContext(UMB_WORKSPACE_CONTEXT, this);
  }

  getEntityType(): string {
    return FILTER_NODES_ENTITY_TYPE;
  }
}

export { FilterNodesWorkspaceContext as api };

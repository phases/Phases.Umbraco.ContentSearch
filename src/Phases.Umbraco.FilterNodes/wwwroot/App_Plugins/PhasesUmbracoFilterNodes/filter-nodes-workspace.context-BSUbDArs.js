import { UmbContextBase as e } from "@umbraco-cms/backoffice/class-api";
import { UMB_WORKSPACE_CONTEXT as o } from "@umbraco-cms/backoffice/workspace";
import { UmbViewContext as s } from "@umbraco-cms/backoffice/view";
import { F as r, a as i } from "./bundle.manifests-BYeq-CGR.js";
import { UmbContextToken as n } from "@umbraco-cms/backoffice/context-api";
const E = new n("FilterNodesWorkspaceContext");
class N extends e {
  constructor(t) {
    super(t, E), this.workspaceAlias = r, this.view = new s(this, null), this.view.setTitle("Filter Nodes"), this.provideContext(o, this);
  }
  getEntityType() {
    return i;
  }
}
export {
  N as FilterNodesWorkspaceContext,
  N as api
};
//# sourceMappingURL=filter-nodes-workspace.context-BSUbDArs.js.map

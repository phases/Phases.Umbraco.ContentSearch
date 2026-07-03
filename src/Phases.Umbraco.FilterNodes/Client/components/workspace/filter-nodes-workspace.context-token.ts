import { UmbContextToken } from "@umbraco-cms/backoffice/context-api";
import type { FilterNodesWorkspaceContext } from "./filter-nodes-workspace.context.js";

export const FILTER_NODES_WORKSPACE_CONTEXT = new UmbContextToken<
  FilterNodesWorkspaceContext
>("FilterNodesWorkspaceContext");

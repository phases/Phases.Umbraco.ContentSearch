import { UMB_WORKSPACE_CONDITION_ALIAS } from "@umbraco-cms/backoffice/workspace";
import {
  FILTER_NODES_ENTITY_TYPE,
  FILTER_NODES_WORKSPACE_ALIAS,
  FILTER_NODES_WORKSPACE_VIEW_ALIAS,
} from "./constants.js";

export const manifests: Array<UmbExtensionManifest> = [
  {
    type: "workspace",
    alias: FILTER_NODES_WORKSPACE_ALIAS,
    name: "Filter Nodes Workspace",
    element: () => import("./filter-nodes-workspace.element.js"),
    api: () => import("./filter-nodes-workspace.context.js"),
    meta: {
      entityType: FILTER_NODES_ENTITY_TYPE,
    },
  },
  {
    type: "workspaceView",
    alias: FILTER_NODES_WORKSPACE_VIEW_ALIAS,
    name: "Filter Nodes Workspace View",
    element: () => import("../filter-nodes-workspace-view/index.js"),
    weight: 100,
    meta: {
      label: "Filter",
      pathname: "filter",
      icon: "icon-filter",
    },
    conditions: [
      {
        alias: UMB_WORKSPACE_CONDITION_ALIAS,
        match: FILTER_NODES_WORKSPACE_ALIAS,
      },
    ],
  },
  {
    type: "menuItem",
    alias: "Phases.MenuItem.FilterNodes",
    name: "Filter Nodes Menu Item",
    weight: 120,
    meta: {
      label: "Filter Nodes",
      icon: "icon-filter",
      entityType: FILTER_NODES_ENTITY_TYPE,
      menus: ["Umb.Menu.Content"],
    },
  },
];

import { UMB_WORKSPACE_CONDITION_ALIAS as _ } from "@umbraco-cms/backoffice/workspace";
const a = [
  {
    name: "Phases Umbraco Filter Nodes Entrypoint",
    alias: "Phases.Umbraco.FilterNodes.Entrypoint",
    type: "backofficeEntryPoint",
    js: () => import("./entrypoint-BSlTz4-p.js")
  }
], E = "filter-nodes", s = "Phases.Workspace.FilterNodes", t = "Phases.WorkspaceView.FilterNodes", R = 20, A = [20, 50, 100], I = 25, i = " -> ", c = 300, C = 20, N = 50, r = 200, S = 40, P = "Search properties...", l = 100, e = "createDate", n = "updateDate", o = "nodeName", O = "__NodeTypeAlias", D = [
  o,
  e,
  n,
  O
], B = "All Content Types", d = [
  "*",
  "all",
  "allContentTypes",
  "__all__"
], p = [
  "Contains",
  "StartsWith",
  "EndsWith",
  "Equals"
], h = "System", M = "Content Type", Y = "Compositions", u = "Block Grid", U = "Block List", m = "icon-layout", G = "icon-thumbnail-list", y = "icon-settings", H = "icon-document", K = "icon-puzzle-piece", f = "icon-blueprint", b = "General", F = " > ", k = " › ", W = "Searchable", w = "Not searchable", X = "Not individually indexed", V = "⚠ Not Individually Indexed", g = "This property exists within the Block Grid structure but is not indexed as a dedicated Examine field. Search is available through the parent Block Grid field.", x = "Hide properties that can't be searched", q = `Uncheck "Hide properties that can't be searched" to show all properties.`, v = "You can filter content using this field.", z = "This field is not included in search yet. Ask an administrator to enable block property search in Settings.", Z = "Search mode", j = "Container Search", $ = "Dedicated Property Search", J = "Content indexed only in parent field. Search performed against the {blockEditor} property.", Q = "Dedicated Examine field exists. Search performed against the individual property.", EE = "Search field", sE = "Property Information", _E = "Developer Diagnostics", aE = "Searchable", tE = "Property Type", eE = "Source", nE = "Culture", oE = "Invariant", OE = "Variant", TE = "Search culture", LE = "All Cultures", RE = "Current Culture", AE = "Specific Culture", IE = "Language", iE = "Matched culture", cE = "Search summary", CE = "Indexed field information", NE = "Resolved alias information", rE = "Block property", SE = "The block property itself only checks whether blocks exist (Is empty / Is not empty). Search inside block fields using the properties listed below.", PE = "This Block Grid is searchable as a whole.", lE = "You can search values contained within blocks using:", DE = [
  "Contains",
  "Equals",
  "Starts With",
  "Ends With",
  "Is Empty",
  "Is Not Empty"
], BE = "Example:", dE = "This will return pages containing the value anywhere inside the Block Grid.", pE = "Container Search Available:", hE = "This Block Grid is searchable as a whole. Use Contains, Equals, Starts With, Ends With, Is Empty, or Is Not Empty against the parent field to find values anywhere inside the block content.", ME = "Element types", YE = "Properties found", uE = "Searchable properties", UE = "Not searchable properties", mE = "Not individually indexed properties", GE = "Configuration loaded", yE = "Allowed blocks count", HE = "Resolved element types count", KE = "Resolved properties count", fE = "Examine analysis", bE = "Container field", FE = "Container indexed", kE = "Element fields detected", WE = "Dedicated property fields", wE = "Explanation", XE = !0, VE = [
  "Equals",
  "NotEquals",
  "Contains",
  "StartsWith",
  "EndsWith",
  "GreaterThan",
  "GreaterThanOrEqual",
  "LessThan",
  "LessThanOrEqual",
  "Between",
  "IsEmpty",
  "IsNotEmpty"
], gE = [
  "Equals",
  "GreaterThan",
  "GreaterThanOrEqual",
  "LessThan",
  "LessThanOrEqual",
  "Between"
], xE = [
  "Equals",
  "NotEquals",
  "GreaterThan",
  "GreaterThanOrEqual",
  "LessThan",
  "LessThanOrEqual",
  "IsEmpty",
  "IsNotEmpty"
], T = [
  {
    type: "workspace",
    alias: s,
    name: "Filter Nodes Workspace",
    element: () => import("./filter-nodes-workspace.element-B5-dny4o.js"),
    api: () => import("./filter-nodes-workspace.context-BSUbDArs.js"),
    meta: {
      entityType: E
    }
  },
  {
    type: "workspaceView",
    alias: t,
    name: "Filter Nodes Workspace View",
    element: () => import("./index-BonkGSFG.js"),
    weight: 100,
    meta: {
      label: "Filter",
      pathname: "filter",
      icon: "icon-filter"
    },
    conditions: [
      {
        alias: _,
        match: s
      }
    ]
  },
  {
    type: "menuItem",
    alias: "Phases.MenuItem.FilterNodes",
    name: "Filter Nodes Menu Item",
    weight: 120,
    meta: {
      label: "Filter Nodes",
      icon: "icon-filter",
      entityType: E,
      menus: ["Umb.Menu.Content"]
    }
  }
], qE = [
  ...a,
  ...T
];
export {
  aE as $,
  B as A,
  G as B,
  H as C,
  b as D,
  D as E,
  s as F,
  v as G,
  g as H,
  z as I,
  X as J,
  P as K,
  S as L,
  C as M,
  o as N,
  V as O,
  F as P,
  pE as Q,
  d as R,
  y as S,
  f as T,
  n as U,
  q as V,
  W,
  w as X,
  r as Y,
  sE as Z,
  _E as _,
  E as a,
  tE as a0,
  eE as a1,
  nE as a2,
  Z as a3,
  cE as a4,
  uE as a5,
  mE as a6,
  UE as a7,
  rE as a8,
  SE as a9,
  AE as aA,
  iE as aB,
  A as aC,
  XE as aD,
  R as aE,
  qE as aF,
  PE as aa,
  lE as ab,
  BE as ac,
  dE as ad,
  DE as ae,
  GE as af,
  yE as ag,
  HE as ah,
  KE as ai,
  CE as aj,
  EE as ak,
  bE as al,
  FE as am,
  kE as an,
  WE as ao,
  fE as ap,
  wE as aq,
  NE as ar,
  ME as as,
  YE as at,
  TE as au,
  x as av,
  IE as aw,
  I as ax,
  LE as ay,
  RE as az,
  m as b,
  K as c,
  U as d,
  u as e,
  Y as f,
  M as g,
  h,
  e as i,
  O as j,
  p as k,
  gE as l,
  xE as m,
  VE as n,
  k as o,
  N as p,
  c as q,
  l as r,
  i as s,
  j as t,
  J as u,
  Q as v,
  $ as w,
  OE as x,
  oE as y,
  hE as z
};
//# sourceMappingURL=bundle.manifests-BYeq-CGR.js.map

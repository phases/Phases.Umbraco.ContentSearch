import { UMB_SECTION_USER_PERMISSION_CONDITION_ALIAS as s, UMB_SECTION_ALIAS_CONDITION_ALIAS as c } from "@umbraco-cms/backoffice/section";
const i = "Phases.Umbraco.ContentSearch.Localization", o = "phasesContentSearch", t = {
  sectionLabel: "sectionLabel",
  workspaceTitle: "workspaceTitle",
  searchButton: "searchButton",
  exportButton: "exportButton",
  noResultsTitle: "noResultsTitle",
  noResultsDescription: "noResultsDescription"
};
function n(a) {
  return `#${o}_${a}`;
}
const r = [
  {
    type: "localization",
    alias: i,
    name: "Phases Content Search Localization",
    meta: {
      culture: "en-US",
      localizations: {
        [o]: {
          [t.sectionLabel]: "Content Search",
          [t.workspaceTitle]: "Content Search",
          [t.searchButton]: "Search",
          [t.exportButton]: "Export",
          [t.noResultsTitle]: "No results found",
          [t.noResultsDescription]: "Try adjusting your search conditions or clearing filters."
        }
      }
    }
  }
], e = "Phases.Section.ContentSearch", l = "Phases.SectionView.ContentSearch.Workspace", S = [
  {
    type: "section",
    alias: e,
    name: "Content Search Section",
    weight: 750,
    meta: {
      label: n(t.sectionLabel),
      pathname: "content-search"
    },
    conditions: [
      {
        alias: s,
        match: e
      }
    ]
  },
  {
    type: "sectionView",
    alias: l,
    name: "Content Search Workspace",
    element: () => import("./content-search-workspace.element-DUtVa-fL.js"),
    weight: 100,
    meta: {
      label: n(t.sectionLabel),
      pathname: "search",
      icon: "icon-search"
    },
    conditions: [
      {
        alias: c,
        match: e
      }
    ]
  }
], h = [
  ...r,
  ...S
];
export {
  t as C,
  n as c,
  h as m
};

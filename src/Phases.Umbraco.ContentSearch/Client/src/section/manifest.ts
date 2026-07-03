import {
  UMB_SECTION_ALIAS_CONDITION_ALIAS,
  UMB_SECTION_USER_PERMISSION_CONDITION_ALIAS,
} from "@umbraco-cms/backoffice/section";
import {
  contentSearchLocalizationKey,
  CONTENT_SEARCH_LOCALIZATION_KEYS,
} from "../localization/constants.js";
import {
  CONTENT_SEARCH_SECTION_ALIAS,
  CONTENT_SEARCH_SECTION_VIEW_ALIAS,
} from "./constants.js";

export const manifests: Array<UmbExtensionManifest> = [
  {
    type: "section",
    alias: CONTENT_SEARCH_SECTION_ALIAS,
    name: "Content Search Section",
    weight: 750,
    meta: {
      label: contentSearchLocalizationKey(CONTENT_SEARCH_LOCALIZATION_KEYS.sectionLabel),
      pathname: "content-search",
    },
    conditions: [
      {
        alias: UMB_SECTION_USER_PERMISSION_CONDITION_ALIAS,
        match: CONTENT_SEARCH_SECTION_ALIAS,
      },
    ],
  },
  {
    type: "sectionView",
    alias: CONTENT_SEARCH_SECTION_VIEW_ALIAS,
    name: "Content Search Workspace",
    element: () => import("../workspace/content-search-workspace.element.js"),
    weight: 100,
    meta: {
      label: contentSearchLocalizationKey(CONTENT_SEARCH_LOCALIZATION_KEYS.sectionLabel),
      pathname: "search",
      icon: "icon-search",
    },
    conditions: [
      {
        alias: UMB_SECTION_ALIAS_CONDITION_ALIAS,
        match: CONTENT_SEARCH_SECTION_ALIAS,
      },
    ],
  },
];

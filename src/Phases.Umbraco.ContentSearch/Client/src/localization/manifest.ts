import {
  CONTENT_SEARCH_LOCALIZATION_ALIAS,
  CONTENT_SEARCH_LOCALIZATION_KEYS,
  CONTENT_SEARCH_LOCALIZATION_NAMESPACE,
} from "./constants.js";

export const manifests: Array<UmbExtensionManifest> = [
  {
    type: "localization",
    alias: CONTENT_SEARCH_LOCALIZATION_ALIAS,
    name: "Phases Content Search Localization",
    meta: {
      culture: "en-US",
      localizations: {
        [CONTENT_SEARCH_LOCALIZATION_NAMESPACE]: {
          [CONTENT_SEARCH_LOCALIZATION_KEYS.sectionLabel]: "Content Search",
          [CONTENT_SEARCH_LOCALIZATION_KEYS.workspaceTitle]: "Content Search",
          [CONTENT_SEARCH_LOCALIZATION_KEYS.searchButton]: "Search",
          [CONTENT_SEARCH_LOCALIZATION_KEYS.exportButton]: "Export",
          [CONTENT_SEARCH_LOCALIZATION_KEYS.noResultsTitle]: "No results found",
          [CONTENT_SEARCH_LOCALIZATION_KEYS.noResultsDescription]:
            "Try adjusting your search conditions or clearing filters.",
        },
      },
    },
  },
];

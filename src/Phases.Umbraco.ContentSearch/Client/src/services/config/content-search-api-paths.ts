/**
 * Relative API paths for the Content Search backoffice endpoints.
 */
export const CONTENT_SEARCH_API_BASE_PATH =
  "/umbraco/phasesumbracocontentsearch/api/v1";

export const ContentSearchApiPaths = {
  search: "search",
  export: "export",
  languages: "metadata/languages",
  contentTypes: "metadata/content-types",
  properties: (contentTypeAlias: string) =>
    `metadata/content-types/${encodeURIComponent(contentTypeAlias)}/properties`,
  savedSearches: "savedsearches",
  savedSearch: (savedSearchId: string) => `savedsearches/${savedSearchId}`,
  savedSearchDuplicate: (savedSearchId: string) =>
    `savedsearches/${savedSearchId}/duplicate`,
  savedSearchPin: (savedSearchId: string) => `savedsearches/${savedSearchId}/pin`,
  savedSearchFavourite: (savedSearchId: string) =>
    `savedsearches/${savedSearchId}/favourite`,
  savedSearchUse: (savedSearchId: string) => `savedsearches/${savedSearchId}/use`,
  savedSearchRecent: "savedsearches/recent",
  searchPresets: "search-presets",
  searchPreset: (presetId: string) => `search-presets/${encodeURIComponent(presetId)}`,
} as const;

/**
 * Relative API paths for the Filter Nodes backoffice endpoints.
 */
export const FILTER_API_BASE_PATH = "/umbraco/phasesumbracofilternodes/api/v1";

export const FilterApiPaths = {
  contentTypes: "contenttypes",
  languages: "languages",
  properties: (contentTypeAlias: string) =>
    `properties/${encodeURIComponent(contentTypeAlias)}`,
  propertiesBatch: "properties/batch",
  search: "search",
  savedFilters: "savedfilters",
  savedFilter: (savedFilterId: string) =>
    `savedfilters/${encodeURIComponent(savedFilterId)}`,
} as const;

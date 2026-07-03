export const CONTENT_SEARCH_LOCALIZATION_ALIAS =
  "Phases.Umbraco.ContentSearch.Localization";

export const CONTENT_SEARCH_LOCALIZATION_NAMESPACE = "phasesContentSearch";

export const CONTENT_SEARCH_LOCALIZATION_KEYS = {
  sectionLabel: "sectionLabel",
  workspaceTitle: "workspaceTitle",
  searchButton: "searchButton",
  exportButton: "exportButton",
  noResultsTitle: "noResultsTitle",
  noResultsDescription: "noResultsDescription",
} as const;

export function contentSearchLocalizationKey(
  key: (typeof CONTENT_SEARCH_LOCALIZATION_KEYS)[keyof typeof CONTENT_SEARCH_LOCALIZATION_KEYS],
): string {
  return `#${CONTENT_SEARCH_LOCALIZATION_NAMESPACE}_${key}`;
}

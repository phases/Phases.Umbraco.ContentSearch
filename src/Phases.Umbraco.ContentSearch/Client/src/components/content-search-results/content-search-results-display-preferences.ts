export const CONTENT_SEARCH_RESULTS_DISPLAY_PREFERENCES_STORAGE_KEY =
  "phases.content-search.results.display-preferences.v1";

export interface ContentSearchResultsDisplayPreferences {
  readonly showPath: boolean;
  readonly showUrl: boolean;
  readonly showCreateDate: boolean;
  readonly showUpdateDate: boolean;
}

export const DEFAULT_CONTENT_SEARCH_RESULTS_DISPLAY_PREFERENCES: ContentSearchResultsDisplayPreferences =
  {
    showPath: true,
    showUrl: true,
    showCreateDate: true,
    showUpdateDate: true,
  };

export function loadContentSearchResultsDisplayPreferences(): ContentSearchResultsDisplayPreferences {
  try {
    const raw = localStorage.getItem(CONTENT_SEARCH_RESULTS_DISPLAY_PREFERENCES_STORAGE_KEY);

    if (!raw) {
      return DEFAULT_CONTENT_SEARCH_RESULTS_DISPLAY_PREFERENCES;
    }

    const parsed = JSON.parse(raw) as Partial<ContentSearchResultsDisplayPreferences>;

    return {
      showPath:
        typeof parsed.showPath === "boolean"
          ? parsed.showPath
          : DEFAULT_CONTENT_SEARCH_RESULTS_DISPLAY_PREFERENCES.showPath,
      showUrl:
        typeof parsed.showUrl === "boolean"
          ? parsed.showUrl
          : DEFAULT_CONTENT_SEARCH_RESULTS_DISPLAY_PREFERENCES.showUrl,
      showCreateDate:
        typeof parsed.showCreateDate === "boolean"
          ? parsed.showCreateDate
          : DEFAULT_CONTENT_SEARCH_RESULTS_DISPLAY_PREFERENCES.showCreateDate,
      showUpdateDate:
        typeof parsed.showUpdateDate === "boolean"
          ? parsed.showUpdateDate
          : DEFAULT_CONTENT_SEARCH_RESULTS_DISPLAY_PREFERENCES.showUpdateDate,
    };
  } catch {
    return DEFAULT_CONTENT_SEARCH_RESULTS_DISPLAY_PREFERENCES;
  }
}

export function saveContentSearchResultsDisplayPreferences(
  preferences: ContentSearchResultsDisplayPreferences,
): void {
  try {
    localStorage.setItem(
      CONTENT_SEARCH_RESULTS_DISPLAY_PREFERENCES_STORAGE_KEY,
      JSON.stringify(preferences),
    );
  } catch {
    // Ignore storage failures (private mode, quota, etc.).
  }
}

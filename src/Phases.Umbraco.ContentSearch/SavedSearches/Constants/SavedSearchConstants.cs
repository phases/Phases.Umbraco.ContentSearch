namespace Phases.Umbraco.ContentSearch.SavedSearches.Constants;

/// <summary>
/// Constants for saved search persistence.
/// </summary>
public static class SavedSearchConstants
{
    /// <summary>
    /// Key prefix for per-user personal saved searches.
    /// </summary>
    public const string PersonalKeyPrefix = "Phases.ContentSearch.SavedSearches.Personal:v1";

    /// <summary>
    /// Key for the shared saved searches collection.
    /// </summary>
    public const string SharedStorageKey = "Phases.ContentSearch.SavedSearches.Shared:v1";

    /// <summary>
    /// Key prefix for per-user saved search preferences.
    /// </summary>
    public const string PreferencesKeyPrefix = "Phases.ContentSearch.SavedSearches.Preferences:v1";

    /// <summary>
    /// Key prefix for per-user recent searches.
    /// </summary>
    public const string RecentKeyPrefix = "Phases.ContentSearch.SavedSearches.Recent:v1";

    /// <summary>
    /// Maximum personal saved searches per user.
    /// </summary>
    public const int MaxPersonalPerUser = 50;

    /// <summary>
    /// Maximum shared saved searches.
    /// </summary>
    public const int MaxShared = 100;

    /// <summary>
    /// Maximum recent searches retained per user.
    /// </summary>
    public const int MaxRecent = 20;

    /// <summary>
    /// Maximum saved search name length.
    /// </summary>
    public const int MaxNameLength = 100;

    /// <summary>
    /// Maximum saved search description length.
    /// </summary>
    public const int MaxDescriptionLength = 500;
}

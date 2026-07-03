namespace Phases.Umbraco.FilterNodes.Constants;

/// <summary>
/// Constants for persisted saved filters.
/// </summary>
public static class SavedFilterConstants
{
    /// <summary>
    /// Key prefix used with Umbraco key-value storage.
    /// </summary>
    public const string KeyPrefix = "Phases.FilterNodes.SavedFilters:v1";

    /// <summary>
    /// Maximum number of saved filters per backoffice user.
    /// </summary>
    public const int MaxSavedFiltersPerUser = 50;

    /// <summary>
    /// Maximum length of a saved filter name.
    /// </summary>
    public const int MaxNameLength = 100;
}

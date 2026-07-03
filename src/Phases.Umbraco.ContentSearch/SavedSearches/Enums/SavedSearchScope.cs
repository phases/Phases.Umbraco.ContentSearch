namespace Phases.Umbraco.ContentSearch.SavedSearches.Enums;

/// <summary>
/// Where a saved search is stored and who can access it.
/// </summary>
public enum SavedSearchScope
{
    /// <summary>
    /// A search owned by the current backoffice user.
    /// </summary>
    Personal,

    /// <summary>
    /// A search shared with all backoffice users.
    /// </summary>
    Shared,

    /// <summary>
    /// A recently executed search snapshot for the current user.
    /// </summary>
    Recent,
}

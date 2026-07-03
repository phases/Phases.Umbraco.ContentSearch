namespace Phases.Umbraco.ContentSearch.Authorization;

/// <summary>
/// Authorization policy names for the Content Search package.
/// </summary>
public static class ContentSearchAuthorizationPolicies
{
    /// <summary>
    /// Requires an authenticated backoffice user with access to the Content Search section.
    /// </summary>
    public const string SectionAccessContentSearch = "Phases.ContentSearch.SectionAccess";
}

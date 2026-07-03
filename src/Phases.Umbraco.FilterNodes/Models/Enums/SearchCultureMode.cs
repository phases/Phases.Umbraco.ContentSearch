namespace Phases.Umbraco.FilterNodes.Models.Enums;

/// <summary>
/// Determines which culture-specific Examine fields are queried for variant properties.
/// </summary>
public enum SearchCultureMode
{
    /// <summary>
    /// Search across all culture-specific index fields.
    /// </summary>
    AllCultures,

    /// <summary>
    /// Search using the backoffice's current culture.
    /// </summary>
    CurrentCulture,

    /// <summary>
    /// Search using an explicitly selected culture.
    /// </summary>
    SpecificCulture,
}

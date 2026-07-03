namespace Phases.Umbraco.ContentSearch.Search.Enums;

/// <summary>
/// How multiple search conditions are combined.
/// </summary>
public enum SearchMatchMode
{
    /// <summary>
    /// All conditions must match.
    /// </summary>
    All,

    /// <summary>
    /// Any condition may match.
    /// </summary>
    Any,
}

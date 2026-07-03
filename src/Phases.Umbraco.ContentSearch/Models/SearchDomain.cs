namespace Phases.Umbraco.ContentSearch.Models;

/// <summary>
/// Identifies which Examine-backed search domain a request targets.
/// </summary>
public enum SearchDomain
{
    /// <summary>
    /// Published content search via the external content index.
    /// </summary>
    Content = 0,

    /// <summary>
    /// Media search via the external media index.
    /// </summary>
    Media = 1,

    /// <summary>
    /// Member search via the external member index.
    /// </summary>
    Member = 2,
}

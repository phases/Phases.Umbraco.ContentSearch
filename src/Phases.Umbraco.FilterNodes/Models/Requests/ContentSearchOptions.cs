using Phases.Umbraco.FilterNodes.Models.Enums;
using Phases.Umbraco.FilterNodes.Models.Examine;

namespace Phases.Umbraco.FilterNodes.Models.Requests;

/// <summary>
/// Sorting options applied when searching content nodes.
/// </summary>
public sealed record ContentSearchOptions
{
    /// <summary>
    /// Gets the Examine field name to sort by.
    /// </summary>
    public string SortField { get; init; } = "nodeName";

    /// <summary>
    /// Gets the sort direction.
    /// </summary>
    public SortDirection SortDirection { get; init; } = SortDirection.Ascending;

    /// <summary>
    /// Gets the culture context applied to the search.
    /// </summary>
    public SearchCultureContext SearchCultureContext { get; init; } = SearchCultureContext.AllCultures;

    /// <summary>
    /// Gets the display name of the matched culture for result hydration, when applicable.
    /// </summary>
    public string? MatchedCultureDisplayName { get; init; }
}

namespace Phases.Umbraco.ContentSearch.Search.Models;

/// <summary>
/// The outcome of a single Examine pipeline execution.
/// </summary>
public sealed class ContentSearchResult
{
    /// <summary>
    /// Gets or sets the matched entity identifiers.
    /// </summary>
    public IReadOnlyList<int> EntityIds { get; init; } = [];

    /// <summary>
    /// Gets or sets the matched content items.
    /// </summary>
    public IReadOnlyList<ContentSearchResultItem> Items { get; init; } = [];

    /// <summary>
    /// Gets or sets the total number of matches the current user can access.
    /// </summary>
    public long TotalMatches { get; init; }
}

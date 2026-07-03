namespace Phases.Umbraco.ContentSearch.Search.Models;

/// <summary>
/// Paged search response returned to the backoffice UI.
/// </summary>
public sealed class ContentSearchResponse
{
    /// <summary>
    /// Gets or sets the matched items for the current page.
    /// </summary>
    public IReadOnlyList<ContentSearchResultItem> Items { get; init; } = [];

    /// <summary>
    /// Gets or sets the total number of matches before paging.
    /// </summary>
    public long TotalCount { get; init; }

    /// <summary>
    /// Gets or sets the current page index.
    /// </summary>
    public int PageIndex { get; init; }

    /// <summary>
    /// Gets or sets the page size.
    /// </summary>
    public int PageSize { get; init; }

    /// <summary>
    /// Gets or sets the total number of pages.
    /// </summary>
    public int TotalPages { get; init; }

    /// <summary>
    /// Gets or sets a value indicating whether a previous page exists.
    /// </summary>
    public bool HasPreviousPage { get; init; }

    /// <summary>
    /// Gets or sets a value indicating whether a next page exists.
    /// </summary>
    public bool HasNextPage { get; init; }

    /// <summary>
    /// Gets or sets the search execution time in milliseconds.
    /// </summary>
    public long ExecutionTimeMs { get; init; }
}

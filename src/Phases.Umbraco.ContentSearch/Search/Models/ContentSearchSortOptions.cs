using Phases.Umbraco.ContentSearch.Examine;

namespace Phases.Umbraco.ContentSearch.Search.Models;

/// <summary>
/// Sorting options applied when executing a search against Examine.
/// </summary>
public sealed class ContentSearchSortOptions
{
    /// <summary>
    /// Gets or sets the Examine field name to sort by.
    /// </summary>
    public string Field { get; init; } = ContentSearchExamineFields.NodeName;

    /// <summary>
    /// Gets or sets a value indicating whether sorting is descending.
    /// </summary>
    public bool Descending { get; init; }
}

using Phases.Umbraco.FilterNodes.Models.Enums;

namespace Phases.Umbraco.FilterNodes.Models.Requests;

/// <summary>
/// Sort settings for filtered node search results.
/// </summary>
public sealed record SortOptions
{
    /// <summary>
    /// Gets the Examine field to sort by.
    /// </summary>
    public string Field { get; init; } = string.Empty;

    /// <summary>
    /// Gets the sort direction.
    /// </summary>
    public SortDirection Direction { get; init; } = SortDirection.Ascending;
}

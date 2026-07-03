namespace Phases.Umbraco.ContentSearch.Search.Models;

/// <summary>
/// Describes where and how a search condition matched on a result item.
/// </summary>
public sealed class ContentSearchMatchInfo
{
    /// <summary>
    /// Gets or sets the property alias that was searched.
    /// </summary>
    public required string PropertyAlias { get; init; }

    /// <summary>
    /// Gets or sets the display name of the property.
    /// </summary>
    public required string PropertyName { get; init; }

    /// <summary>
    /// Gets or sets the human-readable operator label when no snippet is shown.
    /// </summary>
    public string? OperatorLabel { get; init; }

    /// <summary>
    /// Gets or sets a contextual excerpt from the indexed field value.
    /// </summary>
    public string? Snippet { get; init; }

    /// <summary>
    /// Gets or sets terms to highlight within the snippet.
    /// </summary>
    public IReadOnlyList<string> HighlightTerms { get; init; } = [];
}

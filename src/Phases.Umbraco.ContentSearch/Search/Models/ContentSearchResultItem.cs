namespace Phases.Umbraco.ContentSearch.Search.Models;

/// <summary>
/// A single content item returned from a search execution.
/// </summary>
public sealed class ContentSearchResultItem
{
    /// <summary>
    /// Gets or sets the content node identifier.
    /// </summary>
    public int Id { get; init; }

    /// <summary>
    /// Gets or sets the content node key.
    /// </summary>
    public Guid Key { get; init; }

    /// <summary>
    /// Gets or sets the display name.
    /// </summary>
    public string Name { get; init; } = string.Empty;

    /// <summary>
    /// Gets or sets the content type alias.
    /// </summary>
    public string? ContentTypeAlias { get; init; }

    /// <summary>
    /// Gets or sets the parent display name.
    /// </summary>
    public string? ParentName { get; init; }

    /// <summary>
    /// Gets or sets the create date.
    /// </summary>
    public DateTime? CreateDate { get; init; }

    /// <summary>
    /// Gets or sets the update date.
    /// </summary>
    public DateTime? UpdateDate { get; init; }

    /// <summary>
    /// Gets or sets the published URL when available.
    /// </summary>
    public string? Url { get; init; }

    /// <summary>
    /// Gets or sets the display label for the published URL column.
    /// </summary>
    public string? UrlDisplay { get; init; }

    /// <summary>
    /// Gets or sets the hierarchical node path from the Examine index.
    /// </summary>
    public string? Path { get; init; }

    /// <summary>
    /// Gets or sets the editor-friendly content hierarchy path.
    /// </summary>
    public string? PathDisplay { get; init; }

    /// <summary>
    /// Gets or sets the Umbraco UDI for the content item.
    /// </summary>
    public string? Udi { get; init; }

    /// <summary>
    /// Gets or sets the culture that matched the search criteria.
    /// </summary>
    public string? MatchedCulture { get; init; }

    /// <summary>
    /// Gets or sets a value indicating whether the content item has a published version.
    /// </summary>
    public bool? Published { get; init; }

    /// <summary>
    /// Gets or sets match details for each search condition that applied to this item.
    /// </summary>
    public IReadOnlyList<ContentSearchMatchInfo> MatchedFields { get; init; } = [];

    /// <summary>
    /// Gets or sets raw Examine index field values used for culture-aware filtering.
    /// </summary>
    [System.Text.Json.Serialization.JsonIgnore]
    public IReadOnlyDictionary<string, string>? IndexFieldValues { get; init; }
}

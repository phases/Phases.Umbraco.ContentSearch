namespace Phases.Umbraco.FilterNodes.Models.Responses;

/// <summary>
/// A content node returned from a filter or search operation.
/// </summary>
public sealed record NodeSearchResult
{
    /// <summary>
    /// Gets the unique key of the content node.
    /// </summary>
    public required Guid Key { get; init; }

    /// <summary>
    /// Gets the numeric identifier of the content node.
    /// </summary>
    public required int Id { get; init; }

    /// <summary>
    /// Gets the display name of the content node.
    /// </summary>
    public required string Name { get; init; }

    /// <summary>
    /// Gets the document type alias of the content node.
    /// </summary>
    public string? ContentTypeAlias { get; init; }

    /// <summary>
    /// Gets the unique key of the parent content node, if one exists.
    /// </summary>
    public Guid? ParentKey { get; init; }

    /// <summary>
    /// Gets the display name of the parent content node, if one exists.
    /// </summary>
    public string? ParentName { get; init; }

    /// <summary>
    /// Gets the date the content node was created.
    /// </summary>
    public DateTimeOffset? CreateDate { get; init; }

    /// <summary>
    /// Gets the date the content node was last updated.
    /// </summary>
    public DateTimeOffset? UpdateDate { get; init; }

    /// <summary>
    /// Gets the published URL of the content node, if available.
    /// </summary>
    public string? Url { get; init; }

    /// <summary>
    /// Gets the display name of the culture that matched the search, when available.
    /// </summary>
    public string? MatchedCulture { get; init; }
}

namespace Phases.Umbraco.ContentSearch.Metadata.Models.Responses;

/// <summary>
/// Response containing document type metadata for the query builder UI.
/// </summary>
public sealed class ContentTypeListResponse
{
    /// <summary>
    /// Gets or sets the discovered content types.
    /// </summary>
    public required IReadOnlyList<ContentTypeMetadata> ContentTypes { get; init; }
}

namespace Phases.Umbraco.ContentSearch.Metadata.Models.Responses;

/// <summary>
/// Response containing searchable property metadata for a document type.
/// </summary>
public sealed class PropertyMetadataListResponse
{
    /// <summary>
    /// Gets or sets the document type alias.
    /// </summary>
    public required string ContentTypeAlias { get; init; }

    /// <summary>
    /// Gets or sets the discovered properties.
    /// </summary>
    public required IReadOnlyList<SearchablePropertyMetadata> Properties { get; init; }
}

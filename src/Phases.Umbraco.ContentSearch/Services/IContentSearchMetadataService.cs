using Phases.Umbraco.ContentSearch.Metadata.Models;

namespace Phases.Umbraco.ContentSearch.Services;

/// <summary>
/// Provides cached metadata for the Content Search query builder UI.
/// </summary>
public interface IContentSearchMetadataService
{
    /// <summary>
    /// Gets document types available for search configuration.
    /// </summary>
    Task<IReadOnlyList<ContentTypeMetadata>> GetContentTypesAsync(
        MetadataDomain domain = MetadataDomain.Content,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets searchable properties for a document type.
    /// </summary>
    Task<IReadOnlyList<SearchablePropertyMetadata>> GetPropertiesAsync(
        string contentTypeAlias,
        MetadataDomain domain = MetadataDomain.Content,
        CancellationToken cancellationToken = default);
}

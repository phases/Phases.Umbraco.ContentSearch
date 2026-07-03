using Phases.Umbraco.ContentSearch.Metadata.Models;

namespace Phases.Umbraco.ContentSearch.Metadata;

/// <summary>
/// Discovers schema metadata from Umbraco document types for building the search UI.
/// Implementations must not scan published content or traverse the content tree.
/// </summary>
public interface IContentSearchMetadataDiscovery
{
    /// <summary>
    /// Gets all document types available for search configuration.
    /// </summary>
    /// <param name="domain">The metadata domain to discover.</param>
    /// <param name="cancellationToken">A token to cancel the operation.</param>
    /// <returns>Content type metadata for UI rendering.</returns>
    Task<IReadOnlyList<ContentTypeMetadata>> GetContentTypesAsync(
        MetadataDomain domain = MetadataDomain.Content,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets searchable properties for a document type.
    /// </summary>
    /// <param name="contentTypeAlias">The document type alias.</param>
    /// <param name="domain">The metadata domain to discover.</param>
    /// <param name="cancellationToken">A token to cancel the operation.</param>
    /// <returns>Property metadata for UI rendering.</returns>
    Task<IReadOnlyList<SearchablePropertyMetadata>> GetPropertiesAsync(
        string contentTypeAlias,
        MetadataDomain domain = MetadataDomain.Content,
        CancellationToken cancellationToken = default);
}

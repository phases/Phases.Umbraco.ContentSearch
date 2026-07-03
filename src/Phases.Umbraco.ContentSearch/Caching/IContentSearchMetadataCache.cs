using Phases.Umbraco.ContentSearch.Metadata.Models;

namespace Phases.Umbraco.ContentSearch.Caching;

/// <summary>
/// Caches metadata discovery results to avoid repeated schema lookups.
/// </summary>
public interface IContentSearchMetadataCache
{
    /// <summary>
    /// Gets cached content type metadata or creates it using the supplied factory.
    /// </summary>
    Task<IReadOnlyList<ContentTypeMetadata>> GetContentTypesAsync(
        MetadataDomain domain,
        Func<CancellationToken, Task<IReadOnlyList<ContentTypeMetadata>>> factory,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets cached property metadata or creates it using the supplied factory.
    /// </summary>
    Task<IReadOnlyList<SearchablePropertyMetadata>> GetPropertiesAsync(
        MetadataDomain domain,
        string contentTypeAlias,
        Func<CancellationToken, Task<IReadOnlyList<SearchablePropertyMetadata>>> factory,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Invalidates cached content type metadata for a domain.
    /// </summary>
    void InvalidateContentTypes(MetadataDomain domain);

    /// <summary>
    /// Invalidates cached property metadata for a document type.
    /// </summary>
    void InvalidateProperties(MetadataDomain domain, string contentTypeAlias);

    /// <summary>
    /// Removes all cached metadata entries.
    /// </summary>
    void InvalidateAll();
}

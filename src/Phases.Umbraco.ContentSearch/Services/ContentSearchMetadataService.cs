using Phases.Umbraco.ContentSearch.Caching;
using Phases.Umbraco.ContentSearch.Metadata;
using Phases.Umbraco.ContentSearch.Metadata.Models;

namespace Phases.Umbraco.ContentSearch.Services;

/// <summary>
/// Cached facade over metadata discovery for the query builder UI.
/// </summary>
public sealed class ContentSearchMetadataService : IContentSearchMetadataService
{
    private readonly IContentSearchMetadataDiscovery _metadataDiscovery;
    private readonly IContentSearchMetadataCache _metadataCache;

    /// <summary>
    /// Initializes a new instance of the <see cref="ContentSearchMetadataService"/> class.
    /// </summary>
    public ContentSearchMetadataService(
        IContentSearchMetadataDiscovery metadataDiscovery,
        IContentSearchMetadataCache metadataCache)
    {
        _metadataDiscovery = metadataDiscovery;
        _metadataCache = metadataCache;
    }

    /// <inheritdoc />
    public Task<IReadOnlyList<ContentTypeMetadata>> GetContentTypesAsync(
        MetadataDomain domain = MetadataDomain.Content,
        CancellationToken cancellationToken = default)
        => _metadataCache.GetContentTypesAsync(
            domain,
            ct => _metadataDiscovery.GetContentTypesAsync(domain, ct),
            cancellationToken);

    /// <inheritdoc />
    public Task<IReadOnlyList<SearchablePropertyMetadata>> GetPropertiesAsync(
        string contentTypeAlias,
        MetadataDomain domain = MetadataDomain.Content,
        CancellationToken cancellationToken = default)
        => _metadataCache.GetPropertiesAsync(
            domain,
            contentTypeAlias,
            ct => _metadataDiscovery.GetPropertiesAsync(contentTypeAlias, domain, ct),
            cancellationToken);
}

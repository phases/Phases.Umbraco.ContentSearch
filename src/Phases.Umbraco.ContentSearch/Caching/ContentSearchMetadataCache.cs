using Phases.Umbraco.ContentSearch.Metadata.Models;

namespace Phases.Umbraco.ContentSearch.Caching;

/// <summary>
/// Default implementation of <see cref="IContentSearchMetadataCache"/>.
/// </summary>
public sealed class ContentSearchMetadataCache : IContentSearchMetadataCache
{
    private readonly IContentSearchRuntimeCache _cache;

    /// <summary>
    /// Initializes a new instance of the <see cref="ContentSearchMetadataCache"/> class.
    /// </summary>
    public ContentSearchMetadataCache(IContentSearchRuntimeCache cache)
    {
        _cache = cache;
    }

    /// <inheritdoc />
    public Task<IReadOnlyList<ContentTypeMetadata>> GetContentTypesAsync(
        MetadataDomain domain,
        Func<CancellationToken, Task<IReadOnlyList<ContentTypeMetadata>>> factory,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(factory);

        return _cache.GetOrCreateAsync(
            ContentSearchCacheConstants.ContentTypesKey(domain),
            factory,
            new ContentSearchCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = ContentSearchCachePolicy.ContentTypesExpiration,
            },
            cancellationToken);
    }

    /// <inheritdoc />
    public Task<IReadOnlyList<SearchablePropertyMetadata>> GetPropertiesAsync(
        MetadataDomain domain,
        string contentTypeAlias,
        Func<CancellationToken, Task<IReadOnlyList<SearchablePropertyMetadata>>> factory,
        CancellationToken cancellationToken = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(contentTypeAlias);
        ArgumentNullException.ThrowIfNull(factory);

        return _cache.GetOrCreateAsync(
            ContentSearchCacheConstants.PropertiesKey(domain, contentTypeAlias),
            factory,
            new ContentSearchCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = ContentSearchCachePolicy.PropertiesExpiration,
            },
            cancellationToken);
    }

    /// <inheritdoc />
    public void InvalidateContentTypes(MetadataDomain domain)
        => _cache.Remove(ContentSearchCacheConstants.ContentTypesKey(domain));

    /// <inheritdoc />
    public void InvalidateProperties(MetadataDomain domain, string contentTypeAlias)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(contentTypeAlias);
        _cache.Remove(ContentSearchCacheConstants.PropertiesKey(domain, contentTypeAlias));
    }

    /// <inheritdoc />
    public void InvalidateAll()
    {
        InvalidateContentTypes(MetadataDomain.Content);
        _cache.RemoveByPrefix(ContentSearchCacheConstants.PropertiesKeyPrefix);
    }
}

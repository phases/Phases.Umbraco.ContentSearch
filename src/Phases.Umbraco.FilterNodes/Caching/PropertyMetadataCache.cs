using Phases.Umbraco.FilterNodes.Constants;
using Phases.Umbraco.FilterNodes.Models.Responses;

namespace Phases.Umbraco.FilterNodes.Caching;

/// <summary>
/// Default implementation of <see cref="IPropertyMetadataCache"/>.
/// </summary>
public sealed class PropertyMetadataCache : IPropertyMetadataCache
{
    private readonly IFilterNodesCache _cache;

    /// <summary>
    /// Initializes a new instance of the <see cref="PropertyMetadataCache"/> class.
    /// </summary>
    /// <param name="cache">The Filter Nodes cache.</param>
    public PropertyMetadataCache(IFilterNodesCache cache)
    {
        _cache = cache;
    }

    /// <inheritdoc />
    public Task<IReadOnlyList<ContentTypeListItem>> GetContentTypesAsync(
        Func<CancellationToken, Task<IReadOnlyList<ContentTypeListItem>>> factory,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(factory);

        return _cache.GetOrCreateAsync(
            FilterNodesCacheConstants.ContentTypeAliasesKey,
            factory,
            new FilterNodesCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = FilterNodesCachePolicy.ContentTypeAliasesExpiration,
            },
            cancellationToken);
    }

    /// <inheritdoc />
    public Task<IReadOnlyList<FilterablePropertyMetadata>> GetPropertyMetadataAsync(
        string contentTypeAlias,
        Func<CancellationToken, Task<IReadOnlyList<FilterablePropertyMetadata>>> factory,
        CancellationToken cancellationToken = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(contentTypeAlias);
        ArgumentNullException.ThrowIfNull(factory);

        return _cache.GetOrCreateAsync(
            FilterNodesCacheConstants.PropertyAliasesKey(contentTypeAlias),
            factory,
            new FilterNodesCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = FilterNodesCachePolicy.PropertyAliasesExpiration,
            },
            cancellationToken);
    }

    /// <inheritdoc />
    public void InvalidateContentTypeAliases()
        => _cache.Remove(FilterNodesCacheConstants.ContentTypeAliasesKey);

    /// <inheritdoc />
    public void InvalidatePropertyAliases(string contentTypeAlias)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(contentTypeAlias);
        _cache.Remove(FilterNodesCacheConstants.PropertyAliasesKey(contentTypeAlias));
    }

    /// <inheritdoc />
    public void InvalidateAll()
    {
        InvalidateContentTypeAliases();
        _cache.RemoveByPrefix(FilterNodesCacheConstants.PropertyAliasesKeyPrefix);
    }
}

using Phases.Umbraco.FilterNodes.Caching;
using Phases.Umbraco.FilterNodes.Models.Requests;
using Phases.Umbraco.FilterNodes.Models.Responses;
using Phases.Umbraco.FilterNodes.Services.Interfaces;

namespace Phases.Umbraco.FilterNodes.Services.Caching;

/// <summary>
/// Decorates <see cref="PropertyMetadataService"/> with metadata caching.
/// Search results are not cached by this service.
/// </summary>
public sealed class CachedPropertyMetadataService : IPropertyMetadataService
{
    private readonly PropertyMetadataService _inner;
    private readonly IPropertyMetadataCache _metadataCache;

    /// <summary>
    /// Initializes a new instance of the <see cref="CachedPropertyMetadataService"/> class.
    /// </summary>
    /// <param name="inner">The inner metadata service.</param>
    /// <param name="metadataCache">The metadata cache.</param>
    public CachedPropertyMetadataService(
        PropertyMetadataService inner,
        IPropertyMetadataCache metadataCache)
    {
        _inner = inner;
        _metadataCache = metadataCache;
    }

    /// <inheritdoc />
    public Task<IReadOnlyList<ContentTypeListItem>> GetContentTypesAsync(
        CancellationToken cancellationToken = default)
        => _metadataCache.GetContentTypesAsync(
            ct => _inner.GetContentTypesAsync(ct),
            cancellationToken);

    /// <inheritdoc />
    public async Task<IReadOnlyList<string>> GetContentTypeAliasesAsync(
        CancellationToken cancellationToken = default)
    {
        IReadOnlyList<ContentTypeListItem> contentTypes = await GetContentTypesAsync(cancellationToken)
            .ConfigureAwait(false);

        return contentTypes
            .Select(static contentType => contentType.Alias)
            .ToArray();
    }

    /// <inheritdoc />
    public Task<IReadOnlyList<FilterablePropertyMetadata>> GetPropertyMetadataAsync(
        string contentTypeAlias,
        CancellationToken cancellationToken = default)
        => _metadataCache.GetPropertyMetadataAsync(
            contentTypeAlias,
            ct => _inner.GetPropertyMetadataAsync(contentTypeAlias, ct),
            cancellationToken);

    /// <inheritdoc />
    public Task<IReadOnlyList<PropertyAliasesResponse>> GetPropertyMetadataBatchAsync(
        IReadOnlyList<string> contentTypeAliases,
        CancellationToken cancellationToken = default)
        => _inner.GetPropertyMetadataBatchAsync(contentTypeAliases, cancellationToken);

    /// <inheritdoc />
    public Task<bool> SupportsFilterConditionAsync(
        FilterCondition condition,
        CancellationToken cancellationToken = default)
        => _inner.SupportsFilterConditionAsync(condition, cancellationToken);
}

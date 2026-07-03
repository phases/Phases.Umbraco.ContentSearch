using System.Collections.Concurrent;
using Phases.Umbraco.FilterNodes.Constants;
using Umbraco.Cms.Core.Cache;

namespace Phases.Umbraco.FilterNodes.Caching;

/// <summary>
/// Umbraco <see cref="IAppPolicyCache"/> implementation of <see cref="IFilterNodesCache"/>.
/// </summary>
public sealed class FilterNodesCache : IFilterNodesCache
{
    private readonly IAppPolicyCache _runtimeCache;
    private readonly ConcurrentDictionary<string, byte> _trackedKeys = new(StringComparer.Ordinal);

    /// <summary>
    /// Initializes a new instance of the <see cref="FilterNodesCache"/> class.
    /// </summary>
    /// <param name="appCaches">The Umbraco application caches.</param>
    public FilterNodesCache(AppCaches appCaches)
    {
        ArgumentNullException.ThrowIfNull(appCaches);
        _runtimeCache = appCaches.RuntimeCache;
    }

    /// <inheritdoc />
    public Task<T> GetOrCreateAsync<T>(
        string cacheKey,
        Func<CancellationToken, Task<T>> factory,
        FilterNodesCacheEntryOptions? options = null,
        CancellationToken cancellationToken = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(cacheKey);
        ArgumentNullException.ThrowIfNull(factory);

        cancellationToken.ThrowIfCancellationRequested();

        var fullCacheKey = BuildFullCacheKey(cacheKey);
        _trackedKeys.TryAdd(fullCacheKey, 0);

        var timeout = options?.AbsoluteExpirationRelativeToNow;
        var isSliding = options?.IsSliding ?? false;

        var value = _runtimeCache.Get(
            fullCacheKey,
            () => factory(cancellationToken).GetAwaiter().GetResult(),
            timeout,
            isSliding);

        return value is null
            ? throw new InvalidOperationException($"Failed to create cache entry for key '{cacheKey}'.")
            : Task.FromResult((T)value);
    }

    /// <inheritdoc />
    public void Remove(string cacheKey)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(cacheKey);

        var fullCacheKey = BuildFullCacheKey(cacheKey);
        _runtimeCache.ClearByKey(fullCacheKey);
        _trackedKeys.TryRemove(fullCacheKey, out _);
    }

    /// <inheritdoc />
    public void RemoveByPrefix(string cacheKeyPrefix)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(cacheKeyPrefix);

        var fullPrefix = BuildFullCacheKey(cacheKeyPrefix);

        foreach (var trackedKey in _trackedKeys.Keys)
        {
            if (!trackedKey.StartsWith(fullPrefix, StringComparison.Ordinal))
            {
                continue;
            }

            _runtimeCache.ClearByKey(trackedKey);
            _trackedKeys.TryRemove(trackedKey, out _);
        }
    }

    private static string BuildFullCacheKey(string cacheKey)
        => $"{FilterNodesCacheConstants.CacheKeyPrefix}{cacheKey}";
}

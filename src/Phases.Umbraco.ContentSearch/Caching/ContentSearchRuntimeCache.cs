using System.Collections.Concurrent;
using Umbraco.Cms.Core.Cache;

namespace Phases.Umbraco.ContentSearch.Caching;

/// <summary>
/// Umbraco runtime cache wrapper for Content Search metadata.
/// </summary>
public interface IContentSearchRuntimeCache
{
    /// <summary>
    /// Gets a cached value or creates it using the supplied factory.
    /// </summary>
    Task<T> GetOrCreateAsync<T>(
        string cacheKey,
        Func<CancellationToken, Task<T>> factory,
        ContentSearchCacheEntryOptions? options = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Removes a cache entry.
    /// </summary>
    void Remove(string cacheKey);

    /// <summary>
    /// Removes all cache entries with the specified key prefix.
    /// </summary>
    void RemoveByPrefix(string cacheKeyPrefix);
}

/// <summary>
/// Default implementation of <see cref="IContentSearchRuntimeCache"/>.
/// </summary>
public sealed class ContentSearchRuntimeCache : IContentSearchRuntimeCache
{
    private readonly IAppPolicyCache _runtimeCache;
    private readonly ConcurrentDictionary<string, Lazy<Task<object?>>> _pendingFactories = new(StringComparer.Ordinal);
    private readonly ConcurrentDictionary<string, byte> _trackedKeys = new(StringComparer.Ordinal);

    /// <summary>
    /// Initializes a new instance of the <see cref="ContentSearchRuntimeCache"/> class.
    /// </summary>
    public ContentSearchRuntimeCache(AppCaches appCaches)
    {
        ArgumentNullException.ThrowIfNull(appCaches);
        _runtimeCache = appCaches.RuntimeCache;
    }

    /// <inheritdoc />
    public async Task<T> GetOrCreateAsync<T>(
        string cacheKey,
        Func<CancellationToken, Task<T>> factory,
        ContentSearchCacheEntryOptions? options = null,
        CancellationToken cancellationToken = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(cacheKey);
        ArgumentNullException.ThrowIfNull(factory);

        cancellationToken.ThrowIfCancellationRequested();

        var fullCacheKey = BuildFullCacheKey(cacheKey);

        if (_runtimeCache.Get(fullCacheKey) is T cachedValue)
        {
            return cachedValue;
        }

        var lazy = _pendingFactories.GetOrAdd(
            fullCacheKey,
            _ => new Lazy<Task<object?>>(
                () => CreateEntryAsync(fullCacheKey, factory, options, cancellationToken),
                LazyThreadSafetyMode.ExecutionAndPublication));

        var value = await lazy.Value.ConfigureAwait(false);
        _pendingFactories.TryRemove(fullCacheKey, out _);

        return value is T typedValue
            ? typedValue
            : throw new InvalidOperationException($"Failed to create cache entry for key '{cacheKey}'.");
    }

    /// <inheritdoc />
    public void Remove(string cacheKey)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(cacheKey);

        var fullCacheKey = BuildFullCacheKey(cacheKey);
        _runtimeCache.ClearByKey(fullCacheKey);
        _pendingFactories.TryRemove(fullCacheKey, out _);
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
            _pendingFactories.TryRemove(trackedKey, out _);
            _trackedKeys.TryRemove(trackedKey, out _);
        }
    }

    private async Task<object?> CreateEntryAsync<T>(
        string fullCacheKey,
        Func<CancellationToken, Task<T>> factory,
        ContentSearchCacheEntryOptions? options,
        CancellationToken cancellationToken)
    {
        if (_runtimeCache.Get(fullCacheKey) is T cachedValue)
        {
            return cachedValue;
        }

        var createdValue = await factory(cancellationToken).ConfigureAwait(false);
        var timeout = options?.AbsoluteExpirationRelativeToNow;
        var isSliding = options?.IsSliding ?? false;

        _trackedKeys.TryAdd(fullCacheKey, 0);
        _runtimeCache.Get(
            fullCacheKey,
            () => createdValue,
            timeout,
            isSliding);

        return createdValue;
    }

    private static string BuildFullCacheKey(string cacheKey)
        => $"{ContentSearchCacheConstants.CacheKeyPrefix}{cacheKey}";
}

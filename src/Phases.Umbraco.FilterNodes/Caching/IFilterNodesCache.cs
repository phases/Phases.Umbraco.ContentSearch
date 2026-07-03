namespace Phases.Umbraco.FilterNodes.Caching;

/// <summary>
/// Provides caching operations for the Filter Nodes package using Umbraco cache abstractions.
/// </summary>
public interface IFilterNodesCache
{
    /// <summary>
    /// Gets a cached value or creates it using the specified factory.
    /// </summary>
    /// <typeparam name="T">The type of the cached value.</typeparam>
    /// <param name="cacheKey">The cache key.</param>
    /// <param name="factory">The factory used to create the value when it is not cached.</param>
    /// <param name="options">Optional cache entry options.</param>
    /// <param name="cancellationToken">A token to cancel the operation.</param>
    /// <returns>The cached or newly created value.</returns>
    Task<T> GetOrCreateAsync<T>(
        string cacheKey,
        Func<CancellationToken, Task<T>> factory,
        FilterNodesCacheEntryOptions? options = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Removes a value from the cache.
    /// </summary>
    /// <param name="cacheKey">The cache key to remove.</param>
    void Remove(string cacheKey);

    /// <summary>
    /// Removes all cached values whose keys start with the specified prefix.
    /// </summary>
    /// <param name="cacheKeyPrefix">The cache key prefix.</param>
    void RemoveByPrefix(string cacheKeyPrefix);
}

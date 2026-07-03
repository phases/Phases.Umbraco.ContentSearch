namespace Phases.Umbraco.FilterNodes.Caching;

/// <summary>
/// Options applied when creating a Filter Nodes cache entry.
/// </summary>
public sealed class FilterNodesCacheEntryOptions
{
    /// <summary>
    /// Gets or sets the absolute expiration relative to now.
    /// </summary>
    public TimeSpan? AbsoluteExpirationRelativeToNow { get; init; }

    /// <summary>
    /// Gets or sets whether the cache entry uses a sliding expiration window.
    /// </summary>
    public bool IsSliding { get; init; }
}

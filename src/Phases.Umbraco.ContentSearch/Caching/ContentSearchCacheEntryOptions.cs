namespace Phases.Umbraco.ContentSearch.Caching;

/// <summary>
/// Options for Content Search runtime cache entries.
/// </summary>
public sealed class ContentSearchCacheEntryOptions
{
    /// <summary>
    /// Gets or sets the absolute expiration relative to now.
    /// </summary>
    public TimeSpan? AbsoluteExpirationRelativeToNow { get; init; }

    /// <summary>
    /// Gets or sets a value indicating whether sliding expiration is enabled.
    /// </summary>
    public bool IsSliding { get; init; }
}

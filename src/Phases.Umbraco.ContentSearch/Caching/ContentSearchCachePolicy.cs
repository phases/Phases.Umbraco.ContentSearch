namespace Phases.Umbraco.ContentSearch.Caching;

/// <summary>
/// Default cache expiration policies for Content Search metadata.
/// </summary>
internal static class ContentSearchCachePolicy
{
    /// <summary>
    /// Absolute expiration for cached content type lists.
    /// </summary>
    public static readonly TimeSpan ContentTypesExpiration = TimeSpan.FromHours(6);

    /// <summary>
    /// Absolute expiration for cached property metadata lists.
    /// </summary>
    public static readonly TimeSpan PropertiesExpiration = TimeSpan.FromHours(6);
}

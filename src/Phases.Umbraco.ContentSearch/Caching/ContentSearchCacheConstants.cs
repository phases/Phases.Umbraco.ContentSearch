namespace Phases.Umbraco.ContentSearch.Caching;

/// <summary>
/// Cache key constants for Content Search metadata.
/// </summary>
internal static class ContentSearchCacheConstants
{
    /// <summary>
    /// Cache key prefix for all Content Search cache entries.
    /// </summary>
    public const string CacheKeyPrefix = "Phases.Umbraco.ContentSearch:";

    /// <summary>
    /// Cache key prefix for content type lists.
    /// </summary>
    public const string ContentTypesKeyPrefix = "metadata:content-types:";

    /// <summary>
    /// Cache key prefix for per-document-type property metadata.
    /// </summary>
    public const string PropertiesKeyPrefix = "metadata:properties:";

    /// <summary>
    /// Builds the cache key for content types in a metadata domain.
    /// </summary>
    public static string ContentTypesKey(Metadata.Models.MetadataDomain domain)
        => $"{ContentTypesKeyPrefix}{domain.ToString().ToLowerInvariant()}";

    /// <summary>
    /// Builds the cache key for properties of a document type in a metadata domain.
    /// </summary>
    public static string PropertiesKey(Metadata.Models.MetadataDomain domain, string contentTypeAlias)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(contentTypeAlias);

        return
            $"{PropertiesKeyPrefix}{domain.ToString().ToLowerInvariant()}:{contentTypeAlias.Trim().ToLowerInvariant()}";
    }
}

namespace Phases.Umbraco.FilterNodes.Constants;

/// <summary>
/// Cache key constants for the Phases Umbraco Filter Nodes package.
/// </summary>
public static class FilterNodesCacheConstants
{
    /// <summary>
    /// Cache key prefix for all filter nodes cache entries.
    /// </summary>
    public const string CacheKeyPrefix = "Phases.Umbraco.FilterNodes:";

    /// <summary>
    /// Cache key for the document type alias list.
    /// </summary>
    public const string ContentTypeAliasesKey = "metadata:content-type-aliases";

    /// <summary>
    /// Cache key prefix for per-document-type property alias lists.
    /// </summary>
    public const string PropertyAliasesKeyPrefix = "metadata:property-aliases:";

    /// <summary>
    /// Builds the cache key for property aliases of a document type.
    /// </summary>
    /// <param name="contentTypeAlias">The document type alias.</param>
    /// <returns>The cache key.</returns>
    public static string PropertyAliasesKey(string contentTypeAlias)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(contentTypeAlias);

        return $"{PropertyAliasesKeyPrefix}{contentTypeAlias.Trim().ToLowerInvariant()}";
    }
}

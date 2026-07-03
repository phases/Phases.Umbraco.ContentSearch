namespace Phases.Umbraco.FilterNodes.Caching;

using Phases.Umbraco.FilterNodes.Models.Responses;

/// <summary>
/// Caches document type and property metadata used by the Filter Nodes backoffice.
/// </summary>
public interface IPropertyMetadataCache
{
    /// <summary>
    /// Gets or creates the cached document type list.
    /// </summary>
    /// <param name="factory">The factory that loads document types when the cache misses.</param>
    /// <param name="cancellationToken">A token to cancel the operation.</param>
    /// <returns>The document types.</returns>
    Task<IReadOnlyList<ContentTypeListItem>> GetContentTypesAsync(
        Func<CancellationToken, Task<IReadOnlyList<ContentTypeListItem>>> factory,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets or creates the cached property metadata list for a document type.
    /// </summary>
    /// <param name="contentTypeAlias">The document type alias.</param>
    /// <param name="factory">The factory that loads metadata when the cache misses.</param>
    /// <param name="cancellationToken">A token to cancel the operation.</param>
    /// <returns>The property metadata.</returns>
    Task<IReadOnlyList<FilterablePropertyMetadata>> GetPropertyMetadataAsync(
        string contentTypeAlias,
        Func<CancellationToken, Task<IReadOnlyList<FilterablePropertyMetadata>>> factory,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Invalidates the cached document type alias list.
    /// </summary>
    void InvalidateContentTypeAliases();

    /// <summary>
    /// Invalidates the cached property aliases for a document type.
    /// </summary>
    /// <param name="contentTypeAlias">The document type alias.</param>
    void InvalidatePropertyAliases(string contentTypeAlias);

    /// <summary>
    /// Invalidates all cached metadata entries.
    /// </summary>
    void InvalidateAll();
}

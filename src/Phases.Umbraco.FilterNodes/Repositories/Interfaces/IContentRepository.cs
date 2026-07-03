using Phases.Umbraco.FilterNodes.Models.Requests;
using Phases.Umbraco.FilterNodes.Models.Responses;

namespace Phases.Umbraco.FilterNodes.Repositories.Interfaces;

/// <summary>
/// Resolves Umbraco content nodes into API search result models.
/// </summary>
public interface IContentRepository
{
    /// <summary>
    /// Searches content nodes using Examine and returns a paginated, sorted result set.
    /// </summary>
    /// <param name="request">The filter and pagination criteria.</param>
    /// <param name="searchOptions">Optional sorting options.</param>
    /// <param name="cancellationToken">A token to cancel the operation.</param>
    /// <returns>A paginated collection of matching content nodes.</returns>
    Task<PagedResponse<NodeSearchResult>> SearchAsync(
        FilterRequest request,
        ContentSearchOptions? searchOptions = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a single content node by its unique key.
    /// </summary>
    /// <param name="key">The unique key of the content node.</param>
    /// <param name="cancellationToken">A token to cancel the operation.</param>
    /// <returns>The matching node, or <c>null</c> when not found.</returns>
    Task<NodeSearchResult?> GetNodeByKeyAsync(
        Guid key,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets content nodes for the specified unique keys, preserving the supplied order.
    /// </summary>
    /// <param name="keys">The unique keys of the content nodes to resolve.</param>
    /// <param name="cancellationToken">A token to cancel the operation.</param>
    /// <returns>The resolved content nodes. Missing keys are omitted.</returns>
    Task<IReadOnlyList<NodeSearchResult>> GetNodesByKeysAsync(
        IReadOnlyList<Guid> keys,
        CancellationToken cancellationToken = default);
}

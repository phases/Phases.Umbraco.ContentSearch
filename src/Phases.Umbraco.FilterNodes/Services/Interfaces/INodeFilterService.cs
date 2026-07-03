using Phases.Umbraco.FilterNodes.Models.Requests;
using Phases.Umbraco.FilterNodes.Models.Responses;

namespace Phases.Umbraco.FilterNodes.Services.Interfaces;

/// <summary>
/// Orchestrates content node filtering across Examine search and content resolution.
/// </summary>
public interface INodeFilterService
{
    /// <summary>
    /// Filters content nodes using the specified request and returns a paginated result set.
    /// </summary>
    /// <param name="request">The filter and pagination criteria.</param>
    /// <param name="cancellationToken">A token to cancel the operation.</param>
    /// <returns>A paginated collection of matching content nodes.</returns>
    Task<PagedResponse<NodeSearchResult>> FilterAsync(
        FilterRequest request,
        CancellationToken cancellationToken = default);
}

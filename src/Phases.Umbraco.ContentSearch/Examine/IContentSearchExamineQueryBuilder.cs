using Examine.Search;
using Phases.Umbraco.ContentSearch.Search.Models;

namespace Phases.Umbraco.ContentSearch.Examine;

/// <summary>
/// Builds Examine queries from normalized search requests.
/// </summary>
public interface IContentSearchExamineQueryBuilder
{
    /// <summary>
    /// Builds an Examine boolean query from the normalized request.
    /// </summary>
    /// <param name="request">The normalized request.</param>
    /// <param name="query">The base query.</param>
    /// <param name="cancellationToken">A token to cancel the operation.</param>
    /// <returns>The composed boolean query.</returns>
    Task<IBooleanOperation> BuildAsync(
        NormalizedContentSearchRequest request,
        IBooleanOperation query,
        CancellationToken cancellationToken = default);
}

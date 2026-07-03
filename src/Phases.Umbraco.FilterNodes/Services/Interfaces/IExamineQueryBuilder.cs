using Examine.Search;
using Phases.Umbraco.FilterNodes.Models.Requests;

namespace Phases.Umbraco.FilterNodes.Services.Interfaces;

/// <summary>
/// Builds Examine search queries from filter requests.
/// </summary>
/// <remarks>
/// Implementations should compose onto the supplied base query so callers can apply
/// additional index-specific constraints before or after filtering.
/// </remarks>
public interface IExamineQueryBuilder
{
    /// <summary>
    /// Applies the filter request to an Examine query.
    /// </summary>
    /// <param name="request">The filter criteria to translate into Examine query operations.</param>
    /// <param name="query">The base Examine query to extend.</param>
    /// <param name="cancellationToken">A token to cancel the operation.</param>
    /// <returns>The composed Examine query.</returns>
    Task<IBooleanOperation> BuildAsync(
        FilterRequest request,
        IBooleanOperation query,
        CancellationToken cancellationToken = default);
}

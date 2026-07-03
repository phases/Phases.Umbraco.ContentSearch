using Phases.Umbraco.ContentSearch.Search.Models;

namespace Phases.Umbraco.ContentSearch.Search;

/// <summary>
/// The single entry point for executing content search through Examine.
/// All search requests must flow through this pipeline.
/// </summary>
public interface IExamineSearchPipeline
{
    /// <summary>
    /// Executes a search request against the appropriate external Examine index.
    /// </summary>
    /// <param name="request">The search request.</param>
    /// <param name="cancellationToken">A token to cancel the operation.</param>
    /// <param name="pageSizeCap">Optional page size cap override (for example export requests).</param>
    /// <returns>The search result.</returns>
    Task<ContentSearchResult> ExecuteAsync(
        ContentSearchRequest request,
        CancellationToken cancellationToken = default,
        int? pageSizeCap = null);
}

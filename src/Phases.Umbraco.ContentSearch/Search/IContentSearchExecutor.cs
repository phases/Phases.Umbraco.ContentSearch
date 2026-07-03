using Phases.Umbraco.ContentSearch.Models;
using Phases.Umbraco.ContentSearch.Search.Models;

namespace Phases.Umbraco.ContentSearch.Search;

/// <summary>
/// Coordinates search execution for backoffice and API consumers.
/// </summary>
public interface IContentSearchExecutor
{
    /// <summary>
    /// Executes a search for the given domain via the Examine pipeline.
    /// </summary>
    /// <param name="request">The search request.</param>
    /// <param name="cancellationToken">A token to cancel the operation.</param>
    /// <param name="pageSizeCap">Optional page size cap override (for example export requests).</param>
    /// <returns>The search result.</returns>
    Task<ContentSearchResult> SearchAsync(
        ContentSearchRequest request,
        CancellationToken cancellationToken = default,
        int? pageSizeCap = null);
}

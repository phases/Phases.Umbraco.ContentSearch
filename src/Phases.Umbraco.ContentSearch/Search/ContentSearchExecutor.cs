using Phases.Umbraco.ContentSearch.Search.Models;

namespace Phases.Umbraco.ContentSearch.Search;

/// <summary>
/// Coordinates search execution for backoffice and API consumers.
/// </summary>
public sealed class ContentSearchExecutor : IContentSearchExecutor
{
    private readonly IExamineSearchPipeline _searchPipeline;

    /// <summary>
    /// Initializes a new instance of the <see cref="ContentSearchExecutor"/> class.
    /// </summary>
    /// <param name="searchPipeline">The Examine search pipeline.</param>
    public ContentSearchExecutor(IExamineSearchPipeline searchPipeline)
    {
        _searchPipeline = searchPipeline;
    }

    /// <inheritdoc />
    public async Task<ContentSearchResult> SearchAsync(
        ContentSearchRequest request,
        CancellationToken cancellationToken = default,
        int? pageSizeCap = null)
        => await _searchPipeline
            .ExecuteAsync(request, cancellationToken, pageSizeCap)
            .ConfigureAwait(false);
}

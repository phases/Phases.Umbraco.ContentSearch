using System.Diagnostics;
using Phases.Umbraco.ContentSearch.Configuration;
using Phases.Umbraco.ContentSearch.Search;
using Phases.Umbraco.ContentSearch.Search.Models;
using Microsoft.Extensions.Options;

namespace Phases.Umbraco.ContentSearch.Services;

/// <summary>
/// Backoffice search service that executes queries through the Examine pipeline.
/// </summary>
public interface IContentSearchService
{
    /// <summary>
    /// Executes a content search request.
    /// </summary>
    /// <param name="request">The search request.</param>
    /// <param name="cancellationToken">A token to cancel the operation.</param>
    /// <returns>The paged search response.</returns>
    Task<ContentSearchResponse> SearchAsync(
        ContentSearchRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Executes a search request for export using the configured export row cap.
    /// </summary>
    /// <param name="request">The search request.</param>
    /// <param name="cancellationToken">A token to cancel the operation.</param>
    /// <returns>The export search response.</returns>
    Task<ContentSearchResponse> SearchForExportAsync(
        ContentSearchRequest request,
        CancellationToken cancellationToken = default);
}

/// <summary>
/// Default implementation of <see cref="IContentSearchService"/>.
/// </summary>
public sealed class ContentSearchService : IContentSearchService
{
    private readonly IContentSearchExecutor _executor;
    private readonly int _maxExportRows;

    /// <summary>
    /// Initializes a new instance of the <see cref="ContentSearchService"/> class.
    /// </summary>
    /// <param name="executor">The search executor.</param>
    /// <param name="options">The package options.</param>
    public ContentSearchService(
        IContentSearchExecutor executor,
        IOptions<ContentSearchOptions> options)
    {
        _executor = executor;
        _maxExportRows = options.Value.MaxExportRows;
    }

    /// <inheritdoc />
    public async Task<ContentSearchResponse> SearchAsync(
        ContentSearchRequest request,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request);

        var stopwatch = Stopwatch.StartNew();
        var result = await _executor
            .SearchAsync(request, cancellationToken)
            .ConfigureAwait(false);
        stopwatch.Stop();

        return BuildResponse(request, result, stopwatch.ElapsedMilliseconds);
    }

    /// <inheritdoc />
    public async Task<ContentSearchResponse> SearchForExportAsync(
        ContentSearchRequest request,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request);

        var stopwatch = Stopwatch.StartNew();
        var result = await _executor
            .SearchAsync(request, cancellationToken, _maxExportRows)
            .ConfigureAwait(false);
        stopwatch.Stop();

        return BuildResponse(request, result, stopwatch.ElapsedMilliseconds);
    }

    private static ContentSearchResponse BuildResponse(
        ContentSearchRequest request,
        ContentSearchResult result,
        long executionTimeMs)
    {
        var pageSize = request.PageSize < 1 ? 20 : request.PageSize;
        var pageIndex = request.PageIndex < 0 ? 0 : request.PageIndex;
        var totalPages = pageSize == 0
            ? 0
            : (int)Math.Ceiling(result.TotalMatches / (double)pageSize);

        return new ContentSearchResponse
        {
            Items = result.Items,
            TotalCount = result.TotalMatches,
            PageIndex = pageIndex,
            PageSize = pageSize,
            TotalPages = totalPages,
            HasPreviousPage = pageIndex > 0,
            HasNextPage = pageIndex + 1 < totalPages,
            ExecutionTimeMs = executionTimeMs,
        };
    }
}

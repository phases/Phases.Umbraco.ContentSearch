using Examine;
using Examine.Search;
using Microsoft.Extensions.Logging;
using Phases.Umbraco.FilterNodes.Constants;
using Phases.Umbraco.FilterNodes.Models.Enums;
using Phases.Umbraco.FilterNodes.Models.Examine;
using Phases.Umbraco.FilterNodes.Models.Requests;
using Phases.Umbraco.FilterNodes.Models.Responses;
using Phases.Umbraco.FilterNodes.Repositories.Interfaces;
using Phases.Umbraco.FilterNodes.Repositories.Mappers;
using Phases.Umbraco.FilterNodes.Services;
using Phases.Umbraco.FilterNodes.Services.Examine;
using Phases.Umbraco.FilterNodes.Services.Interfaces;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Infrastructure.Examine;

namespace Phases.Umbraco.FilterNodes.Repositories;

/// <summary>
/// Umbraco-specific implementation of <see cref="IContentRepository"/>.
/// </summary>
public sealed class ContentRepository : IContentRepository
{
    private readonly IContentService _contentService;
    private readonly IContentTypeService _contentTypeService;
    private readonly IExamineManager _examineManager;
    private readonly IExamineQueryBuilder _queryBuilder;
    private readonly INodeSearchResultMapper _mapper;
    private readonly ILogger<ContentRepository> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="ContentRepository"/> class.
    /// </summary>
    public ContentRepository(
        IContentService contentService,
        IContentTypeService contentTypeService,
        IExamineManager examineManager,
        IExamineQueryBuilder queryBuilder,
        INodeSearchResultMapper mapper,
        ILogger<ContentRepository> logger)
    {
        _contentService = contentService;
        _contentTypeService = contentTypeService;
        _examineManager = examineManager;
        _queryBuilder = queryBuilder;
        _mapper = mapper;
        _logger = logger;
    }

    /// <inheritdoc />
    public async Task<PagedResponse<NodeSearchResult>> SearchAsync(
        FilterRequest request,
        ContentSearchOptions? searchOptions = null,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request);
        cancellationToken.ThrowIfCancellationRequested();

        var paging = NormalizePaging(request.Paging);
        searchOptions ??= new ContentSearchOptions();

        var searchPlan = FilterRequestSearchPlanner.Create(request);
        PagedResponse<NodeSearchResult>? lastResult = null;

        foreach (var indexName in FilterNodesExamineIndexes.ContentSearchIndexNames)
        {
            if (!_examineManager.TryGetIndex(indexName, out IIndex? index) || index is null)
            {
                _logger.LogWarning("Examine index '{IndexName}' was not found.", indexName);
                continue;
            }

            lastResult = await SearchOnIndexAsync(
                index,
                indexName,
                request,
                searchPlan,
                paging,
                searchOptions,
                cancellationToken).ConfigureAwait(false);

            if (lastResult.TotalCount > 0)
            {
                _logger.LogInformation(
                    "Content search completed using Examine index '{IndexName}'. Returned={ReturnedCount}, Total={TotalCount}, Page={Page}.",
                    indexName,
                    lastResult.Items.Count,
                    lastResult.TotalCount,
                    paging.Page);

                return lastResult;
            }

            if (!ShouldTryNextContentIndex(indexName, searchPlan))
            {
                break;
            }

            _logger.LogInformation(
                "Content search returned no results from Examine index '{IndexName}'; trying next content index.",
                indexName);
        }

        if (lastResult is not null)
        {
            return lastResult;
        }

        _logger.LogError(
            "No content Examine indexes were available. Expected at least '{IndexName}'.",
            FilterNodesExamineIndexes.InternalIndexName);

        return PagedResponse<NodeSearchResult>.Create([], paging.Page, paging.PageSize, 0);
    }

    private async Task<PagedResponse<NodeSearchResult>> SearchOnIndexAsync(
        IIndex index,
        string indexName,
        FilterRequest request,
        FilterSearchPlan searchPlan,
        PagedRequest paging,
        ContentSearchOptions searchOptions,
        CancellationToken cancellationToken)
    {
        _logger.LogDebug(
            "Searching content nodes on Examine index '{IndexName}'. Page={Page}, PageSize={PageSize}, SortField={SortField}, SortDirection={SortDirection}.",
            indexName,
            paging.Page,
            paging.PageSize,
            searchOptions.SortField,
            searchOptions.SortDirection);

        var baseQuery = CreateBaseQuery(index);
        var filteredQuery = await _queryBuilder
            .BuildAsync(searchPlan.ExamineRequest, baseQuery, cancellationToken)
            .ConfigureAwait(false);

        var sortedQuery = ApplySorting(filteredQuery, searchOptions);
        var skip = (paging.Page - 1) * paging.PageSize;

        if (!searchPlan.RequiresContentEvaluation)
        {
            var searchResults = await Task.Run(
                () => sortedQuery.Execute(new QueryOptions(skip, paging.PageSize)),
                cancellationToken).ConfigureAwait(false);

            var items = HydrateSearchResults(searchResults, searchOptions);

            return PagedResponse<NodeSearchResult>.Create(
                items,
                paging.Page,
                paging.PageSize,
                searchResults.TotalItemCount);
        }

        var allSearchResults = await Task.Run(
            () => sortedQuery.Execute(),
            cancellationToken).ConfigureAwait(false);

        var matchingResults = FilterSearchResults(
            allSearchResults,
            searchPlan.ContentConditions,
            request.FilterType,
            searchOptions.SearchCultureContext);

        var totalFilteredCount = matchingResults.Count;
        var pagedResults = matchingResults
            .Skip(skip)
            .Take(paging.PageSize)
            .ToList();

        var pagedItems = HydrateSearchResults(
            new SearchResultsAdapter(pagedResults, totalFilteredCount),
            searchOptions);

        return PagedResponse<NodeSearchResult>.Create(
            pagedItems,
            paging.Page,
            paging.PageSize,
            totalFilteredCount);
    }

    private static bool ShouldTryNextContentIndex(string indexName, FilterSearchPlan searchPlan)
    {
        if (!indexName.Equals(FilterNodesExamineIndexes.InternalIndexName, StringComparison.OrdinalIgnoreCase))
        {
            return false;
        }

        if (searchPlan.RequiresContentEvaluation)
        {
            return false;
        }

        return searchPlan.ExamineRequest.Conditions.Any(HasExaminePropertyValueFilter);
    }

    private static bool HasExaminePropertyValueFilter(FilterCondition condition)
    {
        if (string.IsNullOrWhiteSpace(condition.PropertyAlias))
        {
            return false;
        }

        return condition.FilterOperator switch
        {
            FilterOperator.IsEmpty or FilterOperator.IsNotEmpty => false,
            _ => true,
        };
    }

    private List<ISearchResult> FilterSearchResults(
        ISearchResults searchResults,
        IReadOnlyList<FilterCondition> contentConditions,
        FilterType filterType,
        SearchCultureContext cultureContext)
    {
        if (!searchResults.Any())
        {
            return [];
        }

        var orderedResults = searchResults.ToList();
        var ids = orderedResults
            .Select(static result => int.Parse(result.Id, System.Globalization.CultureInfo.InvariantCulture))
            .ToArray();

        var contentById = _contentService
            .GetByIds(ids)
            .ToDictionary(static content => content.Id);

        var schedulesByContentId = LoadSchedules(contentById.Values, contentConditions);

        var matchingResults = new List<ISearchResult>(orderedResults.Count);

        foreach (var searchResult in orderedResults)
        {
            var id = int.Parse(searchResult.Id, System.Globalization.CultureInfo.InvariantCulture);
            if (!contentById.TryGetValue(id, out IContent? content))
            {
                continue;
            }

            schedulesByContentId.TryGetValue(content.Id, out ContentScheduleCollection? schedules);

            if (FilterConditionContentEvaluator.Matches(
                    content,
                    contentConditions,
                    filterType,
                    cultureContext,
                    _contentTypeService,
                    schedules))
            {
                matchingResults.Add(searchResult);
            }
        }

        return matchingResults;
    }

    private Dictionary<int, ContentScheduleCollection> LoadSchedules(
        IEnumerable<IContent> contents,
        IReadOnlyList<FilterCondition> contentConditions)
    {
        if (!contentConditions.Any(static condition =>
                PublishStatusFilterValues.IsPublishStatusProperty(condition.PropertyAlias)))
        {
            return [];
        }

        var keys = contents
            .Select(static content => content.Key)
            .Distinct()
            .ToArray();

        if (keys.Length == 0)
        {
            return [];
        }

        IDictionary<int, IEnumerable<ContentSchedule>> schedulesById =
            _contentService.GetContentSchedulesByIds(keys);

        return contents
            .DistinctBy(static content => content.Id)
            .ToDictionary(
                static content => content.Id,
                content => ContentPublishStatusEvaluator.ToScheduleCollection(
                    schedulesById.TryGetValue(content.Id, out IEnumerable<ContentSchedule>? schedules)
                        ? schedules
                        : []));
    }

    private sealed class SearchResultsAdapter : ISearchResults
    {
        private readonly IReadOnlyList<ISearchResult> _results;

        public SearchResultsAdapter(IReadOnlyList<ISearchResult> results, long totalItemCount)
        {
            _results = results;
            TotalItemCount = totalItemCount;
        }

        public long TotalItemCount { get; }

        public IEnumerator<ISearchResult> GetEnumerator() => _results.GetEnumerator();

        System.Collections.IEnumerator System.Collections.IEnumerable.GetEnumerator() => GetEnumerator();
    }

    /// <inheritdoc />
    public Task<NodeSearchResult?> GetNodeByKeyAsync(
        Guid key,
        CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        if (key == Guid.Empty)
        {
            return Task.FromResult<NodeSearchResult?>(null);
        }

        IContent? content = _contentService.GetById(key);
        if (content is null)
        {
            _logger.LogDebug("Content node with key {ContentKey} was not found.", key);
            return Task.FromResult<NodeSearchResult?>(null);
        }

        return Task.FromResult<NodeSearchResult?>(_mapper.Map(content));
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<NodeSearchResult>> GetNodesByKeysAsync(
        IReadOnlyList<Guid> keys,
        CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        if (keys.Count == 0)
        {
            return [];
        }

        if (keys.Count > PaginationConstants.MaxKeyBatchSize)
        {
            _logger.LogWarning(
                "Requested hydration for {KeyCount} keys exceeds the batch limit of {MaxBatchSize}. Only the first batch will be processed.",
                keys.Count,
                PaginationConstants.MaxKeyBatchSize);
        }

        var distinctKeys = keys
            .Where(static key => key != Guid.Empty)
            .Distinct()
            .Take(PaginationConstants.MaxKeyBatchSize)
            .ToArray();

        var resolved = new Dictionary<Guid, IContent>(distinctKeys.Length);

        if (distinctKeys.Length <= 10)
        {
            ResolveKeysDirectly(distinctKeys, resolved);
        }
        else
        {
            await ResolveKeysViaExamineAsync(distinctKeys, resolved, cancellationToken).ConfigureAwait(false);
        }

        var results = new List<NodeSearchResult>(keys.Count);

        foreach (var key in keys)
        {
            if (resolved.TryGetValue(key, out IContent? content))
            {
                results.Add(_mapper.Map(content));
            }
        }

        return results;
    }

    private static IBooleanOperation CreateBaseQuery(IIndex index)
    {
        return index.Searcher
            .CreateQuery(IndexTypes.Content)
            .GroupedNot(new[] { FilterNodesExamineFields.Trashed }, new[] { "y" });
    }

    private static IOrdering ApplySorting(IBooleanOperation query, ContentSearchOptions searchOptions)
    {
        var sortableField = new SortableField(
            searchOptions.SortField,
            ResolveSortType(searchOptions.SortField));

        return searchOptions.SortDirection == SortDirection.Ascending
            ? query.OrderBy(sortableField)
            : query.OrderByDescending(sortableField);
    }

    private static SortType ResolveSortType(string sortField)
    {
        if (sortField.Equals(FilterNodesExamineFields.UpdateDate, StringComparison.OrdinalIgnoreCase)
            || sortField.Equals(FilterNodesExamineFields.CreateDate, StringComparison.OrdinalIgnoreCase)
            || sortField.Equals(FilterNodesExamineFields.SortOrder, StringComparison.OrdinalIgnoreCase)
            || sortField.Equals(FilterNodesExamineFields.NodeId, StringComparison.OrdinalIgnoreCase))
        {
            return SortType.Long;
        }

        return SortType.String;
    }

    private IReadOnlyList<NodeSearchResult> HydrateSearchResults(
        ISearchResults searchResults,
        ContentSearchOptions searchOptions)
    {
        if (!searchResults.Any())
        {
            return [];
        }

        var orderedResults = searchResults.ToList();
        var ids = orderedResults
            .Select(static result => int.Parse(result.Id, System.Globalization.CultureInfo.InvariantCulture))
            .ToArray();

        var contentById = _contentService
            .GetByIds(ids)
            .ToDictionary(static content => content.Id);

        var parentIds = contentById.Values
            .Select(static content => content.ParentId)
            .Where(static parentId => parentId > 0)
            .Distinct()
            .ToArray();

        var parentsById = parentIds.Length == 0
            ? new Dictionary<int, IContent>()
            : _contentService
                .GetByIds(parentIds)
                .ToDictionary(static parent => parent.Id);

        var items = new List<NodeSearchResult>(orderedResults.Count);

        foreach (var searchResult in orderedResults)
        {
            var id = int.Parse(searchResult.Id, System.Globalization.CultureInfo.InvariantCulture);
            if (!contentById.TryGetValue(id, out IContent? content))
            {
                _logger.LogWarning("Examine result id {ContentId} could not be resolved via IContentService.", id);
                continue;
            }

            var mapped = _mapper.Map(
                content,
                searchResult,
                new NodeSearchResultMappingOptions
                {
                    SearchCultureContext = searchOptions.SearchCultureContext,
                    MatchedCultureDisplayName = searchOptions.MatchedCultureDisplayName,
                });

            if (content.ParentId > 0
                && parentsById.TryGetValue(content.ParentId, out IContent? parent))
            {
                mapped = mapped with
                {
                    ParentKey = parent.Key,
                    ParentName = parent.Name,
                };
            }

            items.Add(mapped);
        }

        return items;
    }

    private void ResolveKeysDirectly(IReadOnlyList<Guid> keys, IDictionary<Guid, IContent> resolved)
    {
        foreach (var key in keys)
        {
            if (resolved.ContainsKey(key))
            {
                continue;
            }

            IContent? content = _contentService.GetById(key);
            if (content is not null)
            {
                resolved[key] = content;
            }
        }
    }

    private async Task ResolveKeysViaExamineAsync(
        IReadOnlyList<Guid> keys,
        IDictionary<Guid, IContent> resolved,
        CancellationToken cancellationToken)
    {
        if (!_examineManager.TryGetIndex(global::Umbraco.Cms.Core.Constants.UmbracoIndexes.InternalIndexName, out IIndex? index) || index is null)
        {
            ResolveKeysDirectly(keys, resolved);
            return;
        }

        const int chunkSize = 50;

        foreach (var keyChunk in keys.Chunk(chunkSize))
        {
            cancellationToken.ThrowIfCancellationRequested();

            var fields = keyChunk.Select(static _ => FilterNodesExamineFields.NodeKey).ToArray();
            var values = keyChunk.Select(static key => key.ToString("D")).ToArray();

            var searchResults = await Task.Run(
                () => index.Searcher
                    .CreateQuery(IndexTypes.Content)
                    .GroupedOr(fields, values)
                    .Execute(),
                cancellationToken).ConfigureAwait(false);

            var ids = searchResults
                .Select(static result => int.Parse(result.Id, System.Globalization.CultureInfo.InvariantCulture))
                .ToArray();

            foreach (var content in _contentService.GetByIds(ids))
            {
                resolved[content.Key] = content;
            }
        }
    }

    private static PagedRequest NormalizePaging(PagedRequest paging)
    {
        var page = paging.Page < 1 ? 1 : paging.Page;
        var pageSize = paging.PageSize < 1
            ? PaginationConstants.DefaultPageSize
            : Math.Min(paging.PageSize, PaginationConstants.MaxPageSize);

        return paging with { Page = page, PageSize = pageSize };
    }
}

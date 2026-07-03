using Examine;
using Examine.Search;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Phases.Umbraco.ContentSearch.Configuration;
using Phases.Umbraco.ContentSearch.Examine;
using Phases.Umbraco.ContentSearch.Metadata.Constants;
using Phases.Umbraco.ContentSearch.Models;
using Phases.Umbraco.ContentSearch.Search.Mapping;
using Phases.Umbraco.ContentSearch.Search.Models;
using Phases.Umbraco.ContentSearch.Search.Normalization;
using Phases.Umbraco.ContentSearch.Services;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Models.Membership;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Infrastructure.Examine;
using Umbraco.Extensions;

namespace Phases.Umbraco.ContentSearch.Search;

/// <summary>
/// Executes content search exclusively through the external Examine index.
/// </summary>
public sealed class ExamineSearchPipeline : IExamineSearchPipeline
{
    private readonly IExamineManager _examineManager;
    private readonly IExamineIndexResolver _indexResolver;
    private readonly IContentSearchRequestNormalizer _requestNormalizer;
    private readonly IContentSearchExamineQueryBuilder _queryBuilder;
    private readonly IContentSearchResultMapper _resultMapper;
    private readonly IContentSearchUserAccessService _userAccessService;
    private readonly IContentSearchResultEnricher _resultEnricher;
    private readonly IContentService _contentService;
    private readonly IContentTypeService _contentTypeService;
    private readonly ILogger<ExamineSearchPipeline> _logger;
    private readonly ContentSearchOptions _options;

    /// <summary>
    /// Initializes a new instance of the <see cref="ExamineSearchPipeline"/> class.
    /// </summary>
    public ExamineSearchPipeline(
        IExamineManager examineManager,
        IExamineIndexResolver indexResolver,
        IContentSearchRequestNormalizer requestNormalizer,
        IContentSearchExamineQueryBuilder queryBuilder,
        IContentSearchResultMapper resultMapper,
        IContentSearchUserAccessService userAccessService,
        IContentSearchResultEnricher resultEnricher,
        IContentService contentService,
        IContentTypeService contentTypeService,
        ILogger<ExamineSearchPipeline> logger,
        IOptions<ContentSearchOptions> options)
    {
        _examineManager = examineManager;
        _indexResolver = indexResolver;
        _requestNormalizer = requestNormalizer;
        _queryBuilder = queryBuilder;
        _resultMapper = resultMapper;
        _userAccessService = userAccessService;
        _resultEnricher = resultEnricher;
        _contentService = contentService;
        _contentTypeService = contentTypeService;
        _logger = logger;
        _options = options.Value;
    }

    /// <inheritdoc />
    public async Task<ContentSearchResult> ExecuteAsync(
        ContentSearchRequest request,
        CancellationToken cancellationToken = default,
        int? pageSizeCap = null)
    {
        ArgumentNullException.ThrowIfNull(request);
        cancellationToken.ThrowIfCancellationRequested();

        if (request.Domain != SearchDomain.Content)
        {
            throw new NotSupportedException(
                $"Search domain '{request.Domain}' is not supported yet. Only content search is available.");
        }

        if (request.Conditions.Count == 0)
        {
            return new ContentSearchResult();
        }

        var normalizedRequest = await _requestNormalizer
            .NormalizeAsync(request, cancellationToken, pageSizeCap)
            .ConfigureAwait(false);

        var executionPlan = ContentSearchExecutionPlanner.Create(normalizedRequest);

        IUser currentUser = _userAccessService.GetRequiredCurrentUser();

        if (HasPublishStatusFilter(executionPlan))
        {
            var publishStatusQuery = await TryBuildSortedQueryAsync(
                executionPlan,
                normalizedRequest,
                useInternalContentIndex: true,
                cancellationToken).ConfigureAwait(false);

            if (publishStatusQuery is null)
            {
                return new ContentSearchResult();
            }

            if (_userAccessService.HasUnrestrictedContentAccess(currentUser))
            {
                return normalizedRequest.CultureContext.IsSingleCulture
                    ? ExecutePublishStatusForUnrestrictedSingleCulture(
                        publishStatusQuery,
                        normalizedRequest,
                        executionPlan,
                        currentUser)
                    : ExecuteForUnrestrictedUserAllCultures(
                        publishStatusQuery,
                        normalizedRequest,
                        executionPlan,
                        currentUser);
            }

            return normalizedRequest.CultureContext.IsSingleCulture
                ? ExecutePublishStatusForRestrictedSingleCulture(
                    publishStatusQuery,
                    normalizedRequest,
                    executionPlan,
                    currentUser,
                    cancellationToken)
                : ExecuteForRestrictedUserAllCultures(
                    publishStatusQuery,
                    normalizedRequest,
                    executionPlan,
                    currentUser,
                    cancellationToken);
        }

        var indexName = _indexResolver.ResolveIndexName(normalizedRequest.Domain, useInternalContentIndex: false);

        if (!_examineManager.TryGetIndex(indexName, out IIndex? index) || index is null)
        {
            _logger.LogWarning("Examine index '{IndexName}' was not found.", indexName);
            return new ContentSearchResult();
        }

        var baseQuery = index.Searcher
            .CreateQuery(IndexTypes.Content)
            .GroupedNot([ContentSearchExamineFields.Trashed], ["y"]);

        var filteredQuery = await _queryBuilder
            .BuildAsync(executionPlan.ExamineRequest, baseQuery, cancellationToken)
            .ConfigureAwait(false);

        var sortedQuery = ApplySorting(filteredQuery, normalizedRequest.Sort);

        if (_userAccessService.HasUnrestrictedContentAccess(currentUser))
        {
            return normalizedRequest.CultureContext.IsSingleCulture
                ? ExecuteForUnrestrictedUser(sortedQuery, normalizedRequest, executionPlan, currentUser)
                : ExecuteForUnrestrictedUserAllCultures(sortedQuery, normalizedRequest, executionPlan, currentUser);
        }

        return normalizedRequest.CultureContext.IsSingleCulture
            ? ExecuteForRestrictedUser(
                sortedQuery,
                normalizedRequest,
                executionPlan,
                currentUser,
                cancellationToken)
            : ExecuteForRestrictedUserAllCultures(
                sortedQuery,
                normalizedRequest,
                executionPlan,
                currentUser,
                cancellationToken);
    }

    private static bool HasPublishStatusFilter(ContentSearchExecutionPlan executionPlan)
        => executionPlan.ContentConditions.Any(static condition =>
            PublishStatusFilterValues.IsPublishStatusProperty(condition.PropertyAlias));

    private async Task<IOrdering?> TryBuildSortedQueryAsync(
        ContentSearchExecutionPlan executionPlan,
        NormalizedContentSearchRequest normalizedRequest,
        bool useInternalContentIndex,
        CancellationToken cancellationToken)
    {
        var indexName = _indexResolver.ResolveIndexName(
            normalizedRequest.Domain,
            useInternalContentIndex);

        if (!_examineManager.TryGetIndex(indexName, out IIndex? index) || index is null)
        {
            _logger.LogWarning("Examine index '{IndexName}' was not found.", indexName);
            return null;
        }

        var baseQuery = index.Searcher
            .CreateQuery(IndexTypes.Content)
            .GroupedNot([ContentSearchExamineFields.Trashed], ["y"]);

        var filteredQuery = await _queryBuilder
            .BuildAsync(executionPlan.ExamineRequest, baseQuery, cancellationToken)
            .ConfigureAwait(false);

        return ApplySorting(filteredQuery, normalizedRequest.Sort);
    }

    private ContentSearchResult ExecutePublishStatusForUnrestrictedSingleCulture(
        IOrdering sortedQuery,
        NormalizedContentSearchRequest normalizedRequest,
        ContentSearchExecutionPlan executionPlan,
        IUser currentUser)
    {
        var (pageItems, totalMatches) = CollectPagedItems(
            sortedQuery,
            normalizedRequest,
            executionPlan,
            currentUser,
            enrichDuringCollection: false);

        var enrichedItems = _resultEnricher.Enrich(pageItems, CreateEnrichmentContext(normalizedRequest));

        return new ContentSearchResult
        {
            EntityIds = enrichedItems.Select(static item => item.Id).ToArray(),
            Items = enrichedItems,
            TotalMatches = totalMatches,
        };
    }

    private ContentSearchResult ExecutePublishStatusForRestrictedSingleCulture(
        IOrdering sortedQuery,
        NormalizedContentSearchRequest normalizedRequest,
        ContentSearchExecutionPlan executionPlan,
        IUser currentUser,
        CancellationToken cancellationToken)
    {
        var (pageItems, totalMatches) = CollectPagedItems(
            sortedQuery,
            normalizedRequest,
            executionPlan,
            currentUser,
            enrichDuringCollection: false,
            cancellationToken: cancellationToken);

        var enrichedItems = _resultEnricher.Enrich(pageItems, CreateEnrichmentContext(normalizedRequest));

        return new ContentSearchResult
        {
            EntityIds = enrichedItems.Select(static item => item.Id).ToArray(),
            Items = enrichedItems,
            TotalMatches = totalMatches,
        };
    }

    private ContentSearchResult ExecuteForUnrestrictedUserAllCultures(
        IOrdering sortedQuery,
        NormalizedContentSearchRequest normalizedRequest,
        ContentSearchExecutionPlan executionPlan,
        IUser currentUser)
    {
        var (pageItems, totalMatches) = CollectPagedItems(
            sortedQuery,
            normalizedRequest,
            executionPlan,
            currentUser,
            enrichDuringCollection: true);

        return new ContentSearchResult
        {
            EntityIds = pageItems.Select(static item => item.Id).ToArray(),
            Items = pageItems,
            TotalMatches = totalMatches,
        };
    }

    private ContentSearchResult ExecuteForRestrictedUserAllCultures(
        IOrdering sortedQuery,
        NormalizedContentSearchRequest normalizedRequest,
        ContentSearchExecutionPlan executionPlan,
        IUser currentUser,
        CancellationToken cancellationToken)
    {
        var (pageItems, totalMatches) = CollectPagedItems(
            sortedQuery,
            normalizedRequest,
            executionPlan,
            currentUser,
            enrichDuringCollection: true,
            cancellationToken: cancellationToken);

        return new ContentSearchResult
        {
            EntityIds = pageItems.Select(static item => item.Id).ToArray(),
            Items = pageItems,
            TotalMatches = totalMatches,
        };
    }

    private (IReadOnlyList<ContentSearchResultItem> PageItems, long TotalMatches) CollectPagedItems(
        IOrdering sortedQuery,
        NormalizedContentSearchRequest normalizedRequest,
        ContentSearchExecutionPlan executionPlan,
        IUser currentUser,
        bool enrichDuringCollection,
        CancellationToken cancellationToken = default)
    {
        const int batchSize = 250;
        var pageSize = normalizedRequest.PageSize;
        var targetSkip = normalizedRequest.PageIndex * pageSize;
        var maxScanRows = _options.MaxExpansionRows;
        var pageItems = new List<ContentSearchResultItem>(pageSize);
        var examineOffset = 0;
        long matchTotal = 0;
        long examineTotal = 0;
        var truncated = false;

        while (true)
        {
            cancellationToken.ThrowIfCancellationRequested();

            var batch = sortedQuery.Execute(new QueryOptions(examineOffset, batchSize));
            examineTotal = batch.TotalItemCount;

            if (examineTotal == 0 || examineOffset >= examineTotal)
            {
                break;
            }

            if (examineOffset >= _options.MaxRestrictedScanRows)
            {
                truncated = true;
                _logger.LogWarning(
                    "Search scan stopped after reaching MaxRestrictedScanRows ({MaxScanRows}).",
                    _options.MaxRestrictedScanRows);
                break;
            }

            var mappedItems = _resultMapper.Map(
                batch,
                normalizedRequest.CultureContext,
                normalizedRequest.Conditions);
            var accessibleItems = _userAccessService.FilterAccessibleResults(currentUser, mappedItems);
            accessibleItems = FilterByContentConditions(
                accessibleItems,
                executionPlan,
                normalizedRequest);

            if (enrichDuringCollection)
            {
                accessibleItems = _resultEnricher.Enrich(
                    accessibleItems,
                    CreateEnrichmentContext(normalizedRequest));
            }

            foreach (var item in accessibleItems)
            {
                if (matchTotal >= targetSkip && pageItems.Count < pageSize)
                {
                    pageItems.Add(item);
                }

                matchTotal++;

                if (matchTotal >= maxScanRows)
                {
                    truncated = true;
                    _logger.LogWarning(
                        "Search expansion stopped after reaching MaxExpansionRows ({MaxExpansionRows}).",
                        maxScanRows);
                    break;
                }
            }

            if (truncated || (pageItems.Count >= pageSize && matchTotal >= targetSkip + pageSize))
            {
                break;
            }

            examineOffset += batchSize;
        }

        return (pageItems, matchTotal);
    }

    private ContentSearchResult ExecuteForUnrestrictedUser(
        IOrdering sortedQuery,
        NormalizedContentSearchRequest normalizedRequest,
        ContentSearchExecutionPlan executionPlan,
        IUser currentUser)
    {
        var skip = normalizedRequest.PageIndex * normalizedRequest.PageSize;
        var results = sortedQuery.Execute(new QueryOptions(skip, normalizedRequest.PageSize));

        var items = _resultMapper.Map(results, normalizedRequest.CultureContext, normalizedRequest.Conditions);
        items = _userAccessService.FilterAccessibleResults(currentUser, items);
        items = FilterByContentConditions(items, executionPlan, normalizedRequest);
        items = _resultEnricher.Enrich(items, CreateEnrichmentContext(normalizedRequest));

        return new ContentSearchResult
        {
            EntityIds = items.Select(static item => item.Id).ToArray(),
            Items = items,
            TotalMatches = results.TotalItemCount,
        };
    }

    private ContentSearchResult ExecuteForRestrictedUser(
        IOrdering sortedQuery,
        NormalizedContentSearchRequest normalizedRequest,
        ContentSearchExecutionPlan executionPlan,
        IUser currentUser,
        CancellationToken cancellationToken)
    {
        var pageSize = normalizedRequest.PageSize;
        var targetSkip = normalizedRequest.PageIndex * pageSize;
        var batchSize = Math.Max(pageSize, 100);
        var examineOffset = 0;
        var pageItems = new List<ContentSearchResultItem>(pageSize);
        long accessibleTotal = 0;
        long examineTotal = 0;

        while (true)
        {
            cancellationToken.ThrowIfCancellationRequested();

            if (examineOffset >= _options.MaxRestrictedScanRows)
            {
                _logger.LogWarning(
                    "Restricted-user search scan stopped after reaching MaxRestrictedScanRows ({MaxScanRows}).",
                    _options.MaxRestrictedScanRows);
                break;
            }

            var batch = sortedQuery.Execute(new QueryOptions(examineOffset, batchSize));
            examineTotal = batch.TotalItemCount;

            if (examineTotal == 0 || examineOffset >= examineTotal)
            {
                break;
            }

            var mappedItems = _resultMapper.Map(batch, normalizedRequest.CultureContext, normalizedRequest.Conditions);
            var accessibleItems = _userAccessService.FilterAccessibleResults(currentUser, mappedItems);

            foreach (var item in accessibleItems)
            {
                if (!MatchesContentConditions(item, executionPlan, normalizedRequest))
                {
                    continue;
                }

                if (accessibleTotal >= targetSkip && pageItems.Count < pageSize)
                {
                    pageItems.Add(item);
                }

                accessibleTotal++;
            }

            examineOffset += batchSize;
        }

        var enrichedItems = _resultEnricher.Enrich(pageItems, CreateEnrichmentContext(normalizedRequest));

        return new ContentSearchResult
        {
            EntityIds = enrichedItems.Select(static item => item.Id).ToArray(),
            Items = enrichedItems,
            TotalMatches = accessibleTotal,
        };
    }

    private IReadOnlyList<ContentSearchResultItem> FilterByContentConditions(
        IReadOnlyList<ContentSearchResultItem> items,
        ContentSearchExecutionPlan executionPlan,
        NormalizedContentSearchRequest normalizedRequest)
    {
        if (!executionPlan.RequiresContentEvaluation || items.Count == 0)
        {
            return items;
        }

        var culture = normalizedRequest.CultureContext.IsSingleCulture
            ? normalizedRequest.CultureContext.Culture
            : null;

        var conditionsToApply = normalizedRequest.CultureContext.IsSingleCulture
            ? executionPlan.ContentConditions
            : executionPlan.ContentConditions
                .Where(static condition =>
                    PublishStatusFilterValues.IsPublishStatusProperty(condition.PropertyAlias))
                .ToArray();

        if (conditionsToApply.Count == 0)
        {
            return items;
        }

        var contents = _contentService
            .GetByIds(items.Select(item => item.Id))
            .ToDictionary(content => content.Id);

        var schedulesByContentId = LoadSchedules(contents.Values, conditionsToApply);

        return items
            .Where(item => contents.TryGetValue(item.Id, out var content)
                && SearchConditionContentEvaluator.Matches(
                    content,
                    conditionsToApply,
                    normalizedRequest.MatchMode,
                    culture,
                    _contentTypeService,
                    schedulesByContentId.GetValueOrDefault(content.Id)))
            .ToArray();
    }

    private bool MatchesContentConditions(
        ContentSearchResultItem item,
        ContentSearchExecutionPlan executionPlan,
        NormalizedContentSearchRequest normalizedRequest)
    {
        if (!executionPlan.RequiresContentEvaluation
            || !normalizedRequest.CultureContext.IsSingleCulture)
        {
            return true;
        }

        IContent? content = _contentService.GetById(item.Id);
        if (content is null)
        {
            return false;
        }

        ContentScheduleCollection? schedules = null;
        if (executionPlan.ContentConditions.Any(static condition =>
                PublishStatusFilterValues.IsPublishStatusProperty(condition.PropertyAlias)))
        {
            schedules = _contentService.GetContentScheduleByContentId(content.Key);
        }

        return SearchConditionContentEvaluator.Matches(
            content,
            executionPlan.ContentConditions,
            normalizedRequest.MatchMode,
            normalizedRequest.CultureContext.Culture,
            _contentTypeService,
            schedules);
    }

    private Dictionary<int, ContentScheduleCollection> LoadSchedules(
        IEnumerable<IContent> contents,
        IReadOnlyList<NormalizedSearchCondition> contentConditions)
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

    private static ContentSearchEnrichmentContext CreateEnrichmentContext(
        NormalizedContentSearchRequest normalizedRequest)
        => new()
        {
            CultureContext = normalizedRequest.CultureContext,
            Conditions = normalizedRequest.Conditions,
            MatchMode = normalizedRequest.MatchMode,
        };

    private static IOrdering ApplySorting(IBooleanOperation query, ContentSearchSortOptions sort)
    {
        var sortableField = new SortableField(
            sort.Field,
            ResolveSortType(sort.Field));

        return sort.Descending
            ? query.OrderByDescending(sortableField)
            : query.OrderBy(sortableField);
    }

    private static SortType ResolveSortType(string field)
    {
        if (field.Equals(ContentSearchExamineFields.CreateDate, StringComparison.OrdinalIgnoreCase)
            || field.Equals(ContentSearchExamineFields.UpdateDate, StringComparison.OrdinalIgnoreCase)
            || field.Equals(ContentSearchExamineFields.Path, StringComparison.OrdinalIgnoreCase))
        {
            return SortType.Long;
        }

        return SortType.String;
    }
}

using Microsoft.Extensions.Logging;
using Phases.Umbraco.FilterNodes.Constants;
using Phases.Umbraco.FilterNodes.Exceptions;
using Phases.Umbraco.FilterNodes.Models.Enums;
using Phases.Umbraco.FilterNodes.Models.Examine;
using Phases.Umbraco.FilterNodes.Models.Requests;
using Phases.Umbraco.FilterNodes.Models.Responses;
using Phases.Umbraco.FilterNodes.Repositories.Interfaces;
using Phases.Umbraco.FilterNodes.Repositories.Mappers;
using Phases.Umbraco.FilterNodes.Services.Interfaces;
using Phases.Umbraco.FilterNodes.Services.Normalization;
using Phases.Umbraco.FilterNodes.Services.Validation;

namespace Phases.Umbraco.FilterNodes.Services;

/// <summary>
/// Default implementation of <see cref="INodeFilterService"/>.
/// </summary>
public sealed class NodeFilterService : INodeFilterService
{
    private readonly IContentRepository _contentRepository;
    private readonly IFilterRequestValidator _validator;
    private readonly IFilterRequestNormalizer _normalizer;
    private readonly ILanguageQueryService _languageQueryService;
    private readonly ILogger<NodeFilterService> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="NodeFilterService"/> class.
    /// </summary>
    /// <param name="contentRepository">The content repository.</param>
    /// <param name="validator">The filter request validator.</param>
    /// <param name="normalizer">The filter request normalizer.</param>
    /// <param name="languageQueryService">The language query service.</param>
    /// <param name="logger">The logger.</param>
    public NodeFilterService(
        IContentRepository contentRepository,
        IFilterRequestValidator validator,
        IFilterRequestNormalizer normalizer,
        ILanguageQueryService languageQueryService,
        ILogger<NodeFilterService> logger)
    {
        _contentRepository = contentRepository;
        _validator = validator;
        _normalizer = normalizer;
        _languageQueryService = languageQueryService;
        _logger = logger;
    }

    /// <inheritdoc />
    public async Task<PagedResponse<NodeSearchResult>> FilterAsync(
        FilterRequest request,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request);
        cancellationToken.ThrowIfCancellationRequested();

        try
        {
            _validator.Validate(request);
        }
        catch (FilterRequestValidationException ex)
        {
            _logger.LogWarning(
                ex,
                "Filter request validation failed with {ErrorCount} error(s).",
                ex.Errors.Count);
            throw;
        }

        var normalizedRequest = _normalizer.Normalize(request);
        var searchOptions = BuildSearchOptions(normalizedRequest);

        _logger.LogInformation(
            "Executing node filter. ConditionCount={ConditionCount}, FilterType={FilterType}, Page={Page}, PageSize={PageSize}.",
            normalizedRequest.Conditions.Count,
            normalizedRequest.FilterType,
            normalizedRequest.Paging.Page,
            normalizedRequest.Paging.PageSize);

        var results = await _contentRepository
            .SearchAsync(normalizedRequest, searchOptions, cancellationToken)
            .ConfigureAwait(false);

        _logger.LogDebug(
            "Node filter completed. Returned={ReturnedCount}, Total={TotalCount}.",
            results.Items.Count,
            results.TotalCount);

        return results;
    }

    private ContentSearchOptions BuildSearchOptions(FilterRequest request)
    {
        var cultureContext = SearchCultureContext.FromRequest(
            request.SearchCultureMode,
            request.Culture);

        string? matchedCultureDisplayName = cultureContext.IsSingleCulture
            ? _languageQueryService.GetCultureDisplayName(cultureContext.Culture!)
            : null;

        if (!string.IsNullOrWhiteSpace(request.Sort?.Field))
        {
            return new ContentSearchOptions
            {
                SortField = request.Sort.Field,
                SortDirection = request.Sort.Direction,
                SearchCultureContext = cultureContext,
                MatchedCultureDisplayName = matchedCultureDisplayName,
            };
        }

        return new ContentSearchOptions
        {
            SortField = ResolveDefaultSortField(request),
            SortDirection = SortDirection.Ascending,
            SearchCultureContext = cultureContext,
            MatchedCultureDisplayName = matchedCultureDisplayName,
        };
    }

    private static string ResolveDefaultSortField(FilterRequest request)
    {
        var updatedDateCondition = request.Conditions.FirstOrDefault(FilterConditionClassifier.IsUpdatedDateCondition);
        if (updatedDateCondition is not null)
        {
            return FilterNodesExamineFields.UpdateDate;
        }

        var createdDateCondition = request.Conditions.FirstOrDefault(FilterConditionClassifier.IsCreatedDateCondition);
        if (createdDateCondition is not null)
        {
            return FilterNodesExamineFields.CreateDate;
        }

        return FilterNodesExamineFields.NodeName;
    }
}

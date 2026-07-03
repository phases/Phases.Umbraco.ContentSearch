using Microsoft.Extensions.Options;
using Phases.Umbraco.ContentSearch.Configuration;
using Phases.Umbraco.ContentSearch.Examine;
using Phases.Umbraco.ContentSearch.Metadata.Constants;
using Phases.Umbraco.ContentSearch.Metadata.Discovery;
using Phases.Umbraco.ContentSearch.Metadata.Models;
using Phases.Umbraco.ContentSearch.Models;
using Phases.Umbraco.ContentSearch.Models.Enums;
using Phases.Umbraco.ContentSearch.Search.Enums;
using Phases.Umbraco.ContentSearch.Search.Models;
using Phases.Umbraco.ContentSearch.Search.Sorting;
using Phases.Umbraco.ContentSearch.Search.Operators;
using Phases.Umbraco.ContentSearch.Services;

namespace Phases.Umbraco.ContentSearch.Search.Normalization;

/// <summary>
/// Normalizes search requests by resolving operators and Examine fields.
/// </summary>
public interface IContentSearchRequestNormalizer
{
    /// <summary>
    /// Normalizes a search request for Examine execution.
    /// </summary>
    /// <param name="request">The incoming request.</param>
    /// <param name="cancellationToken">A token to cancel the operation.</param>
    /// <param name="pageSizeCap">Optional page size cap override (for example export requests).</param>
    /// <returns>The normalized request.</returns>
    Task<NormalizedContentSearchRequest> NormalizeAsync(
        ContentSearchRequest request,
        CancellationToken cancellationToken = default,
        int? pageSizeCap = null);
}

/// <summary>
/// Default implementation of <see cref="IContentSearchRequestNormalizer"/>.
/// </summary>
public sealed class ContentSearchRequestNormalizer : IContentSearchRequestNormalizer
{
    private readonly IContentSearchMetadataService _metadataService;
    private readonly IContentSearchFieldResolver _fieldResolver;
    private readonly ISearchOperatorResolver _operatorResolver;
    private readonly ContentSearchOptions _options;

    /// <summary>
    /// Initializes a new instance of the <see cref="ContentSearchRequestNormalizer"/> class.
    /// </summary>
    public ContentSearchRequestNormalizer(
        IContentSearchMetadataService metadataService,
        IContentSearchFieldResolver fieldResolver,
        ISearchOperatorResolver operatorResolver,
        IOptions<ContentSearchOptions> options)
    {
        _metadataService = metadataService;
        _fieldResolver = fieldResolver;
        _operatorResolver = operatorResolver;
        _options = options.Value;
    }

    /// <inheritdoc />
    public async Task<NormalizedContentSearchRequest> NormalizeAsync(
        ContentSearchRequest request,
        CancellationToken cancellationToken = default,
        int? pageSizeCap = null)
    {
        ArgumentNullException.ThrowIfNull(request);
        cancellationToken.ThrowIfCancellationRequested();

        var cultureContext = SearchCultureContext.FromRequest(
            request.SearchCultureMode,
            request.Culture);

        var normalizedConditions = new List<NormalizedSearchCondition>();

        foreach (var condition in request.Conditions)
        {
            cancellationToken.ThrowIfCancellationRequested();

            if (string.IsNullOrWhiteSpace(condition.ContentTypeAlias)
                || string.IsNullOrWhiteSpace(condition.PropertyAlias)
                || string.IsNullOrWhiteSpace(condition.Operator))
            {
                continue;
            }

            var metadata = await ResolvePropertyMetadataAsync(
                condition.ContentTypeAlias,
                condition.PropertyAlias,
                cancellationToken).ConfigureAwait(false);

            var resolvedOperator = _operatorResolver.ResolveOperator(condition.Operator);
            var comparisonValues = new NormalizedSearchConditionValues();
            _operatorResolver.ResolveComparisonValues(
                comparisonValues,
                metadata,
                resolvedOperator,
                condition.Value);

            var resolution = _fieldResolver.Resolve(
                condition.PropertyAlias.Trim(),
                metadata,
                cultureContext);

            normalizedConditions.Add(new NormalizedSearchCondition
            {
                ContentTypeAlias = condition.ContentTypeAlias.Trim(),
                PropertyAlias = condition.PropertyAlias.Trim(),
                Operator = resolvedOperator,
                Value = comparisonValues.Value,
                FromDate = comparisonValues.FromDate,
                ToDate = comparisonValues.ToDate,
                FromNumber = comparisonValues.FromNumber,
                ToNumber = comparisonValues.ToNumber,
                ResolvedExamineFieldNames = resolution.FieldNames,
                ResolutionStrategy = resolution.Strategy,
                Metadata = metadata,
            });
        }

        var maxPageSize = pageSizeCap ?? _options.MaxPageSize;
        var pageSize = request.PageSize < 1
            ? _options.DefaultPageSize
            : Math.Min(request.PageSize, maxPageSize);

        return new NormalizedContentSearchRequest
        {
            Domain = request.Domain,
            MatchMode = request.MatchMode,
            CultureContext = cultureContext,
            Conditions = normalizedConditions,
            PageIndex = request.PageIndex < 0 ? 0 : request.PageIndex,
            PageSize = pageSize,
            Sort = new ContentSearchSortOptions
            {
                Field = ContentSearchSortFieldResolver.ResolveField(request.SortColumn),
                Descending = request.SortDescending,
            },
        };
    }

    private async Task<SearchablePropertyMetadata?> ResolvePropertyMetadataAsync(
        string contentTypeAlias,
        string propertyAlias,
        CancellationToken cancellationToken)
    {
        if (ContentSearchMetadataConstants.IsWildcardContentTypeAlias(contentTypeAlias))
        {
            return ResolveWildcardPropertyMetadata(propertyAlias);
        }

        var properties = await _metadataService
            .GetPropertiesAsync(contentTypeAlias, MetadataDomain.Content, cancellationToken)
            .ConfigureAwait(false);

        return properties.FirstOrDefault(property =>
            property.Alias.Equals(propertyAlias, StringComparison.OrdinalIgnoreCase));
    }

    private static SearchablePropertyMetadata? ResolveWildcardPropertyMetadata(string propertyAlias)
    {
        if (IsKnownSystemProperty(propertyAlias))
        {
            return SearchablePropertyMetadataResolver.ResolveSystemProperty(propertyAlias);
        }

        return new SearchablePropertyMetadata
        {
            Alias = propertyAlias,
            Name = propertyAlias,
            EditorAlias = "Umbraco.TextBox",
            GroupName = ContentSearchMetadataSourceGroups.SystemGroupName,
            GroupSortOrder = ContentSearchMetadataSourceGroups.GetGroupSortOrder(
                PropertyMetadataSourceCategory.System),
            SourceCategory = PropertyMetadataSourceCategory.System,
            VariesByCulture = false,
        };
    }

    private static bool IsKnownSystemProperty(string propertyAlias)
        => ContentSearchMetadataConstants.IsWildcardSystemProperty(propertyAlias);
}

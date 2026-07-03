using Phases.Umbraco.FilterNodes.Constants;
using Phases.Umbraco.FilterNodes.Models.Enums;
using Phases.Umbraco.FilterNodes.Models.Examine;
using Phases.Umbraco.FilterNodes.Models.Requests;
using Phases.Umbraco.FilterNodes.Models.Responses;
using Phases.Umbraco.FilterNodes.Services.Examine;
using Phases.Umbraco.FilterNodes.Services.Interfaces;
using Phases.Umbraco.FilterNodes.Services.Validation;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Services;

namespace Phases.Umbraco.FilterNodes.Services.Normalization;

/// <summary>
/// Default implementation of <see cref="IFilterRequestNormalizer"/>.
/// </summary>
public sealed class FilterRequestNormalizer : IFilterRequestNormalizer
{
    private readonly IContentTypeService _contentTypeService;
    private readonly PropertyMetadataDiscovery _propertyMetadataDiscovery;
    private readonly PropertyIndexCapabilityEnricher _propertyIndexCapabilityEnricher;
    private readonly IExamineFieldResolver _fieldResolver;
    private readonly ILanguageQueryService _languageQueryService;

    /// <summary>
    /// Initializes a new instance of the <see cref="FilterRequestNormalizer"/> class.
    /// </summary>
    /// <param name="contentTypeService">The Umbraco content type service.</param>
    /// <param name="dataTypeService">The Umbraco data type service.</param>
    /// <param name="propertyIndexCapabilityEnricher">The index capability enricher.</param>
    /// <param name="fieldResolver">The Examine field resolver.</param>
    /// <param name="languageQueryService">The language query service.</param>
    public FilterRequestNormalizer(
        IContentTypeService contentTypeService,
        IDataTypeService dataTypeService,
        PropertyIndexCapabilityEnricher propertyIndexCapabilityEnricher,
        IExamineFieldResolver fieldResolver,
        ILanguageQueryService languageQueryService)
    {
        _contentTypeService = contentTypeService;
        _propertyMetadataDiscovery = new PropertyMetadataDiscovery(contentTypeService, dataTypeService);
        _propertyIndexCapabilityEnricher = propertyIndexCapabilityEnricher;
        _fieldResolver = fieldResolver;
        _languageQueryService = languageQueryService;
    }

    /// <inheritdoc />
    public FilterRequest Normalize(FilterRequest request)
    {
        ArgumentNullException.ThrowIfNull(request);

        var cultureContext = SearchCultureContext.FromRequest(
            request.SearchCultureMode,
            request.Culture);

        var normalizedConditions = request.Conditions
            .Select(condition => NormalizeCondition(condition, cultureContext))
            .ToArray();

        var normalizedPaging = new PagedRequest
        {
            Page = request.Paging.Page < 1 ? 1 : request.Paging.Page,
            PageSize = request.Paging.PageSize < 1
                ? PaginationConstants.DefaultPageSize
                : Math.Min(request.Paging.PageSize, PaginationConstants.MaxPageSize),
        };

        return request with
        {
            Paging = normalizedPaging,
            Conditions = normalizedConditions,
        };
    }

    private FilterCondition NormalizeCondition(
        FilterCondition condition,
        SearchCultureContext cultureContext)
    {
        return FilterConditionClassifier.Classify(condition) switch
        {
            FilterConditionKind.ContentType => NormalizeContentTypeCondition(condition),
            FilterConditionKind.CreatedDate => NormalizeDateCondition(condition, FilterNodesExamineFields.CreateDate),
            FilterConditionKind.UpdatedDate => NormalizeDateCondition(condition, FilterNodesExamineFields.UpdateDate),
            FilterConditionKind.PublishStatus => NormalizePublishStatusCondition(condition),
            FilterConditionKind.Property => NormalizePropertyCondition(condition, cultureContext),
            _ => condition,
        };
    }

    private static FilterCondition NormalizeContentTypeCondition(FilterCondition condition)
    {
        return condition with
        {
            ContentTypeAlias = condition.ContentTypeAlias!.Trim(),
            PropertyAlias = null,
            PropertyValue = null,
            FilterOperator = null,
            FromDate = null,
            ToDate = null,
        };
    }

    private FilterCondition NormalizePropertyCondition(
        FilterCondition condition,
        SearchCultureContext cultureContext)
    {
        var metadata = ResolvePropertyMetadataAsync(condition).GetAwaiter().GetResult();
        metadata = AugmentMetadataWithLanguages(metadata);
        var propertyAlias = condition.PropertyAlias!.Trim();
        ExamineFieldResolution resolution = _fieldResolver.Resolve(
            propertyAlias,
            metadata,
            cultureContext);

        return condition with
        {
            ContentTypeAlias = condition.ContentTypeAlias?.Trim(),
            PropertyAlias = propertyAlias,
            PropertyValue = FilterPropertyValueNormalizer.Normalize(metadata, condition.PropertyValue),
            FilterOperator = condition.FilterOperator ?? FilterOperator.Equals,
            PropertyFilterType = metadata?.FilterType,
            ResolvedExamineFieldNames = resolution.FieldNames,
            ExamineResolutionStrategy = resolution.Strategy,
        };
    }

    private static FilterCondition NormalizePublishStatusCondition(FilterCondition condition)
    {
        return condition with
        {
            ContentTypeAlias = condition.ContentTypeAlias?.Trim(),
            PropertyAlias = PublishStatusFilterValues.PropertyAlias,
            PropertyValue = condition.PropertyValue?.Trim(),
            FilterOperator = FilterOperator.Equals,
            FromDate = null,
            ToDate = null,
        };
    }

    private static FilterCondition NormalizeDateCondition(FilterCondition condition, string examineFieldName)
    {
        return condition with
        {
            ContentTypeAlias = condition.ContentTypeAlias?.Trim(),
            PropertyAlias = examineFieldName,
            PropertyValue = null,
            FilterOperator = FilterOperatorResolver.ResolveDateOperator(condition),
        };
    }

    private async Task<FilterablePropertyMetadata?> ResolvePropertyMetadataAsync(FilterCondition condition)
    {
        if (string.IsNullOrWhiteSpace(condition.PropertyAlias))
        {
            return null;
        }

        if (!string.IsNullOrWhiteSpace(condition.ContentTypeAlias))
        {
            IContentType? contentType = _contentTypeService.Get(condition.ContentTypeAlias);
            if (contentType is not null)
            {
                IReadOnlyList<FilterablePropertyMetadata> properties =
                    await _propertyMetadataDiscovery
                        .DiscoverAsync(contentType, cancellationToken: default)
                        .ConfigureAwait(false);

                IReadOnlyList<FilterablePropertyMetadata> enriched =
                    _propertyIndexCapabilityEnricher.Enrich(properties);

                FilterablePropertyMetadata? metadata = enriched.FirstOrDefault(property =>
                    property.Alias.Equals(condition.PropertyAlias, StringComparison.OrdinalIgnoreCase));

                if (metadata is not null)
                {
                    return metadata;
                }
            }
        }

        return PropertyFilterMetadataResolver.ResolveSystemProperty(condition.PropertyAlias);
    }

    private FilterablePropertyMetadata? AugmentMetadataWithLanguages(
        FilterablePropertyMetadata? metadata)
    {
        if (metadata is null || metadata.AvailableCultures.Count > 0)
        {
            return metadata;
        }

        IReadOnlyList<Models.Responses.LanguageListItem> languages =
            _languageQueryService.GetLanguagesAsync().GetAwaiter().GetResult();

        if (languages.Count == 0)
        {
            return metadata;
        }

        return metadata with
        {
            AvailableCultures = languages
                .Select(static language => language.IsoCode)
                .ToArray(),
        };
    }
}

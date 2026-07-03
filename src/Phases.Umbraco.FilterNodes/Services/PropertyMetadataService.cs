using Phases.Umbraco.FilterNodes.Constants;
using Phases.Umbraco.FilterNodes.Exceptions;
using Phases.Umbraco.FilterNodes.Models.Enums;
using Phases.Umbraco.FilterNodes.Models.Requests;
using Phases.Umbraco.FilterNodes.Models.Responses;
using Phases.Umbraco.FilterNodes.Services.Examine;
using Phases.Umbraco.FilterNodes.Services.Interfaces;
using Phases.Umbraco.FilterNodes.Services.Validation;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Services;

namespace Phases.Umbraco.FilterNodes.Services;

/// <summary>
/// Default implementation of <see cref="IPropertyMetadataService"/>.
/// </summary>
public sealed class PropertyMetadataService : IPropertyMetadataService
{
    private static readonly string[] SystemFilterableProperties =
    [
        FilterNodesExamineFields.NodeName,
        FilterConstants.CreatedDatePropertyAlias,
        FilterConstants.UpdatedDatePropertyAlias,
        PublishStatusFilterValues.PropertyAlias,
    ];

    private readonly IContentTypeService _contentTypeService;
    private readonly PropertyMetadataDiscovery _propertyMetadataDiscovery;
    private readonly PropertyIndexCapabilityEnricher _propertyIndexCapabilityEnricher;
    private readonly ILanguageQueryService _languageQueryService;

    /// <summary>
    /// Initializes a new instance of the <see cref="PropertyMetadataService"/> class.
    /// </summary>
    /// <param name="contentTypeService">The Umbraco content type service.</param>
    /// <param name="dataTypeService">The Umbraco data type service.</param>
    /// <param name="propertyIndexCapabilityEnricher">The index capability enricher.</param>
    /// <param name="languageQueryService">The language query service.</param>
    public PropertyMetadataService(
        IContentTypeService contentTypeService,
        IDataTypeService dataTypeService,
        PropertyIndexCapabilityEnricher propertyIndexCapabilityEnricher,
        ILanguageQueryService languageQueryService)
    {
        _contentTypeService = contentTypeService;
        _propertyMetadataDiscovery = new PropertyMetadataDiscovery(contentTypeService, dataTypeService);
        _propertyIndexCapabilityEnricher = propertyIndexCapabilityEnricher;
        _languageQueryService = languageQueryService;
    }

    /// <inheritdoc />
    public Task<IReadOnlyList<ContentTypeListItem>> GetContentTypesAsync(
        CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        var contentTypes = _contentTypeService
            .GetAll()
            .Where(static contentType => !contentType.IsElement)
            .Where(static contentType => !FilterConstants.IsReservedContentTypeAlias(contentType.Alias))
            .GroupBy(static contentType => contentType.Alias, StringComparer.OrdinalIgnoreCase)
            .Select(static group => group.First())
            .Select(static contentType => new ContentTypeListItem
            {
                Alias = contentType.Alias,
                Name = string.IsNullOrWhiteSpace(contentType.Name)
                    ? contentType.Alias
                    : contentType.Name,
            })
            .OrderBy(static contentType => contentType.Name, StringComparer.OrdinalIgnoreCase)
            .ToArray();

        return Task.FromResult<IReadOnlyList<ContentTypeListItem>>(contentTypes);
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<string>> GetContentTypeAliasesAsync(
        CancellationToken cancellationToken = default)
    {
        IReadOnlyList<ContentTypeListItem> contentTypes = await GetContentTypesAsync(cancellationToken)
            .ConfigureAwait(false);

        return contentTypes
            .Select(static contentType => contentType.Alias)
            .ToArray();
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<FilterablePropertyMetadata>> GetPropertyMetadataAsync(
        string contentTypeAlias,
        CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();
        ArgumentException.ThrowIfNullOrWhiteSpace(contentTypeAlias);

        IContentType? contentType = _contentTypeService.Get(contentTypeAlias);
        if (contentType is null)
        {
            throw new ContentTypeNotFoundException(contentTypeAlias);
        }

        var properties = new List<FilterablePropertyMetadata>(
            await _propertyMetadataDiscovery
                .DiscoverAsync(contentType, cancellationToken)
                .ConfigureAwait(false));

        for (var index = 0; index < SystemFilterableProperties.Length; index++)
        {
            properties.Add(
                PropertyFilterMetadataResolver.ResolveSystemProperty(
                    SystemFilterableProperties[index],
                    index));
        }

        var availableCultures = await _languageQueryService
            .GetLanguagesAsync(cancellationToken)
            .ConfigureAwait(false);

        var cultureIsoCodes = availableCultures
            .Select(static language => language.IsoCode)
            .ToArray();

        var result = _propertyIndexCapabilityEnricher
            .Enrich(
                properties
                    .GroupBy(static property => property.Alias, StringComparer.OrdinalIgnoreCase)
                    .Select(static group => group.First())
                    .ToArray())
            .Select(property => property with { AvailableCultures = cultureIsoCodes })
            .OrderBy(static property => property.GroupSortOrder)
            .ThenBy(static property => property.SortOrder)
            .ThenBy(static property => property.Name, StringComparer.OrdinalIgnoreCase)
            .ToArray();

        return result;
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<PropertyAliasesResponse>> GetPropertyMetadataBatchAsync(
        IReadOnlyList<string> contentTypeAliases,
        CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();
        ArgumentNullException.ThrowIfNull(contentTypeAliases);

        var aliases = contentTypeAliases
            .Where(static alias => !string.IsNullOrWhiteSpace(alias))
            .Where(static alias => !FilterConstants.IsReservedContentTypeAlias(alias))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .Take(FilterConstants.MaxPropertyMetadataBatchSize)
            .ToArray();

        if (aliases.Length == 0)
        {
            return [];
        }

        var tasks = aliases.Select(async alias =>
        {
            IReadOnlyList<FilterablePropertyMetadata> properties = await GetPropertyMetadataAsync(
                    alias,
                    cancellationToken)
                .ConfigureAwait(false);

            return new PropertyAliasesResponse
            {
                ContentTypeAlias = alias,
                Aliases = properties.Select(static property => property.Alias).ToArray(),
                Properties = properties,
            };
        });

        return await Task.WhenAll(tasks).ConfigureAwait(false);
    }

    /// <inheritdoc />
    public Task<bool> SupportsFilterConditionAsync(
        FilterCondition condition,
        CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();
        ArgumentNullException.ThrowIfNull(condition);

        return Task.FromResult(SupportsCondition(condition));
    }

    private bool SupportsCondition(FilterCondition condition)
    {
        return FilterConditionClassifier.Classify(condition) switch
        {
            FilterConditionKind.ContentType => SupportsContentTypeCondition(condition),
            FilterConditionKind.CreatedDate or FilterConditionKind.UpdatedDate => true,
            FilterConditionKind.PublishStatus => PublishStatusFilterValues.IsKnownValue(condition.PropertyValue),
            FilterConditionKind.Property => SupportsPropertyCondition(condition),
            _ => false,
        };
    }

    private bool SupportsContentTypeCondition(FilterCondition condition)
    {
        if (string.IsNullOrWhiteSpace(condition.ContentTypeAlias))
        {
            return false;
        }

        return _contentTypeService.Get(condition.ContentTypeAlias) is not null;
    }

    private bool SupportsPropertyCondition(FilterCondition condition)
    {
        if (string.IsNullOrWhiteSpace(condition.PropertyAlias))
        {
            return false;
        }

        if (string.IsNullOrWhiteSpace(condition.ContentTypeAlias))
        {
            return FilterConstants.IsEntireSiteSystemProperty(condition.PropertyAlias);
        }

        if (FilterConstants.IsReservedContentTypeAlias(condition.ContentTypeAlias))
        {
            return false;
        }

        if (FilterConditionClassifier.IsCreatedDateCondition(condition)
            || FilterConditionClassifier.IsUpdatedDateCondition(condition))
        {
            return true;
        }

        if (condition.PropertyAlias.Equals(FilterNodesExamineFields.NodeName, StringComparison.OrdinalIgnoreCase))
        {
            return true;
        }

        if (condition.PropertyAlias.Equals(FilterNodesExamineFields.NodeTypeAlias, StringComparison.OrdinalIgnoreCase))
        {
            return true;
        }

        if (PublishStatusFilterValues.IsPublishStatusProperty(condition.PropertyAlias))
        {
            return true;
        }

        IContentType? contentType = _contentTypeService.Get(condition.ContentTypeAlias);
        if (contentType is null)
        {
            return false;
        }

        if (contentType.CompositionPropertyTypes
            .Any(property => property.Alias.Equals(condition.PropertyAlias, StringComparison.OrdinalIgnoreCase)))
        {
            return true;
        }

        FilterablePropertyMetadata? metadata = _propertyMetadataDiscovery
            .ResolvePropertyAsync(contentType, condition.PropertyAlias, CancellationToken.None)
            .GetAwaiter()
            .GetResult();

        return metadata is { IsFilterable: true };
    }
}

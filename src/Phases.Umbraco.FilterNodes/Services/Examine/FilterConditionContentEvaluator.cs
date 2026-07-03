using Phases.Umbraco.FilterNodes.Constants;
using Phases.Umbraco.FilterNodes.Models.Enums;
using Phases.Umbraco.FilterNodes.Models.Examine;
using Phases.Umbraco.FilterNodes.Models.Requests;
using Phases.Umbraco.FilterNodes.Services;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Services;

namespace Phases.Umbraco.FilterNodes.Services.Examine;

/// <summary>
/// Evaluates Is Empty / Is Not Empty conditions directly against <see cref="IContent"/>.
/// </summary>
internal static class FilterConditionContentEvaluator
{
    internal static bool RequiresContentEvaluation(FilterCondition condition)
        => condition.FilterOperator is FilterOperator.IsEmpty or FilterOperator.IsNotEmpty
            || PublishStatusFilterValues.IsPublishStatusProperty(condition.PropertyAlias);

    internal static bool Matches(
        IContent content,
        IReadOnlyList<FilterCondition> contentConditions,
        FilterType filterType,
        SearchCultureContext? cultureContext = null,
        IContentTypeService? contentTypeService = null,
        ContentScheduleCollection? schedules = null)
    {
        if (contentConditions.Count == 0)
        {
            return true;
        }

        return filterType == FilterType.Any
            ? contentConditions.Any(condition =>
                MatchesCondition(content, condition, cultureContext, contentTypeService, schedules))
            : contentConditions.All(condition =>
                MatchesCondition(content, condition, cultureContext, contentTypeService, schedules));
    }

    private static bool MatchesCondition(
        IContent content,
        FilterCondition condition,
        SearchCultureContext? cultureContext,
        IContentTypeService? contentTypeService,
        ContentScheduleCollection? schedules)
    {
        if (!FilterConstants.IsReservedContentTypeAlias(condition.ContentTypeAlias)
            && !content.ContentType.Alias.Equals(
                condition.ContentTypeAlias,
                StringComparison.OrdinalIgnoreCase))
        {
            return false;
        }

        var culture = cultureContext?.IsSingleCulture == true
            ? cultureContext.Culture
            : null;

        if (PublishStatusFilterValues.IsPublishStatusProperty(condition.PropertyAlias))
        {
            if (string.IsNullOrWhiteSpace(condition.PropertyValue)
                || !PublishStatusFilterValues.IsKnownValue(condition.PropertyValue))
            {
                return false;
            }

            return ContentPublishStatusEvaluator.Matches(
                content,
                condition.PropertyValue.Trim(),
                schedules ?? new ContentScheduleCollection(),
                culture);
        }

        if (string.IsNullOrWhiteSpace(condition.PropertyAlias))
        {
            return true;
        }

        if (BlockPropertyAliasParser.TryParse(condition.PropertyAlias, out var blockParts))
        {
            return MatchesBlockElementCondition(
                content,
                blockParts,
                condition.FilterOperator!.Value,
                culture,
                contentTypeService);
        }

        IProperty? property = content.Properties[condition.PropertyAlias];
        if (property is null)
        {
            return condition.FilterOperator == FilterOperator.IsEmpty;
        }

        var hasValue = ContentPropertyPopulationEvaluator.HasPopulatedPropertyValue(
            property,
            culture: culture);

        return condition.FilterOperator switch
        {
            FilterOperator.IsNotEmpty => hasValue,
            FilterOperator.IsEmpty => !hasValue,
            _ => false,
        };
    }

    private static bool MatchesBlockElementCondition(
        IContent content,
        BlockPropertyAliasParts blockParts,
        FilterOperator filterOperator,
        string? culture,
        IContentTypeService? contentTypeService)
    {
        IProperty? containerProperty = content.Properties[blockParts.ContainerAlias];
        if (containerProperty is null)
        {
            return filterOperator == FilterOperator.IsEmpty;
        }

        if (contentTypeService is null)
        {
            return filterOperator == FilterOperator.IsEmpty;
        }

        var hasValue = BlockEditorPropertyValueReader.HasPopulatedElementPropertyValue(
            containerProperty,
            blockParts,
            contentTypeService,
            culture);

        return filterOperator switch
        {
            FilterOperator.IsNotEmpty => hasValue,
            FilterOperator.IsEmpty => !hasValue,
            _ => false,
        };
    }
}

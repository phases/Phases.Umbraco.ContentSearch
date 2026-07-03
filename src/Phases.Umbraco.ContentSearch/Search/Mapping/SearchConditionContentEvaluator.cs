using Phases.Umbraco.ContentSearch.Examine;
using Phases.Umbraco.ContentSearch.Metadata.Constants;
using Phases.Umbraco.ContentSearch.Search.Enums;
using Phases.Umbraco.ContentSearch.Search.Models;
using Phases.Umbraco.ContentSearch.Services;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Services;

namespace Phases.Umbraco.ContentSearch.Search.Mapping;

/// <summary>
/// Evaluates is empty / is not empty conditions directly against <see cref="IContent"/>.
/// </summary>
internal static class SearchConditionContentEvaluator
{
    internal static bool RequiresContentEvaluation(NormalizedSearchCondition condition)
        => condition.Operator is SearchOperator.IsEmpty or SearchOperator.IsNotEmpty
            || PublishStatusFilterValues.IsPublishStatusProperty(condition.PropertyAlias);

    internal static bool Matches(
        IContent content,
        IReadOnlyList<NormalizedSearchCondition> contentConditions,
        SearchMatchMode matchMode,
        string? culture = null,
        IContentTypeService? contentTypeService = null,
        ContentScheduleCollection? schedules = null)
    {
        if (contentConditions.Count == 0)
        {
            return true;
        }

        return matchMode == SearchMatchMode.Any
            ? contentConditions.Any(condition =>
                MatchesCondition(content, condition, culture, contentTypeService, schedules))
            : contentConditions.All(condition =>
                MatchesCondition(content, condition, culture, contentTypeService, schedules));
    }

    internal static bool MatchesCondition(
        IContent content,
        NormalizedSearchCondition condition,
        string? culture = null,
        IContentTypeService? contentTypeService = null,
        ContentScheduleCollection? schedules = null)
    {
        if (!ContentSearchMetadataConstants.IsReservedContentTypeAlias(condition.ContentTypeAlias)
            && !content.ContentType.Alias.Equals(
                condition.ContentTypeAlias,
                StringComparison.OrdinalIgnoreCase))
        {
            return false;
        }

        if (string.IsNullOrWhiteSpace(condition.PropertyAlias))
        {
            return true;
        }

        if (PublishStatusFilterValues.IsPublishStatusProperty(condition.PropertyAlias))
        {
            var targetStatus = PublishStatusFilterValues.ResolveTargetValue(
                condition.Value,
                condition.Operator);

            if (string.IsNullOrWhiteSpace(targetStatus)
                || !PublishStatusFilterValues.IsKnownValue(targetStatus))
            {
                return false;
            }

            return ContentPublishStatusEvaluator.Matches(
                content,
                targetStatus,
                schedules ?? new ContentScheduleCollection(),
                culture);
        }

        if (condition.PropertyAlias.Equals(
                ContentSearchMetadataConstants.NodeNamePropertyAlias,
                StringComparison.OrdinalIgnoreCase))
        {
            return MatchesNodeNameCondition(content, condition.Operator, culture);
        }

        if (BlockPropertyAliasParser.TryParse(condition.PropertyAlias, out var blockParts))
        {
            return MatchesBlockElementCondition(
                content,
                blockParts,
                condition.Operator,
                culture,
                contentTypeService);
        }

        IProperty? property = content.Properties[condition.PropertyAlias];
        if (property is null)
        {
            return condition.Operator == SearchOperator.IsEmpty;
        }

        var hasValue = ContentPropertyPopulationEvaluator.HasPopulatedPropertyValue(
            property,
            culture: culture);

        return condition.Operator switch
        {
            SearchOperator.IsNotEmpty => hasValue,
            SearchOperator.IsEmpty => !hasValue,
            _ => false,
        };
    }

    private static bool MatchesNodeNameCondition(
        IContent content,
        SearchOperator @operator,
        string? culture)
    {
        var name = string.IsNullOrWhiteSpace(culture)
            ? content.Name
            : content.GetCultureName(culture) ?? content.Name;

        var hasValue = !string.IsNullOrWhiteSpace(name);

        return @operator switch
        {
            SearchOperator.IsNotEmpty => hasValue,
            SearchOperator.IsEmpty => !hasValue,
            _ => false,
        };
    }

    private static bool MatchesBlockElementCondition(
        IContent content,
        BlockPropertyAliasParts blockParts,
        SearchOperator @operator,
        string? culture,
        IContentTypeService? contentTypeService)
    {
        if (contentTypeService is null)
        {
            return @operator == SearchOperator.IsEmpty;
        }

        var condition = new NormalizedSearchCondition
        {
            ContentTypeAlias = content.ContentType.Alias,
            PropertyAlias = string.Join(
                ContentSearchMetadataConstants.BlockPropertyAliasSeparator,
                blockParts.ContainerAlias,
                blockParts.ElementTypeAlias,
                blockParts.ElementPropertyAlias),
            Operator = @operator,
        };

        return BlockEditorPropertyValueReader.MatchesElementPropertyCondition(
            content,
            blockParts,
            condition,
            culture,
            contentTypeService);
    }
}

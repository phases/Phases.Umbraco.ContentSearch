using Phases.Umbraco.ContentSearch.Examine;
using Phases.Umbraco.ContentSearch.Metadata.Constants;
using Phases.Umbraco.ContentSearch.Search.Enums;
using Phases.Umbraco.ContentSearch.Search.Mapping;
using Phases.Umbraco.ContentSearch.Search.Models;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Services;

namespace Phases.Umbraco.ContentSearch.Services;

/// <summary>
/// Evaluates whether search conditions match a specific culture variant.
/// </summary>
public interface IContentSearchCultureMatchEvaluator
{
    /// <summary>
    /// Determines whether all or any conditions match the supplied culture variant.
    /// </summary>
    bool MatchesCulture(
        IContent content,
        string culture,
        IReadOnlyDictionary<string, string> indexValues,
        IReadOnlyList<NormalizedSearchCondition> conditions,
        SearchMatchMode matchMode);
}

/// <summary>
/// Default implementation of <see cref="IContentSearchCultureMatchEvaluator"/>.
/// </summary>
public sealed class ContentSearchCultureMatchEvaluator : IContentSearchCultureMatchEvaluator
{
    private readonly IContentSearchFieldResolver _fieldResolver;
    private readonly IContentTypeService _contentTypeService;
    private readonly IContentService _contentService;

    /// <summary>
    /// Initializes a new instance of the <see cref="ContentSearchCultureMatchEvaluator"/> class.
    /// </summary>
    public ContentSearchCultureMatchEvaluator(
        IContentSearchFieldResolver fieldResolver,
        IContentTypeService contentTypeService,
        IContentService contentService)
    {
        _fieldResolver = fieldResolver;
        _contentTypeService = contentTypeService;
        _contentService = contentService;
    }

    /// <inheritdoc />
    public bool MatchesCulture(
        IContent content,
        string culture,
        IReadOnlyDictionary<string, string> indexValues,
        IReadOnlyList<NormalizedSearchCondition> conditions,
        SearchMatchMode matchMode)
    {
        ArgumentNullException.ThrowIfNull(content);
        ArgumentException.ThrowIfNullOrWhiteSpace(culture);
        ArgumentNullException.ThrowIfNull(indexValues);
        ArgumentNullException.ThrowIfNull(conditions);

        if (conditions.Count == 0)
        {
            return true;
        }

        return matchMode == SearchMatchMode.Any
            ? conditions.Any(condition =>
                MatchesCondition(content, culture, indexValues, condition))
            : conditions.All(condition =>
                MatchesCondition(content, culture, indexValues, condition));
    }

    private bool MatchesCondition(
        IContent content,
        string culture,
        IReadOnlyDictionary<string, string> indexValues,
        NormalizedSearchCondition condition)
    {
        if (SearchConditionContentEvaluator.RequiresContentEvaluation(condition))
        {
            return SearchConditionContentEvaluator.MatchesCondition(
                content,
                condition,
                culture,
                _contentTypeService,
                ResolveSchedules(content, condition));
        }

        if (SearchConditionCultureEvaluator.MatchesCulture(
                indexValues,
                [condition],
                SearchMatchMode.All,
                culture,
                _fieldResolver))
        {
            return true;
        }

        if (BlockPropertyAliasParser.TryParse(condition.PropertyAlias, out var blockParts))
        {
            return BlockEditorPropertyValueReader.MatchesElementPropertyCondition(
                content,
                blockParts,
                condition,
                culture,
                _contentTypeService);
        }

        return false;
    }

    private ContentScheduleCollection ResolveSchedules(
        IContent content,
        NormalizedSearchCondition condition)
    {
        if (!PublishStatusFilterValues.IsPublishStatusProperty(condition.PropertyAlias))
        {
            return new ContentScheduleCollection();
        }

        return _contentService.GetContentScheduleByContentId(content.Key)
            ?? new ContentScheduleCollection();
    }
}

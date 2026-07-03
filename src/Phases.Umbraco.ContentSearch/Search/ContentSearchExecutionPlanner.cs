using Phases.Umbraco.ContentSearch.Metadata.Constants;
using Phases.Umbraco.ContentSearch.Search.Enums;
using Phases.Umbraco.ContentSearch.Search.Mapping;
using Phases.Umbraco.ContentSearch.Search.Models;

namespace Phases.Umbraco.ContentSearch.Search;

/// <summary>
/// Splits a normalized search request into Examine and content-evaluation parts.
/// </summary>
internal sealed record ContentSearchExecutionPlan(
    NormalizedContentSearchRequest ExamineRequest,
    IReadOnlyList<NormalizedSearchCondition> ContentConditions,
    bool RequiresContentEvaluation);

/// <summary>
/// Builds execution plans for mixed Examine and content-based conditions.
/// </summary>
internal static class ContentSearchExecutionPlanner
{
    internal static ContentSearchExecutionPlan Create(NormalizedContentSearchRequest request)
    {
        ArgumentNullException.ThrowIfNull(request);

        var contentConditions = request.Conditions
            .Where(SearchConditionContentEvaluator.RequiresContentEvaluation)
            .ToArray();

        if (contentConditions.Length == 0)
        {
            return new ContentSearchExecutionPlan(request, [], false);
        }

        var examineConditions = request.Conditions
            .Where(condition => !SearchConditionContentEvaluator.RequiresContentEvaluation(condition))
            .ToList();

        foreach (var scopeCondition in CreateScopeConditions(contentConditions))
        {
            if (!examineConditions.Any(existing => HasSameContentTypeScope(existing, scopeCondition)))
            {
                examineConditions.Add(scopeCondition);
            }
        }

        var examineRequest = new NormalizedContentSearchRequest
        {
            Domain = request.Domain,
            MatchMode = SearchMatchMode.All,
            CultureContext = request.CultureContext,
            Conditions = examineConditions,
            PageIndex = request.PageIndex,
            PageSize = request.PageSize,
            Sort = request.Sort,
        };

        return new ContentSearchExecutionPlan(examineRequest, contentConditions, true);
    }

    private static IEnumerable<NormalizedSearchCondition> CreateScopeConditions(
        IReadOnlyList<NormalizedSearchCondition> contentConditions)
    {
        foreach (var condition in contentConditions)
        {
            if (ContentSearchMetadataConstants.IsReservedContentTypeAlias(condition.ContentTypeAlias))
            {
                continue;
            }

            yield return new NormalizedSearchCondition
            {
                ContentTypeAlias = condition.ContentTypeAlias,
                PropertyAlias = string.Empty,
                Operator = SearchOperator.Equals,
            };
        }
    }

    private static bool HasSameContentTypeScope(
        NormalizedSearchCondition left,
        NormalizedSearchCondition right)
        => !ContentSearchMetadataConstants.IsWildcardContentTypeAlias(left.ContentTypeAlias)
           && left.ContentTypeAlias.Equals(right.ContentTypeAlias, StringComparison.OrdinalIgnoreCase)
           && string.IsNullOrWhiteSpace(left.PropertyAlias);
}

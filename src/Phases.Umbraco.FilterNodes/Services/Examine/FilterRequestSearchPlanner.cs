using Phases.Umbraco.FilterNodes.Constants;
using Phases.Umbraco.FilterNodes.Models.Enums;
using Phases.Umbraco.FilterNodes.Models.Requests;

namespace Phases.Umbraco.FilterNodes.Services.Examine;

/// <summary>
/// Splits a filter request into Examine and content-evaluation parts.
/// </summary>
internal sealed record FilterSearchPlan(
    FilterRequest ExamineRequest,
    IReadOnlyList<FilterCondition> ContentConditions,
    bool RequiresContentEvaluation);

/// <summary>
/// Builds search plans and validates supported match modes.
/// </summary>
internal static class FilterRequestSearchPlanner
{
    internal static FilterSearchPlan Create(FilterRequest request)
    {
        ArgumentNullException.ThrowIfNull(request);

        var contentConditions = request.Conditions
            .Where(FilterConditionContentEvaluator.RequiresContentEvaluation)
            .ToArray();

        if (contentConditions.Length == 0)
        {
            return new FilterSearchPlan(request, [], false);
        }

        var examineConditions = request.Conditions
            .Where(condition => !FilterConditionContentEvaluator.RequiresContentEvaluation(condition))
            .ToList();

        foreach (var scopeCondition in CreateScopeConditions(contentConditions))
        {
            if (!examineConditions.Any(existing => HasSameContentTypeScope(existing, scopeCondition)))
            {
                examineConditions.Add(scopeCondition);
            }
        }

        var examineRequest = request with
        {
            Conditions = examineConditions,
            FilterType = FilterType.All,
        };

        return new FilterSearchPlan(examineRequest, contentConditions, true);
    }

    internal static bool SupportsAnyMatchMode(FilterRequest request)
    {
        if (request.FilterType != FilterType.Any || request.Conditions.Count <= 1)
        {
            return true;
        }

        if (request.Conditions.Any(FilterConditionContentEvaluator.RequiresContentEvaluation))
        {
            return false;
        }

        return request.Conditions.All(IsGroupedOrEligible);
    }

    private static IEnumerable<FilterCondition> CreateScopeConditions(
        IReadOnlyList<FilterCondition> contentConditions)
    {
        foreach (var condition in contentConditions)
        {
            if (FilterConstants.IsReservedContentTypeAlias(condition.ContentTypeAlias))
            {
                continue;
            }

            yield return new FilterCondition
            {
                ContentTypeAlias = condition.ContentTypeAlias,
            };
        }
    }

    private static bool HasSameContentTypeScope(FilterCondition left, FilterCondition right)
    {
        return !string.IsNullOrWhiteSpace(left.ContentTypeAlias)
            && left.ContentTypeAlias.Equals(right.ContentTypeAlias, StringComparison.OrdinalIgnoreCase)
            && string.IsNullOrWhiteSpace(left.PropertyAlias);
    }

    private static bool IsGroupedOrEligible(FilterCondition condition)
    {
        if (!string.IsNullOrWhiteSpace(condition.ContentTypeAlias)
            && string.IsNullOrWhiteSpace(condition.PropertyAlias))
        {
            return true;
        }

        if (string.IsNullOrWhiteSpace(condition.PropertyAlias))
        {
            return false;
        }

        return condition.FilterOperator is not (
            FilterOperator.IsEmpty
            or FilterOperator.IsNotEmpty);
    }
}

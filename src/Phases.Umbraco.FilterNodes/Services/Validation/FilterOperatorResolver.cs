using Phases.Umbraco.FilterNodes.Models.Enums;
using Phases.Umbraco.FilterNodes.Models.Requests;

namespace Phases.Umbraco.FilterNodes.Services.Validation;

/// <summary>
/// Resolves effective filter operators from request conditions.
/// </summary>
internal static class FilterOperatorResolver
{
    /// <summary>
    /// Resolves the operator to use for date-based filter conditions.
    /// </summary>
    /// <param name="condition">The filter condition.</param>
    /// <returns>The effective date filter operator.</returns>
    public static FilterOperator ResolveDateOperator(FilterCondition condition)
    {
        var filterOperator = condition.FilterOperator ?? FilterOperator.Between;

        if (IsRangeOperator(filterOperator))
        {
            return filterOperator;
        }

        if (condition.FromDate.HasValue || condition.ToDate.HasValue)
        {
            return FilterOperator.Between;
        }

        return filterOperator;
    }

    private static bool IsRangeOperator(FilterOperator filterOperator)
    {
        return filterOperator is FilterOperator.Between
            or FilterOperator.GreaterThan
            or FilterOperator.GreaterThanOrEqual
            or FilterOperator.LessThan
            or FilterOperator.LessThanOrEqual;
    }
}

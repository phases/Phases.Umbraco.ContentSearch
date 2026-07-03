using Phases.Umbraco.FilterNodes.Constants;
using Phases.Umbraco.FilterNodes.Models.Enums;
using Phases.Umbraco.FilterNodes.Models.Requests;

namespace Phases.Umbraco.FilterNodes.Services.Validation;

/// <summary>
/// Classifies <see cref="FilterCondition"/> instances by filter type.
/// </summary>
internal static class FilterConditionClassifier
{
    /// <summary>
    /// Determines the kind of the specified filter condition.
    /// </summary>
    /// <param name="condition">The condition to classify.</param>
    /// <returns>The classified condition kind.</returns>
    public static FilterConditionKind Classify(FilterCondition condition)
    {
        ArgumentNullException.ThrowIfNull(condition);

        if (IsCreatedDateCondition(condition))
        {
            return FilterConditionKind.CreatedDate;
        }

        if (IsUpdatedDateCondition(condition))
        {
            return FilterConditionKind.UpdatedDate;
        }

        if (IsPublishStatusCondition(condition))
        {
            return FilterConditionKind.PublishStatus;
        }

        if (!string.IsNullOrWhiteSpace(condition.PropertyAlias))
        {
            return FilterConditionKind.Property;
        }

        if (!string.IsNullOrWhiteSpace(condition.ContentTypeAlias))
        {
            return FilterConditionKind.ContentType;
        }

        if (condition.FromDate.HasValue || condition.ToDate.HasValue)
        {
            return FilterConditionKind.UpdatedDate;
        }

        return FilterConditionKind.Property;
    }

    /// <summary>
    /// Determines whether the condition targets the creation date field.
    /// </summary>
    /// <param name="condition">The condition to evaluate.</param>
    /// <returns><c>true</c> when the condition targets creation date; otherwise, <c>false</c>.</returns>
    public static bool IsCreatedDateCondition(FilterCondition condition)
    {
        return IsDateAlias(condition.PropertyAlias, FilterConstants.CreatedDatePropertyAlias, FilterNodesExamineFields.CreateDate);
    }

    /// <summary>
    /// Determines whether the condition targets the update date field.
    /// </summary>
    /// <param name="condition">The condition to evaluate.</param>
    /// <returns><c>true</c> when the condition targets update date; otherwise, <c>false</c>.</returns>
    public static bool IsUpdatedDateCondition(FilterCondition condition)
    {
        return IsDateAlias(condition.PropertyAlias, FilterConstants.UpdatedDatePropertyAlias, FilterNodesExamineFields.UpdateDate);
    }

    /// <summary>
    /// Determines whether the condition targets the publish status field.
    /// </summary>
    /// <param name="condition">The condition to evaluate.</param>
    /// <returns><c>true</c> when the condition targets publish status; otherwise, <c>false</c>.</returns>
    public static bool IsPublishStatusCondition(FilterCondition condition)
        => PublishStatusFilterValues.IsPublishStatusProperty(condition.PropertyAlias);

    private static bool IsDateAlias(string? propertyAlias, params string[] allowedAliases)
    {
        if (string.IsNullOrWhiteSpace(propertyAlias))
        {
            return false;
        }

        return allowedAliases.Any(alias =>
            propertyAlias.Equals(alias, StringComparison.OrdinalIgnoreCase));
    }
}

using Phases.Umbraco.ContentSearch.Metadata.Discovery;
using Phases.Umbraco.ContentSearch.Metadata.Models;
using Phases.Umbraco.ContentSearch.Search.Enums;
using Phases.Umbraco.ContentSearch.Search.Models;

namespace Phases.Umbraco.ContentSearch.Metadata.Constants;

/// <summary>
/// Publish status filter property values exposed in the query builder.
/// </summary>
internal static class PublishStatusFilterValues
{
    internal const string PropertyAlias = "publishStatus";

    internal const string Published = "1";
    internal const string Unpublished = "0";

    private static readonly HashSet<string> KnownValues = new(StringComparer.OrdinalIgnoreCase)
    {
        Published,
        Unpublished,
        bool.TrueString,
        bool.FalseString,
    };

    internal static bool IsPublishStatusProperty(string? propertyAlias)
        => !string.IsNullOrWhiteSpace(propertyAlias)
           && propertyAlias.Trim().Equals(PropertyAlias, StringComparison.OrdinalIgnoreCase);

    internal static bool IsKnownValue(string? value)
        => !string.IsNullOrWhiteSpace(value) && KnownValues.Contains(value.Trim());

    internal static bool IsPublishedValue(string? value)
        => value?.Trim() is string normalized
           && (normalized.Equals(Published, StringComparison.OrdinalIgnoreCase)
               || normalized.Equals(bool.TrueString, StringComparison.OrdinalIgnoreCase));

    internal static bool IsUnpublishedValue(string? value)
        => value?.Trim() is string normalized
           && (normalized.Equals(Unpublished, StringComparison.OrdinalIgnoreCase)
               || normalized.Equals(bool.FalseString, StringComparison.OrdinalIgnoreCase));

    /// <summary>
    /// Resolves the indexed publish status value from a condition value and operator.
    /// </summary>
    internal static string? ResolveTargetValue(string? value, SearchOperator @operator)
    {
        if (IsKnownValue(value))
        {
            return value!.Trim();
        }

        return @operator switch
        {
            SearchOperator.IsTrue => Published,
            SearchOperator.IsFalse => Unpublished,
            _ => null,
        };
    }

    internal static bool TargetsUnpublishedContent(string? value, SearchOperator @operator)
        => IsUnpublishedValue(ResolveTargetValue(value, @operator));

    internal static bool TargetsPublishedContent(string? value, SearchOperator @operator)
        => IsPublishedValue(ResolveTargetValue(value, @operator));

    internal static bool RequiresInternalContentIndex(
        IReadOnlyList<NormalizedSearchCondition> contentConditions)
        => contentConditions.Any(static condition =>
            IsPublishStatusProperty(condition.PropertyAlias)
            && TargetsUnpublishedContent(condition.Value, condition.Operator));

    internal static SearchablePropertyMetadata CreateMetadata(int sortOrder = 3)
        => new()
        {
            Alias = PropertyAlias,
            Name = "Publish status",
            EditorAlias = "Umbraco.TrueFalse",
            GroupName = ContentSearchMetadataSourceGroups.SystemGroupName,
            GroupSortOrder = ContentSearchMetadataSourceGroups.GetGroupSortOrder(
                PropertyMetadataSourceCategory.System),
            SortOrder = sortOrder,
            SourceCategory = PropertyMetadataSourceCategory.System,
            VariesByCulture = true,
        };
}

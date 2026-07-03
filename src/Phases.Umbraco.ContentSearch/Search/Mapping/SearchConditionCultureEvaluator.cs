using Phases.Umbraco.ContentSearch.Examine;
using Phases.Umbraco.ContentSearch.Metadata.Constants;
using Phases.Umbraco.ContentSearch.Metadata.Models;
using Phases.Umbraco.ContentSearch.Models;
using Phases.Umbraco.ContentSearch.Models.Enums;
using Phases.Umbraco.ContentSearch.Search.Enums;
using Phases.Umbraco.ContentSearch.Search.Models;

namespace Phases.Umbraco.ContentSearch.Search.Mapping;

/// <summary>
/// Evaluates whether normalized search conditions match a specific culture variant.
/// </summary>
internal static class SearchConditionCultureEvaluator
{
    /// <summary>
    /// Determines whether the supplied conditions match the given culture variant.
    /// </summary>
    internal static bool MatchesCulture(
        IReadOnlyDictionary<string, string> indexValues,
        IReadOnlyList<NormalizedSearchCondition> conditions,
        SearchMatchMode matchMode,
        string culture,
        IContentSearchFieldResolver fieldResolver)
    {
        ArgumentNullException.ThrowIfNull(indexValues);
        ArgumentNullException.ThrowIfNull(conditions);
        ArgumentException.ThrowIfNullOrWhiteSpace(culture);
        ArgumentNullException.ThrowIfNull(fieldResolver);

        if (conditions.Count == 0)
        {
            return true;
        }

        return matchMode == SearchMatchMode.Any
            ? conditions.Any(condition =>
                MatchesCondition(indexValues, condition, culture, fieldResolver))
            : conditions.All(condition =>
                MatchesCondition(indexValues, condition, culture, fieldResolver));
    }

    /// <summary>
    /// Resolves a condition against a single culture for match extraction.
    /// </summary>
    internal static NormalizedSearchCondition ResolveConditionForCulture(
        NormalizedSearchCondition condition,
        string culture,
        IContentSearchFieldResolver fieldResolver)
    {
        ArgumentNullException.ThrowIfNull(condition);
        ArgumentException.ThrowIfNullOrWhiteSpace(culture);
        ArgumentNullException.ThrowIfNull(fieldResolver);

        var cultureContext = new SearchCultureContext
        {
            Mode = SearchCultureMode.SpecificCulture,
            Culture = culture,
        };
        var resolution = fieldResolver.Resolve(
            condition.PropertyAlias,
            condition.Metadata,
            cultureContext);

        return new NormalizedSearchCondition
        {
            ContentTypeAlias = condition.ContentTypeAlias,
            PropertyAlias = condition.PropertyAlias,
            Operator = condition.Operator,
            Value = condition.Value,
            FromDate = condition.FromDate,
            ToDate = condition.ToDate,
            FromNumber = condition.FromNumber,
            ToNumber = condition.ToNumber,
            ResolvedExamineFieldNames = resolution.FieldNames,
            ResolutionStrategy = resolution.Strategy,
            Metadata = condition.Metadata,
        };
    }

    private static bool MatchesCondition(
        IReadOnlyDictionary<string, string> indexValues,
        NormalizedSearchCondition condition,
        string culture,
        IContentSearchFieldResolver fieldResolver)
    {
        if (!condition.IsSupported)
        {
            return false;
        }

        if (!VariesByCulture(condition))
        {
            return true;
        }

        var cultureCondition = ResolveConditionForCulture(condition, culture, fieldResolver);
        var fieldValue = GetFieldValue(indexValues, cultureCondition.ResolvedExamineFieldNames);
        if (EvaluateOperator(cultureCondition, fieldValue))
        {
            return true;
        }

        var fallbackFieldNames = condition.ResolvedExamineFieldNames
            .Where(fieldName => !IsCultureSpecificFieldName(fieldName))
            .ToArray();

        if (fallbackFieldNames.Length == 0)
        {
            return false;
        }

        var fallbackFieldValue = GetFieldValue(indexValues, fallbackFieldNames);
        return EvaluateOperator(condition, fallbackFieldValue);
    }

    private static bool VariesByCulture(NormalizedSearchCondition condition)
    {
        if (ContentSearchMetadataConstants.IsCultureInvariantSystemProperty(condition.PropertyAlias))
        {
            return false;
        }

        if (condition.Metadata is { VariesByCulture: true })
        {
            return true;
        }

        return condition.ResolvedExamineFieldNames.Count > 1
            || condition.ResolvedExamineFieldNames.Any(IsCultureSpecificFieldName);
    }

    private static bool IsCultureSpecificFieldName(string fieldName)
    {
        var separatorIndex = fieldName.LastIndexOf('_');

        if (separatorIndex <= 0 || separatorIndex >= fieldName.Length - 1)
        {
            return false;
        }

        var suffix = fieldName[(separatorIndex + 1)..];

        return suffix.Contains('-', StringComparison.Ordinal);
    }

    private static string? GetFieldValue(
        IReadOnlyDictionary<string, string> indexValues,
        IReadOnlyList<string> fieldNames)
    {
        foreach (var fieldName in fieldNames)
        {
            if (indexValues.TryGetValue(fieldName, out var value))
            {
                return value;
            }
        }

        return null;
    }

    private static bool EvaluateOperator(NormalizedSearchCondition condition, string? fieldValue)
    {
        return condition.Operator switch
        {
            SearchOperator.IsEmpty => IsEmpty(fieldValue),
            SearchOperator.IsNotEmpty => !IsEmpty(fieldValue),
            SearchOperator.IsTrue => MatchesTruthyFieldValue(fieldValue),
            SearchOperator.IsFalse => MatchesFalsyFieldValue(fieldValue),
            _ when IsDateProperty(condition.Metadata) || IsRelativeDateOperator(condition.Operator)
                => EvaluateDateOperator(condition, fieldValue),
            _ when IsNumericProperty(condition.Metadata) => EvaluateNumericOperator(condition, fieldValue),
            _ => EvaluateTextOperator(condition, fieldValue),
        };
    }

    private static bool EvaluateTextOperator(NormalizedSearchCondition condition, string? fieldValue)
    {
        var normalizedFieldValue = fieldValue?.Trim() ?? string.Empty;
        var comparisonValue = condition.Value?.Trim() ?? string.Empty;

        return condition.Operator switch
        {
            SearchOperator.Equals => string.Equals(
                normalizedFieldValue,
                comparisonValue,
                StringComparison.OrdinalIgnoreCase),
            SearchOperator.NotEquals => !string.Equals(
                normalizedFieldValue,
                comparisonValue,
                StringComparison.OrdinalIgnoreCase),
            SearchOperator.Contains => normalizedFieldValue.Contains(
                comparisonValue,
                StringComparison.OrdinalIgnoreCase),
            SearchOperator.NotContains => !normalizedFieldValue.Contains(
                comparisonValue,
                StringComparison.OrdinalIgnoreCase),
            SearchOperator.StartsWith => normalizedFieldValue.StartsWith(
                comparisonValue,
                StringComparison.OrdinalIgnoreCase),
            SearchOperator.EndsWith => normalizedFieldValue.EndsWith(
                comparisonValue,
                StringComparison.OrdinalIgnoreCase),
            SearchOperator.ContainsAny => SplitMultiValue(condition.Value)
                .Any(term => normalizedFieldValue.Contains(term, StringComparison.OrdinalIgnoreCase)),
            SearchOperator.ContainsAll => SplitMultiValue(condition.Value)
                .All(term => normalizedFieldValue.Contains(term, StringComparison.OrdinalIgnoreCase)),
            _ => false,
        };
    }

    private static bool EvaluateDateOperator(NormalizedSearchCondition condition, string? fieldValue)
    {
        if (!TryParseDate(fieldValue, out var parsedDate))
        {
            return false;
        }

        var from = condition.FromDate?.UtcDateTime;
        var to = condition.ToDate?.UtcDateTime;

        return condition.Operator switch
        {
            SearchOperator.GreaterThan => from.HasValue && parsedDate > from.Value,
            SearchOperator.GreaterThanOrEqual => from.HasValue && parsedDate >= from.Value,
            SearchOperator.LessThan => to.HasValue && parsedDate < to.Value,
            SearchOperator.LessThanOrEqual => to.HasValue && parsedDate <= to.Value,
            SearchOperator.Between => from.HasValue
                && to.HasValue
                && parsedDate >= from.Value
                && parsedDate <= to.Value,
            SearchOperator.Equals => from.HasValue
                && to.HasValue
                && parsedDate >= from.Value
                && parsedDate <= to.Value,
            SearchOperator.Today
                or SearchOperator.Yesterday
                or SearchOperator.Last7Days
                or SearchOperator.Last30Days
                or SearchOperator.ThisMonth
                or SearchOperator.LastMonth
                or SearchOperator.ThisYear => from.HasValue
                && to.HasValue
                && parsedDate >= from.Value
                && parsedDate <= to.Value,
            _ => false,
        };
    }

    private static bool EvaluateNumericOperator(NormalizedSearchCondition condition, string? fieldValue)
    {
        if (!decimal.TryParse(fieldValue, out var parsedNumber))
        {
            return false;
        }

        return condition.Operator switch
        {
            SearchOperator.Equals => condition.FromNumber.HasValue
                && parsedNumber == condition.FromNumber.Value,
            SearchOperator.NotEquals => condition.FromNumber.HasValue
                && parsedNumber != condition.FromNumber.Value,
            SearchOperator.GreaterThan => condition.FromNumber.HasValue
                && parsedNumber > condition.FromNumber.Value,
            SearchOperator.GreaterThanOrEqual => condition.FromNumber.HasValue
                && parsedNumber >= condition.FromNumber.Value,
            SearchOperator.LessThan => condition.ToNumber.HasValue
                && parsedNumber < condition.ToNumber.Value,
            SearchOperator.LessThanOrEqual => condition.ToNumber.HasValue
                && parsedNumber <= condition.ToNumber.Value,
            SearchOperator.Between => condition.FromNumber.HasValue
                && condition.ToNumber.HasValue
                && parsedNumber >= condition.FromNumber.Value
                && parsedNumber <= condition.ToNumber.Value,
            _ => false,
        };
    }

    private static bool IsEmpty(string? fieldValue)
        => string.IsNullOrWhiteSpace(fieldValue);

    private static bool IsDateProperty(SearchablePropertyMetadata? metadata)
        => metadata?.EditorAlias is { Length: > 0 } alias
            && alias.Contains("Date", StringComparison.OrdinalIgnoreCase);

    private static bool IsNumericProperty(SearchablePropertyMetadata? metadata)
        => metadata?.EditorAlias is { Length: > 0 } alias
            && (alias.Contains("Integer", StringComparison.OrdinalIgnoreCase)
                || alias.Contains("Decimal", StringComparison.OrdinalIgnoreCase));

    private static bool IsRelativeDateOperator(SearchOperator @operator)
        => @operator is SearchOperator.Today
            or SearchOperator.Yesterday
            or SearchOperator.Last7Days
            or SearchOperator.Last30Days
            or SearchOperator.ThisMonth
            or SearchOperator.LastMonth
            or SearchOperator.ThisYear;

    private static bool TryParseDate(string? fieldValue, out DateTime parsedDate)
    {
        parsedDate = default;

        if (string.IsNullOrWhiteSpace(fieldValue))
        {
            return false;
        }

        if (long.TryParse(fieldValue, out var ticks)
            && ticks >= DateTime.MinValue.Ticks
            && ticks <= DateTime.MaxValue.Ticks)
        {
            parsedDate = new DateTime(ticks, DateTimeKind.Utc);
            return true;
        }

        return DateTime.TryParse(fieldValue, out parsedDate);
    }

    private static string[] SplitMultiValue(string? value)
        => string.IsNullOrWhiteSpace(value)
            ? []
            : value.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

    private static bool MatchesTruthyFieldValue(string? fieldValue)
    {
        if (string.IsNullOrWhiteSpace(fieldValue))
        {
            return false;
        }

        if (IsTruthyToken(fieldValue))
        {
            return true;
        }

        return fieldValue
            .Split([' ', '\t', '\r', '\n'], StringSplitOptions.RemoveEmptyEntries)
            .Any(IsTruthyToken);
    }

    private static bool MatchesFalsyFieldValue(string? fieldValue)
    {
        if (string.IsNullOrWhiteSpace(fieldValue))
        {
            return true;
        }

        if (IsFalsyToken(fieldValue))
        {
            return true;
        }

        return fieldValue
            .Split([' ', '\t', '\r', '\n'], StringSplitOptions.RemoveEmptyEntries)
            .All(IsFalsyToken);
    }

    private static bool IsTruthyToken(string value)
        => string.Equals(value, "1", StringComparison.Ordinal)
            || string.Equals(value, "true", StringComparison.OrdinalIgnoreCase);

    private static bool IsFalsyToken(string value)
        => string.Equals(value, "0", StringComparison.Ordinal)
            || string.Equals(value, "false", StringComparison.OrdinalIgnoreCase);
}

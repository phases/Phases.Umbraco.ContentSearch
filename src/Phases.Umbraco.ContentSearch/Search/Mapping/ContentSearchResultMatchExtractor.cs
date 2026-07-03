using Phases.Umbraco.ContentSearch.Search.Enums;
using Phases.Umbraco.ContentSearch.Search.Models;

namespace Phases.Umbraco.ContentSearch.Search.Mapping;

/// <summary>
/// Extracts match metadata from Examine field values for search result display.
/// </summary>
public interface IContentSearchResultMatchExtractor
{
    /// <summary>
    /// Builds match info for each supported search condition.
    /// </summary>
    IReadOnlyList<ContentSearchMatchInfo> Extract(
        IReadOnlyDictionary<string, string> fieldValues,
        IReadOnlyList<NormalizedSearchCondition> conditions);
}

/// <summary>
/// Default implementation of <see cref="IContentSearchResultMatchExtractor"/>.
/// </summary>
public sealed class ContentSearchResultMatchExtractor : IContentSearchResultMatchExtractor
{
    private const int SnippetContextChars = 40;
    private const int MaxSnippetLength = 120;

    private static readonly HashSet<SearchOperator> ValuelessOperators =
    [
        SearchOperator.IsEmpty,
        SearchOperator.IsNotEmpty,
        SearchOperator.IsTrue,
        SearchOperator.IsFalse,
        SearchOperator.Today,
        SearchOperator.Yesterday,
        SearchOperator.Last7Days,
        SearchOperator.Last30Days,
        SearchOperator.ThisMonth,
        SearchOperator.LastMonth,
        SearchOperator.ThisYear,
    ];

    private static readonly HashSet<SearchOperator> NegativeOperators =
    [
        SearchOperator.NotContains,
        SearchOperator.NotEquals,
    ];

    /// <inheritdoc />
    public IReadOnlyList<ContentSearchMatchInfo> Extract(
        IReadOnlyDictionary<string, string> fieldValues,
        IReadOnlyList<NormalizedSearchCondition> conditions)
    {
        ArgumentNullException.ThrowIfNull(fieldValues);
        ArgumentNullException.ThrowIfNull(conditions);

        if (conditions.Count == 0)
        {
            return [];
        }

        var matches = new List<ContentSearchMatchInfo>();

        foreach (var condition in conditions)
        {
            if (!condition.IsSupported)
            {
                continue;
            }

            var match = BuildMatch(fieldValues, condition);
            if (match is not null)
            {
                matches.Add(match);
            }
        }

        return matches;
    }

    private static ContentSearchMatchInfo? BuildMatch(
        IReadOnlyDictionary<string, string> fieldValues,
        NormalizedSearchCondition condition)
    {
        var propertyName = condition.Metadata?.Name?.Trim();
        if (string.IsNullOrWhiteSpace(propertyName))
        {
            propertyName = condition.PropertyAlias;
        }

        var operatorLabel = GetOperatorLabel(condition.Operator);

        if (ValuelessOperators.Contains(condition.Operator))
        {
            return new ContentSearchMatchInfo
            {
                PropertyAlias = condition.PropertyAlias,
                PropertyName = propertyName,
                OperatorLabel = operatorLabel,
            };
        }

        if (NegativeOperators.Contains(condition.Operator))
        {
            return new ContentSearchMatchInfo
            {
                PropertyAlias = condition.PropertyAlias,
                PropertyName = propertyName,
                OperatorLabel = operatorLabel,
            };
        }

        var highlightTerms = GetHighlightTerms(condition);
        var fieldValue = ResolveFieldValue(fieldValues, condition, highlightTerms);

        if (string.IsNullOrWhiteSpace(fieldValue))
        {
            return new ContentSearchMatchInfo
            {
                PropertyAlias = condition.PropertyAlias,
                PropertyName = propertyName,
                OperatorLabel = operatorLabel,
            };
        }

        if (IsDateProperty(condition.Metadata))
        {
            return new ContentSearchMatchInfo
            {
                PropertyAlias = condition.PropertyAlias,
                PropertyName = propertyName,
                Snippet = FormatDateFieldValue(fieldValue),
            };
        }

        var snippet = BuildSnippet(fieldValue, highlightTerms, condition.Operator);

        return new ContentSearchMatchInfo
        {
            PropertyAlias = condition.PropertyAlias,
            PropertyName = propertyName,
            Snippet = snippet,
            HighlightTerms = highlightTerms,
        };
    }

    private static string? ResolveFieldValue(
        IReadOnlyDictionary<string, string> fieldValues,
        NormalizedSearchCondition condition,
        IReadOnlyList<string> highlightTerms)
    {
        string? bestMatch = null;

        foreach (var fieldName in condition.ResolvedExamineFieldNames)
        {
            if (!fieldValues.TryGetValue(fieldName, out var value)
                || string.IsNullOrWhiteSpace(value))
            {
                continue;
            }

            if (highlightTerms.Count > 0
                && highlightTerms.Any(term =>
                    value.Contains(term, StringComparison.OrdinalIgnoreCase)))
            {
                return value;
            }

            bestMatch ??= value;
        }

        return bestMatch;
    }

    private static IReadOnlyList<string> GetHighlightTerms(NormalizedSearchCondition condition)
    {
        if (condition.Operator is SearchOperator.ContainsAny or SearchOperator.ContainsAll)
        {
            return SplitMultiValue(condition.Value);
        }

        var displayValue = GetDisplaySearchValue(condition);
        if (string.IsNullOrWhiteSpace(displayValue))
        {
            return [];
        }

        return [displayValue];
    }

    private static string? GetDisplaySearchValue(NormalizedSearchCondition condition)
    {
        if (!string.IsNullOrWhiteSpace(condition.Value))
        {
            return condition.Value.Trim();
        }

        if (condition.FromDate.HasValue && condition.ToDate.HasValue
            && condition.Operator == SearchOperator.Between)
        {
            return $"{condition.FromDate.Value:yyyy-MM-dd} .. {condition.ToDate.Value:yyyy-MM-dd}";
        }

        if (condition.FromDate.HasValue)
        {
            return condition.FromDate.Value.ToString("yyyy-MM-dd");
        }

        if (condition.ToDate.HasValue)
        {
            return condition.ToDate.Value.ToString("yyyy-MM-dd");
        }

        if (condition.FromNumber.HasValue && condition.ToNumber.HasValue
            && condition.Operator == SearchOperator.Between)
        {
            return $"{condition.FromNumber.Value} .. {condition.ToNumber.Value}";
        }

        if (condition.FromNumber.HasValue)
        {
            return condition.FromNumber.Value.ToString();
        }

        if (condition.ToNumber.HasValue)
        {
            return condition.ToNumber.Value.ToString();
        }

        return null;
    }

    private static string BuildSnippet(
        string fieldValue,
        IReadOnlyList<string> highlightTerms,
        SearchOperator @operator)
    {
        var normalizedValue = fieldValue.Trim();

        if (highlightTerms.Count == 0)
        {
            return TruncateValue(normalizedValue, MaxSnippetLength);
        }

        var primaryTerm = highlightTerms
            .OrderByDescending(static term => term.Length)
            .First();

        var index = normalizedValue.IndexOf(primaryTerm, StringComparison.OrdinalIgnoreCase);

        if (index < 0)
        {
            if (@operator == SearchOperator.Equals)
            {
                return TruncateValue(normalizedValue, MaxSnippetLength);
            }

            return TruncateValue(normalizedValue, MaxSnippetLength);
        }

        var start = Math.Max(0, index - SnippetContextChars);
        var end = Math.Min(
            normalizedValue.Length,
            index + primaryTerm.Length + SnippetContextChars);

        var snippet = normalizedValue[start..end];
        var prefix = start > 0 ? "…" : string.Empty;
        var suffix = end < normalizedValue.Length ? "…" : string.Empty;

        return $"{prefix}{snippet}{suffix}";
    }

    private static bool IsDateProperty(Metadata.Models.SearchablePropertyMetadata? metadata)
        => metadata?.EditorAlias is { Length: > 0 } alias
            && alias.Contains("Date", StringComparison.OrdinalIgnoreCase);

    private static string FormatDateFieldValue(string value)
    {
        // Examine stores dates as .NET ticks; convert back to a readable value.
        if (long.TryParse(value, out var ticks)
            && ticks >= DateTime.MinValue.Ticks
            && ticks <= DateTime.MaxValue.Ticks)
        {
            return new DateTime(ticks).ToString("yyyy-MM-dd HH:mm");
        }

        return DateTime.TryParse(value, out var parsed)
            ? parsed.ToString("yyyy-MM-dd HH:mm")
            : value;
    }

    private static string TruncateValue(string value, int maxLength)
    {
        if (value.Length <= maxLength)
        {
            return value;
        }

        return $"{value[..maxLength]}…";
    }

    private static string[] SplitMultiValue(string? value)
        => string.IsNullOrWhiteSpace(value)
            ? []
            : value.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

    private static string GetOperatorLabel(SearchOperator @operator)
        => @operator switch
        {
            SearchOperator.Equals => "equals",
            SearchOperator.NotEquals => "does not equal",
            SearchOperator.Contains => "contains",
            SearchOperator.NotContains => "does not contain",
            SearchOperator.StartsWith => "starts with",
            SearchOperator.EndsWith => "ends with",
            SearchOperator.GreaterThan => "greater than",
            SearchOperator.GreaterThanOrEqual => "greater than or equal",
            SearchOperator.LessThan => "less than",
            SearchOperator.LessThanOrEqual => "less than or equal",
            SearchOperator.Between => "between",
            SearchOperator.Today => "today",
            SearchOperator.Yesterday => "yesterday",
            SearchOperator.Last7Days => "last 7 days",
            SearchOperator.Last30Days => "last 30 days",
            SearchOperator.ThisMonth => "this month",
            SearchOperator.LastMonth => "last month",
            SearchOperator.ThisYear => "this year",
            SearchOperator.IsTrue => "is true",
            SearchOperator.IsFalse => "is false",
            SearchOperator.ContainsAny => "contains any",
            SearchOperator.ContainsAll => "contains all",
            SearchOperator.IsEmpty => "is empty",
            SearchOperator.IsNotEmpty => "is not empty",
            _ => @operator.ToString(),
        };
}

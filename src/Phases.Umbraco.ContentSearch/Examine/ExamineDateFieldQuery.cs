using System.Globalization;
using Phases.Umbraco.ContentSearch.Search.Enums;
using Phases.Umbraco.ContentSearch.Search.Models;

namespace Phases.Umbraco.ContentSearch.Examine;

/// <summary>
/// Builds native Lucene queries for date properties indexed as analyzed text.
/// </summary>
internal static class ExamineDateFieldQuery
{
    private const int MaxDaySpan = 366;

    private static readonly DateTime MinIndexedDay = new(1970, 1, 1);
    private static readonly DateTime MaxIndexedDay = new(2099, 12, 31);

    /// <summary>
    /// Builds a native query for a text-indexed date field.
    /// </summary>
    internal static string BuildQuery(string fieldName, NormalizedSearchCondition condition)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(fieldName);
        ArgumentNullException.ThrowIfNull(condition);

        var clause = ResolveClause(fieldName, condition);
        if (clause is null)
        {
            return $"+id:{ContentSearchExamineFields.UnresolvedPropertyQueryToken}";
        }

        return $"+({clause})";
    }

    /// <summary>
    /// Builds a grouped OR native query across multiple text-indexed date fields.
    /// </summary>
    internal static string BuildGroupedQuery(
        IReadOnlyList<string> fieldNames,
        NormalizedSearchCondition condition)
    {
        ArgumentNullException.ThrowIfNull(fieldNames);

        if (fieldNames.Count == 0)
        {
            return string.Empty;
        }

        if (fieldNames.Count == 1)
        {
            return BuildQuery(fieldNames[0], condition);
        }

        var clauses = fieldNames
            .Select(field => ResolveClause(field, condition))
            .Where(static clause => clause is not null)
            .Select(clause => $"({clause})");

        return $"+({string.Join(" OR ", clauses)})";
    }

    private static string? ResolveClause(string fieldName, NormalizedSearchCondition condition)
    {
        if (IsRelativeDateOperator(condition.Operator))
        {
            return TryBuildBoundedDayMatchRange(fieldName, condition);
        }

        return condition.Operator switch
        {
            SearchOperator.Equals => TryBuildEqualsClause(fieldName, condition),
            SearchOperator.GreaterThan => TryBuildGreaterThanClause(fieldName, condition),
            SearchOperator.GreaterThanOrEqual => TryBuildGreaterThanOrEqualClause(fieldName, condition),
            SearchOperator.LessThan => TryBuildLessThanClause(fieldName, condition),
            SearchOperator.LessThanOrEqual => TryBuildLessThanOrEqualClause(fieldName, condition),
            SearchOperator.Between => TryBuildBetweenClause(fieldName, condition),
            _ => TryBuildBoundedDayMatchRange(fieldName, condition),
        };
    }

    private static string? TryBuildEqualsClause(
        string fieldName,
        NormalizedSearchCondition condition)
    {
        if (!TryGetComparisonDay(condition, out var day))
        {
            return null;
        }

        return BuildDayMatchClause(fieldName, day);
    }

    private static string? TryBuildGreaterThanClause(
        string fieldName,
        NormalizedSearchCondition condition)
    {
        if (!TryGetComparisonDay(condition, out var day))
        {
            return null;
        }

        return BuildAfterDayClause(fieldName, day, inclusive: false);
    }

    private static string? TryBuildGreaterThanOrEqualClause(
        string fieldName,
        NormalizedSearchCondition condition)
    {
        if (!TryGetComparisonDay(condition, out var day))
        {
            return null;
        }

        return BuildAfterDayClause(fieldName, day, inclusive: true);
    }

    private static string? TryBuildLessThanClause(
        string fieldName,
        NormalizedSearchCondition condition)
    {
        if (!TryGetComparisonDay(condition, out var day))
        {
            return null;
        }

        return BuildBeforeDayClause(fieldName, day, inclusive: false);
    }

    private static string? TryBuildLessThanOrEqualClause(
        string fieldName,
        NormalizedSearchCondition condition)
    {
        if (!TryGetComparisonDay(condition, out var day))
        {
            return null;
        }

        return BuildBeforeDayClause(fieldName, day, inclusive: true);
    }

    private static string? TryBuildBetweenClause(
        string fieldName,
        NormalizedSearchCondition condition)
    {
        if (!TryGetInclusiveDayRange(condition, out var fromDay, out var toDay))
        {
            return null;
        }

        return TryBuildBoundedDayMatchRange(fieldName, fromDay, toDay);
    }

    private static string? TryBuildBoundedDayMatchRange(
        string fieldName,
        NormalizedSearchCondition condition)
    {
        if (!TryGetInclusiveDayRange(condition, out var fromDay, out var toDay))
        {
            return null;
        }

        return TryBuildBoundedDayMatchRange(fieldName, fromDay, toDay);
    }

    private static string? TryBuildBoundedDayMatchRange(
        string fieldName,
        DateTime fromDay,
        DateTime toDay)
    {
        var normalizedFrom = fromDay.Date;
        var normalizedTo = toDay.Date;

        if (normalizedTo < normalizedFrom)
        {
            (normalizedFrom, normalizedTo) = (normalizedTo, normalizedFrom);
        }

        var dayCount = (normalizedTo - normalizedFrom).Days + 1;
        if (dayCount > MaxDaySpan)
        {
            normalizedTo = normalizedFrom.AddDays(MaxDaySpan - 1);
        }

        var clauses = new List<string>(dayCount);
        for (var day = normalizedFrom; day <= normalizedTo; day = day.AddDays(1))
        {
            clauses.Add(BuildDayMatchClause(fieldName, day));
        }

        return string.Join(" OR ", clauses);
    }

    /// <summary>
    /// Builds a compact greater-than style query using a year wildcard and negated day phrases.
    /// </summary>
    private static string BuildAfterDayClause(string fieldName, DateTime day, bool inclusive)
    {
        var comparisonDay = day.Date;
        var year = comparisonDay.Year;
        var yearStart = new DateTime(year, 1, 1);
        var negateThrough = inclusive ? comparisonDay.AddDays(-1) : comparisonDay;

        var clauses = new List<string>(MaxIndexedDay.Year - year + 1);

        if (negateThrough >= yearStart)
        {
            clauses.Add(BuildSameYearWildcardWithNegatedDays(fieldName, year, yearStart, negateThrough));
        }
        else
        {
            clauses.Add(BuildYearPrefixClause(fieldName, year));
        }

        for (var futureYear = year + 1; futureYear <= MaxIndexedDay.Year; futureYear++)
        {
            clauses.Add(BuildYearPrefixClause(fieldName, futureYear));
        }

        return string.Join(" OR ", clauses);
    }

    /// <summary>
    /// Builds a compact less-than style query using year wildcards and negated day phrases.
    /// </summary>
    private static string BuildBeforeDayClause(string fieldName, DateTime day, bool inclusive)
    {
        var comparisonDay = day.Date;
        var year = comparisonDay.Year;
        var yearEnd = new DateTime(year, 12, 31);
        var negateFrom = inclusive ? comparisonDay.AddDays(1) : comparisonDay;

        var clauses = new List<string>(year - MinIndexedDay.Year + 1);

        for (var pastYear = MinIndexedDay.Year; pastYear < year; pastYear++)
        {
            clauses.Add(BuildYearPrefixClause(fieldName, pastYear));
        }

        if (negateFrom <= yearEnd)
        {
            clauses.Add(BuildSameYearWildcardWithNegatedDays(fieldName, year, negateFrom, yearEnd));
        }
        else
        {
            clauses.Add(BuildYearPrefixClause(fieldName, year));
        }

        return string.Join(" OR ", clauses);
    }

    private static string BuildSameYearWildcardWithNegatedDays(
        string fieldName,
        int year,
        DateTime negateFrom,
        DateTime negateTo)
    {
        var field = EscapeFieldName(fieldName);
        var wildcard = $"{field}:{year}*";

        if (negateFrom > negateTo)
        {
            return wildcard;
        }

        var negations = new List<string>((negateTo - negateFrom).Days + 1);
        for (var day = negateFrom; day <= negateTo; day = day.AddDays(1))
        {
            negations.Add(BuildNegatedDayPhrase(fieldName, day));
        }

        return $"{wildcard} {string.Join(" ", negations)}";
    }

    private static string BuildNegatedDayPhrase(string fieldName, DateTime day)
    {
        var field = EscapeFieldName(fieldName);
        var date = FormatDay(day);
        return $"-{field}:\"{EscapePhraseValue($"{date} 00:00:00")}\"";
    }

    private static string BuildYearPrefixClause(string fieldName, int year)
    {
        var field = EscapeFieldName(fieldName);
        return $"{field}:{year}*";
    }

    private static string BuildDayMatchClause(string fieldName, DateTime day)
    {
        var field = EscapeFieldName(fieldName);
        var date = FormatDay(day);
        var umbracoMidnight = EscapePhraseValue($"{date} 00:00:00");
        var isoMidnight = EscapePhraseValue($"{date}T00:00:00");
        var escapedTerm = EscapeDateTerm(date);

        return
            $"{field}:\"{umbracoMidnight}\" OR {field}:\"{isoMidnight}\" OR {field}:{escapedTerm}";
    }

    private static bool TryGetInclusiveDayRange(
        NormalizedSearchCondition condition,
        out DateTime fromDay,
        out DateTime toDay)
    {
        fromDay = default;
        toDay = default;

        if (condition.FromDate.HasValue && condition.ToDate.HasValue)
        {
            fromDay = condition.FromDate.Value.Date;
            toDay = condition.ToDate.Value.Date;
            return true;
        }

        if (string.IsNullOrWhiteSpace(condition.Value))
        {
            return false;
        }

        var parts = SplitRangeValue(condition.Value);
        if (parts.Length == 2
            && TryParseSearchDate(parts[0], out var from)
            && TryParseSearchDate(parts[1], out var to))
        {
            fromDay = from.Date;
            toDay = to.Date;
            return true;
        }

        return false;
    }

    private static bool TryGetComparisonDay(
        NormalizedSearchCondition condition,
        out DateTime day)
    {
        if (condition.FromDate.HasValue)
        {
            day = condition.FromDate.Value.Date;
            return true;
        }

        if (condition.ToDate.HasValue)
        {
            day = condition.ToDate.Value.Date;
            return true;
        }

        if (TryParseSearchDate(condition.Value, out var parsed))
        {
            day = parsed.Date;
            return true;
        }

        day = default;
        return false;
    }

    internal static bool TryParseSearchDate(string? value, out DateTimeOffset parsed)
    {
        parsed = default;

        if (string.IsNullOrWhiteSpace(value))
        {
            return false;
        }

        var trimmed = value.Trim();
        string[] formats =
        [
            "yyyy-MM-dd",
            "yyyy-MM-dd'T'HH:mm:ss",
            "yyyy-MM-dd'T'HH:mm:ssK",
            "yyyy-MM-dd HH:mm:ss",
            "O",
        ];

        if (DateTimeOffset.TryParseExact(
                trimmed,
                formats,
                CultureInfo.InvariantCulture,
                DateTimeStyles.RoundtripKind,
                out parsed))
        {
            return true;
        }

        return DateTimeOffset.TryParse(
            trimmed,
            CultureInfo.InvariantCulture,
            DateTimeStyles.RoundtripKind,
            out parsed);
    }

    private static string[] SplitRangeValue(string value)
    {
        if (value.Contains("..", StringComparison.Ordinal))
        {
            return value.Split("..", StringSplitOptions.TrimEntries);
        }

        if (value.Contains('|', StringComparison.Ordinal))
        {
            return value.Split('|', StringSplitOptions.TrimEntries);
        }

        return value.Split(',', StringSplitOptions.TrimEntries);
    }

    private static string EscapePhraseValue(string value)
        => value
            .Replace("\\", "\\\\", StringComparison.Ordinal)
            .Replace("\"", "\\\"", StringComparison.Ordinal);

    private static string FormatDay(DateTime day)
        => day.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);

    private static string EscapeDateTerm(string date)
        => date
            .Replace("-", "\\-", StringComparison.Ordinal);

    private static bool IsRelativeDateOperator(SearchOperator @operator)
        => @operator is SearchOperator.Today
            or SearchOperator.Yesterday
            or SearchOperator.Last7Days
            or SearchOperator.Last30Days
            or SearchOperator.ThisMonth
            or SearchOperator.LastMonth
            or SearchOperator.ThisYear;

    private static string EscapeFieldName(string fieldName)
        => fieldName
            .Replace("\\", "\\\\", StringComparison.Ordinal)
            .Replace(":", "\\:", StringComparison.Ordinal)
            .Replace(" ", "\\ ", StringComparison.Ordinal);
}

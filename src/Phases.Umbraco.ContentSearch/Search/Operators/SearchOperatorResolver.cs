using Phases.Umbraco.ContentSearch.Examine;
using Phases.Umbraco.ContentSearch.Metadata.Constants;
using Phases.Umbraco.ContentSearch.Metadata.Models;
using Phases.Umbraco.ContentSearch.Search.Enums;

namespace Phases.Umbraco.ContentSearch.Search.Operators;

/// <summary>
/// Resolves client operator identifiers to <see cref="SearchOperator"/> values.
/// </summary>
public interface ISearchOperatorResolver
{
    /// <summary>
    /// Parses a client operator identifier.
    /// </summary>
    /// <param name="operatorId">The client operator identifier.</param>
    /// <returns>The resolved operator.</returns>
    SearchOperator ResolveOperator(string operatorId);

    /// <summary>
    /// Parses comparison values for date and numeric operators.
    /// </summary>
    /// <param name="condition">The mutable condition values to populate.</param>
    /// <param name="metadata">The property metadata.</param>
    /// <param name="operator">The resolved operator.</param>
    /// <param name="value">The raw value from the client.</param>
    void ResolveComparisonValues(
        NormalizedSearchConditionValues condition,
        SearchablePropertyMetadata? metadata,
        SearchOperator @operator,
        string? value);
}

/// <summary>
/// Mutable comparison values resolved from a client condition value.
/// </summary>
public sealed class NormalizedSearchConditionValues
{
    /// <summary>
    /// Gets or sets the text comparison value.
    /// </summary>
    public string? Value { get; set; }

    /// <summary>
    /// Gets or sets the lower date bound.
    /// </summary>
    public DateTimeOffset? FromDate { get; set; }

    /// <summary>
    /// Gets or sets the upper date bound.
    /// </summary>
    public DateTimeOffset? ToDate { get; set; }

    /// <summary>
    /// Gets or sets the lower numeric bound.
    /// </summary>
    public decimal? FromNumber { get; set; }

    /// <summary>
    /// Gets or sets the upper numeric bound.
    /// </summary>
    public decimal? ToNumber { get; set; }
}

/// <summary>
/// Default implementation of <see cref="ISearchOperatorResolver"/>.
/// </summary>
public sealed class SearchOperatorResolver : ISearchOperatorResolver
{
    /// <inheritdoc />
    public SearchOperator ResolveOperator(string operatorId)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(operatorId);

        return operatorId.Trim().ToLowerInvariant() switch
        {
            "equals" => SearchOperator.Equals,
            "notequals" => SearchOperator.NotEquals,
            "contains" => SearchOperator.Contains,
            "notcontains" => SearchOperator.NotContains,
            "containsany" => SearchOperator.ContainsAny,
            "containsall" => SearchOperator.ContainsAll,
            "startswith" => SearchOperator.StartsWith,
            "endswith" => SearchOperator.EndsWith,
            "greaterthan" => SearchOperator.GreaterThan,
            "greaterthanorequal" => SearchOperator.GreaterThanOrEqual,
            "lessthan" => SearchOperator.LessThan,
            "lessthanorequal" => SearchOperator.LessThanOrEqual,
            "between" => SearchOperator.Between,
            "before" => SearchOperator.LessThan,
            "after" => SearchOperator.GreaterThan,
            "today" => SearchOperator.Today,
            "yesterday" => SearchOperator.Yesterday,
            "last7days" => SearchOperator.Last7Days,
            "last30days" => SearchOperator.Last30Days,
            "thismonth" => SearchOperator.ThisMonth,
            "lastmonth" => SearchOperator.LastMonth,
            "thisyear" => SearchOperator.ThisYear,
            "istrue" => SearchOperator.IsTrue,
            "isfalse" => SearchOperator.IsFalse,
            "hasvalue" => SearchOperator.IsNotEmpty,
            "hasnovalue" => SearchOperator.IsEmpty,
            "hasmedia" => SearchOperator.IsNotEmpty,
            "hasnomedia" => SearchOperator.IsEmpty,
            "isempty" => SearchOperator.IsEmpty,
            "isnotempty" => SearchOperator.IsNotEmpty,
            _ => throw new ArgumentException($"Unsupported operator '{operatorId}'.", nameof(operatorId)),
        };
    }

    /// <inheritdoc />
    public void ResolveComparisonValues(
        NormalizedSearchConditionValues condition,
        SearchablePropertyMetadata? metadata,
        SearchOperator @operator,
        string? value)
    {
        ArgumentNullException.ThrowIfNull(condition);

        if (@operator is SearchOperator.IsEmpty
            or SearchOperator.IsNotEmpty
            or SearchOperator.IsTrue
            or SearchOperator.IsFalse
            or SearchOperator.Today
            or SearchOperator.Yesterday
            or SearchOperator.Last7Days
            or SearchOperator.Last30Days
            or SearchOperator.ThisMonth
            or SearchOperator.LastMonth
            or SearchOperator.ThisYear)
        {
            if (@operator is SearchOperator.IsTrue)
            {
                condition.Value = "1";
            }
            else if (@operator is SearchOperator.IsFalse)
            {
                condition.Value = "0";
            }
            else if (IsRelativeDateOperator(@operator))
            {
                ResolveRelativeDateRange(condition, @operator);
            }

            return;
        }

        var trimmedValue = value?.Trim();
        if (string.IsNullOrWhiteSpace(trimmedValue))
        {
            return;
        }

        if (IsDateProperty(metadata))
        {
            ResolveDateValues(condition, @operator, trimmedValue);
            return;
        }

        if (IsNumericProperty(metadata))
        {
            ResolveNumericValues(condition, @operator, trimmedValue);
            return;
        }

        if (IsTrueFalseProperty(metadata))
        {
            condition.Value = NormalizeTrueFalseValue(trimmedValue);
            return;
        }

        condition.Value = trimmedValue;
    }

    private static void ResolveDateValues(
        NormalizedSearchConditionValues condition,
        SearchOperator @operator,
        string value)
    {
        if (@operator == SearchOperator.Between)
        {
            var parts = SplitRangeValue(value);
            if (parts.Length == 2
                && TryParseDate(parts[0], out var from)
                && TryParseDate(parts[1], out var to))
            {
                condition.FromDate = from;
                condition.ToDate = to;
            }

            return;
        }

        if (!TryParseDate(value, out var date))
        {
            condition.Value = value;
            return;
        }

        switch (@operator)
        {
            case SearchOperator.Equals:
                condition.FromDate = new DateTimeOffset(date.Date, TimeSpan.Zero);
                condition.ToDate = condition.FromDate.Value.AddDays(1).AddTicks(-1);
                break;
            case SearchOperator.GreaterThan:
            case SearchOperator.GreaterThanOrEqual:
                condition.FromDate = date;
                break;
            case SearchOperator.LessThan:
            case SearchOperator.LessThanOrEqual:
                condition.ToDate = date;
                break;
            case SearchOperator.Between:
                condition.FromDate = date;
                condition.ToDate = date;
                break;
            default:
                condition.Value = value;
                break;
        }
    }

    private static void ResolveNumericValues(
        NormalizedSearchConditionValues condition,
        SearchOperator @operator,
        string value)
    {
        if (@operator == SearchOperator.Between)
        {
            var parts = SplitRangeValue(value);
            if (parts.Length == 2
                && decimal.TryParse(parts[0], out var from)
                && decimal.TryParse(parts[1], out var to))
            {
                condition.FromNumber = from;
                condition.ToNumber = to;
            }

            return;
        }

        if (!decimal.TryParse(value, out var number))
        {
            condition.Value = value;
            return;
        }

        switch (@operator)
        {
            case SearchOperator.GreaterThan:
            case SearchOperator.GreaterThanOrEqual:
                condition.FromNumber = number;
                break;
            case SearchOperator.LessThan:
            case SearchOperator.LessThanOrEqual:
                condition.ToNumber = number;
                break;
            default:
                condition.Value = value;
                break;
        }
    }

    private static bool IsRelativeDateOperator(SearchOperator @operator)
        => @operator is SearchOperator.Today
            or SearchOperator.Yesterday
            or SearchOperator.Last7Days
            or SearchOperator.Last30Days
            or SearchOperator.ThisMonth
            or SearchOperator.LastMonth
            or SearchOperator.ThisYear;

    private static void ResolveRelativeDateRange(
        NormalizedSearchConditionValues condition,
        SearchOperator @operator)
    {
        var now = DateTimeOffset.UtcNow;
        var today = new DateTimeOffset(now.Year, now.Month, now.Day, 0, 0, 0, TimeSpan.Zero);

        switch (@operator)
        {
            case SearchOperator.Today:
                condition.FromDate = today;
                condition.ToDate = today.AddDays(1).AddTicks(-1);
                break;
            case SearchOperator.Yesterday:
                condition.FromDate = today.AddDays(-1);
                condition.ToDate = today.AddTicks(-1);
                break;
            case SearchOperator.Last7Days:
                condition.FromDate = today.AddDays(-7);
                condition.ToDate = now;
                break;
            case SearchOperator.Last30Days:
                condition.FromDate = today.AddDays(-30);
                condition.ToDate = now;
                break;
            case SearchOperator.ThisMonth:
                condition.FromDate = new DateTimeOffset(now.Year, now.Month, 1, 0, 0, 0, TimeSpan.Zero);
                condition.ToDate = now;
                break;
            case SearchOperator.LastMonth:
                var firstOfThisMonth = new DateTimeOffset(now.Year, now.Month, 1, 0, 0, 0, TimeSpan.Zero);
                condition.FromDate = firstOfThisMonth.AddMonths(-1);
                condition.ToDate = firstOfThisMonth.AddTicks(-1);
                break;
            case SearchOperator.ThisYear:
                condition.FromDate = new DateTimeOffset(now.Year, 1, 1, 0, 0, 0, TimeSpan.Zero);
                condition.ToDate = now;
                break;
        }
    }

    private static bool IsDateProperty(SearchablePropertyMetadata? metadata)
    {
        if (metadata is null)
        {
            return false;
        }

        if (metadata.Alias.Equals(
                ContentSearchMetadataConstants.CreatedDatePropertyAlias,
                StringComparison.OrdinalIgnoreCase)
            || metadata.Alias.Equals(
                ContentSearchMetadataConstants.UpdatedDatePropertyAlias,
                StringComparison.OrdinalIgnoreCase)
            || metadata.Alias.Equals(
                ContentSearchMetadataConstants.ReleaseDatePropertyAlias,
                StringComparison.OrdinalIgnoreCase))
        {
            return true;
        }

        return metadata.EditorAlias?.Contains("Date", StringComparison.OrdinalIgnoreCase) == true;
    }

    private static bool IsTrueFalseProperty(SearchablePropertyMetadata? metadata)
        => metadata?.EditorAlias?.Equals("Umbraco.TrueFalse", StringComparison.OrdinalIgnoreCase) == true;

    private static string NormalizeTrueFalseValue(string value)
    {
        if (value.Equals("true", StringComparison.OrdinalIgnoreCase)
            || value.Equals("yes", StringComparison.OrdinalIgnoreCase)
            || value == "1")
        {
            return "1";
        }

        if (value.Equals("false", StringComparison.OrdinalIgnoreCase)
            || value.Equals("no", StringComparison.OrdinalIgnoreCase)
            || value == "0")
        {
            return "0";
        }

        return value;
    }

    private static bool IsNumericProperty(SearchablePropertyMetadata? metadata)
        => metadata?.EditorAlias?.Contains("Numeric", StringComparison.OrdinalIgnoreCase) == true
           || metadata?.EditorAlias?.Contains("Integer", StringComparison.OrdinalIgnoreCase) == true
           || metadata?.EditorAlias?.Contains("Decimal", StringComparison.OrdinalIgnoreCase) == true;

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

    private static bool TryParseDate(string value, out DateTimeOffset date)
        => ExamineDateFieldQuery.TryParseSearchDate(value, out date);
}

using Phases.Umbraco.ContentSearch.Examine;
using Phases.Umbraco.ContentSearch.Examine.Models;
using Phases.Umbraco.ContentSearch.Metadata.Models;
using Phases.Umbraco.ContentSearch.Search.Enums;
using Phases.Umbraco.ContentSearch.Search.Models;
using Xunit;

namespace Phases.Umbraco.ContentSearch.Tests.Examine;

public sealed class ExamineDateFieldQueryTests
{
    [Fact]
    public void BuildQuery_equals_operator_matches_umbraco_midnight_phrase()
    {
        var query = ExamineDateFieldQuery.BuildQuery(
            "datePicker",
            CreateCondition(
                SearchOperator.Equals,
                fromDate: new DateTimeOffset(2024, 1, 15, 0, 0, 0, TimeSpan.Zero),
                toDate: new DateTimeOffset(2024, 1, 15, 23, 59, 59, TimeSpan.Zero)));

        Assert.Contains("datePicker:\"2024-01-15 00:00:00\"", query, StringComparison.Ordinal);
        Assert.Contains("datePicker:2024\\-01\\-15", query, StringComparison.Ordinal);
    }

    [Fact]
    public void BuildQuery_greaterThan_operator_uses_year_wildcard_with_negated_days()
    {
        var query = ExamineDateFieldQuery.BuildQuery(
            "datePicker",
            CreateCondition(
                SearchOperator.GreaterThan,
                fromDate: new DateTimeOffset(2026, 7, 1, 0, 0, 0, TimeSpan.Zero)));

        Assert.Contains("datePicker:2026*", query, StringComparison.Ordinal);
        Assert.Contains("-datePicker:\"2026-07-01 00:00:00\"", query, StringComparison.Ordinal);
        Assert.Contains("datePicker:2027*", query, StringComparison.Ordinal);
    }

    [Fact]
    public void BuildQuery_lessThan_operator_uses_year_wildcard_with_negated_days()
    {
        var query = ExamineDateFieldQuery.BuildQuery(
            "datePicker",
            CreateCondition(
                SearchOperator.LessThan,
                toDate: new DateTimeOffset(2024, 1, 15, 0, 0, 0, TimeSpan.Zero)));

        Assert.Contains("datePicker:2024*", query, StringComparison.Ordinal);
        Assert.Contains("-datePicker:\"2024-01-15 00:00:00\"", query, StringComparison.Ordinal);
        Assert.Contains("datePicker:2023*", query, StringComparison.Ordinal);
    }

    [Fact]
    public void BuildQuery_between_operator_uses_day_match_clauses_for_each_day()
    {
        var query = ExamineDateFieldQuery.BuildQuery(
            "datePicker",
            CreateCondition(
                SearchOperator.Between,
                fromDate: new DateTimeOffset(2024, 1, 1, 0, 0, 0, TimeSpan.Zero),
                toDate: new DateTimeOffset(2024, 1, 3, 0, 0, 0, TimeSpan.Zero)));

        Assert.Contains("datePicker:\"2024-01-01 00:00:00\"", query, StringComparison.Ordinal);
        Assert.Contains("datePicker:2024\\-01\\-02", query, StringComparison.Ordinal);
        Assert.Contains("datePicker:\"2024-01-03 00:00:00\"", query, StringComparison.Ordinal);
    }

    [Fact]
    public void BuildGroupedQuery_combines_multiple_fields_with_or()
    {
        var query = ExamineDateFieldQuery.BuildGroupedQuery(
            ["datePicker_en-us", "datePicker_da-dk"],
            CreateCondition(
                SearchOperator.Equals,
                fromDate: new DateTimeOffset(2024, 1, 15, 0, 0, 0, TimeSpan.Zero),
                toDate: new DateTimeOffset(2024, 1, 15, 23, 59, 59, TimeSpan.Zero)));

        Assert.Contains("datePicker_en-us:\"2024-01-15 00:00:00\"", query, StringComparison.Ordinal);
        Assert.Contains("datePicker_da-dk:\"2024-01-15 00:00:00\"", query, StringComparison.Ordinal);
        Assert.Contains(" OR ", query, StringComparison.Ordinal);
    }

    [Theory]
    [InlineData("2026-07-01", 2026, 7, 1)]
    [InlineData("2026-07-01T00:00:00", 2026, 7, 1)]
    [InlineData("2026-07-01 00:00:00", 2026, 7, 1)]
    public void TryParseSearchDate_supports_common_date_formats(
        string value,
        int year,
        int month,
        int day)
    {
        Assert.True(ExamineDateFieldQuery.TryParseSearchDate(value, out var parsed));
        Assert.Equal(new DateTime(year, month, day), parsed.Date);
    }

    private static NormalizedSearchCondition CreateCondition(
        SearchOperator searchOperator,
        DateTimeOffset? fromDate = null,
        DateTimeOffset? toDate = null,
        string? value = null)
        => new()
        {
            ContentTypeAlias = "content",
            PropertyAlias = "datePicker",
            Operator = searchOperator,
            Value = value,
            FromDate = fromDate,
            ToDate = toDate,
            ResolvedExamineFieldNames = ["datePicker"],
            ResolutionStrategy = ExamineFieldResolutionStrategy.Direct,
            Metadata = new SearchablePropertyMetadata
            {
                Alias = "datePicker",
                Name = "Date picker",
                EditorAlias = "Umbraco.DateTime",
            },
        };
}

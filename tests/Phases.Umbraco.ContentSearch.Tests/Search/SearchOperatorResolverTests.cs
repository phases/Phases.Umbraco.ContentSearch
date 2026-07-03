using Phases.Umbraco.ContentSearch.Search.Enums;
using Phases.Umbraco.ContentSearch.Search.Operators;
using Xunit;

namespace Phases.Umbraco.ContentSearch.Tests.Search;

public sealed class SearchOperatorResolverTests
{
    private readonly SearchOperatorResolver _resolver = new();

    [Theory]
    [InlineData("isEmpty", SearchOperator.IsEmpty)]
    [InlineData("IsEmpty", SearchOperator.IsEmpty)]
    [InlineData("ISNOTEMPTY", SearchOperator.IsNotEmpty)]
    public void ResolveOperator_maps_client_identifiers(string operatorId, SearchOperator expected)
    {
        Assert.Equal(expected, _resolver.ResolveOperator(operatorId));
    }

    [Theory]
    [InlineData("equals", SearchOperator.Equals)]
    [InlineData("contains", SearchOperator.Contains)]
    [InlineData("startsWith", SearchOperator.StartsWith)]
    [InlineData("endsWith", SearchOperator.EndsWith)]
    [InlineData("greaterThan", SearchOperator.GreaterThan)]
    [InlineData("lessThan", SearchOperator.LessThan)]
    [InlineData("between", SearchOperator.Between)]
    [InlineData("isNotEmpty", SearchOperator.IsNotEmpty)]
    public void ResolveOperator_maps_camelCase_identifiers(string operatorId, SearchOperator expected)
    {
        Assert.Equal(expected, _resolver.ResolveOperator(operatorId));
    }

    [Fact]
    public void ResolveComparisonValues_parses_release_date_greater_than()
    {
        var values = new NormalizedSearchConditionValues();
        var metadata = new Phases.Umbraco.ContentSearch.Metadata.Models.SearchablePropertyMetadata
        {
            Alias = "releaseDate",
            Name = "Release date",
            EditorAlias = "Umbraco.DateTime",
        };

        _resolver.ResolveComparisonValues(
            values,
            metadata,
            SearchOperator.GreaterThan,
            DateTimeOffset.UtcNow.ToString("O"));

        Assert.NotNull(values.FromDate);
    }

    [Fact]
    public void ResolveComparisonValues_parses_date_between_range()
    {
        var values = new NormalizedSearchConditionValues();
        var metadata = new Phases.Umbraco.ContentSearch.Metadata.Models.SearchablePropertyMetadata
        {
            Alias = "createDate",
            Name = "Create date",
            EditorAlias = "Umbraco.DateTime",
        };

        _resolver.ResolveComparisonValues(
            values,
            metadata,
            SearchOperator.Between,
            "2024-01-01..2024-12-31");

        Assert.NotNull(values.FromDate);
        Assert.NotNull(values.ToDate);
    }

    [Theory]
    [InlineData("true", "1")]
    [InlineData("True", "1")]
    [InlineData("false", "0")]
    [InlineData("False", "0")]
    [InlineData("1", "1")]
    [InlineData("0", "0")]
    public void ResolveComparisonValues_normalizes_truefalse_values(
        string input,
        string expected)
    {
        var values = new NormalizedSearchConditionValues();
        var metadata = new Phases.Umbraco.ContentSearch.Metadata.Models.SearchablePropertyMetadata
        {
            Alias = "isFeatured",
            Name = "Is Featured",
            EditorAlias = "Umbraco.TrueFalse",
        };

        _resolver.ResolveComparisonValues(
            values,
            metadata,
            SearchOperator.Equals,
            input);

        Assert.Equal(expected, values.Value);
    }

    [Theory]
    [InlineData("before", SearchOperator.LessThan)]
    [InlineData("after", SearchOperator.GreaterThan)]
    [InlineData("greaterThanOrEqual", SearchOperator.GreaterThanOrEqual)]
    [InlineData("lessThanOrEqual", SearchOperator.LessThanOrEqual)]
    [InlineData("isTrue", SearchOperator.IsTrue)]
    [InlineData("isFalse", SearchOperator.IsFalse)]
    [InlineData("today", SearchOperator.Today)]
    [InlineData("last7Days", SearchOperator.Last7Days)]
    [InlineData("containsAny", SearchOperator.ContainsAny)]
    [InlineData("containsAll", SearchOperator.ContainsAll)]
    [InlineData("hasMedia", SearchOperator.IsNotEmpty)]
    [InlineData("hasNoMedia", SearchOperator.IsEmpty)]
    [InlineData("hasValue", SearchOperator.IsNotEmpty)]
    [InlineData("hasNoValue", SearchOperator.IsEmpty)]
    public void ResolveOperator_maps_extended_identifiers(string operatorId, SearchOperator expected)
    {
        Assert.Equal(expected, _resolver.ResolveOperator(operatorId));
    }

    [Fact]
    public void ResolveComparisonValues_sets_relative_date_range_for_today()
    {
        var values = new NormalizedSearchConditionValues();

        _resolver.ResolveComparisonValues(
            values,
            null,
            SearchOperator.Today,
            null);

        Assert.NotNull(values.FromDate);
        Assert.NotNull(values.ToDate);
    }

    [Fact]
    public void ResolveComparisonValues_sets_boolean_value_for_is_true()
    {
        var values = new NormalizedSearchConditionValues();

        _resolver.ResolveComparisonValues(
            values,
            null,
            SearchOperator.IsTrue,
            null);

        Assert.Equal("1", values.Value);
    }
}

using Examine;
using Examine.Search;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using Phases.Umbraco.ContentSearch.Examine;
using Phases.Umbraco.ContentSearch.Examine.Models;
using Phases.Umbraco.ContentSearch.Metadata.Constants;
using Phases.Umbraco.ContentSearch.Search.Enums;
using Phases.Umbraco.ContentSearch.Search.Models;
using Xunit;

namespace Phases.Umbraco.ContentSearch.Tests.Examine;

public sealed class ContentSearchExamineQueryBuilderTests
{
    private readonly ContentSearchExamineQueryBuilder _builder = new(NullLogger<ContentSearchExamineQueryBuilder>.Instance);

    [Fact]
    public async Task BuildAsync_contains_operator_uses_substring_wildcard_pattern()
    {
        var (booleanOperation, innerQuery, examineValues, _) = CreateQueryMocks();
        var request = CreateRequest(
            SearchOperator.Contains,
            "standardPage 666",
            ["pageTitle"]);

        await _builder.BuildAsync(request, booleanOperation.Object);

        var (field, examineValue) = Assert.Single(examineValues);
        Assert.Equal("pageTitle", field);
        Assert.Equal(Examineness.ComplexWildcard, examineValue.Examineness);
        Assert.Equal("standardPage 666", examineValue.Value);
    }

    [Fact]
    public async Task BuildAsync_isEmpty_operator_uses_native_empty_query()
    {
        var (booleanOperation, _, _, nativeQueries) = CreateQueryMocks();
        var request = CreateRequest(
            SearchOperator.IsEmpty,
            string.Empty,
            [ContentSearchExamineFields.Url]);

        await _builder.BuildAsync(request, booleanOperation.Object);

        Assert.Contains(
            ExamineEmptyFieldQuery.BuildIsEmptyQuery(ContentSearchExamineFields.Url),
            Assert.Single(nativeQueries));
    }

    [Fact]
    public async Task BuildAsync_isNotEmpty_operator_uses_native_nonempty_query()
    {
        var (booleanOperation, _, _, nativeQueries) = CreateQueryMocks();
        var request = CreateRequest(
            SearchOperator.IsNotEmpty,
            string.Empty,
            [ContentSearchExamineFields.NodeName]);

        await _builder.BuildAsync(request, booleanOperation.Object);

        Assert.Contains(
            ExamineEmptyFieldQuery.BuildIsNotEmptyQuery(ContentSearchExamineFields.NodeName),
            Assert.Single(nativeQueries));
    }

    [Fact]
    public async Task BuildAsync_equals_operator_uses_phrase_native_query()
    {
        var (booleanOperation, _, _, nativeQueries) = CreateQueryMocks();
        var request = CreateRequest(
            SearchOperator.Equals,
            "standardPage 666",
            ["pageTitle"]);

        await _builder.BuildAsync(request, booleanOperation.Object);

        Assert.Contains("+pageTitle:\"standardPage 666\"", Assert.Single(nativeQueries));
    }

    [Fact]
    public async Task BuildAsync_not_equals_operator_uses_negated_phrase_native_query()
    {
        var (booleanOperation, _, _, nativeQueries) = CreateQueryMocks();
        var request = CreateRequest(
            SearchOperator.NotEquals,
            "standardPage 666",
            ["pageTitle"]);

        await _builder.BuildAsync(request, booleanOperation.Object);

        Assert.Contains("-pageTitle:\"standardPage 666\"", Assert.Single(nativeQueries));
    }

    [Fact]
    public async Task BuildAsync_not_contains_operator_uses_negated_wildcard_native_query()
    {
        var (booleanOperation, _, _, nativeQueries) = CreateQueryMocks();
        var request = CreateRequest(
            SearchOperator.NotContains,
            "standardPage 666",
            ["pageTitle"]);

        await _builder.BuildAsync(request, booleanOperation.Object);

        var nativeQuery = Assert.Single(nativeQueries);
        Assert.Contains("-pageTitle:*standardPage 666*", nativeQuery, StringComparison.Ordinal);
    }

    [Fact]
    public async Task BuildAsync_equals_operator_queries_each_culture_field_with_phrase_value()
    {
        var (booleanOperation, _, _, nativeQueries) = CreateQueryMocks();
        var request = CreateRequest(
            SearchOperator.Equals,
            "standardPage 666",
            ["pageTitle_en-us", "pageTitle_da-dk"]);

        await _builder.BuildAsync(request, booleanOperation.Object);

        var nativeQuery = Assert.Single(nativeQueries);
        Assert.Contains("pageTitle_en-us:\"standardPage 666\"", nativeQuery, StringComparison.Ordinal);
        Assert.Contains("pageTitle_da-dk:\"standardPage 666\"", nativeQuery, StringComparison.Ordinal);
        Assert.Contains(" OR ", nativeQuery, StringComparison.Ordinal);
    }

    [Fact]
    public async Task BuildAsync_custom_date_property_uses_text_indexed_date_native_query()
    {
        var (booleanOperation, _, _, nativeQueries) = CreateQueryMocks();
        var request = CreateRequest(
            SearchOperator.GreaterThan,
            "2024-01-15",
            ["datePicker"],
            propertyAlias: "datePicker",
            editorAlias: "Umbraco.DateTime",
            fromDate: new DateTimeOffset(2024, 1, 15, 0, 0, 0, TimeSpan.Zero));

        await _builder.BuildAsync(request, booleanOperation.Object);

        Assert.Contains("datePicker:2024*", Assert.Single(nativeQueries));
    }

    [Fact]
    public async Task BuildAsync_system_create_date_uses_datetime_range_query()
    {
        var (booleanOperation, innerQuery, _, _) = CreateQueryMocks();
        var request = CreateRequest(
            SearchOperator.GreaterThan,
            "2024-01-15",
            [ContentSearchExamineFields.CreateDate],
            propertyAlias: ContentSearchExamineFields.CreateDate,
            editorAlias: "Umbraco.DateTime",
            fromDate: new DateTimeOffset(2024, 1, 15, 0, 0, 0, TimeSpan.Zero));

        await _builder.BuildAsync(request, booleanOperation.Object);

        innerQuery.Verify(
            q => q.RangeQuery(
                It.Is<string[]>(fields => fields.Single() == ContentSearchExamineFields.CreateDate),
                It.IsAny<DateTime?>(),
                It.Is<DateTime?>(value => value == null)),
            Times.Once);
    }

    private static NormalizedContentSearchRequest CreateRequest(
        SearchOperator searchOperator,
        string value,
        IReadOnlyList<string> fields,
        string propertyAlias = "pageTitle",
        string? editorAlias = null,
        DateTimeOffset? fromDate = null,
        DateTimeOffset? toDate = null)
        => new()
        {
            MatchMode = SearchMatchMode.All,
            Conditions =
            [
                new NormalizedSearchCondition
                {
                    ContentTypeAlias = ContentSearchMetadataConstants.WildcardContentTypeAlias,
                    PropertyAlias = propertyAlias,
                    Operator = searchOperator,
                    Value = value,
                    FromDate = fromDate,
                    ToDate = toDate,
                    ResolutionStrategy = ExamineFieldResolutionStrategy.Direct,
                    ResolvedExamineFieldNames = fields,
                    Metadata = editorAlias is null
                        ? null
                        : new Phases.Umbraco.ContentSearch.Metadata.Models.SearchablePropertyMetadata
                        {
                            Alias = propertyAlias,
                            Name = propertyAlias,
                            EditorAlias = editorAlias,
                        },
                },
            ],
        };

    private static (
        Mock<IBooleanOperation> BooleanOperation,
        Mock<IQuery> InnerQuery,
        List<(string Field, IExamineValue Value)> ExamineValues,
        List<string> NativeQueries) CreateQueryMocks()
    {
        var booleanOperation = new Mock<IBooleanOperation>();
        var innerQuery = new Mock<IQuery>();
        var examineValues = new List<(string Field, IExamineValue Value)>();
        var nativeQueries = new List<string>();

        booleanOperation
            .Setup(q => q.And())
            .Returns(innerQuery.Object);

        booleanOperation
            .Setup(q => q.Or())
            .Returns(innerQuery.Object);

        innerQuery
            .Setup(q => q.RangeQuery(It.IsAny<string[]>(), It.IsAny<DateTime?>(), It.IsAny<DateTime?>()))
            .Returns(booleanOperation.Object);

        innerQuery
            .Setup(q => q.NativeQuery(It.IsAny<string>()))
            .Callback<string>(nativeQueries.Add)
            .Returns(booleanOperation.Object);

        innerQuery
            .Setup(q => q.Field(It.IsAny<string>(), It.IsAny<string>()))
            .Returns(booleanOperation.Object);

        innerQuery
            .Setup(q => q.Field(It.IsAny<string>(), It.IsAny<IExamineValue>()))
            .Callback<string, IExamineValue>((field, value) => examineValues.Add((field, value)))
            .Returns(booleanOperation.Object);

        return (booleanOperation, innerQuery, examineValues, nativeQueries);
    }
}

using Examine;
using Examine.Search;
using Microsoft.Extensions.Logging;
using Moq;
using Phases.Umbraco.FilterNodes.Models.Enums;
using Phases.Umbraco.FilterNodes.Models.Examine;
using Phases.Umbraco.FilterNodes.Models.Requests;
using Phases.Umbraco.FilterNodes.Models.Responses;
using Phases.Umbraco.FilterNodes.Services;
using Phases.Umbraco.FilterNodes.Services.Examine;
using Xunit;

namespace Phases.Umbraco.FilterNodes.Tests.Services;

public sealed class ExamineQueryBuilderTests
{
    private readonly ExamineQueryBuilder _builder;

    public ExamineQueryBuilderTests()
    {
        var fieldResolver = new Mock<IExamineFieldResolver>();
        fieldResolver
            .Setup(resolver => resolver.Resolve(
                It.IsAny<string>(),
                It.IsAny<FilterablePropertyMetadata?>(),
                It.IsAny<SearchCultureContext?>()))
            .Returns((string propertyAlias, FilterablePropertyMetadata? _, SearchCultureContext? _) => new ExamineFieldResolution
            {
                FieldNames = [propertyAlias],
                Strategy = ExamineFieldResolutionStrategy.Direct,
            });

        _builder = new ExamineQueryBuilder(
            fieldResolver.Object,
            Mock.Of<ILogger<ExamineQueryBuilder>>());
    }

    [Theory]
    [InlineData("bodyText", FilterOperator.IsEmpty, "*:* -bodyText:[\u0001 TO *]")]
    [InlineData("category", FilterOperator.IsEmpty, "*:* -category:[\u0001 TO *]")]
    [InlineData("isFeatured", FilterOperator.IsEmpty, "*:* -isFeatured:[\u0001 TO *]")]
    [InlineData("publishDate", FilterOperator.IsEmpty, "*:* -publishDate:[\u0001 TO *]")]
    [InlineData("bodyText", FilterOperator.IsNotEmpty, "+bodyText:[\u0001 TO *]")]
    [InlineData("category", FilterOperator.IsNotEmpty, "+category:[\u0001 TO *]")]
    [InlineData("isFeatured", FilterOperator.IsNotEmpty, "+isFeatured:[\u0001 TO *]")]
    [InlineData("publishDate", FilterOperator.IsNotEmpty, "+publishDate:[\u0001 TO *]")]
    public async Task BuildAsync_uses_native_query_for_empty_operators(
        string propertyAlias,
        FilterOperator filterOperator,
        string expectedNativeQuery)
    {
        var (booleanOperation, innerQuery, nativeQueries) = CreateQueryMocks();
        var request = CreateRequest(propertyAlias, filterOperator);

        await _builder.BuildAsync(request, booleanOperation.Object);

        Assert.Equal(expectedNativeQuery, Assert.Single(nativeQueries));
        innerQuery.Verify(q => q.NativeQuery(expectedNativeQuery), Times.Once);
    }

    [Fact]
    public async Task BuildAsync_equals_operator_uses_phrase_match_for_text()
    {
        var (booleanOperation, innerQuery, nativeQueries) = CreateQueryMocks();
        var fieldQueries = new List<(string Field, IExamineValue Value)>();
        innerQuery
            .Setup(q => q.Field(It.IsAny<string>(), It.IsAny<IExamineValue>()))
            .Callback<string, IExamineValue>((field, value) => fieldQueries.Add((field, value)))
            .Returns(booleanOperation.Object);

        var request = new FilterRequest
        {
            FilterType = FilterType.All,
            Conditions =
            [
                new FilterCondition
                {
                    PropertyAlias = "blogTitle",
                    FilterOperator = FilterOperator.Equals,
                    PropertyValue = "Blog 01",
                    PropertyFilterType = PropertyFilterType.Text,
                },
            ],
        };

        await _builder.BuildAsync(request, booleanOperation.Object);

        Assert.Empty(nativeQueries);
        var (field, examineValue) = Assert.Single(fieldQueries);
        Assert.Equal("blogTitle", field);
        Assert.Equal(Examineness.Escaped, examineValue.Examineness);
    }

    [Fact]
    public async Task BuildAsync_equals_operator_uses_phrase_match_for_dropdown_values()
    {
        var (booleanOperation, innerQuery, nativeQueries) = CreateQueryMocks();
        var fieldQueries = new List<(string Field, IExamineValue Value)>();
        innerQuery
            .Setup(q => q.Field(It.IsAny<string>(), It.IsAny<IExamineValue>()))
            .Callback<string, IExamineValue>((field, value) => fieldQueries.Add((field, value)))
            .Returns(booleanOperation.Object);

        var request = new FilterRequest
        {
            FilterType = FilterType.All,
            Conditions =
            [
                new FilterCondition
                {
                    PropertyAlias = "rdBlog",
                    FilterOperator = FilterOperator.Equals,
                    PropertyValue = "1 R",
                    PropertyFilterType = PropertyFilterType.Dropdown,
                },
            ],
        };

        await _builder.BuildAsync(request, booleanOperation.Object);

        Assert.Empty(nativeQueries);
        var (field, examineValue) = Assert.Single(fieldQueries);
        Assert.Equal("rdBlog", field);
        Assert.Equal(Examineness.Escaped, examineValue.Examineness);
    }

    [Fact]
    public async Task BuildAsync_equals_operator_uses_phrase_match_for_multiselect_values()
    {
        var (booleanOperation, innerQuery, nativeQueries) = CreateQueryMocks();
        var fieldQueries = new List<(string Field, IExamineValue Value)>();
        innerQuery
            .Setup(q => q.Field(It.IsAny<string>(), It.IsAny<IExamineValue>()))
            .Callback<string, IExamineValue>((field, value) => fieldQueries.Add((field, value)))
            .Returns(booleanOperation.Object);

        var request = new FilterRequest
        {
            FilterType = FilterType.All,
            Conditions =
            [
                new FilterCondition
                {
                    PropertyAlias = "checkList",
                    FilterOperator = FilterOperator.Equals,
                    PropertyValue = "One check",
                    PropertyFilterType = PropertyFilterType.MultiSelect,
                },
            ],
        };

        await _builder.BuildAsync(request, booleanOperation.Object);

        Assert.Empty(nativeQueries);
        var (field, examineValue) = Assert.Single(fieldQueries);
        Assert.Equal("checkList", field);
        Assert.Equal(Examineness.Escaped, examineValue.Examineness);
        Assert.Equal("one check", examineValue.Value);
    }

    [Fact]
    public async Task BuildAsync_is_empty_with_any_filter_or_chains_native_query_with_grouped_or()
    {
        var (booleanOperation, innerQuery, nativeQueries) = CreateQueryMocks();
        var groupedOrCalls = 0;
        var orCalls = 0;
        innerQuery
            .Setup(q => q.GroupedOr(It.IsAny<IEnumerable<string>>(), It.IsAny<string[]>()))
            .Callback(() => groupedOrCalls++)
            .Returns(booleanOperation.Object);

        booleanOperation
            .Setup(q => q.Or())
            .Callback(() => orCalls++)
            .Returns(innerQuery.Object);

        var request = new FilterRequest
        {
            FilterType = FilterType.Any,
            Conditions =
            [
                new FilterCondition
                {
                    PropertyAlias = "bodyText",
                    FilterOperator = FilterOperator.IsEmpty,
                },
                new FilterCondition
                {
                    PropertyAlias = "category",
                    FilterOperator = FilterOperator.Equals,
                    PropertyValue = "news",
                },
            ],
        };

        await _builder.BuildAsync(request, booleanOperation.Object);

        Assert.Equal(0, groupedOrCalls);
        Assert.Equal(1, orCalls);
        Assert.Equal("*:* -bodyText:[\u0001 TO *]", Assert.Single(nativeQueries));
        innerQuery.Verify(
            q => q.Field("category", It.IsAny<IExamineValue>()),
            Times.Once);
    }

    [Fact]
    public async Task BuildAsync_is_empty_or_is_not_empty_with_any_filter_applies_both_native_queries()
    {
        var (booleanOperation, innerQuery, nativeQueries) = CreateQueryMocks();
        var orCalls = 0;
        booleanOperation
            .Setup(q => q.Or())
            .Callback(() => orCalls++)
            .Returns(innerQuery.Object);

        var request = new FilterRequest
        {
            FilterType = FilterType.Any,
            Conditions =
            [
                new FilterCondition
                {
                    PropertyAlias = "blogTitle",
                    FilterOperator = FilterOperator.IsEmpty,
                },
                new FilterCondition
                {
                    PropertyAlias = "blogTitle",
                    FilterOperator = FilterOperator.IsNotEmpty,
                },
            ],
        };

        await _builder.BuildAsync(request, booleanOperation.Object);

        Assert.Equal(1, orCalls);
        Assert.Equal(2, nativeQueries.Count);
        Assert.Contains("*:* -blogTitle:[\u0001 TO *]", nativeQueries);
        Assert.Contains("+blogTitle:[\u0001 TO *]", nativeQueries);
        innerQuery.Verify(q => q.GroupedOr(It.IsAny<IEnumerable<string>>(), It.IsAny<string[]>()), Times.Never);
    }

    [Fact]
    public async Task BuildAsync_contains_operator_queries_block_grid_container_field()
    {
        var (booleanOperation, innerQuery, nativeQueries) = CreateQueryMocks();
        var fieldQueries = new List<(string Field, IExamineValue Value)>();
        innerQuery
            .Setup(q => q.Field(It.IsAny<string>(), It.IsAny<IExamineValue>()))
            .Callback<string, IExamineValue>((field, value) => fieldQueries.Add((field, value)))
            .Returns(booleanOperation.Object);

        var request = new FilterRequest
        {
            FilterType = FilterType.All,
            Conditions =
            [
                new FilterCondition
                {
                    PropertyAlias = "bgCheck",
                    FilterOperator = FilterOperator.Contains,
                    PropertyValue = "BGTitle",
                    PropertyFilterType = PropertyFilterType.Text,
                },
            ],
        };

        await _builder.BuildAsync(request, booleanOperation.Object);

        Assert.Empty(nativeQueries);
        var (field, examineValue) = Assert.Single(fieldQueries);
        Assert.Equal("bgCheck", field);
        Assert.Equal(Examineness.ComplexWildcard, examineValue.Examineness);
        Assert.Equal("BGTitle", examineValue.Value);
    }

    [Fact]
    public async Task BuildAsync_contains_operator_queries_all_resolved_culture_fields()
    {
        var (booleanOperation, innerQuery, nativeQueries) = CreateQueryMocks();
        var groupedOrFields = Array.Empty<string>();
        var groupedOrValues = Array.Empty<string>();
        innerQuery
            .Setup(q => q.GroupedOr(It.IsAny<IEnumerable<string>>(), It.IsAny<string[]>()))
            .Callback<IEnumerable<string>, string[]>((fields, values) =>
            {
                groupedOrFields = fields.ToArray();
                groupedOrValues = values;
            })
            .Returns(booleanOperation.Object);

        var request = new FilterRequest
        {
            FilterType = FilterType.All,
            Conditions =
            [
                new FilterCondition
                {
                    PropertyAlias = "seoTitle",
                    FilterOperator = FilterOperator.Contains,
                    PropertyValue = "Hello",
                    PropertyFilterType = PropertyFilterType.Text,
                    ResolvedExamineFieldNames = ["seoTitle_da-dk", "seoTitle_en-us"],
                    ExamineResolutionStrategy = ExamineFieldResolutionStrategy.Direct,
                },
            ],
        };

        await _builder.BuildAsync(request, booleanOperation.Object);

        Assert.Empty(nativeQueries);
        Assert.Equal(["seoTitle_da-dk", "seoTitle_en-us"], groupedOrFields);
        Assert.Equal(2, groupedOrValues.Length);
        Assert.All(groupedOrValues, value => Assert.Contains("Hello", value, StringComparison.Ordinal));
    }

    [Fact]
    public void RequiresContentEvaluation_uses_content_for_is_empty_operators()
    {
        var condition = new FilterCondition
        {
            PropertyAlias = "blogImage",
            FilterOperator = FilterOperator.IsEmpty,
            ResolvedExamineFieldNames = ["blogImage"],
            ExamineResolutionStrategy = ExamineFieldResolutionStrategy.Direct,
        };

        Assert.True(FilterConditionContentEvaluator.RequiresContentEvaluation(condition));
    }

    [Fact]
    public void RequiresContentEvaluation_uses_content_for_is_not_empty_operators()
    {
        var condition = new FilterCondition
        {
            PropertyAlias = "websiteName",
            FilterOperator = FilterOperator.IsNotEmpty,
            ResolvedExamineFieldNames = ["websiteName_en-us"],
            ExamineResolutionStrategy = ExamineFieldResolutionStrategy.Direct,
        };

        Assert.True(FilterConditionContentEvaluator.RequiresContentEvaluation(condition));
    }

    [Fact]
    public async Task BuildAsync_unresolved_property_uses_impossible_native_query()
    {
        var (booleanOperation, innerQuery, nativeQueries) = CreateQueryMocks();
        var fieldResolver = new Mock<IExamineFieldResolver>();
        fieldResolver
            .Setup(resolver => resolver.Resolve(
                It.IsAny<string>(),
                It.IsAny<FilterablePropertyMetadata?>(),
                It.IsAny<SearchCultureContext?>()))
            .Returns(new ExamineFieldResolution
            {
                FieldNames = [],
                Strategy = ExamineFieldResolutionStrategy.Unsupported,
            });

        var builder = new ExamineQueryBuilder(
            fieldResolver.Object,
            Mock.Of<ILogger<ExamineQueryBuilder>>());

        var request = new FilterRequest
        {
            FilterType = FilterType.All,
            Conditions =
            [
                new FilterCondition
                {
                    PropertyAlias = "bgCheck__blockGridComponent2__bgTitle",
                    FilterOperator = FilterOperator.Contains,
                    PropertyValue = "BGTitle",
                    PropertyFilterType = PropertyFilterType.Text,
                },
            ],
        };

        await builder.BuildAsync(request, booleanOperation.Object);

        Assert.Equal("+id:__filter_nodes_unresolved_property__", Assert.Single(nativeQueries));
        innerQuery.Verify(q => q.NativeQuery("+id:__filter_nodes_unresolved_property__"), Times.Once);
    }

    [Fact]
    public async Task BuildAsync_uses_pre_resolved_examine_fields_from_condition()
    {
        var (booleanOperation, innerQuery, nativeQueries) = CreateQueryMocks();
        var fieldQueries = new List<(string Field, IExamineValue Value)>();
        innerQuery
            .Setup(q => q.Field(It.IsAny<string>(), It.IsAny<IExamineValue>()))
            .Callback<string, IExamineValue>((field, value) => fieldQueries.Add((field, value)))
            .Returns(booleanOperation.Object);

        var fieldResolver = new Mock<IExamineFieldResolver>();
        fieldResolver
            .Setup(resolver => resolver.Resolve(It.IsAny<string>(), It.IsAny<Models.Responses.FilterablePropertyMetadata?>()))
            .Throws(new InvalidOperationException("Resolver should not be called when fields are pre-resolved."));

        var builder = new ExamineQueryBuilder(
            fieldResolver.Object,
            Mock.Of<ILogger<ExamineQueryBuilder>>());

        var request = new FilterRequest
        {
            FilterType = FilterType.All,
            Conditions =
            [
                new FilterCondition
                {
                    PropertyAlias = "bgCheck",
                    FilterOperator = FilterOperator.Contains,
                    PropertyValue = "BGTitle",
                    PropertyFilterType = PropertyFilterType.Text,
                    ResolvedExamineFieldNames = ["bgCheck"],
                    ExamineResolutionStrategy = ExamineFieldResolutionStrategy.ContainerOnly,
                },
            ],
        };

        await builder.BuildAsync(request, booleanOperation.Object);

        Assert.Empty(nativeQueries);
        var (field, examineValue) = Assert.Single(fieldQueries);
        Assert.Equal("bgCheck", field);
        Assert.Equal(Examineness.ComplexWildcard, examineValue.Examineness);
        fieldResolver.Verify(
            resolver => resolver.Resolve(
                It.IsAny<string>(),
                It.IsAny<FilterablePropertyMetadata?>(),
                It.IsAny<SearchCultureContext?>()),
            Times.Never);
    }

    private static FilterRequest CreateRequest(
        string propertyAlias,
        FilterOperator filterOperator,
        string? propertyValue = null)
        => new()
        {
            FilterType = FilterType.All,
            Conditions =
            [
                new FilterCondition
                {
                    PropertyAlias = propertyAlias,
                    FilterOperator = filterOperator,
                    PropertyValue = propertyValue,
                },
            ],
        };

    private static (Mock<IBooleanOperation> BooleanOperation, Mock<IQuery> InnerQuery, List<string> NativeQueries) CreateQueryMocks()
    {
        var nativeQueries = new List<string>();
        var innerQuery = new Mock<IQuery>();
        var booleanOperation = new Mock<IBooleanOperation>();

        innerQuery
            .Setup(q => q.NativeQuery(It.IsAny<string>()))
            .Callback<string>(nativeQueries.Add)
            .Returns(booleanOperation.Object);

        innerQuery
            .Setup(q => q.Field(It.IsAny<string>(), It.IsAny<IExamineValue>()))
            .Returns(booleanOperation.Object);

        innerQuery
            .Setup(q => q.Field(It.IsAny<string>(), It.IsAny<string>()))
            .Returns(booleanOperation.Object);

        booleanOperation
            .Setup(q => q.And())
            .Returns(innerQuery.Object);

        booleanOperation
            .Setup(q => q.Or())
            .Returns(innerQuery.Object);

        return (booleanOperation, innerQuery, nativeQueries);
    }
}

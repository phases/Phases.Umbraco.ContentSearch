using Phases.Umbraco.ContentSearch.Examine.Models;
using Phases.Umbraco.ContentSearch.Search.Enums;
using Phases.Umbraco.ContentSearch.Search.Mapping;
using Phases.Umbraco.ContentSearch.Search.Models;
using Xunit;

namespace Phases.Umbraco.ContentSearch.Tests.Search;

public sealed class ContentSearchResultMatchExtractorTests
{
    private readonly ContentSearchResultMatchExtractor _extractor = new();

    [Fact]
    public void Extract_contains_operator_returns_snippet_and_highlight_term()
    {
        var fieldValues = new Dictionary<string, string>
        {
            ["pageTitle"] = "Welcome to standardPage 666 home",
        };

        var conditions = new[]
        {
            CreateCondition(
                "pageTitle",
                "Page Title",
                SearchOperator.Contains,
                "standardPage 666",
                ["pageTitle"]),
        };

        var matches = _extractor.Extract(fieldValues, conditions);

        var match = Assert.Single(matches);
        Assert.Equal("Page Title", match.PropertyName);
        Assert.Contains("standardPage 666", match.Snippet, StringComparison.Ordinal);
        Assert.Contains("standardPage 666", match.HighlightTerms, StringComparer.Ordinal);
        Assert.Null(match.OperatorLabel);
    }

    [Fact]
    public void Extract_isEmpty_operator_returns_operator_label_only()
    {
        var fieldValues = new Dictionary<string, string>
        {
            ["featuredImage"] = string.Empty,
        };

        var conditions = new[]
        {
            CreateCondition(
                "featuredImage",
                "Featured Image",
                SearchOperator.IsEmpty,
                null,
                ["featuredImage"]),
        };

        var matches = _extractor.Extract(fieldValues, conditions);

        var match = Assert.Single(matches);
        Assert.Equal("Featured Image", match.PropertyName);
        Assert.Equal("is empty", match.OperatorLabel);
        Assert.Null(match.Snippet);
        Assert.Empty(match.HighlightTerms);
    }

    [Fact]
    public void Extract_multiple_conditions_returns_multiple_matches()
    {
        var fieldValues = new Dictionary<string, string>
        {
            ["pageTitle"] = "Hello world",
            ["bodyText"] = "Lorem ipsum dolor",
        };

        var conditions = new[]
        {
            CreateCondition("pageTitle", "Page Title", SearchOperator.Contains, "world", ["pageTitle"]),
            CreateCondition("bodyText", "Body Text", SearchOperator.Contains, "ipsum", ["bodyText"]),
        };

        var matches = _extractor.Extract(fieldValues, conditions);

        Assert.Equal(2, matches.Count);
        Assert.Contains(matches, match => match.PropertyAlias == "pageTitle");
        Assert.Contains(matches, match => match.PropertyAlias == "bodyText");
    }

    [Fact]
    public void Extract_prefers_culture_field_containing_search_term()
    {
        var fieldValues = new Dictionary<string, string>
        {
            ["pageTitle_en-us"] = "English title",
            ["pageTitle_da-dk"] = "Danish standardPage 666 title",
        };

        var conditions = new[]
        {
            CreateCondition(
                "pageTitle",
                "Page Title",
                SearchOperator.Contains,
                "standardPage 666",
                ["pageTitle_en-us", "pageTitle_da-dk"]),
        };

        var matches = _extractor.Extract(fieldValues, conditions);

        var match = Assert.Single(matches);
        Assert.Contains("standardPage 666", match.Snippet, StringComparison.Ordinal);
    }

    [Fact]
    public void Extract_nodeName_condition_returns_match_info()
    {
        var fieldValues = new Dictionary<string, string>
        {
            ["nodeName"] = "Home standardPage 666",
        };

        var conditions = new[]
        {
            CreateCondition(
                "nodeName",
                "Node name",
                SearchOperator.Contains,
                "standardPage 666",
                ["nodeName"]),
        };

        var matches = _extractor.Extract(fieldValues, conditions);

        var match = Assert.Single(matches);
        Assert.Equal("nodeName", match.PropertyAlias);
        Assert.Equal("Node name", match.PropertyName);
        Assert.Contains("standardPage 666", match.Snippet, StringComparison.Ordinal);
    }

    [Fact]
    public void Extract_notContains_returns_operator_label_without_snippet()
    {
        var fieldValues = new Dictionary<string, string>
        {
            ["bodyText"] = "Some content without the term",
        };

        var conditions = new[]
        {
            CreateCondition(
                "bodyText",
                "Body Text",
                SearchOperator.NotContains,
                "missing",
                ["bodyText"]),
        };

        var matches = _extractor.Extract(fieldValues, conditions);

        var match = Assert.Single(matches);
        Assert.Equal("does not contain", match.OperatorLabel);
        Assert.Null(match.Snippet);
    }

    private static NormalizedSearchCondition CreateCondition(
        string propertyAlias,
        string propertyName,
        SearchOperator @operator,
        string? value,
        IReadOnlyList<string> resolvedFields)
        => new()
        {
            ContentTypeAlias = "standardPage",
            PropertyAlias = propertyAlias,
            Operator = @operator,
            Value = value,
            ResolvedExamineFieldNames = resolvedFields,
            ResolutionStrategy = ExamineFieldResolutionStrategy.Direct,
            Metadata = new Phases.Umbraco.ContentSearch.Metadata.Models.SearchablePropertyMetadata
            {
                Alias = propertyAlias,
                Name = propertyName,
            },
        };
}

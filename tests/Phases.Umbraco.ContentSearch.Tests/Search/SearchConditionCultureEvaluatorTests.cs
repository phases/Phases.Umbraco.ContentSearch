using Phases.Umbraco.ContentSearch.Examine;
using Phases.Umbraco.ContentSearch.Examine.Models;
using Phases.Umbraco.ContentSearch.Metadata.Models;
using Phases.Umbraco.ContentSearch.Models;
using Phases.Umbraco.ContentSearch.Models.Enums;
using Phases.Umbraco.ContentSearch.Search.Enums;
using Phases.Umbraco.ContentSearch.Search.Mapping;
using Phases.Umbraco.ContentSearch.Search.Models;
using Xunit;

namespace Phases.Umbraco.ContentSearch.Tests.Search;

public sealed class SearchConditionCultureEvaluatorTests
{
    private readonly IContentSearchFieldResolver _fieldResolver = new ContentSearchFieldResolver(
        new TestFieldCatalog(new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            "rte",
            "rte_en-us",
            "rte_da-dk",
            "nodeName",
            "nodeName_en-us",
            "nodeName_da-dk",
        }));

    [Fact]
    public void MatchesCulture_variant_property_only_matches_cultures_with_matching_value()
    {
        var indexValues = new Dictionary<string, string>
        {
            ["rte_da-dk"] = "DK 01",
            ["rte_en-us"] = "English RTE content",
        };

        var conditions = new[]
        {
            CreateCondition(
                "rte",
                SearchOperator.Equals,
                "dk 01",
                variesByCulture: true,
                resolvedFields: ["rte", "rte_en-us", "rte_da-dk"]),
        };

        Assert.True(Matches(indexValues, conditions, "da-DK"));
        Assert.False(Matches(indexValues, conditions, "en-US"));
    }

    [Fact]
    public void MatchesCulture_node_name_matches_only_matching_culture_name()
    {
        var indexValues = new Dictionary<string, string>
        {
            ["nodeName_da-dk"] = "DK 01",
            ["nodeName_en-us"] = "Content",
        };

        var conditions = new[]
        {
            CreateCondition(
                "nodeName",
                SearchOperator.Equals,
                "DK 01",
                variesByCulture: false,
                resolvedFields: ["nodeName", "nodeName_en-us", "nodeName_da-dk"]),
        };

        Assert.True(Matches(indexValues, conditions, "da-DK"));
        Assert.False(Matches(indexValues, conditions, "en-US"));
    }

    [Fact]
    public void MatchesCulture_invariant_create_date_applies_to_all_cultures()
    {
        var indexValues = new Dictionary<string, string>
        {
            ["createDate"] = DateTime.UtcNow.Ticks.ToString(),
            ["rte_da-dk"] = "DK 01",
            ["rte_en-us"] = "English RTE content",
        };

        var conditions = new[]
        {
            CreateCondition(
                "rte",
                SearchOperator.Equals,
                "dk 01",
                variesByCulture: true,
                resolvedFields: ["rte", "rte_en-us", "rte_da-dk"]),
            CreateCondition(
                "createDate",
                SearchOperator.Today,
                value: null,
                variesByCulture: false,
                resolvedFields: ["createDate"],
                fromDate: DateTime.UtcNow.Date,
                toDate: DateTime.UtcNow.Date.AddDays(1).AddTicks(-1)),
        };

        Assert.True(Matches(indexValues, conditions, "da-DK"));
        Assert.False(Matches(indexValues, conditions, "en-US"));
    }

    [Fact]
    public void MatchesCulture_variant_property_falls_back_to_base_field_when_culture_field_does_not_match()
    {
        var indexValues = new Dictionary<string, string>
        {
            ["bgCheck__blockGridComponent2__isActive"] = "1",
            ["bgCheck__blockGridComponent2__isActive_en-us"] = "0",
            ["bgCheck__blockGridComponent2__isActive_da-dk"] = "0",
        };

        var conditions = new[]
        {
            CreateCondition(
                "bgCheck__blockGridComponent2__isActive",
                SearchOperator.IsTrue,
                "1",
                variesByCulture: true,
                resolvedFields:
                [
                    "bgCheck__blockGridComponent2__isActive",
                    "bgCheck__blockGridComponent2__isActive_en-us",
                    "bgCheck__blockGridComponent2__isActive_da-dk",
                ]),
        };

        Assert.True(Matches(indexValues, conditions, "en-US"));
    }

    [Fact]
    public void MatchesCulture_container_block_text_with_true_token_matches_isTrue()
    {
        var indexValues = new Dictionary<string, string>
        {
            ["blog_en-us"] = "\u0002 true BGTitle",
        };

        var conditions = new[]
        {
            CreateCondition(
                "blog__descriptionBlog__isActive",
                SearchOperator.IsTrue,
                "1",
                variesByCulture: true,
                resolvedFields: ["blog", "blog_en-us", "blog_da-dk"]),
        };

        Assert.True(Matches(indexValues, conditions, "en-US"));
    }

    private bool Matches(
        IReadOnlyDictionary<string, string> indexValues,
        IReadOnlyList<NormalizedSearchCondition> conditions,
        string culture)
        => SearchConditionCultureEvaluator.MatchesCulture(
            indexValues,
            conditions,
            SearchMatchMode.All,
            culture,
            _fieldResolver);

    private static NormalizedSearchCondition CreateCondition(
        string propertyAlias,
        SearchOperator @operator,
        string? value,
        bool variesByCulture,
        IReadOnlyList<string> resolvedFields,
        DateTime? fromDate = null,
        DateTime? toDate = null)
        => new()
        {
            ContentTypeAlias = "content",
            PropertyAlias = propertyAlias,
            Operator = @operator,
            Value = value,
            FromDate = fromDate,
            ToDate = toDate,
            ResolvedExamineFieldNames = resolvedFields,
            ResolutionStrategy = ExamineFieldResolutionStrategy.Direct,
            Metadata = new SearchablePropertyMetadata
            {
                Alias = propertyAlias,
                Name = propertyAlias,
                EditorAlias = propertyAlias.Contains("Date", StringComparison.OrdinalIgnoreCase)
                    ? "Umbraco.DateTime"
                    : "Umbraco.TextBox",
                VariesByCulture = variesByCulture,
            },
        };

    private sealed class TestFieldCatalog(IReadOnlySet<string> fields) : IExamineIndexFieldCatalog
    {
        public IReadOnlySet<string> GetFieldNames() => fields;

        public void Invalidate()
        {
        }
    }
}

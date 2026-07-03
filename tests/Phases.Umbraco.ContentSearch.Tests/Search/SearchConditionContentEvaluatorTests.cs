using Moq;
using Phases.Umbraco.ContentSearch.Search.Enums;
using Phases.Umbraco.ContentSearch.Search.Mapping;
using Phases.Umbraco.ContentSearch.Search.Models;
using Umbraco.Cms.Core.Models;
using Xunit;

namespace Phases.Umbraco.ContentSearch.Tests.Search;

public sealed class SearchConditionContentEvaluatorTests
{
    [Fact]
    public void Matches_is_empty_when_media_picker_property_is_unset()
    {
        var content = CreateContent("content", CreateProperty("featuredImage", "Umbraco.MediaPicker3", null));

        var matches = SearchConditionContentEvaluator.Matches(
            content.Object,
            [CreateCondition("featuredImage", SearchOperator.IsEmpty)],
            SearchMatchMode.All);

        Assert.True(matches);
    }

    [Fact]
    public void Matches_is_not_empty_when_media_picker_has_json_value()
    {
        const string value =
            """[{"key":"11111111-1111-1111-1111-111111111111","mediaKey":"22222222-2222-2222-2222-222222222222","mediaTypeAlias":"Image"}]""";

        var content = CreateContent("content", CreateProperty("featuredImage", "Umbraco.MediaPicker3", value));

        var matches = SearchConditionContentEvaluator.Matches(
            content.Object,
            [CreateCondition("featuredImage", SearchOperator.IsNotEmpty)],
            SearchMatchMode.All);

        Assert.True(matches);
    }

    [Fact]
    public void Matches_is_not_empty_rejects_empty_media_picker_json()
    {
        var content = CreateContent("content", CreateProperty("featuredImage", "Umbraco.MediaPicker3", "[]"));

        var matches = SearchConditionContentEvaluator.Matches(
            content.Object,
            [CreateCondition("featuredImage", SearchOperator.IsNotEmpty)],
            SearchMatchMode.All);

        Assert.False(matches);
    }

    [Fact]
    public void MatchesCondition_isEmpty_treats_empty_rte_html_as_empty()
    {
        var content = CreateContent(
            "content",
            CreateProperty("rte", "Umbraco.RichText", "<p><br></p>"));

        var condition = CreateCondition("rte", SearchOperator.IsEmpty);

        Assert.True(SearchConditionContentEvaluator.MatchesCondition(
            content.Object,
            condition,
            culture: null));
    }

    [Fact]
    public void MatchesCondition_isEmpty_node_name_checks_culture_specific_name()
    {
        var content = new Mock<IContent>();
        var contentType = new Mock<ISimpleContentType>();
        contentType.SetupGet(type => type.Alias).Returns("content");
        content.SetupGet(item => item.ContentType).Returns(contentType.Object);
        content.Setup(item => item.GetCultureName("da-DK")).Returns("DK 01");
        content.Setup(item => item.GetCultureName("en-US")).Returns("Content");

        var condition = CreateCondition("nodeName", SearchOperator.IsEmpty);

        Assert.False(SearchConditionContentEvaluator.MatchesCondition(
            content.Object,
            condition,
            culture: "da-DK"));
        Assert.False(SearchConditionContentEvaluator.MatchesCondition(
            content.Object,
            condition,
            culture: "en-US"));
    }

    private static NormalizedSearchCondition CreateCondition(
        string propertyAlias,
        SearchOperator @operator)
        => new()
        {
            ContentTypeAlias = "content",
            PropertyAlias = propertyAlias,
            Operator = @operator,
        };

    private static Mock<IContent> CreateContent(string alias, Mock<IProperty> property)
    {
        var contentType = new Mock<ISimpleContentType>();
        contentType.SetupGet(type => type.Alias).Returns(alias);

        var content = new Mock<IContent>();
        content.SetupGet(node => node.ContentType).Returns(contentType.Object);
        content.SetupGet(node => node.Properties).Returns(new PropertyCollection([property.Object]));

        return content;
    }

    private static Mock<IProperty> CreateProperty(string alias, string editorAlias, object? value)
    {
        var propertyType = new Mock<IPropertyType>();
        propertyType.SetupGet(type => type.Alias).Returns(alias);
        propertyType.SetupGet(type => type.PropertyEditorAlias).Returns(editorAlias);
        propertyType.SetupGet(type => type.Variations).Returns(ContentVariation.Nothing);

        var property = new Mock<IProperty>();
        property.SetupGet(item => item.Alias).Returns(alias);
        property.SetupGet(item => item.PropertyType).Returns(propertyType.Object);
        property.Setup(item => item.GetValue(null, null, false)).Returns(value);

        return property;
    }
}

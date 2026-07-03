using Moq;
using Phases.Umbraco.FilterNodes.Models.Enums;
using Phases.Umbraco.FilterNodes.Models.Requests;
using Phases.Umbraco.FilterNodes.Services.Examine;
using Umbraco.Cms.Core.Models;
using Umbraco.Extensions;
using Xunit;

namespace Phases.Umbraco.FilterNodes.Tests.Services;

public sealed class FilterConditionContentEvaluatorTests
{
    [Fact]
    public void Matches_is_empty_when_media_picker_property_is_unset()
    {
        var content = CreateContent("blog", CreateProperty("blogImage", "Umbraco.MediaPicker3", null));

        var matches = FilterConditionContentEvaluator.Matches(
            content.Object,
            [
                new FilterCondition
                {
                    ContentTypeAlias = "blog",
                    PropertyAlias = "blogImage",
                    FilterOperator = FilterOperator.IsEmpty,
                },
            ],
            FilterType.All);

        Assert.True(matches);
    }

    [Fact]
    public void Matches_is_not_empty_when_media_picker_has_json_value()
    {
        const string value =
            """[{"key":"11111111-1111-1111-1111-111111111111","mediaKey":"22222222-2222-2222-2222-222222222222","mediaTypeAlias":"Image"}]""";

        var content = CreateContent("blog", CreateProperty("blogImage", "Umbraco.MediaPicker3", value));

        var matches = FilterConditionContentEvaluator.Matches(
            content.Object,
            [
                new FilterCondition
                {
                    ContentTypeAlias = "blog",
                    PropertyAlias = "blogImage",
                    FilterOperator = FilterOperator.IsNotEmpty,
                },
            ],
            FilterType.All);

        Assert.True(matches);
    }

    [Fact]
    public void SupportsAnyMatchMode_rejects_multiple_is_empty_conditions()
    {
        var request = new FilterRequest
        {
            FilterType = FilterType.Any,
            Conditions =
            [
                new FilterCondition
                {
                    ContentTypeAlias = "blog",
                    PropertyAlias = "blogTitle",
                    FilterOperator = FilterOperator.IsEmpty,
                },
                new FilterCondition
                {
                    ContentTypeAlias = "blog",
                    PropertyAlias = "blogImage",
                    FilterOperator = FilterOperator.IsNotEmpty,
                },
            ],
        };

        Assert.False(FilterRequestSearchPlanner.SupportsAnyMatchMode(request));
    }

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

using Moq;
using Phases.Umbraco.ContentSearch.Examine;
using Phases.Umbraco.ContentSearch.Search.Enums;
using Phases.Umbraco.ContentSearch.Search.Models;
using Phases.Umbraco.ContentSearch.Services;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Services;
using Xunit;

namespace Phases.Umbraco.ContentSearch.Tests.Services;

public sealed class BlockEditorPropertyValueReaderTests
{
    [Fact]
    public void MatchesElementPropertyCondition_isTrue_matches_culture_specific_block_value()
    {
        const string json = """
            {
              "contentData": [
                {
                  "contentTypeKey": "11111111-1111-1111-1111-111111111111",
                  "isActive": true
                }
              ],
              "settingsData": []
            }
            """;

        var content = CreateContentWithBlock("blog", json, "en-US");
        var contentTypeService = CreateContentTypeService("descriptionBlog");
        var parts = new BlockPropertyAliasParts("blog", "descriptionBlog", "isActive");
        var condition = CreateCondition("blog__descriptionBlog__isActive", SearchOperator.IsTrue);

        var matches = BlockEditorPropertyValueReader.MatchesElementPropertyCondition(
            content.Object,
            parts,
            condition,
            "en-US",
            contentTypeService.Object);

        Assert.True(matches);
    }

    [Fact]
    public void MatchesElementPropertyCondition_isTrue_does_not_match_other_culture_variant()
    {
        const string enJson = """
            {
              "contentData": [
                {
                  "contentTypeKey": "11111111-1111-1111-1111-111111111111",
                  "isActive": true
                }
              ],
              "settingsData": []
            }
            """;

        const string daJson = """
            {
              "contentData": [
                {
                  "contentTypeKey": "11111111-1111-1111-1111-111111111111",
                  "isActive": false
                }
              ],
              "settingsData": []
            }
            """;

        var content = CreateContentWithCultureSpecificBlocks(
            "blog",
            ("en-US", enJson),
            ("da-DK", daJson));
        var contentTypeService = CreateContentTypeService("descriptionBlog");
        var parts = new BlockPropertyAliasParts("blog", "descriptionBlog", "isActive");
        var condition = CreateCondition("blog__descriptionBlog__isActive", SearchOperator.IsTrue);

        Assert.True(BlockEditorPropertyValueReader.MatchesElementPropertyCondition(
            content.Object,
            parts,
            condition,
            "en-US",
            contentTypeService.Object));

        Assert.False(BlockEditorPropertyValueReader.MatchesElementPropertyCondition(
            content.Object,
            parts,
            condition,
            "da-DK",
            contentTypeService.Object));
    }

    private static NormalizedSearchCondition CreateCondition(
        string propertyAlias,
        SearchOperator @operator)
        => new()
        {
            ContentTypeAlias = "content",
            PropertyAlias = propertyAlias,
            Operator = @operator,
            Value = @operator == SearchOperator.IsTrue ? "1" : null,
        };

    private static Mock<IContentTypeService> CreateContentTypeService(string elementTypeAlias)
    {
        var elementType = new Mock<IContentType>();
        elementType.SetupGet(type => type.Key).Returns(Guid.Parse("11111111-1111-1111-1111-111111111111"));

        var contentTypeService = new Mock<IContentTypeService>();
        contentTypeService
            .Setup(service => service.Get(elementTypeAlias))
            .Returns(elementType.Object);

        return contentTypeService;
    }

    private static Mock<IContent> CreateContentWithBlock(
        string containerAlias,
        string json,
        string? culture)
    {
        var property = CreateBlockProperty(containerAlias, json, culture);
        return CreateContent(property);
    }

    private static Mock<IContent> CreateContentWithCultureSpecificBlocks(
        string containerAlias,
        params (string Culture, string Json)[] cultureValues)
    {
        var propertyType = new Mock<IPropertyType>();
        propertyType.SetupGet(type => type.Alias).Returns(containerAlias);
        propertyType.SetupGet(type => type.PropertyEditorAlias)
            .Returns(global::Umbraco.Cms.Core.Constants.PropertyEditors.Aliases.BlockGrid);
        propertyType.SetupGet(type => type.Variations).Returns(ContentVariation.Culture);

        var property = new Mock<IProperty>();
        property.SetupGet(item => item.Alias).Returns(containerAlias);
        property.SetupGet(item => item.PropertyType).Returns(propertyType.Object);

        foreach (var (culture, json) in cultureValues)
        {
            property
                .Setup(item => item.GetValue(culture, null, false))
                .Returns(json);
        }

        return CreateContent(property);
    }

    private static Mock<IProperty> CreateBlockProperty(
        string containerAlias,
        string json,
        string? culture)
    {
        var propertyType = new Mock<IPropertyType>();
        propertyType.SetupGet(type => type.Alias).Returns(containerAlias);
        propertyType.SetupGet(type => type.PropertyEditorAlias)
            .Returns(global::Umbraco.Cms.Core.Constants.PropertyEditors.Aliases.BlockGrid);
        propertyType.SetupGet(type => type.Variations).Returns(
            string.IsNullOrWhiteSpace(culture) ? ContentVariation.Nothing : ContentVariation.Culture);

        var property = new Mock<IProperty>();
        property.SetupGet(item => item.Alias).Returns(containerAlias);
        property.SetupGet(item => item.PropertyType).Returns(propertyType.Object);

        if (string.IsNullOrWhiteSpace(culture))
        {
            property.Setup(item => item.GetValue(null, null, false)).Returns(json);
        }
        else
        {
            property.Setup(item => item.GetValue(culture, null, false)).Returns(json);
        }

        return property;
    }

    private static Mock<IContent> CreateContent(Mock<IProperty> property)
    {
        var contentType = new Mock<ISimpleContentType>();
        contentType.SetupGet(type => type.Alias).Returns("content");

        var content = new Mock<IContent>();
        content.SetupGet(item => item.ContentType).Returns(contentType.Object);
        content.SetupGet(item => item.Properties).Returns(new PropertyCollection([property.Object]));

        return content;
    }
}

using System.Text.Json;
using Phases.Umbraco.FilterNodes.Constants;
using Phases.Umbraco.FilterNodes.Models.Enums;
using Phases.Umbraco.FilterNodes.Services;
using Moq;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Core.Strings;
using Xunit;

namespace Phases.Umbraco.FilterNodes.Tests.Services;

public sealed class PropertyMetadataDiscoveryTests
{
    [Fact]
    public void EnumerateCompositionProperties_includes_nested_composition_properties()
    {
        var seoComposition = CreateContentType("seoSettings", "Xml Sitemap Settings");
        seoComposition.AddPropertyType(
            CreatePropertyType("hideFromXmlSitemap", "Hide From Xml Sitemap"));

        var baseComposition = CreateContentType("basePage", "Base Page");
        baseComposition.AddContentType(seoComposition);

        var page = CreateContentType("contentPage", "Content Page");
        page.AddContentType(baseComposition);

        var properties = PropertyMetadataDiscovery
            .EnumerateCompositionProperties(page, [])
            .ToArray();

        Assert.Single(properties);
        Assert.Equal("seoSettings", properties[0].Composition.Alias);
        Assert.Equal("hideFromXmlSitemap", properties[0].Property.Alias);
    }

    [Fact]
    public void BuildHierarchicalDisplayName_formats_composition_hierarchy()
    {
        var displayName = PropertyMetadataDiscovery.BuildHierarchicalDisplayName(
            "Xml Sitemap Settings",
            "Hide From Xml Sitemap");

        Assert.Equal(
            $"Xml Sitemap Settings{PropertyMetadataSourceGroups.HierarchySeparator}Hide From Xml Sitemap",
            displayName);
    }

    [Fact]
    public void BuildBlockPropertyAlias_uses_separator()
    {
        var alias = PropertyMetadataDiscovery.BuildBlockPropertyAlias(
            "contentBlocks",
            "heroBlock",
            "title");

        Assert.Equal("contentBlocks__heroBlock__title", alias);
    }

    [Fact]
    public async Task DiscoverAsync_includes_direct_composition_and_block_properties()
    {
        var heroElement = CreateElementType("heroBlock", "Hero Block");
        heroElement.AddPropertyType(CreatePropertyType("title", "Title"));

        var seoComposition = CreateContentType("seoSettings", "Xml Sitemap Settings");
        seoComposition.AddPropertyType(
            CreatePropertyType("searchEngineChangeFrequency", "Search Engine Change Frequency"));

        var page = CreateContentType("landingPage", "Landing Page");
        page.AddPropertyType(CreatePropertyType("pageTitle", "Page Title"));
        page.AddContentType(seoComposition);

        var blockListDataTypeKey = Guid.NewGuid();
        var blockListDataType = CreateBlockListDataType(42, blockListDataTypeKey, heroElement.Key);

        var blockListProperty = CreatePropertyType(
            "contentBlocks",
            "Content Blocks",
            global::Umbraco.Cms.Core.Constants.PropertyEditors.Aliases.BlockList,
            42,
            blockListDataTypeKey);
        page.AddPropertyType(blockListProperty);

        var contentTypeService = new Mock<IContentTypeService>();
        contentTypeService.Setup(service => service.Get(heroElement.Key)).Returns(heroElement);

        var dataTypeService = new Mock<IDataTypeService>();
        dataTypeService
            .Setup(service => service.GetAsync(blockListDataTypeKey))
            .ReturnsAsync(blockListDataType);

        var discovery = new PropertyMetadataDiscovery(
            contentTypeService.Object,
            dataTypeService.Object);

        var properties = await discovery.DiscoverAsync(page);

        Assert.Contains(
            properties,
            property => property.Alias == "pageTitle"
                && property.SourceCategory == PropertyMetadataSourceCategory.ContentType
                && property.GroupName == PropertyMetadataSourceGroups.ContentType
                && property.IsFilterable);

        Assert.Contains(
            properties,
            property => property.Alias == "searchEngineChangeFrequency"
                && property.SourceCategory == PropertyMetadataSourceCategory.Composition
                && property.GroupName == PropertyMetadataSourceGroups.Compositions
                && property.Name.Contains("Xml Sitemap Settings", StringComparison.Ordinal)
                && property.Name.Contains("Search Engine Change Frequency", StringComparison.Ordinal));

        Assert.Contains(
            properties,
            property => property.Alias == "contentBlocks"
                && property.IsContainer
                && property.IsFilterable
                && property.Name == "Content Blocks (Block List)"
                && property.ContainerAlias == "contentBlocks"
                && property.ContainerName == "Content Blocks");

        Assert.Contains(
            properties,
            property => property.Alias == "contentBlocks__heroBlock__title"
                && property.SourceCategory == PropertyMetadataSourceCategory.BlockList
                && property.GroupName == PropertyMetadataSourceGroups.ContentType
                && !property.IsFilterable
                && property.ContainerAlias == "contentBlocks"
                && property.ElementTypeAlias == "heroBlock"
                && property.Name.Contains("Hero Block", StringComparison.Ordinal)
                && property.Name.Contains("Title", StringComparison.Ordinal)
                && property.DisplayPath.SequenceEqual(new[] { "Content Blocks", "Hero Block", "Title" }));
    }

    [Fact]
    public void GetElementTypeKeys_reads_block_list_configuration_data()
    {
        var heroKey = Guid.NewGuid();
        var dataType = new Mock<IDataType>();
        dataType.SetupGet(type => type.ConfigurationData).Returns(new Dictionary<string, object>
        {
            ["blocks"] = JsonSerializer.SerializeToElement(new[]
            {
                new { contentElementTypeKey = heroKey.ToString(), settingsElementTypeKey = (string?)null },
            }),
        });

        IReadOnlyList<Guid> keys = BlockEditorConfigurationReader.GetElementTypeKeys(
            dataType.Object,
            global::Umbraco.Cms.Core.Constants.PropertyEditors.Aliases.BlockList);

        Assert.Single(keys);
        Assert.Equal(heroKey, keys[0]);
    }

    [Fact]
    public void GetElementTypeKeys_reads_block_grid_area_allowance()
    {
        var layoutKey = Guid.NewGuid();
        var nestedKey = Guid.NewGuid();
        var dataType = new Mock<IDataType>();
        dataType.SetupGet(type => type.ConfigurationData).Returns(new Dictionary<string, object>
        {
            ["blocks"] = JsonSerializer.SerializeToElement(new[]
            {
                new
                {
                    contentElementTypeKey = layoutKey.ToString(),
                    settingsElementTypeKey = (string?)null,
                    areas = new[]
                    {
                        new
                        {
                            specifiedAllowance = new[]
                            {
                                new { contentElementTypeKey = nestedKey.ToString() },
                            },
                        },
                    },
                },
            }),
        });

        IReadOnlyList<Guid> keys = BlockEditorConfigurationReader.GetElementTypeKeys(
            dataType.Object,
            global::Umbraco.Cms.Core.Constants.PropertyEditors.Aliases.BlockGrid);

        Assert.Equal(2, keys.Count);
        Assert.Contains(layoutKey, keys);
        Assert.Contains(nestedKey, keys);
    }

    private static ContentType CreateContentType(string alias, string name)
    {
        var contentType = new ContentType(ShortStringHelper, -1)
        {
            Alias = alias,
            Name = name,
        };
        contentType.Key = Guid.NewGuid();
        return contentType;
    }

    private static ContentType CreateElementType(string alias, string name)
    {
        var contentType = CreateContentType(alias, name);
        contentType.IsElement = true;
        return contentType;
    }

    private static PropertyType CreatePropertyType(
        string alias,
        string name,
        string editorAlias = "Umbraco.TextBox",
        int dataTypeId = 1,
        Guid? dataTypeKey = null)
    {
        var propertyType = new PropertyType(ShortStringHelper, editorAlias, ValueStorageType.Nvarchar)
        {
            Alias = alias,
            Name = name,
            DataTypeId = dataTypeId,
        };
        propertyType.DataTypeKey = dataTypeKey ?? Guid.NewGuid();
        return propertyType;
    }

    private static IDataType CreateBlockListDataType(int id, Guid key, Guid elementTypeKey)
    {
        var dataType = new Mock<IDataType>();
        dataType.SetupGet(type => type.Id).Returns(id);
        dataType.SetupGet(type => type.Key).Returns(key);
        dataType.SetupGet(type => type.EditorAlias)
            .Returns(global::Umbraco.Cms.Core.Constants.PropertyEditors.Aliases.BlockList);
        dataType.SetupGet(type => type.ConfigurationData).Returns(new Dictionary<string, object>
        {
            ["blocks"] = JsonSerializer.SerializeToElement(new[]
            {
                new { contentElementTypeKey = elementTypeKey.ToString(), settingsElementTypeKey = (string?)null },
            }),
        });

        return dataType.Object;
    }

    private static IShortStringHelper ShortStringHelper { get; } =
        new DefaultShortStringHelper(new DefaultShortStringHelperConfig());
}

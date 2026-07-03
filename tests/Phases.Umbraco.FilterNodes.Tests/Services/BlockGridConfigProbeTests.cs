using Phases.Umbraco.FilterNodes.Models.Enums;
using Phases.Umbraco.FilterNodes.Services;
using Moq;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.PropertyEditors;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Core.Strings;
using Xunit;

namespace Phases.Umbraco.FilterNodes.Tests.Services;

public sealed class BlockGridConfigProbeTests
{
    [Fact]
    public void Read_reads_typed_block_grid_blocks_array()
    {
        var heroKey = Guid.NewGuid();
        var dataType = new Mock<IDataType>();
        dataType.SetupGet(type => type.ConfigurationData).Returns(new Dictionary<string, object>
        {
            ["blocks"] = new[]
            {
                new BlockGridConfiguration.BlockGridBlockConfiguration
                {
                    ContentElementTypeKey = heroKey,
                    AllowAtRoot = true,
                },
            },
        });

        BlockEditorConfigurationReadResult result = BlockEditorConfigurationReader.Read(
            dataType.Object,
            global::Umbraco.Cms.Core.Constants.PropertyEditors.Aliases.BlockGrid);

        Assert.True(result.ConfigurationLoaded);
        Assert.Equal(1, result.AllowedBlocksCount);
        Assert.Single(result.ElementTypeKeys);
        Assert.Equal(heroKey, result.ElementTypeKeys[0]);
    }

    [Fact]
    public void Read_reads_block_grid_configuration_object()
    {
        var heroKey = Guid.NewGuid();
        var dataType = new Mock<IDataType>();
        dataType.SetupGet(type => type.ConfigurationObject).Returns(new BlockGridConfiguration
        {
            Blocks =
            [
                new BlockGridConfiguration.BlockGridBlockConfiguration
                {
                    ContentElementTypeKey = heroKey,
                    AllowAtRoot = true,
                },
            ],
        });

        BlockEditorConfigurationReadResult result = BlockEditorConfigurationReader.Read(
            dataType.Object,
            global::Umbraco.Cms.Core.Constants.PropertyEditors.Aliases.BlockGrid);

        Assert.True(result.ConfigurationLoaded);
        Assert.Equal(1, result.AllowedBlocksCount);
        Assert.Single(result.ElementTypeKeys);
        Assert.Equal(heroKey, result.ElementTypeKeys[0]);
    }

    [Fact]
    public async Task DiscoverAsync_includes_block_grid_element_properties_from_typed_configuration()
    {
        var heroElement = CreateElementType("heroBlock", "Hero Block");
        heroElement.AddPropertyType(CreatePropertyType("title", "Title"));

        var page = CreateContentType("landingPage", "Landing Page");
        var blockGridDataTypeKey = Guid.NewGuid();
        var blockGridDataType = new Mock<IDataType>();
        blockGridDataType.SetupGet(type => type.Id).Returns(42);
        blockGridDataType.SetupGet(type => type.Key).Returns(blockGridDataTypeKey);
        blockGridDataType.SetupGet(type => type.EditorAlias)
            .Returns(global::Umbraco.Cms.Core.Constants.PropertyEditors.Aliases.BlockGrid);
        blockGridDataType.SetupGet(type => type.ConfigurationObject).Returns(new BlockGridConfiguration
        {
            Blocks =
            [
                new BlockGridConfiguration.BlockGridBlockConfiguration
                {
                    ContentElementTypeKey = heroElement.Key,
                    AllowAtRoot = true,
                },
            ],
        });

        var blockGridProperty = CreatePropertyType(
            "bgCheck",
            "BGCheck",
            global::Umbraco.Cms.Core.Constants.PropertyEditors.Aliases.BlockGrid,
            42,
            blockGridDataTypeKey);
        page.AddPropertyType(blockGridProperty);

        var contentTypeService = new Mock<IContentTypeService>();
        contentTypeService.Setup(service => service.Get(heroElement.Key)).Returns(heroElement);

        var dataTypeService = new Mock<IDataTypeService>();
        dataTypeService
            .Setup(service => service.GetAsync(blockGridDataTypeKey))
            .ReturnsAsync(blockGridDataType.Object);

        var discovery = new PropertyMetadataDiscovery(
            contentTypeService.Object,
            dataTypeService.Object);

        var properties = await discovery.DiscoverAsync(page);

        var container = Assert.Single(
            properties,
            property => property.Alias == "bgCheck" && property.IsContainer);

        Assert.NotNull(container.BlockDiscoveryDiagnostics);
        Assert.True(container.BlockDiscoveryDiagnostics.ConfigurationLoaded);
        Assert.Equal(1, container.BlockDiscoveryDiagnostics.AllowedBlocksCount);
        Assert.Equal(1, container.BlockDiscoveryDiagnostics.ResolvedElementTypesCount);
        Assert.Equal(1, container.BlockDiscoveryDiagnostics.ResolvedPropertiesCount);

        Assert.Contains(
            properties,
            property => property.Alias == "bgCheck__heroBlock__title"
                && property.SourceCategory == PropertyMetadataSourceCategory.BlockGrid
                && property.ElementTypeAlias == "heroBlock");
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

    private static IShortStringHelper ShortStringHelper { get; } =
        new DefaultShortStringHelper(new DefaultShortStringHelperConfig());
}

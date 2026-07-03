using Phases.Umbraco.FilterNodes.Models.Enums;
using Phases.Umbraco.FilterNodes.Services;
using Moq;
using Umbraco.Cms.Core.Models;
using Xunit;

namespace Phases.Umbraco.FilterNodes.Tests.Services;

public sealed class PropertyFilterMetadataResolverTests
{
    [Fact]
    public void Resolve_maps_truefalse_to_dropdown_with_predefined_options()
    {
        var propertyType = CreatePropertyType("isFeatured", "Is Featured", "Umbraco.TrueFalse", 42);

        var metadata = PropertyFilterMetadataResolver.Resolve(propertyType.Object, null);

        Assert.Equal("isFeatured", metadata.Alias);
        Assert.Equal("Is Featured", metadata.Name);
        Assert.Equal("Umbraco.TrueFalse", metadata.EditorAlias);
        Assert.Equal(42, metadata.DataTypeId);
        Assert.Equal(PropertyFilterType.Dropdown, metadata.FilterType);
        Assert.Collection(
            metadata.Options,
            option =>
            {
                Assert.Equal("True", option.Label);
                Assert.Equal("1", option.Value);
            },
            option =>
            {
                Assert.Equal("False", option.Label);
                Assert.Equal("0", option.Value);
            });
    }

    [Theory]
    [InlineData("Umbraco.DateTime")]
    [InlineData("Umbraco.DateOnly")]
    [InlineData("Umbraco.DateTimeUnspecified")]
    [InlineData("Umbraco.DateTimeWithTimeZone")]
    public void Resolve_maps_date_editors_to_date_filter_type(string editorAlias)
    {
        var propertyType = CreatePropertyType("publishDate", "Publish Date", editorAlias, 10);

        var metadata = PropertyFilterMetadataResolver.Resolve(propertyType.Object, null);

        Assert.Equal(PropertyFilterType.Date, metadata.FilterType);
        Assert.Empty(metadata.Options);
    }

    [Fact]
    public void Resolve_maps_checkbox_list_to_multiselect_with_configured_options()
    {
        var propertyType = CreatePropertyType("tags", "Tags", "Umbraco.CheckBoxList", 15);
        var dataType = new Mock<IDataType>();
        dataType.SetupGet(dataType => dataType.EditorAlias).Returns("Umbraco.CheckBoxList");
        dataType.SetupGet(dataType => dataType.Id).Returns(15);
        dataType.SetupGet(dataType => dataType.ConfigurationData).Returns(new Dictionary<string, object>
        {
            ["items"] = new[]
            {
                new Dictionary<string, object> { ["value"] = "News" },
                new Dictionary<string, object> { ["value"] = "Events" },
            },
        });

        var metadata = PropertyFilterMetadataResolver.Resolve(propertyType.Object, dataType.Object);

        Assert.Equal(PropertyFilterType.MultiSelect, metadata.FilterType);
        Assert.Equal(15, metadata.DataTypeId);
        Assert.Collection(
            metadata.Options,
            option =>
            {
                Assert.Equal("News", option.Label);
                Assert.Equal("News", option.Value);
            },
            option =>
            {
                Assert.Equal("Events", option.Label);
                Assert.Equal("Events", option.Value);
            });
    }

    [Fact]
    public void Resolve_maps_checkbox_list_options_from_plain_string_array()
    {
        var propertyType = CreatePropertyType("checkList", "Check List", "Umbraco.CheckBoxList", 16);
        var dataType = new Mock<IDataType>();
        dataType.SetupGet(dataType => dataType.EditorAlias).Returns("Umbraco.CheckBoxList");
        dataType.SetupGet(dataType => dataType.Id).Returns(16);
        dataType.SetupGet(dataType => dataType.ConfigurationData).Returns(new Dictionary<string, object>
        {
            ["items"] = new[] { "One check", "Two check", "Three check" },
        });

        var metadata = PropertyFilterMetadataResolver.Resolve(propertyType.Object, dataType.Object);

        Assert.Equal(PropertyFilterType.MultiSelect, metadata.FilterType);
        Assert.Collection(
            metadata.Options,
            option =>
            {
                Assert.Equal("One check", option.Label);
                Assert.Equal("One check", option.Value);
            },
            option =>
            {
                Assert.Equal("Two check", option.Label);
                Assert.Equal("Two check", option.Value);
            },
            option =>
            {
                Assert.Equal("Three check", option.Label);
                Assert.Equal("Three check", option.Value);
            });
    }

    [Fact]
    public void Resolve_maps_radio_options_from_plain_string_array_with_case_insensitive_items_key()
    {
        var propertyType = CreatePropertyType("rdBlog", "RD Blog", "Umbraco.RadioButtonList", 21);
        var dataType = new Mock<IDataType>();
        dataType.SetupGet(dataType => dataType.EditorAlias).Returns("Umbraco.RadioButtonList");
        dataType.SetupGet(dataType => dataType.Id).Returns(21);
        dataType.SetupGet(dataType => dataType.ConfigurationData).Returns(new Dictionary<string, object>
        {
            ["Items"] = new[] { "1 R", "2 R", "3 R" },
        });

        var metadata = PropertyFilterMetadataResolver.Resolve(propertyType.Object, dataType.Object);

        Assert.Equal(PropertyFilterType.Dropdown, metadata.FilterType);
        Assert.Collection(
            metadata.Options,
            option =>
            {
                Assert.Equal("1 R", option.Label);
                Assert.Equal("1 R", option.Value);
            },
            option =>
            {
                Assert.Equal("2 R", option.Label);
                Assert.Equal("2 R", option.Value);
            },
            option =>
            {
                Assert.Equal("3 R", option.Label);
                Assert.Equal("3 R", option.Value);
            });
    }

    [Fact]
    public void Resolve_maps_radio_options_using_name_and_value_fields()
    {
        var propertyType = CreatePropertyType("rdBlog", "RD Blog", "Umbraco.RadioButtonList", 20);
        var dataType = new Mock<IDataType>();
        dataType.SetupGet(dataType => dataType.EditorAlias).Returns("Umbraco.RadioButtonList");
        dataType.SetupGet(dataType => dataType.Id).Returns(20);
        dataType.SetupGet(dataType => dataType.ConfigurationData).Returns(new Dictionary<string, object>
        {
            ["items"] = new[]
            {
                new Dictionary<string, object> { ["name"] = "1 R", ["value"] = "1 R" },
                new Dictionary<string, object> { ["name"] = "2 R", ["value"] = "2 R" },
            },
        });

        var metadata = PropertyFilterMetadataResolver.Resolve(propertyType.Object, dataType.Object);

        Assert.Equal(PropertyFilterType.Dropdown, metadata.FilterType);
        Assert.Collection(
            metadata.Options,
            option =>
            {
                Assert.Equal("1 R", option.Label);
                Assert.Equal("1 R", option.Value);
            },
            option =>
            {
                Assert.Equal("2 R", option.Label);
                Assert.Equal("2 R", option.Value);
            });
    }

    private static Mock<IPropertyType> CreatePropertyType(
        string alias,
        string name,
        string editorAlias,
        int dataTypeId)
    {
        var propertyType = new Mock<IPropertyType>();
        propertyType.SetupGet(property => property.Alias).Returns(alias);
        propertyType.SetupGet(property => property.Name).Returns(name);
        propertyType.SetupGet(property => property.PropertyEditorAlias).Returns(editorAlias);
        propertyType.SetupGet(property => property.DataTypeId).Returns(dataTypeId);
        return propertyType;
    }
}

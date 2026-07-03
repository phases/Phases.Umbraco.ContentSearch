using Phases.Umbraco.FilterNodes.Models.Enums;
using Phases.Umbraco.FilterNodes.Models.Responses;
using Phases.Umbraco.FilterNodes.Services.Normalization;
using Xunit;

namespace Phases.Umbraco.FilterNodes.Tests.Normalization;

public sealed class FilterPropertyValueNormalizerTests
{
    [Theory]
    [InlineData("true", "1")]
    [InlineData("True", "1")]
    [InlineData("false", "0")]
    [InlineData("False", "0")]
    [InlineData("1", "1")]
    [InlineData("0", "0")]
    public void Normalize_maps_true_false_values_for_truefalse_editor(string input, string expected)
    {
        var metadata = new FilterablePropertyMetadata
        {
            Alias = "isFeatured",
            Name = "Is Featured",
            EditorAlias = "Umbraco.TrueFalse",
            FilterType = PropertyFilterType.Dropdown,
            Options =
            [
                new PropertyFilterOption { Label = "True", Value = "1" },
                new PropertyFilterOption { Label = "False", Value = "0" },
            ],
        };

        var result = FilterPropertyValueNormalizer.Normalize(metadata, input);

        Assert.Equal(expected, result);
    }

    [Fact]
    public void Normalize_maps_multiselect_labels_to_indexed_values()
    {
        var metadata = new FilterablePropertyMetadata
        {
            Alias = "categories",
            Name = "Categories",
            EditorAlias = "Umbraco.CheckBoxList",
            FilterType = PropertyFilterType.MultiSelect,
            Options =
            [
                new PropertyFilterOption { Label = "News", Value = "news" },
                new PropertyFilterOption { Label = "Events", Value = "events" },
            ],
        };

        var result = FilterPropertyValueNormalizer.Normalize(metadata, "News,events");

        Assert.Equal("news,events", result);
    }

    [Fact]
    public void Normalize_returns_trimmed_text_when_metadata_is_missing()
    {
        var result = FilterPropertyValueNormalizer.Normalize(null, "  hello  ");

        Assert.Equal("hello", result);
    }
}

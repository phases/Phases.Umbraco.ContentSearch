using Phases.Umbraco.FilterNodes.Services.Examine;
using Xunit;

namespace Phases.Umbraco.FilterNodes.Tests.Services;

public sealed class ContentPropertyPopulationEvaluatorTests
{
    [Fact]
    public void HasPopulatedStoredValue_treats_empty_json_array_as_not_populated()
    {
        var isPopulated = ContentPropertyPopulationEvaluator.HasPopulatedStoredValue(
            "[]",
            MediaPicker3EditorAlias);

        Assert.False(isPopulated);
    }

    [Fact]
    public void HasPopulatedStoredValue_treats_non_empty_enumerable_as_populated()
    {
        var isPopulated = ContentPropertyPopulationEvaluator.HasPopulatedStoredValue(
            new[] { "item" },
            MediaPicker3EditorAlias);

        Assert.True(isPopulated);
    }

    private const string MediaPicker3EditorAlias = "Umbraco.MediaPicker3";
    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData("[]")]
    [InlineData("{}")]
    [InlineData("null")]
    public void MediaPicker3_empty_values_are_not_populated(object? value)
    {
        var isPopulated = ContentPropertyPopulationEvaluator.HasPopulatedStoredValue(
            value,
            MediaPicker3EditorAlias);

        Assert.False(isPopulated);
    }

    [Fact]
    public void MediaPicker3_json_array_with_media_is_populated()
    {
        const string value =
            """[{"key":"11111111-1111-1111-1111-111111111111","mediaKey":"22222222-2222-2222-2222-222222222222","mediaTypeAlias":"Image"}]""";

        var isPopulated = ContentPropertyPopulationEvaluator.HasPopulatedStoredValue(
            value,
            MediaPicker3EditorAlias);

        Assert.True(isPopulated);
    }

    [Fact]
    public void MediaPicker3_legacy_udi_format_is_populated()
    {
        const string value = "umb://media/22222222222222222222222222222222";

        var isPopulated = ContentPropertyPopulationEvaluator.HasPopulatedStoredValue(
            value,
            MediaPicker3EditorAlias);

        Assert.True(isPopulated);
    }

    [Fact]
    public void MediaPicker3_empty_json_array_is_not_populated()
    {
        var isPopulated = ContentPropertyPopulationEvaluator.HasPopulatedStoredValue(
            "[]",
            MediaPicker3EditorAlias);

        Assert.False(isPopulated);
    }
}

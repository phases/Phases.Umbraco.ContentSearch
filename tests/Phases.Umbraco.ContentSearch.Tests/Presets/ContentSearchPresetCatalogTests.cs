using Phases.Umbraco.ContentSearch.Metadata.Constants;
using Phases.Umbraco.ContentSearch.Presets;
using Xunit;

namespace Phases.Umbraco.ContentSearch.Tests.Presets;

public sealed class ContentSearchPresetCatalogTests
{
    private readonly ContentSearchPresetCatalog _catalog = new();

    [Fact]
    public async Task GetAllAsync_ReturnsRecentlyCreatedAndUpdatedPresets()
    {
        var response = await _catalog.GetAllAsync(CancellationToken.None);

        Assert.Equal(2, response.Presets.Count);
        Assert.DoesNotContain(
            response.Presets,
            preset => preset.Name.Contains("SEO", StringComparison.OrdinalIgnoreCase));
    }

    [Theory]
    [InlineData("recently-created")]
    [InlineData("recently-updated")]
    public async Task GetByIdAsync_ReturnsPreset_WhenIdExists(string presetId)
    {
        var preset = await _catalog.GetByIdAsync(presetId, CancellationToken.None);

        Assert.NotNull(preset);
        Assert.Equal(presetId, preset.Id, ignoreCase: true);
        Assert.False(string.IsNullOrWhiteSpace(preset.Name));
        Assert.NotEmpty(preset.Conditions);
    }

    [Fact]
    public async Task GetByIdAsync_ReturnsNull_WhenIdMissing()
    {
        var preset = await _catalog.GetByIdAsync("missing-seo", CancellationToken.None);

        Assert.Null(preset);
    }

    [Fact]
    public async Task GetAllAsync_UsesWildcardContentType_ForCrossTypePresets()
    {
        var response = await _catalog.GetAllAsync(CancellationToken.None);

        Assert.All(
            response.Presets,
            preset => Assert.Contains(
                preset.Conditions,
                condition => ContentSearchMetadataConstants.IsWildcardContentTypeAlias(
                    condition.ContentTypeAlias)));
    }

    [Fact]
    public async Task RecentlyCreatedPreset_FiltersByCreateDate()
    {
        var preset = await _catalog.GetByIdAsync("recently-created", CancellationToken.None);

        Assert.NotNull(preset);
        Assert.Single(preset.Conditions);
        Assert.Equal(
            ContentSearchMetadataConstants.CreatedDatePropertyAlias,
            preset.Conditions[0].PropertyAlias,
            ignoreCase: true);
        Assert.Equal("greaterThan", preset.Conditions[0].Operator, ignoreCase: true);
        Assert.Equal("createDate", preset.SortColumn, ignoreCase: true);
        Assert.True(preset.SortDescending);
    }
}

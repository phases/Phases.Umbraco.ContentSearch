using System.Reflection;
using System.Text.Json;
using Phases.Umbraco.ContentSearch.Extensions;
using Umbraco.Cms.Core.Manifest;
using Xunit;

namespace Phases.Umbraco.ContentSearch.Tests.Extensions;

public class ContentSearchPackageManifestReaderTests
{
    [Fact]
    public async Task ReadPackageManifestsAsync_Registers_ContentSearch_Bundle()
    {
        var readerType = typeof(PhasesUmbracoContentSearchComposer).Assembly
            .GetType("Phases.Umbraco.ContentSearch.Extensions.ContentSearchPackageManifestReader", throwOnError: true)!;

        var reader = Activator.CreateInstance(readerType, nonPublic: true);
        var method = readerType.GetMethod("ReadPackageManifestsAsync", BindingFlags.Instance | BindingFlags.Public)!;

        var manifests = await (Task<IEnumerable<PackageManifest>>)method.Invoke(reader, null)!;
        var manifest = Assert.Single(manifests);

        Assert.Equal("Phases.Umbraco.ContentSearch", manifest.Id);
        Assert.Equal("Phases Content Search", manifest.Name);
        Assert.NotNull(manifest.Extensions);
        Assert.Single(manifest.Extensions);

        var extensionJson = JsonSerializer.Serialize(manifest.Extensions[0]);
        using var document = JsonDocument.Parse(extensionJson);
        var root = document.RootElement;

        Assert.Equal("bundle", root.GetProperty("type").GetString());
        Assert.Equal("Phases.Umbraco.ContentSearch.Bundle", root.GetProperty("alias").GetString());
        Assert.StartsWith(
            "/App_Plugins/PhasesUmbracoContentSearch/phases-umbraco-content-search.js",
            root.GetProperty("js").GetString(),
            StringComparison.Ordinal);
    }
}

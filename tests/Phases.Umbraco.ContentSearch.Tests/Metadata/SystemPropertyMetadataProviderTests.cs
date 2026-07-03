using Phases.Umbraco.ContentSearch.Metadata.Constants;
using Phases.Umbraco.ContentSearch.Metadata.Discovery;
using Phases.Umbraco.ContentSearch.Metadata.Models;
using Xunit;

namespace Phases.Umbraco.ContentSearch.Tests.Metadata;

public sealed class SystemPropertyMetadataProviderTests
{
    [Fact]
    public void GetSystemProperties_ReturnsOnlyWildcardSystemFields()
    {
        IReadOnlyList<SearchablePropertyMetadata> properties =
            SystemPropertyMetadataProvider.GetSystemProperties();

        Assert.Equal(4, properties.Count);
        Assert.All(
            properties,
            property => Assert.True(ContentSearchMetadataConstants.IsWildcardSystemProperty(property.Alias)));
    }
}

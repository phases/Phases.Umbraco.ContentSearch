using Phases.Umbraco.ContentSearch.Metadata.Constants;
using Phases.Umbraco.ContentSearch.Metadata.Discovery;
using Phases.Umbraco.ContentSearch.Metadata.Models;
using Xunit;

namespace Phases.Umbraco.ContentSearch.Tests.Metadata;

public sealed class SearchablePropertyMetadataResolverTests
{
    [Fact]
    public void ResolveSystemProperty_ReturnsNodeNameMetadata()
    {
        SearchablePropertyMetadata metadata = SearchablePropertyMetadataResolver.ResolveSystemProperty(
            ContentSearchMetadataConstants.NodeNamePropertyAlias);

        Assert.Equal(ContentSearchMetadataConstants.NodeNamePropertyAlias, metadata.Alias);
        Assert.Equal("Node name", metadata.Name);
        Assert.Equal(PropertyMetadataSourceCategory.System, metadata.SourceCategory);
        Assert.False(metadata.VariesByCulture);
        Assert.True(metadata.IsInvariant);
    }

    [Fact]
    public void ResolveSystemProperty_ReturnsCreateDateMetadata()
    {
        SearchablePropertyMetadata metadata = SearchablePropertyMetadataResolver.ResolveSystemProperty(
            ContentSearchMetadataConstants.CreatedDatePropertyAlias);

        Assert.Equal("Create date", metadata.Name);
        Assert.Equal("Umbraco.DateTime", metadata.EditorAlias);
    }
}

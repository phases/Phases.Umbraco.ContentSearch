using Phases.Umbraco.ContentSearch.Metadata.Constants;
using Phases.Umbraco.ContentSearch.Metadata.Discovery;
using Xunit;

namespace Phases.Umbraco.ContentSearch.Tests.Metadata;

public sealed class ContentSearchMetadataSourceGroupsTests
{
    [Fact]
    public void BuildBlockPropertyAlias_UsesThreePartCompositeAlias()
    {
        var alias = ContentSearchMetadataSourceGroups.BuildBlockPropertyAlias(
            "contentBlocks",
            "heroBlock",
            "heading");

        Assert.Equal("contentBlocks__heroBlock__heading", alias);
    }

    [Fact]
    public void IsReservedContentTypeAlias_ReturnsTrueForSentinels()
    {
        Assert.True(ContentSearchMetadataConstants.IsReservedContentTypeAlias("*"));
        Assert.True(ContentSearchMetadataConstants.IsReservedContentTypeAlias("allContentTypes"));
        Assert.False(ContentSearchMetadataConstants.IsReservedContentTypeAlias("home"));
    }
}

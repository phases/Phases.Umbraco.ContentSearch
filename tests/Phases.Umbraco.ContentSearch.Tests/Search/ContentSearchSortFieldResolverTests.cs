using Xunit;
using Phases.Umbraco.ContentSearch.Examine;
using Phases.Umbraco.ContentSearch.Search.Sorting;

namespace Phases.Umbraco.ContentSearch.Tests.Search;

public sealed class ContentSearchSortFieldResolverTests
{
    [Theory]
    [InlineData("name", ContentSearchExamineFields.NodeName)]
    [InlineData("contentType", ContentSearchExamineFields.NodeTypeAlias)]
    [InlineData("path", ContentSearchExamineFields.Path)]
    [InlineData("createDate", ContentSearchExamineFields.CreateDate)]
    public void ResolveField_maps_grid_columns(string column, string expected)
    {
        Assert.Equal(expected, ContentSearchSortFieldResolver.ResolveField(column));
    }

    [Fact]
    public void ResolveField_falls_back_to_node_name()
    {
        Assert.Equal(
            ContentSearchExamineFields.NodeName,
            ContentSearchSortFieldResolver.ResolveField("culture"));
    }
}

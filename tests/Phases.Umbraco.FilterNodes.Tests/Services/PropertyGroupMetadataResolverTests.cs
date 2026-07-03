using Phases.Umbraco.FilterNodes.Services;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Strings;
using Xunit;

namespace Phases.Umbraco.FilterNodes.Tests.Services;

public sealed class PropertyGroupMetadataResolverTests
{
    [Fact]
    public void Resolve_returns_group_name_and_sort_order_from_content_type()
    {
        var contentType = new ContentType(ShortStringHelper, -1)
        {
            Alias = "blogPost",
            Name = "Blog Post",
        };

        var propertyGroup = new PropertyGroup(true)
        {
            Alias = "seo",
            Name = "SEO",
            SortOrder = 20,
        };
        propertyGroup.Id = 12;
        contentType.PropertyGroups.Add(propertyGroup);

        var propertyType = new PropertyType(ShortStringHelper, "Umbraco.TextBox", ValueStorageType.Nvarchar)
        {
            Alias = "seoTitle",
            Name = "Seo Title",
            PropertyGroupId = new Lazy<int>(() => 12),
        };

        (string groupName, int groupSortOrder) = PropertyGroupMetadataResolver.Resolve(
            contentType,
            propertyType);

        Assert.Equal("SEO", groupName);
        Assert.Equal(20, groupSortOrder);
    }

    [Fact]
    public void Resolve_falls_back_to_general_when_property_has_no_group()
    {
        var contentType = new ContentType(ShortStringHelper, -1)
        {
            Alias = "blogPost",
            Name = "Blog Post",
        };

        var propertyType = new PropertyType(ShortStringHelper, "Umbraco.TextBox", ValueStorageType.Nvarchar)
        {
            Alias = "title",
            Name = "Title",
        };

        (string groupName, int groupSortOrder) = PropertyGroupMetadataResolver.Resolve(
            contentType,
            propertyType);

        Assert.Equal(PropertyGroupMetadataResolver.DefaultGroupName, groupName);
        Assert.Equal(int.MaxValue - 100, groupSortOrder);
    }

    private static IShortStringHelper ShortStringHelper { get; } =
        new DefaultShortStringHelper(new DefaultShortStringHelperConfig());
}

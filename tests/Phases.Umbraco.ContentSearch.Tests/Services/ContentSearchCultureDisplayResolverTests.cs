using Moq;
using Phases.Umbraco.ContentSearch.Services;
using Umbraco.Cms.Core.Models;
using Xunit;

namespace Phases.Umbraco.ContentSearch.Tests.Services;

public sealed class ContentSearchCultureDisplayResolverTests
{
    [Fact]
    public void ResolveName_WithSpecificCulture_ReturnsCultureName()
    {
        var content = new Mock<IContent>();
        content.Setup(contentItem => contentItem.GetCultureName("da-DK")).Returns("Danish title");
        content.SetupGet(contentItem => contentItem.Name).Returns("English title");

        var resolved = ContentSearchCultureDisplayResolver.ResolveName(content.Object, "da-DK");

        Assert.Equal("Danish title", resolved.Name);
        Assert.Equal("da-DK", resolved.MatchedCulture);
    }

    [Fact]
    public void ResolveName_WithAllCultures_ReturnsFirstPublishedCultureName()
    {
        var content = new Mock<IContent>();
        content.SetupGet(contentItem => contentItem.PublishedCultures).Returns(["da-DK", "en-US"]);
        content.Setup(contentItem => contentItem.GetCultureName("da-DK")).Returns("Danish title");
        content.Setup(contentItem => contentItem.GetCultureName("en-US")).Returns("English title");
        content.SetupGet(contentItem => contentItem.Name).Returns("English title");

        var resolved = ContentSearchCultureDisplayResolver.ResolveName(content.Object, culture: null);

        Assert.Equal("Danish title", resolved.Name);
        Assert.Equal("da-DK", resolved.MatchedCulture);
    }

    [Fact]
    public void ResolveName_WithNoPublishedCultures_ReturnsNodeName()
    {
        var content = new Mock<IContent>();
        content.SetupGet(contentItem => contentItem.PublishedCultures).Returns(Array.Empty<string>());
        content.SetupGet(contentItem => contentItem.Name).Returns("Invariant page");

        var resolved = ContentSearchCultureDisplayResolver.ResolveName(content.Object, culture: null);

        Assert.Equal("Invariant page", resolved.Name);
        Assert.Null(resolved.MatchedCulture);
    }

    [Fact]
    public void CountExpandedRows_WithMultiplePublishedCultures_ReturnsCultureCount()
    {
        var content = new Mock<IContent>();
        content.SetupGet(contentItem => contentItem.PublishedCultures).Returns(["da-DK", "en-US"]);

        Assert.Equal(2, ContentSearchCultureDisplayResolver.CountExpandedRows(content.Object));
    }

    [Fact]
    public void CountExpandedRows_WithNoPublishedCultures_ReturnsOne()
    {
        var content = new Mock<IContent>();
        content.SetupGet(contentItem => contentItem.PublishedCultures).Returns(Array.Empty<string>());

        Assert.Equal(1, ContentSearchCultureDisplayResolver.CountExpandedRows(content.Object));
    }
}

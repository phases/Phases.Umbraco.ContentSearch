using Moq;
using Phases.Umbraco.FilterNodes.Constants;
using Phases.Umbraco.FilterNodes.Services;
using Umbraco.Cms.Core.Models.PublishedContent;
using Xunit;

namespace Phases.Umbraco.FilterNodes.Tests.Services;

public sealed class PublishedContentUrlFormatterTests
{
    [Fact]
    public void Format_returns_unavailable_when_published_content_is_missing()
    {
        var url = PublishedContentUrlFormatter.Format(null);

        Assert.Equal(ContentUrlDisplayValues.Unavailable, url);
    }

    [Fact]
    public void Format_returns_unavailable_when_published_url_is_empty()
    {
        var publishedContent = new Mock<IPublishedContent>();
        publishedContent.SetupGet(node => node.UrlSegment).Returns(string.Empty);
        publishedContent.SetupGet(node => node.Level).Returns(1);
        publishedContent.SetupGet(node => node.Cultures).Returns(
            new Dictionary<string, PublishedCultureInfo>());

        var url = PublishedContentUrlFormatter.Format(publishedContent.Object);

        Assert.Equal(ContentUrlDisplayValues.Unavailable, url);
    }
}

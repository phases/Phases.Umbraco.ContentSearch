using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using Phases.Umbraco.FilterNodes.Constants;
using Phases.Umbraco.FilterNodes.Services;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.Web;
using Xunit;

namespace Phases.Umbraco.FilterNodes.Tests.Services;

public sealed class PublishedContentUrlResolverTests
{
    [Fact]
    public void ResolveUrl_returns_not_published_when_content_has_no_published_version()
    {
        var content = CreateContent(published: false);
        var resolver = CreateResolver();

        var url = resolver.ResolveUrl(content.Object);

        Assert.Equal(ContentUrlDisplayValues.NotPublished, url);
    }

    [Fact]
    public void ResolveUrl_returns_unavailable_when_published_content_cannot_be_loaded()
    {
        var content = CreateContent(published: true);
        var resolver = CreateResolver();

        var url = resolver.ResolveUrl(content.Object);

        Assert.Equal(ContentUrlDisplayValues.Unavailable, url);
    }

    [Fact]
    public void ResolveUrl_looks_up_published_content_by_key_before_id()
    {
        var contentKey = Guid.NewGuid();
        var content = CreateContent(published: true, key: contentKey);
        var publishedContent = new Mock<IPublishedContent>();
        publishedContent.SetupGet(node => node.Cultures).Returns(
            new Dictionary<string, PublishedCultureInfo>());

        var publishedContentQuery = new Mock<IPublishedContentQuery>();
        publishedContentQuery
            .Setup(query => query.Content(contentKey))
            .Returns(publishedContent.Object);
        publishedContentQuery
            .Setup(query => query.Content(content.Object.Id))
            .Returns((IPublishedContent?)null);

        var resolver = CreateResolver(publishedContentQuery.Object);

        var url = resolver.ResolveUrl(content.Object);

        Assert.Equal(ContentUrlDisplayValues.Unavailable, url);
        publishedContentQuery.Verify(query => query.Content(contentKey), Times.Once);
        publishedContentQuery.Verify(query => query.Content(content.Object.Id), Times.Never);
    }

    private static PublishedContentUrlResolver CreateResolver(
        IPublishedContentQuery? publishedContentQuery = null)
    {
        var query = publishedContentQuery ?? new Mock<IPublishedContentQuery>().Object;
        var umbracoContext = new Mock<IUmbracoContext>();
        var umbracoContextAccessor = new Mock<IUmbracoContextAccessor>();
        var umbracoContextFactory = new Mock<IUmbracoContextFactory>();

        umbracoContextFactory
            .Setup(factory => factory.EnsureUmbracoContext())
            .Returns(new UmbracoContextReference(
                umbracoContext.Object,
                false,
                umbracoContextAccessor.Object));

        return new PublishedContentUrlResolver(
            umbracoContextFactory.Object,
            query,
            NullLogger<PublishedContentUrlResolver>.Instance);
    }

    private static Mock<IContent> CreateContent(bool published, Guid? key = null)
    {
        var content = new Mock<IContent>();
        var contentType = new Mock<ISimpleContentType>();

        content.SetupGet(node => node.Key).Returns(key ?? Guid.NewGuid());
        content.SetupGet(node => node.Id).Returns(1001);
        content.SetupGet(node => node.Published).Returns(published);
        content.SetupGet(node => node.PublishedCultures).Returns(Array.Empty<string>());
        content.SetupGet(node => node.ContentType).Returns(contentType.Object);

        return content;
    }
}

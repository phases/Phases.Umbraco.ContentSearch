using Microsoft.Extensions.Logging;
using Phases.Umbraco.ContentSearch.Search.Mapping;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.Web;
using Umbraco.Extensions;

namespace Phases.Umbraco.ContentSearch.Services;

/// <summary>
/// Resolves frontend URLs from published content when Examine values are missing.
/// </summary>
public interface IContentSearchPublishedUrlResolver
{
    /// <summary>
    /// Resolves a published frontend URL for the content item.
    /// </summary>
    ContentSearchResultUrlResolver.ResolvedUrl Resolve(IContent content, string? culture = null);
}

/// <summary>
/// Default implementation of <see cref="IContentSearchPublishedUrlResolver"/>.
/// </summary>
public sealed class ContentSearchPublishedUrlResolver : IContentSearchPublishedUrlResolver
{
    private readonly IUmbracoContextFactory _umbracoContextFactory;
    private readonly IPublishedContentQuery _publishedContentQuery;
    private readonly ILogger<ContentSearchPublishedUrlResolver> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="ContentSearchPublishedUrlResolver"/> class.
    /// </summary>
    public ContentSearchPublishedUrlResolver(
        IUmbracoContextFactory umbracoContextFactory,
        IPublishedContentQuery publishedContentQuery,
        ILogger<ContentSearchPublishedUrlResolver> logger)
    {
        _umbracoContextFactory = umbracoContextFactory;
        _publishedContentQuery = publishedContentQuery;
        _logger = logger;
    }

    /// <inheritdoc />
    public ContentSearchResultUrlResolver.ResolvedUrl Resolve(IContent content, string? culture = null)
    {
        ArgumentNullException.ThrowIfNull(content);

        if (!ContentSearchPublishState.HasPublishedVersion(content))
        {
            return new ContentSearchResultUrlResolver.ResolvedUrl(null, "Not published");
        }

        using UmbracoContextReference umbracoContext = _umbracoContextFactory.EnsureUmbracoContext();

        IPublishedContent? published =
            _publishedContentQuery.Content(content.Key)
            ?? _publishedContentQuery.Content(content.Id);

        if (published is null)
        {
            return new ContentSearchResultUrlResolver.ResolvedUrl(null, ContentSearchResultUrlResolver.EmptyDisplay);
        }

        var relativeUrl = TryGetRelativeUrl(published, content.Id, content.Key, culture)
            ?? TryGetFirstPublishedCultureUrl(published, content.Id, content.Key);

        if (relativeUrl is null)
        {
            return new ContentSearchResultUrlResolver.ResolvedUrl(null, ContentSearchResultUrlResolver.EmptyDisplay);
        }

        return new ContentSearchResultUrlResolver.ResolvedUrl(relativeUrl, relativeUrl);
    }

    private string? TryGetFirstPublishedCultureUrl(
        IPublishedContent published,
        int contentId,
        Guid contentKey)
    {
        foreach (var publishedCulture in published.Cultures.Keys)
        {
            var url = TryGetRelativeUrl(published, contentId, contentKey, publishedCulture);

            if (url is not null)
            {
                return url;
            }
        }

        return null;
    }

    private string? TryGetRelativeUrl(
        IPublishedContent published,
        int contentId,
        Guid contentKey,
        string? culture = null)
    {
        try
        {
            string url = culture is null
                ? published.Url(mode: UrlMode.Relative)
                : published.Url(culture, mode: UrlMode.Relative);

            if (string.IsNullOrWhiteSpace(url) || url == "#")
            {
                return null;
            }

            return url.StartsWith('/') ? url : $"/{url}";
        }
        catch (Exception ex)
        {
            _logger.LogDebug(
                ex,
                "Failed to resolve URL for content {ContentId} ({ContentKey}) in culture {Culture}.",
                contentId,
                contentKey,
                culture ?? "(default)");

            return null;
        }
    }
}

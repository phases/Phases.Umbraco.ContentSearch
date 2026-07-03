using Microsoft.Extensions.Logging;
using Phases.Umbraco.FilterNodes.Constants;
using Phases.Umbraco.FilterNodes.Services.Interfaces;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.Web;

namespace Phases.Umbraco.FilterNodes.Services;

/// <summary>
/// Resolves frontend URLs from published content via <see cref="IPublishedContentQuery"/>.
/// </summary>
public sealed class PublishedContentUrlResolver : IPublishedContentUrlResolver
{
    private readonly IUmbracoContextFactory _umbracoContextFactory;
    private readonly IPublishedContentQuery _publishedContentQuery;
    private readonly ILogger<PublishedContentUrlResolver> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="PublishedContentUrlResolver"/> class.
    /// </summary>
    public PublishedContentUrlResolver(
        IUmbracoContextFactory umbracoContextFactory,
        IPublishedContentQuery publishedContentQuery,
        ILogger<PublishedContentUrlResolver> logger)
    {
        _umbracoContextFactory = umbracoContextFactory;
        _publishedContentQuery = publishedContentQuery;
        _logger = logger;
    }

    /// <inheritdoc />
    public string ResolveUrl(IContent content, string? culture = null)
    {
        ArgumentNullException.ThrowIfNull(content);

        if (!ContentPublishState.HasPublishedVersion(content))
        {
            return ContentUrlDisplayValues.NotPublished;
        }

        using UmbracoContextReference umbracoContext = _umbracoContextFactory.EnsureUmbracoContext();

        IPublishedContent? published =
            _publishedContentQuery.Content(content.Key)
            ?? _publishedContentQuery.Content(content.Id);

        return PublishedContentUrlFormatter.Format(
            published,
            _logger,
            content.Id,
            content.Key,
            culture);
    }
}

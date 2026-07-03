using Microsoft.Extensions.Logging;
using Phases.Umbraco.FilterNodes.Constants;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Extensions;

namespace Phases.Umbraco.FilterNodes.Services;

/// <summary>
/// Formats frontend URLs from published content instances.
/// </summary>
internal static class PublishedContentUrlFormatter
{
    internal static string Format(
        IPublishedContent? published,
        ILogger? logger = null,
        int contentId = 0,
        Guid contentKey = default,
        string? culture = null)
    {
        if (published is null)
        {
            return ContentUrlDisplayValues.Unavailable;
        }

        if (!string.IsNullOrWhiteSpace(culture))
        {
            string? cultureUrl = TryGetRelativeUrl(published, logger, contentId, contentKey, culture);

            if (cultureUrl is not null)
            {
                return cultureUrl;
            }
        }

        string? url = TryGetRelativeUrl(published, logger, contentId, contentKey);

        if (url is not null)
        {
            return url;
        }

        foreach (var publishedCulture in published.Cultures.Keys)
        {
            url = TryGetRelativeUrl(published, logger, contentId, contentKey, publishedCulture);

            if (url is not null)
            {
                return url;
            }
        }

        return ContentUrlDisplayValues.Unavailable;
    }

    private static string? TryGetRelativeUrl(
        IPublishedContent published,
        ILogger? logger,
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
            logger?.LogDebug(
                ex,
                "Failed to resolve URL for content {ContentId} ({ContentKey}) in culture {Culture}.",
                contentId,
                contentKey,
                culture ?? "(default)");

            return null;
        }
    }
}

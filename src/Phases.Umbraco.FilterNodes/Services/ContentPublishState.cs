using Umbraco.Cms.Core.Models;
using Umbraco.Extensions;

namespace Phases.Umbraco.FilterNodes.Services;

/// <summary>
/// Helpers for determining whether content has a published version.
/// </summary>
internal static class ContentPublishState
{
    internal static bool HasPublishedVersion(IContent content)
    {
        if (content.ContentType.VariesByCulture())
        {
            return content.PublishedCultures.Any();
        }

        return content.Published;
    }
}

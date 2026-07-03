using Umbraco.Cms.Core.Models;

namespace Phases.Umbraco.FilterNodes.Services.Interfaces;

/// <summary>
/// Resolves frontend URLs for content nodes using the published content cache.
/// </summary>
public interface IPublishedContentUrlResolver
{
    /// <summary>
    /// Resolves the relative frontend URL for the specified content node.
    /// </summary>
    /// <param name="content">The content node to resolve.</param>
    /// <param name="culture">An optional culture ISO code for multilingual sites.</param>
    /// <returns>
    /// A relative URL when published, or a display value from <see cref="Constants.ContentUrlDisplayValues"/>.
    /// </returns>
    string ResolveUrl(IContent content, string? culture = null);
}

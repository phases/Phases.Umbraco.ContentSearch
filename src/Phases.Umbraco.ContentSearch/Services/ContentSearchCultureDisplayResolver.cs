using Umbraco.Cms.Core.Models;

namespace Phases.Umbraco.ContentSearch.Services;

/// <summary>
/// Resolves culture-aware display values for search result rows.
/// </summary>
internal static class ContentSearchCultureDisplayResolver
{
    internal sealed record ResolvedDisplay(string? Name, string? MatchedCulture);

    internal static ResolvedDisplay ResolveName(IContent content, string? culture)
    {
        ArgumentNullException.ThrowIfNull(content);

        if (!string.IsNullOrWhiteSpace(culture))
        {
            return new ResolvedDisplay(
                content.GetCultureName(culture) ?? content.Name,
                culture);
        }

        foreach (var publishedCulture in GetPublishedCultures(content))
        {
            var cultureName = content.GetCultureName(publishedCulture);

            if (!string.IsNullOrWhiteSpace(cultureName))
            {
                return new ResolvedDisplay(cultureName, publishedCulture);
            }
        }

        return new ResolvedDisplay(content.Name, null);
    }

    internal static IReadOnlyList<string> GetPublishedCultures(IContent content)
    {
        ArgumentNullException.ThrowIfNull(content);

        var publishedCultures = content.PublishedCultures
            .Where(static culture => !string.IsNullOrWhiteSpace(culture))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();

        return publishedCultures.Length > 0
            ? publishedCultures
            : [];
    }

    internal static int CountExpandedRows(IContent content)
    {
        ArgumentNullException.ThrowIfNull(content);

        var publishedCultures = GetPublishedCultures(content);
        return publishedCultures.Count > 0 ? publishedCultures.Count : 1;
    }
}

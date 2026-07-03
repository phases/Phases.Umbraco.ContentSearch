using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Services;

namespace Phases.Umbraco.ContentSearch.Search.Mapping;

/// <summary>
/// Resolves Umbraco content paths into editor-friendly hierarchy labels.
/// </summary>
internal static class ContentSearchContentPathResolver
{
    internal static string? Resolve(
        IContent content,
        IContentService contentService,
        IDictionary<int, string> nameCache)
    {
        ArgumentNullException.ThrowIfNull(content);
        ArgumentNullException.ThrowIfNull(contentService);
        ArgumentNullException.ThrowIfNull(nameCache);

        if (string.IsNullOrWhiteSpace(content.Path))
        {
            return null;
        }

        var segments = new List<string>();

        foreach (var part in content.Path.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries))
        {
            if (!int.TryParse(part, out var id) || id <= 0)
            {
                continue;
            }

            if (!nameCache.TryGetValue(id, out var name))
            {
                IContent? node = id == content.Id
                    ? content
                    : contentService.GetById(id);

                name = node?.Name?.Trim();

                if (!string.IsNullOrWhiteSpace(name))
                {
                    nameCache[id] = name;
                }
            }

            if (!string.IsNullOrWhiteSpace(name))
            {
                segments.Add(name);
            }
        }

        return segments.Count > 0
            ? string.Join(" > ", segments)
            : null;
    }
}

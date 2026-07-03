namespace Phases.Umbraco.ContentSearch.Localization;

/// <summary>
/// Default implementation of <see cref="IContentSearchLocalizationService"/>.
/// </summary>
public sealed class ContentSearchLocalizationService : IContentSearchLocalizationService
{
    private static readonly IReadOnlyDictionary<string, string> DefaultValues =
        new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            [ContentSearchLocalizationKeys.SectionLabel] = "Content Search",
            [ContentSearchLocalizationKeys.WorkspaceTitle] = "Content Search",
            [ContentSearchLocalizationKeys.SearchButton] = "Search",
            [ContentSearchLocalizationKeys.ExportButton] = "Export",
            [ContentSearchLocalizationKeys.NoResultsTitle] = "No results found",
            [ContentSearchLocalizationKeys.NoResultsDescription] =
                "Try adjusting your search conditions or clearing filters.",
        };

    /// <inheritdoc />
    public Task<string> GetAsync(
        string key,
        string? culture = null,
        CancellationToken cancellationToken = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(key);
        cancellationToken.ThrowIfCancellationRequested();

        return Task.FromResult(
            DefaultValues.TryGetValue(key, out var value)
                ? value
                : key);
    }
}

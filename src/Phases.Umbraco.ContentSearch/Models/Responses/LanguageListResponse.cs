namespace Phases.Umbraco.ContentSearch.Models.Responses;

/// <summary>
/// Response payload for enabled Umbraco languages.
/// </summary>
public sealed record LanguageListResponse
{
    /// <summary>
    /// Gets the enabled languages ordered for UI display.
    /// </summary>
    public IReadOnlyList<LanguageListItem> Languages { get; init; } = [];
}

namespace Phases.Umbraco.FilterNodes.Models.Responses;

/// <summary>
/// Response containing installed Umbraco languages.
/// </summary>
public sealed record LanguageListResponse
{
    /// <summary>
    /// Gets the installed languages.
    /// </summary>
    public IReadOnlyList<LanguageListItem> Languages { get; init; } = [];
}

using Phases.Umbraco.FilterNodes.Models.Responses;

namespace Phases.Umbraco.FilterNodes.Services.Interfaces;

/// <summary>
/// Provides installed Umbraco language information for culture-aware filtering.
/// </summary>
public interface ILanguageQueryService
{
    /// <summary>
    /// Gets all installed languages.
    /// </summary>
    /// <param name="cancellationToken">A token to cancel the operation.</param>
    /// <returns>Installed languages.</returns>
    Task<IReadOnlyList<LanguageListItem>> GetLanguagesAsync(
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the display name for a culture ISO code.
    /// </summary>
    /// <param name="culture">The culture ISO code.</param>
    /// <returns>The display name, or the ISO code when not found.</returns>
    string GetCultureDisplayName(string culture);
}

using Phases.Umbraco.ContentSearch.Models.Responses;

namespace Phases.Umbraco.ContentSearch.Services;

/// <summary>
/// Provides access to enabled Umbraco languages for culture-aware search.
/// </summary>
public interface ILanguageQueryService
{
    /// <summary>
    /// Gets all enabled languages configured in Umbraco.
    /// </summary>
    /// <param name="cancellationToken">A token to cancel the operation.</param>
    /// <returns>The enabled languages.</returns>
    Task<IReadOnlyList<LanguageListItem>> GetLanguagesAsync(
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the display name for a culture ISO code.
    /// </summary>
    /// <param name="culture">The culture ISO code.</param>
    /// <param name="cancellationToken">A token to cancel the operation.</param>
    /// <returns>The display name.</returns>
    Task<string> GetCultureDisplayNameAsync(
        string culture,
        CancellationToken cancellationToken = default);
}

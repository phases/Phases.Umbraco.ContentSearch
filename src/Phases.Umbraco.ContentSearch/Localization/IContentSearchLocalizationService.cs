namespace Phases.Umbraco.ContentSearch.Localization;

/// <summary>
/// Resolves localized labels for Content Search backoffice UI elements.
/// </summary>
public interface IContentSearchLocalizationService
{
    /// <summary>
    /// Gets a localized string for the specified dictionary key.
    /// </summary>
    /// <param name="key">The dictionary key.</param>
    /// <param name="culture">The culture code.</param>
    /// <param name="cancellationToken">A token to cancel the operation.</param>
    /// <returns>The localized value, or the key when no translation exists.</returns>
    Task<string> GetAsync(
        string key,
        string? culture = null,
        CancellationToken cancellationToken = default);
}

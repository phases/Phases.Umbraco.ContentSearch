using Phases.Umbraco.ContentSearch.Presets.Models;

namespace Phases.Umbraco.ContentSearch.Presets;

/// <summary>
/// Provides built-in quick search presets.
/// </summary>
public interface IContentSearchPresetCatalog
{
    /// <summary>
    /// Gets all built-in presets with runtime values resolved.
    /// </summary>
    /// <param name="cancellationToken">A token to cancel the operation.</param>
    /// <returns>The preset list.</returns>
    Task<ContentSearchPresetListResponse> GetAllAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a preset by identifier.
    /// </summary>
    /// <param name="presetId">The preset identifier.</param>
    /// <param name="cancellationToken">A token to cancel the operation.</param>
    /// <returns>The preset, if found.</returns>
    Task<ContentSearchPresetResponse?> GetByIdAsync(
        string presetId,
        CancellationToken cancellationToken = default);
}

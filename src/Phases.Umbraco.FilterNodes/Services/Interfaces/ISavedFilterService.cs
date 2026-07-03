using Phases.Umbraco.FilterNodes.Models.Requests;
using Phases.Umbraco.FilterNodes.Models.Responses;

namespace Phases.Umbraco.FilterNodes.Services.Interfaces;

/// <summary>
/// Manages saved filter configurations for backoffice users.
/// </summary>
public interface ISavedFilterService
{
    /// <summary>
    /// Gets all saved filters for the current backoffice user.
    /// </summary>
    /// <param name="cancellationToken">A token to cancel the operation.</param>
    /// <returns>The saved filters.</returns>
    Task<SavedFilterListResponse> GetAllAsync(CancellationToken cancellationToken);

    /// <summary>
    /// Saves a new filter configuration for the current backoffice user.
    /// </summary>
    /// <param name="request">The save request.</param>
    /// <param name="cancellationToken">A token to cancel the operation.</param>
    /// <returns>The saved filter.</returns>
    Task<SavedFilterResponse> SaveAsync(
        SaveSavedFilterRequest request,
        CancellationToken cancellationToken);

    /// <summary>
    /// Deletes a saved filter for the current backoffice user.
    /// </summary>
    /// <param name="savedFilterId">The saved filter identifier.</param>
    /// <param name="cancellationToken">A token to cancel the operation.</param>
    Task DeleteAsync(Guid savedFilterId, CancellationToken cancellationToken);
}

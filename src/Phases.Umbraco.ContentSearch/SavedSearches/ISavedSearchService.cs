using Phases.Umbraco.ContentSearch.SavedSearches.Models.Requests;
using Phases.Umbraco.ContentSearch.SavedSearches.Models.Responses;

namespace Phases.Umbraco.ContentSearch.SavedSearches;

/// <summary>
/// Manages persisted, shared, and recent searches for backoffice users.
/// </summary>
public interface ISavedSearchService
{
    /// <summary>
    /// Gets categorized saved searches for the current user.
    /// </summary>
    /// <param name="cancellationToken">A token to cancel the operation.</param>
    /// <returns>The saved search collections.</returns>
    Task<SavedSearchListResponse> GetAllAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a saved or recent search by identifier.
    /// </summary>
    /// <param name="savedSearchId">The saved search identifier.</param>
    /// <param name="cancellationToken">A token to cancel the operation.</param>
    /// <returns>The saved search details.</returns>
    Task<SavedSearchDetailResponse> GetByIdAsync(
        Guid savedSearchId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Saves a new personal or shared search.
    /// </summary>
    /// <param name="request">The save request.</param>
    /// <param name="cancellationToken">A token to cancel the operation.</param>
    /// <returns>The saved search details.</returns>
    Task<SavedSearchDetailResponse> SaveAsync(
        SaveSavedSearchRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates the name and description of a saved search.
    /// </summary>
    /// <param name="savedSearchId">The saved search identifier.</param>
    /// <param name="request">The update request.</param>
    /// <param name="cancellationToken">A token to cancel the operation.</param>
    /// <returns>The updated saved search details.</returns>
    Task<SavedSearchDetailResponse> UpdateAsync(
        Guid savedSearchId,
        UpdateSavedSearchRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Duplicates a saved search into the current user's personal collection.
    /// </summary>
    /// <param name="savedSearchId">The saved search identifier.</param>
    /// <param name="cancellationToken">A token to cancel the operation.</param>
    /// <returns>The duplicated saved search details.</returns>
    Task<SavedSearchDetailResponse> DuplicateAsync(
        Guid savedSearchId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes a saved search.
    /// </summary>
    /// <param name="savedSearchId">The saved search identifier.</param>
    /// <param name="cancellationToken">A token to cancel the operation.</param>
    Task DeleteAsync(Guid savedSearchId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Toggles whether a saved search is pinned for the current user.
    /// </summary>
    /// <param name="savedSearchId">The saved search identifier.</param>
    /// <param name="cancellationToken">A token to cancel the operation.</param>
    /// <returns>The updated saved search summary.</returns>
    Task<SavedSearchSummaryResponse> TogglePinAsync(
        Guid savedSearchId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Toggles whether a saved search is favourited for the current user.
    /// </summary>
    /// <param name="savedSearchId">The saved search identifier.</param>
    /// <param name="cancellationToken">A token to cancel the operation.</param>
    /// <returns>The updated saved search summary.</returns>
    Task<SavedSearchSummaryResponse> ToggleFavouriteAsync(
        Guid savedSearchId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Records usage of a saved search and updates recent searches.
    /// </summary>
    /// <param name="savedSearchId">The saved search identifier.</param>
    /// <param name="cancellationToken">A token to cancel the operation.</param>
    Task RecordSavedSearchUsageAsync(
        Guid savedSearchId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Records an ad-hoc search execution in recent searches.
    /// </summary>
    /// <param name="request">The recent search request.</param>
    /// <param name="cancellationToken">A token to cancel the operation.</param>
    Task RecordRecentSearchAsync(
        RecordRecentSearchRequest request,
        CancellationToken cancellationToken = default);
}

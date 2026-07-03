using Phases.Umbraco.ContentSearch.Models.Responses;

namespace Phases.Umbraco.ContentSearch.Services;

/// <summary>
/// Provides health-check operations for the Content Search API.
/// </summary>
public interface IPingService
{
    /// <summary>
    /// Returns a ping response indicating the API is available.
    /// </summary>
    /// <param name="cancellationToken">A token to cancel the operation.</param>
    /// <returns>A <see cref="PingResponse"/> with the ping message.</returns>
    Task<PingResponse> PingAsync(CancellationToken cancellationToken = default);
}

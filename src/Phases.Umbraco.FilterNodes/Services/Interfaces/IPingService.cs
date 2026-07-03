using Phases.Umbraco.FilterNodes.Models.Responses;

namespace Phases.Umbraco.FilterNodes.Services.Interfaces;

/// <summary>
/// Provides health-check operations for the Filter Nodes API.
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

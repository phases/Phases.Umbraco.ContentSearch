using Phases.Umbraco.FilterNodes.Models.Responses;
using Phases.Umbraco.FilterNodes.Services.Interfaces;

namespace Phases.Umbraco.FilterNodes.Services;

/// <summary>
/// Default implementation of <see cref="IPingService"/>.
/// </summary>
public sealed class PingService : IPingService
{
    /// <inheritdoc />
    public Task<PingResponse> PingAsync(CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        return Task.FromResult(new PingResponse { Message = "Pong" });
    }
}

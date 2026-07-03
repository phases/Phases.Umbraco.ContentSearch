using Phases.Umbraco.ContentSearch.Models.Responses;

namespace Phases.Umbraco.ContentSearch.Services;

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

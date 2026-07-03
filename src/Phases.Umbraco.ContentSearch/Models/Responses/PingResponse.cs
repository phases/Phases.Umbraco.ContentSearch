namespace Phases.Umbraco.ContentSearch.Models.Responses;

/// <summary>
/// Response returned by the Content Search API health-check endpoint.
/// </summary>
public sealed class PingResponse
{
    /// <summary>
    /// Gets or sets the ping message.
    /// </summary>
    public required string Message { get; init; }
}

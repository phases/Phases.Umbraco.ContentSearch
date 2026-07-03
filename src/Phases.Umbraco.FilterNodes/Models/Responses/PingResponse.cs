namespace Phases.Umbraco.FilterNodes.Models.Responses;

/// <summary>
/// Response model for the API health ping endpoint.
/// </summary>
public sealed class PingResponse
{
    /// <summary>
    /// Gets or sets the ping response message.
    /// </summary>
    public string Message { get; set; } = string.Empty;
}

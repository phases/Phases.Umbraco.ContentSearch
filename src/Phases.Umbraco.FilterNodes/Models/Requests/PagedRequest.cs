namespace Phases.Umbraco.FilterNodes.Models.Requests;

/// <summary>
/// Request model for paginated API queries.
/// </summary>
public sealed record PagedRequest
{
    /// <summary>
    /// Gets the page number (1-based).
    /// </summary>
    public int Page { get; init; } = 1;

    /// <summary>
    /// Gets the number of items per page.
    /// </summary>
    public int PageSize { get; init; } = 20;
}

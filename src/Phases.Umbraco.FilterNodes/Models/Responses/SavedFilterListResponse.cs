namespace Phases.Umbraco.FilterNodes.Models.Responses;

/// <summary>
/// Response containing saved filters for the current user.
/// </summary>
public sealed record SavedFilterListResponse
{
    /// <summary>
    /// Gets the saved filters.
    /// </summary>
    public IReadOnlyList<SavedFilterResponse> Filters { get; init; } = [];
}

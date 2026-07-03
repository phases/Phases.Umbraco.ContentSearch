namespace Phases.Umbraco.FilterNodes.Models.Responses;

/// <summary>
/// A language available for culture-specific filtering.
/// </summary>
public sealed record LanguageListItem
{
    /// <summary>
    /// Gets the culture ISO code (for example, en-US).
    /// </summary>
    public required string IsoCode { get; init; }

    /// <summary>
    /// Gets the display name (for example, English (United States)).
    /// </summary>
    public required string Name { get; init; }
}

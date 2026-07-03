namespace Phases.Umbraco.FilterNodes.Models.Responses;

/// <summary>
/// A selectable option for a property filter control.
/// </summary>
public sealed record PropertyFilterOption
{
    /// <summary>
    /// Gets the display label shown in the filter UI.
    /// </summary>
    public required string Label { get; init; }

    /// <summary>
    /// Gets the indexed value sent when filtering.
    /// </summary>
    public required string Value { get; init; }
}

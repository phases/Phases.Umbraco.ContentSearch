namespace Phases.Umbraco.ContentSearch.Metadata.Models;

/// <summary>
/// Describes a content type available for search filter UI configuration.
/// Metadata is used exclusively to build the backoffice UI and never drives search execution directly.
/// </summary>
public sealed class ContentTypeMetadata
{
    /// <summary>
    /// Gets or sets the content type alias.
    /// </summary>
    public required string Alias { get; init; }

    /// <summary>
    /// Gets or sets the display name.
    /// </summary>
    public required string Name { get; init; }

    /// <summary>
    /// Gets or sets the icon CSS class.
    /// </summary>
    public string? Icon { get; init; }
}

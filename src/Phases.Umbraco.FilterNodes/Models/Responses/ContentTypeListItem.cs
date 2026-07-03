namespace Phases.Umbraco.FilterNodes.Models.Responses;

/// <summary>
/// A document type available for filtering in the backoffice.
/// </summary>
public sealed record ContentTypeListItem
{
    /// <summary>
    /// Gets the document type alias.
    /// </summary>
    public required string Alias { get; init; }

    /// <summary>
    /// Gets the document type display name.
    /// </summary>
    public required string Name { get; init; }
}

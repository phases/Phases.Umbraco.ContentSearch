namespace Phases.Umbraco.FilterNodes.Models.Responses;

/// <summary>
/// Response containing property metadata available for filtering on a document type.
/// </summary>
public sealed record PropertyAliasesResponse
{
    /// <summary>
    /// Gets the document type alias.
    /// </summary>
    public required string ContentTypeAlias { get; init; }

    /// <summary>
    /// Gets the filterable property aliases.
    /// </summary>
    public required IReadOnlyList<string> Aliases { get; init; }

    /// <summary>
    /// Gets the filterable property metadata.
    /// </summary>
    public required IReadOnlyList<FilterablePropertyMetadata> Properties { get; init; }
}

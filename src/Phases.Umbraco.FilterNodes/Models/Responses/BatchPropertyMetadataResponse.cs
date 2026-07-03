namespace Phases.Umbraco.FilterNodes.Models.Responses;

/// <summary>
/// Response containing property metadata for multiple document types.
/// </summary>
public sealed record BatchPropertyMetadataResponse
{
    /// <summary>
    /// Gets the property metadata results per document type.
    /// </summary>
    public required IReadOnlyList<PropertyAliasesResponse> Items { get; init; }
}

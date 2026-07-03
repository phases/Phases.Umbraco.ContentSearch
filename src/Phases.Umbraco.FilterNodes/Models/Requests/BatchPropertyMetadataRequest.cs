namespace Phases.Umbraco.FilterNodes.Models.Requests;

/// <summary>
/// Request model for loading property metadata for multiple document types.
/// </summary>
public sealed record BatchPropertyMetadataRequest
{
    /// <summary>
    /// Gets the document type aliases to load property metadata for.
    /// </summary>
    public IReadOnlyList<string> ContentTypeAliases { get; init; } = [];
}

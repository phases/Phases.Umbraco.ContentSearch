namespace Phases.Umbraco.FilterNodes.Models.Responses;

/// <summary>
/// Response containing document types available for filtering.
/// </summary>
public sealed record ContentTypeAliasesResponse
{
    /// <summary>
    /// Gets the document types available for filtering.
    /// </summary>
    public required IReadOnlyList<ContentTypeListItem> ContentTypes { get; init; }

    /// <summary>
    /// Gets the document type aliases.
    /// </summary>
    public IReadOnlyList<string> Aliases
        => ContentTypes.Select(static contentType => contentType.Alias).ToArray();
}

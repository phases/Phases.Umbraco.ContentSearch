namespace Phases.Umbraco.ContentSearch.Search.Models;

/// <summary>
/// A single search condition submitted by the query builder.
/// </summary>
public sealed class SearchConditionRequest
{
    /// <summary>
    /// Gets or sets the content type alias scope.
    /// </summary>
    public required string ContentTypeAlias { get; init; }

    /// <summary>
    /// Gets or sets the property alias to filter on.
    /// </summary>
    public required string PropertyAlias { get; init; }

    /// <summary>
    /// Gets or sets the operator identifier from the client (for example, contains).
    /// </summary>
    public required string Operator { get; init; }

    /// <summary>
    /// Gets or sets the comparison value.
    /// </summary>
    public string? Value { get; init; }
}

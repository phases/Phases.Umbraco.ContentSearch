using System.Text.Json.Serialization;
using Phases.Umbraco.FilterNodes.Models.Enums;

namespace Phases.Umbraco.FilterNodes.Models.Requests;

/// <summary>
/// A persisted filter condition within a saved filter.
/// </summary>
public sealed record SavedFilterCondition
{
    /// <summary>
    /// Gets the document type alias.
    /// </summary>
    public string ContentTypeAlias { get; init; } = string.Empty;

    /// <summary>
    /// Gets the property alias.
    /// </summary>
    public string PropertyAlias { get; init; } = string.Empty;

    /// <summary>
    /// Gets the comparison operator.
    /// </summary>
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public FilterOperator FilterOperator { get; init; } = FilterOperator.Equals;

    /// <summary>
    /// Gets the property value.
    /// </summary>
    public string PropertyValue { get; init; } = string.Empty;

    /// <summary>
    /// Gets the inclusive start of a date range filter.
    /// </summary>
    public string? FromDate { get; init; }

    /// <summary>
    /// Gets the inclusive end of a date range filter.
    /// </summary>
    public string? ToDate { get; init; }
}

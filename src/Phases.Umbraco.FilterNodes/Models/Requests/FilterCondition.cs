using System.Text.Json.Serialization;
using Phases.Umbraco.FilterNodes.Models.Enums;
using Phases.Umbraco.FilterNodes.Models.Examine;

namespace Phases.Umbraco.FilterNodes.Models.Requests;

/// <summary>
/// A single filter criterion applied when searching content nodes.
/// </summary>
public sealed record FilterCondition
{
    /// <summary>
    /// Gets the document type alias to filter by.
    /// </summary>
    public string? ContentTypeAlias { get; init; }

    /// <summary>
    /// Gets the property alias to filter by.
    /// </summary>
    public string? PropertyAlias { get; init; }

    /// <summary>
    /// Gets the property value to compare against.
    /// </summary>
    public string? PropertyValue { get; init; }

    /// <summary>
    /// Gets the comparison operator for the property value.
    /// </summary>
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public FilterOperator? FilterOperator { get; init; }

    /// <summary>
    /// Gets the inclusive start of a date range filter.
    /// </summary>
    public DateTimeOffset? FromDate { get; init; }

    /// <summary>
    /// Gets the inclusive end of a date range filter.
    /// </summary>
    public DateTimeOffset? ToDate { get; init; }

    /// <summary>
    /// Gets the resolved filter control type for the property, when known.
    /// </summary>
    [JsonIgnore]
    public PropertyFilterType? PropertyFilterType { get; init; }

    /// <summary>
    /// Gets the Examine field names resolved for this condition during normalization.
    /// </summary>
    [JsonIgnore]
    public IReadOnlyList<string>? ResolvedExamineFieldNames { get; init; }

    /// <summary>
    /// Gets the Examine field resolution strategy resolved during normalization.
    /// </summary>
    [JsonIgnore]
    public ExamineFieldResolutionStrategy? ExamineResolutionStrategy { get; init; }
}

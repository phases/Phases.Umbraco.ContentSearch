using Phases.Umbraco.ContentSearch.Examine.Models;
using Phases.Umbraco.ContentSearch.Metadata.Models;
using Phases.Umbraco.ContentSearch.Search.Enums;

namespace Phases.Umbraco.ContentSearch.Search.Models;

/// <summary>
/// A search condition after operator resolution and Examine field mapping.
/// </summary>
public sealed class NormalizedSearchCondition
{
    /// <summary>
    /// Gets or sets the content type alias scope.
    /// </summary>
    public required string ContentTypeAlias { get; init; }

    /// <summary>
    /// Gets or sets the property alias.
    /// </summary>
    public required string PropertyAlias { get; init; }

    /// <summary>
    /// Gets or sets the resolved operator.
    /// </summary>
    public SearchOperator Operator { get; init; }

    /// <summary>
    /// Gets or sets the comparison value.
    /// </summary>
    public string? Value { get; init; }

    /// <summary>
    /// Gets or sets the lower bound for date or numeric range comparisons.
    /// </summary>
    public DateTimeOffset? FromDate { get; init; }

    /// <summary>
    /// Gets or sets the upper bound for date or numeric range comparisons.
    /// </summary>
    public DateTimeOffset? ToDate { get; init; }

    /// <summary>
    /// Gets or sets the lower bound for numeric comparisons.
    /// </summary>
    public decimal? FromNumber { get; init; }

    /// <summary>
    /// Gets or sets the upper bound for numeric comparisons.
    /// </summary>
    public decimal? ToNumber { get; init; }

    /// <summary>
    /// Gets or sets the resolved Examine field names.
    /// </summary>
    public IReadOnlyList<string> ResolvedExamineFieldNames { get; init; } = [];

    /// <summary>
    /// Gets or sets the field resolution strategy.
    /// </summary>
    public ExamineFieldResolutionStrategy ResolutionStrategy { get; init; }

    /// <summary>
    /// Gets or sets the property metadata used during resolution.
    /// </summary>
    public SearchablePropertyMetadata? Metadata { get; init; }

    /// <summary>
    /// Gets a value indicating whether the condition can be executed in Examine.
    /// </summary>
    public bool IsSupported =>
        ResolutionStrategy != ExamineFieldResolutionStrategy.Unsupported
        && ResolvedExamineFieldNames.Count > 0;
}

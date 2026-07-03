namespace Phases.Umbraco.ContentSearch.Examine.Models;

/// <summary>
/// The result of resolving a logical property alias to Examine index fields.
/// </summary>
public sealed record ExamineFieldResolution
{
    /// <summary>
    /// Gets the Examine field names to query.
    /// </summary>
    public required IReadOnlyList<string> FieldNames { get; init; }

    /// <summary>
    /// Gets the resolution strategy used.
    /// </summary>
    public ExamineFieldResolutionStrategy Strategy { get; init; } =
        ExamineFieldResolutionStrategy.Direct;

    /// <summary>
    /// Gets a value indicating whether the property varies by culture.
    /// </summary>
    public bool VariesByCulture { get; init; }

    /// <summary>
    /// Gets a value indicating whether the alias can be queried in Examine.
    /// </summary>
    public bool IsSupported => Strategy != ExamineFieldResolutionStrategy.Unsupported
        && FieldNames.Count > 0;
}

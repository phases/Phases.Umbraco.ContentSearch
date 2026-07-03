namespace Phases.Umbraco.FilterNodes.Models.Responses;

/// <summary>
/// Examine index analysis for a block editor container property.
/// </summary>
public sealed record BlockExamineDiagnostics
{
    /// <summary>
    /// Gets the Examine field name used for the block container.
    /// </summary>
    public required string ContainerField { get; init; }

    /// <summary>
    /// Gets a value indicating whether the container field exists in the Examine index.
    /// </summary>
    public bool ContainerIndexed { get; init; }

    /// <summary>
    /// Gets the number of element properties with detected Examine fields.
    /// </summary>
    public int ElementFieldsDetected { get; init; }

    /// <summary>
    /// Gets the number of element properties with dedicated, individually queryable Examine fields.
    /// </summary>
    public int DedicatedPropertyFields { get; init; }

    /// <summary>
    /// Gets the recommended search strategy label for this block configuration.
    /// </summary>
    public required string SearchStrategy { get; init; }

    /// <summary>
    /// Gets a plain-language explanation of how this block is indexed.
    /// </summary>
    public required string Explanation { get; init; }
}

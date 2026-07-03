namespace Phases.Umbraco.FilterNodes.Models.Examine;

/// <summary>
/// Describes how a logical property alias maps to Examine index fields.
/// </summary>
public enum ExamineFieldResolutionStrategy
{
    /// <summary>
    /// The property alias maps directly to a single Examine field.
    /// </summary>
    Direct,

    /// <summary>
    /// The property is a block container and maps to the container field only.
    /// </summary>
    ContainerOnly,

    /// <summary>
    /// The property is a nested block element property mapped to one or more Examine fields.
    /// </summary>
    NestedBlock,

    /// <summary>
    /// No matching Examine fields were found for the logical alias.
    /// </summary>
    Unsupported,
}

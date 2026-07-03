namespace Phases.Umbraco.ContentSearch.Examine.Models;

/// <summary>
/// How a property alias was resolved to Examine index fields.
/// </summary>
public enum ExamineFieldResolutionStrategy
{
    /// <summary>
    /// The property maps directly to a single Examine field.
    /// </summary>
    Direct,

    /// <summary>
    /// The property resolves to a block container field only.
    /// </summary>
    ContainerOnly,

    /// <summary>
    /// The property resolves to a dedicated nested block field.
    /// </summary>
    NestedBlock,

    /// <summary>
    /// The property could not be resolved to searchable fields.
    /// </summary>
    Unsupported,
}

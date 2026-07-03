namespace Phases.Umbraco.FilterNodes.Models.Responses;

/// <summary>
/// Optional metadata applied when resolving filterable property definitions.
/// </summary>
public sealed record PropertyMetadataOptions
{
    /// <summary>
    /// Gets a value indicating whether the property can be used in filter conditions.
    /// </summary>
    public bool IsFilterable { get; init; } = true;

    /// <summary>
    /// Gets a value indicating whether the property is a Block List or Block Grid container.
    /// </summary>
    public bool IsContainer { get; init; }

    /// <summary>
    /// Gets the block container property alias, when applicable.
    /// </summary>
    public string? ContainerAlias { get; init; }

    /// <summary>
    /// Gets the block container display name, when applicable.
    /// </summary>
    public string? ContainerName { get; init; }

    /// <summary>
    /// Gets the block container editor alias, when applicable.
    /// </summary>
    public string? ContainerEditorAlias { get; init; }

    /// <summary>
    /// Gets the block element type alias, when applicable.
    /// </summary>
    public string? ElementTypeAlias { get; init; }

    /// <summary>
    /// Gets the block element type display name, when applicable.
    /// </summary>
    public string? ElementTypeName { get; init; }

    /// <summary>
    /// Gets the hierarchical display path segments for UI rendering.
    /// </summary>
    public IReadOnlyList<string> DisplayPath { get; init; } = [];

    /// <summary>
    /// Gets block editor discovery diagnostics for container properties.
    /// </summary>
    public BlockDiscoveryDiagnostics? BlockDiscoveryDiagnostics { get; init; }

    /// <summary>
    /// Gets whether the block container property varies by culture.
    /// Used to inherit culture variance for nested block element properties.
    /// </summary>
    public bool ContainerVariesByCulture { get; init; }
}

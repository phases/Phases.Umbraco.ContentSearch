namespace Phases.Umbraco.ContentSearch.Metadata.Models;

/// <summary>
/// Optional metadata used when resolving searchable properties.
/// </summary>
public sealed record PropertyMetadataOptions
{
    /// <summary>
    /// Gets a value indicating whether the property can be selected in the builder.
    /// </summary>
    public bool IsSelectable { get; init; } = true;

    /// <summary>
    /// Gets a value indicating whether the property is a block editor container.
    /// </summary>
    public bool IsContainer { get; init; }

    /// <summary>
    /// Gets the block container property alias.
    /// </summary>
    public string? ContainerAlias { get; init; }

    /// <summary>
    /// Gets the block container display name.
    /// </summary>
    public string? ContainerName { get; init; }

    /// <summary>
    /// Gets the block container editor alias.
    /// </summary>
    public string? ContainerEditorAlias { get; init; }

    /// <summary>
    /// Gets a value indicating whether the container varies by culture.
    /// </summary>
    public bool ContainerVariesByCulture { get; init; }

    /// <summary>
    /// Gets the block element type alias.
    /// </summary>
    public string? ElementTypeAlias { get; init; }

    /// <summary>
    /// Gets the block element type display name.
    /// </summary>
    public string? ElementTypeName { get; init; }

    /// <summary>
    /// Gets the hierarchical display path segments.
    /// </summary>
    public IReadOnlyList<string> DisplayPath { get; init; } = [];
}

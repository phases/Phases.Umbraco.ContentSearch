using Phases.Umbraco.FilterNodes.Models.Enums;

namespace Phases.Umbraco.FilterNodes.Models.Responses;

/// <summary>
/// Metadata describing how a property can be filtered in the backoffice.
/// </summary>
public sealed record FilterablePropertyMetadata
{
    /// <summary>
    /// Gets the property alias.
    /// </summary>
    public required string Alias { get; init; }

    /// <summary>
    /// Gets the property display name.
    /// </summary>
    public required string Name { get; init; }

    /// <summary>
    /// Gets the property editor schema alias, when available.
    /// </summary>
    public string? EditorAlias { get; init; }

    /// <summary>
    /// Gets the Umbraco data type identifier, when available.
    /// </summary>
    public int? DataTypeId { get; init; }

    /// <summary>
    /// Gets the filter control type to render.
    /// </summary>
    public required PropertyFilterType FilterType { get; init; }

    /// <summary>
    /// Gets predefined filter options, when applicable.
    /// </summary>
    public IReadOnlyList<PropertyFilterOption> Options { get; init; } = [];

    /// <summary>
    /// Gets the property group display name used by the backoffice combobox.
    /// </summary>
    public string GroupName { get; init; } = "General";

    /// <summary>
    /// Gets the property group sort order.
    /// </summary>
    public int GroupSortOrder { get; init; } = int.MaxValue - 100;

    /// <summary>
    /// Gets the property sort order within its group.
    /// </summary>
    public int SortOrder { get; init; }

    /// <summary>
    /// Gets the source category describing where the property definition originates.
    /// </summary>
    public PropertyMetadataSourceCategory SourceCategory { get; init; } =
        PropertyMetadataSourceCategory.ContentType;

    /// <summary>
    /// Gets the composition or block element type name, when applicable.
    /// </summary>
    public string? SourceName { get; init; }

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
    /// Gets Examine index analysis for block editor container properties.
    /// </summary>
    public BlockExamineDiagnostics? BlockExamineDiagnostics { get; init; }

    /// <summary>
    /// Gets the Examine field aliases used when filtering this property, when resolved.
    /// </summary>
    public IReadOnlyList<string> IndexedFieldAliases { get; init; } = [];

    /// <summary>
    /// Gets a value indicating whether the property varies by culture.
    /// </summary>
    public bool VariesByCulture { get; init; }

    /// <summary>
    /// Gets the installed culture ISO codes available for culture-specific search.
    /// </summary>
    public IReadOnlyList<string> AvailableCultures { get; init; } = [];
}

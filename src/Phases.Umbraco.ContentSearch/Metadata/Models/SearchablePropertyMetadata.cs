namespace Phases.Umbraco.ContentSearch.Metadata.Models;

/// <summary>
/// Describes a searchable property for backoffice query builder UI configuration.
/// </summary>
public sealed class SearchablePropertyMetadata
{
    /// <summary>
    /// Gets or sets the property alias.
    /// </summary>
    public required string Alias { get; init; }

    /// <summary>
    /// Gets or sets the display name.
    /// </summary>
    public required string Name { get; init; }

    /// <summary>
    /// Gets or sets the property editor alias.
    /// </summary>
    public string? EditorAlias { get; init; }

    /// <summary>
    /// Gets or sets the Umbraco data type identifier.
    /// </summary>
    public int? DataTypeId { get; init; }

    /// <summary>
    /// Gets or sets the metadata source category.
    /// </summary>
    public PropertyMetadataSourceCategory SourceCategory { get; init; } =
        PropertyMetadataSourceCategory.ContentType;

    /// <summary>
    /// Gets or sets the composition or block element type name, when applicable.
    /// </summary>
    public string? SourceName { get; init; }

    /// <summary>
    /// Gets or sets the UI group name.
    /// </summary>
    public string GroupName { get; init; } = "Content Type";

    /// <summary>
    /// Gets or sets the UI group sort order.
    /// </summary>
    public int GroupSortOrder { get; init; }

    /// <summary>
    /// Gets or sets the sort order within the group.
    /// </summary>
    public int SortOrder { get; init; }

    /// <summary>
    /// Gets or sets a value indicating whether the property varies by culture.
    /// </summary>
    public bool VariesByCulture { get; init; }

    /// <summary>
    /// Gets a value indicating whether the property is invariant across cultures.
    /// </summary>
    public bool IsInvariant => !VariesByCulture;

    /// <summary>
    /// Gets or sets a value indicating whether the property is a block editor container.
    /// </summary>
    public bool IsContainer { get; init; }

    /// <summary>
    /// Gets or sets a value indicating whether the property can be selected in the builder.
    /// </summary>
    public bool IsSelectable { get; init; } = true;

    /// <summary>
    /// Gets or sets the block container property alias, when applicable.
    /// </summary>
    public string? ContainerAlias { get; init; }

    /// <summary>
    /// Gets or sets the block element type alias, when applicable.
    /// </summary>
    public string? ElementTypeAlias { get; init; }

    /// <summary>
    /// Gets or sets the hierarchical display path segments for UI rendering.
    /// </summary>
    public IReadOnlyList<string> DisplayPath { get; init; } = [];

    /// <summary>
    /// Gets or sets installed culture ISO codes available for culture-variant properties.
    /// </summary>
    public IReadOnlyList<string> AvailableCultures { get; init; } = [];
}

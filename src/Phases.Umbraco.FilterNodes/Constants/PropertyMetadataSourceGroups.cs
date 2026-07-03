using Phases.Umbraco.FilterNodes.Models.Enums;

namespace Phases.Umbraco.FilterNodes.Constants;

/// <summary>
/// Display names and sort orders for property metadata source groups.
/// </summary>
internal static class PropertyMetadataSourceGroups
{
    /// <summary>
    /// Separator used between hierarchy segments in property display names.
    /// </summary>
    public const string HierarchySeparator = " > ";

    /// <summary>
    /// Separator used in composite aliases for block element properties.
    /// </summary>
    public const string BlockPropertyAliasSeparator = "__";

    /// <summary>
    /// Gets the display group name for a property metadata source category.
    /// </summary>
    /// <param name="sourceCategory">The source category.</param>
    /// <returns>The group display name.</returns>
    public static string GetGroupName(PropertyMetadataSourceCategory sourceCategory)
        => sourceCategory switch
        {
            PropertyMetadataSourceCategory.System => System,
            PropertyMetadataSourceCategory.ContentType => ContentType,
            PropertyMetadataSourceCategory.Composition => Compositions,
            PropertyMetadataSourceCategory.BlockGrid => BlockGrid,
            PropertyMetadataSourceCategory.BlockList => BlockList,
            _ => ContentType,
        };

    /// <summary>
    /// Gets the sort order for a property metadata source group.
    /// </summary>
    /// <param name="sourceCategory">The source category.</param>
    /// <returns>The group sort order.</returns>
    public static int GetGroupSortOrder(PropertyMetadataSourceCategory sourceCategory)
        => sourceCategory switch
        {
            PropertyMetadataSourceCategory.ContentType => 0,
            PropertyMetadataSourceCategory.Composition => 100,
            PropertyMetadataSourceCategory.BlockGrid => 200,
            PropertyMetadataSourceCategory.BlockList => 300,
            PropertyMetadataSourceCategory.System => int.MaxValue,
            _ => 0,
        };

    /// <summary>
    /// System property group name.
    /// </summary>
    public const string System = "System";

    /// <summary>
    /// Direct document type property group name.
    /// </summary>
    public const string ContentType = "Content Type";

    /// <summary>
    /// Composition property group name.
    /// </summary>
    public const string Compositions = "Compositions";

    /// <summary>
    /// Block Grid element property group name.
    /// </summary>
    public const string BlockGrid = "Block Grid";

    /// <summary>
    /// Block List element property group name.
    /// </summary>
    public const string BlockList = "Block List";

    /// <summary>
    /// Gets the display label for a block editor alias.
    /// </summary>
    /// <param name="editorAlias">The block editor alias.</param>
    /// <returns>The editor display label.</returns>
    public static string GetBlockEditorLabel(string? editorAlias)
        => editorAlias?.Equals(
                global::Umbraco.Cms.Core.Constants.PropertyEditors.Aliases.BlockGrid,
                StringComparison.OrdinalIgnoreCase) == true
            ? BlockGrid
            : BlockList;

    /// <summary>
    /// Formats a block container display name.
    /// </summary>
    /// <param name="propertyName">The property display name.</param>
    /// <param name="editorAlias">The block editor alias.</param>
    /// <returns>The formatted container name.</returns>
    public static string FormatBlockContainerName(string propertyName, string? editorAlias)
        => $"{propertyName.Trim()} ({GetBlockEditorLabel(editorAlias)})";
}

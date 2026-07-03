using Phases.Umbraco.ContentSearch.Metadata.Constants;
using Phases.Umbraco.ContentSearch.Metadata.Models;

namespace Phases.Umbraco.ContentSearch.Metadata.Discovery;

/// <summary>
/// UI group labels and sort orders for metadata discovery.
/// </summary>
internal static class ContentSearchMetadataSourceGroups
{
    public const string SystemGroupName = "System";
    public const string ContentTypeGroupName = "Content Type";
    public const string CompositionGroupName = "Composition";
    public const string BlockGridGroupName = "Block Grid";
    public const string BlockListGroupName = "Block List";

    public const int SystemSortOrder = 0;
    public const int ContentTypeSortOrder = 10;
    public const int CompositionSortOrder = 20;
    public const int BlockGridSortOrder = 30;
    public const int BlockListSortOrder = 40;

    public static string GetGroupName(PropertyMetadataSourceCategory category) =>
        category switch
        {
            PropertyMetadataSourceCategory.System => SystemGroupName,
            PropertyMetadataSourceCategory.ContentType => ContentTypeGroupName,
            PropertyMetadataSourceCategory.Composition => CompositionGroupName,
            PropertyMetadataSourceCategory.BlockGrid => BlockGridGroupName,
            PropertyMetadataSourceCategory.BlockList => BlockListGroupName,
            _ => ContentTypeGroupName,
        };

    public static int GetGroupSortOrder(PropertyMetadataSourceCategory category) =>
        category switch
        {
            PropertyMetadataSourceCategory.System => SystemSortOrder,
            PropertyMetadataSourceCategory.ContentType => ContentTypeSortOrder,
            PropertyMetadataSourceCategory.Composition => CompositionSortOrder,
            PropertyMetadataSourceCategory.BlockGrid => BlockGridSortOrder,
            PropertyMetadataSourceCategory.BlockList => BlockListSortOrder,
            _ => ContentTypeSortOrder,
        };

    public const string HierarchySeparator = " > ";

    public static string BuildBlockPropertyAlias(
        string containerAlias,
        string elementTypeAlias,
        string elementPropertyAlias) =>
        string.Join(
            ContentSearchMetadataConstants.BlockPropertyAliasSeparator,
            containerAlias,
            elementTypeAlias,
            elementPropertyAlias);

    public static string FormatBlockContainerName(string propertyName, string? editorAlias) =>
        $"{propertyName.Trim()} ({GetBlockEditorLabel(editorAlias)})";

    public static string GetBlockEditorLabel(string? editorAlias) =>
        editorAlias?.Equals(
                global::Umbraco.Cms.Core.Constants.PropertyEditors.Aliases.BlockGrid,
                StringComparison.OrdinalIgnoreCase) == true
            ? BlockGridGroupName
            : BlockListGroupName;

    public static string BuildHierarchicalDisplayName(string? parentName, string propertyName)
    {
        if (string.IsNullOrWhiteSpace(parentName))
        {
            return propertyName;
        }

        return $"{parentName.Trim()}{HierarchySeparator}{propertyName}";
    }
}

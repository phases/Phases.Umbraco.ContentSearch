using Phases.Umbraco.ContentSearch.Metadata.Constants;
using Phases.Umbraco.ContentSearch.Metadata.Models;
using Umbraco.Cms.Core.Models;
using Umbraco.Extensions;

namespace Phases.Umbraco.ContentSearch.Metadata.Discovery;

/// <summary>
/// Resolves searchable property metadata from Umbraco property types and data types.
/// </summary>
internal static class SearchablePropertyMetadataResolver
{
    /// <summary>
    /// Creates metadata for a content type property.
    /// </summary>
    public static SearchablePropertyMetadata Resolve(
        IPropertyType propertyType,
        IDataType? dataType,
        string groupName,
        int groupSortOrder,
        PropertyMetadataSourceCategory sourceCategory,
        string? sourceName = null,
        string? displayName = null,
        int? sortOrder = null,
        string? aliasOverride = null,
        PropertyMetadataOptions? options = null)
    {
        ArgumentNullException.ThrowIfNull(propertyType);

        var editorAlias = dataType?.EditorAlias ?? propertyType.PropertyEditorAlias;
        var variesByCulture = options?.ContainerVariesByCulture == true
            || propertyType.VariesByCulture();

        return new SearchablePropertyMetadata
        {
            Alias = aliasOverride ?? propertyType.Alias,
            Name = displayName ?? propertyType.Name,
            EditorAlias = editorAlias,
            DataTypeId = dataType?.Id ?? propertyType.DataTypeId,
            SourceCategory = sourceCategory,
            SourceName = sourceName,
            GroupName = groupName,
            GroupSortOrder = groupSortOrder,
            SortOrder = sortOrder ?? propertyType.SortOrder,
            VariesByCulture = variesByCulture,
            IsContainer = options?.IsContainer ?? false,
            IsSelectable = options?.IsSelectable ?? true,
            ContainerAlias = options?.ContainerAlias,
            ElementTypeAlias = options?.ElementTypeAlias,
            DisplayPath = options?.DisplayPath ?? [],
        };
    }

    /// <summary>
    /// Creates metadata for a built-in system property.
    /// </summary>
    public static SearchablePropertyMetadata ResolveSystemProperty(string alias, int sortOrder = 0)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(alias);

        if (alias.Equals(ContentSearchMetadataConstants.CreatedDatePropertyAlias, StringComparison.OrdinalIgnoreCase)
            || alias.Equals(ContentSearchMetadataConstants.UpdatedDatePropertyAlias, StringComparison.OrdinalIgnoreCase))
        {
            return new SearchablePropertyMetadata
            {
                Alias = alias,
                Name = alias.Equals(
                        ContentSearchMetadataConstants.CreatedDatePropertyAlias,
                        StringComparison.OrdinalIgnoreCase)
                    ? "Create date"
                    : "Update date",
                EditorAlias = "Umbraco.DateTime",
                GroupName = ContentSearchMetadataSourceGroups.SystemGroupName,
                GroupSortOrder = ContentSearchMetadataSourceGroups.GetGroupSortOrder(
                    PropertyMetadataSourceCategory.System),
                SortOrder = sortOrder,
                SourceCategory = PropertyMetadataSourceCategory.System,
                VariesByCulture = false,
            };
        }

        if (alias.Equals(ContentSearchMetadataConstants.NodeNamePropertyAlias, StringComparison.OrdinalIgnoreCase))
        {
            return CreateSystemProperty(
                alias,
                "Node name",
                "Umbraco.TextBox",
                sortOrder);
        }

        if (PublishStatusFilterValues.IsPublishStatusProperty(alias))
        {
            return PublishStatusFilterValues.CreateMetadata(sortOrder);
        }

        if (alias.Equals(ContentSearchMetadataConstants.TemplateIdPropertyAlias, StringComparison.OrdinalIgnoreCase))
        {
            return CreateSystemProperty(
                alias,
                "Template",
                "Umbraco.Integer",
                sortOrder);
        }

        if (alias.Equals(ContentSearchMetadataConstants.UrlPropertyAlias, StringComparison.OrdinalIgnoreCase))
        {
            return CreateSystemProperty(
                alias,
                "URL",
                "Umbraco.TextBox",
                sortOrder);
        }

        if (alias.Equals(ContentSearchMetadataConstants.ReleaseDatePropertyAlias, StringComparison.OrdinalIgnoreCase))
        {
            return CreateSystemProperty(
                alias,
                "Release date",
                "Umbraco.DateTime",
                sortOrder);
        }

        if (alias.Equals(ContentSearchMetadataConstants.FeaturedImagePropertyAlias, StringComparison.OrdinalIgnoreCase))
        {
            return CreateSystemProperty(
                alias,
                "Featured image",
                "Umbraco.MediaPicker3",
                sortOrder);
        }

        return new SearchablePropertyMetadata
        {
            Alias = alias,
            Name = alias,
            GroupName = ContentSearchMetadataSourceGroups.SystemGroupName,
            GroupSortOrder = ContentSearchMetadataSourceGroups.GetGroupSortOrder(
                PropertyMetadataSourceCategory.System),
            SortOrder = sortOrder,
            SourceCategory = PropertyMetadataSourceCategory.System,
            VariesByCulture = false,
        };
    }

    private static SearchablePropertyMetadata CreateSystemProperty(
        string alias,
        string name,
        string editorAlias,
        int sortOrder)
        => new()
        {
            Alias = alias,
            Name = name,
            EditorAlias = editorAlias,
            GroupName = ContentSearchMetadataSourceGroups.SystemGroupName,
            GroupSortOrder = ContentSearchMetadataSourceGroups.GetGroupSortOrder(
                PropertyMetadataSourceCategory.System),
            SortOrder = sortOrder,
            SourceCategory = PropertyMetadataSourceCategory.System,
            VariesByCulture = false,
        };
}

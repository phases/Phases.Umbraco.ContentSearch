using Umbraco.Cms.Core.Models;

namespace Phases.Umbraco.FilterNodes.Services;

/// <summary>
/// Resolves Umbraco property group metadata for filterable properties.
/// </summary>
internal static class PropertyGroupMetadataResolver
{
    /// <summary>
    /// The default group name for properties without a property group.
    /// </summary>
    public const string DefaultGroupName = "General";

    /// <summary>
    /// The group name used for system filterable properties.
    /// </summary>
    public const string SystemGroupName = "System";

    /// <summary>
    /// Resolves the display name and sort order of the property group for a property type.
    /// </summary>
    /// <param name="contentType">The owning document type.</param>
    /// <param name="propertyType">The property type definition.</param>
    /// <returns>The group name and sort order.</returns>
    public static (string GroupName, int GroupSortOrder) Resolve(
        IContentType contentType,
        IPropertyType propertyType)
    {
        ArgumentNullException.ThrowIfNull(contentType);
        ArgumentNullException.ThrowIfNull(propertyType);

        int? propertyGroupId = propertyType.PropertyGroupId?.Value;
        if (propertyGroupId is null or <= 0)
        {
            return (DefaultGroupName, int.MaxValue - 100);
        }

        PropertyGroup? group = FindPropertyGroup(contentType, propertyGroupId.Value);
        if (group is null || string.IsNullOrWhiteSpace(group.Name))
        {
            return (DefaultGroupName, int.MaxValue - 100);
        }

        return (group.Name, group.SortOrder);
    }

    private static PropertyGroup? FindPropertyGroup(IContentType contentType, int groupId)
    {
        PropertyGroup? group = contentType.PropertyGroups?
            .FirstOrDefault(propertyGroup => propertyGroup.Id == groupId);

        if (group is not null)
        {
            return group;
        }

        foreach (IContentType composition in contentType.ContentTypeComposition)
        {
            group = composition.PropertyGroups?
                .FirstOrDefault(propertyGroup => propertyGroup.Id == groupId);

            if (group is not null)
            {
                return group;
            }
        }

        return null;
    }
}

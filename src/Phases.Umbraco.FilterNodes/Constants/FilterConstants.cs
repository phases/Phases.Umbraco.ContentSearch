namespace Phases.Umbraco.FilterNodes.Constants;

/// <summary>
/// Filter engine limits and conventions.
/// </summary>
public static class FilterConstants
{
    /// <summary>
    /// The maximum number of filter conditions allowed per request.
    /// </summary>
    public const int MaxConditionCount = 25;

    /// <summary>
    /// The maximum number of document types that can be requested in one batch metadata call.
    /// </summary>
    public const int MaxPropertyMetadataBatchSize = 25;

    /// <summary>
    /// The property alias used to filter by node creation date.
    /// </summary>
    public const string CreatedDatePropertyAlias = "createDate";

    /// <summary>
    /// The property alias used to filter by node update date.
    /// </summary>
    public const string UpdatedDatePropertyAlias = "updateDate";

    private static readonly HashSet<string> ReservedContentTypeAliases = new(StringComparer.OrdinalIgnoreCase)
    {
        "*",
        "all",
        "allContentTypes",
        "__all__",
    };

    /// <summary>
    /// Determines whether the alias is a reserved cross-type sentinel rather than a document type.
    /// </summary>
    /// <param name="alias">The content type alias to evaluate.</param>
    /// <returns><c>true</c> when the alias is reserved; otherwise, <c>false</c>.</returns>
    public static bool IsReservedContentTypeAlias(string? alias)
    {
        if (string.IsNullOrWhiteSpace(alias))
        {
            return true;
        }

        return ReservedContentTypeAliases.Contains(alias.Trim());
    }

    /// <summary>
    /// Determines whether the property alias is available for entire-site searches.
    /// </summary>
    /// <param name="propertyAlias">The property alias to evaluate.</param>
    /// <returns><c>true</c> when the alias is a system property for entire-site search; otherwise, <c>false</c>.</returns>
    public static bool IsEntireSiteSystemProperty(string? propertyAlias)
    {
        if (string.IsNullOrWhiteSpace(propertyAlias))
        {
            return false;
        }

        return propertyAlias.Equals(FilterNodesExamineFields.NodeName, StringComparison.OrdinalIgnoreCase)
            || propertyAlias.Equals(FilterNodesExamineFields.CreateDate, StringComparison.OrdinalIgnoreCase)
            || propertyAlias.Equals(FilterNodesExamineFields.UpdateDate, StringComparison.OrdinalIgnoreCase)
            || propertyAlias.Equals(FilterNodesExamineFields.NodeTypeAlias, StringComparison.OrdinalIgnoreCase)
            || PublishStatusFilterValues.IsPublishStatusProperty(propertyAlias);
    }
}

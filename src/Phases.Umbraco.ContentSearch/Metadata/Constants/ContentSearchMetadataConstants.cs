namespace Phases.Umbraco.ContentSearch.Metadata.Constants;

/// <summary>
/// Metadata discovery conventions.
/// </summary>
internal static class ContentSearchMetadataConstants
{
    /// <summary>
    /// The property alias used to filter by node name.
    /// </summary>
    public const string NodeNamePropertyAlias = "nodeName";

    /// <summary>
    /// The property alias used to filter by node creation date.
    /// </summary>
    public const string CreatedDatePropertyAlias = "createDate";

    /// <summary>
    /// The property alias used to filter by node update date.
    /// </summary>
    public const string UpdatedDatePropertyAlias = "updateDate";

    /// <summary>
    /// The property alias used to filter by assigned template.
    /// </summary>
    public const string TemplateIdPropertyAlias = "templateID";

    /// <summary>
    /// The property alias used to filter by published URL.
    /// </summary>
    public const string UrlPropertyAlias = "url";

    /// <summary>
    /// The property alias used to filter by scheduled release date.
    /// </summary>
    public const string ReleaseDatePropertyAlias = "releaseDate";

    /// <summary>
    /// Conventional featured image property alias used by quick presets.
    /// </summary>
    public const string FeaturedImagePropertyAlias = "featuredImage";

    /// <summary>
    /// Sentinel content type alias that searches across all document types.
    /// </summary>
    public const string WildcardContentTypeAlias = "__all__";

    /// <summary>
    /// Separator between block container and element property aliases.
    /// </summary>
    public const string BlockPropertyAliasSeparator = "__";

    private static readonly HashSet<string> ReservedContentTypeAliases = new(StringComparer.OrdinalIgnoreCase)
    {
        "*",
        "all",
        "allContentTypes",
        WildcardContentTypeAlias,
    };

    /// <summary>
    /// Determines whether the alias is a reserved sentinel rather than a document type.
    /// </summary>
    public static bool IsReservedContentTypeAlias(string? alias)
    {
        if (string.IsNullOrWhiteSpace(alias))
        {
            return true;
        }

        return ReservedContentTypeAliases.Contains(alias.Trim());
    }

    /// <summary>
    /// Determines whether the alias searches across all document types.
    /// </summary>
    public static bool IsWildcardContentTypeAlias(string? alias)
        => !string.IsNullOrWhiteSpace(alias)
           && alias.Trim().Equals(WildcardContentTypeAlias, StringComparison.OrdinalIgnoreCase);

    /// <summary>
    /// Determines whether the property alias is a built-in system field exposed for wildcard searches.
    /// </summary>
    public static bool IsWildcardSystemProperty(string? propertyAlias)
    {
        if (string.IsNullOrWhiteSpace(propertyAlias))
        {
            return false;
        }

        return propertyAlias.Equals(NodeNamePropertyAlias, StringComparison.OrdinalIgnoreCase)
            || propertyAlias.Equals(CreatedDatePropertyAlias, StringComparison.OrdinalIgnoreCase)
            || propertyAlias.Equals(UpdatedDatePropertyAlias, StringComparison.OrdinalIgnoreCase)
            || PublishStatusFilterValues.IsPublishStatusProperty(propertyAlias);
    }

    /// <summary>
    /// Determines whether the system property value is shared across all cultures.
    /// </summary>
    public static bool IsCultureInvariantSystemProperty(string? propertyAlias)
    {
        if (string.IsNullOrWhiteSpace(propertyAlias))
        {
            return false;
        }

        return propertyAlias.Equals(CreatedDatePropertyAlias, StringComparison.OrdinalIgnoreCase)
            || propertyAlias.Equals(UpdatedDatePropertyAlias, StringComparison.OrdinalIgnoreCase);
    }
}

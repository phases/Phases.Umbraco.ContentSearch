namespace Phases.Umbraco.ContentSearch.Examine;

/// <summary>
/// Examine index field names used by Content Search.
/// </summary>
public static class ContentSearchExamineFields
{
    /// <summary>
    /// The node display name field.
    /// </summary>
    public const string NodeName = "nodeName";

    /// <summary>
    /// The node unique key field.
    /// </summary>
    public const string NodeKey = "__Key";

    /// <summary>
    /// The numeric content node id field.
    /// </summary>
    public const string NodeId = "id";

    /// <summary>
    /// The document type alias field.
    /// </summary>
    public const string NodeTypeAlias = "__NodeTypeAlias";

    /// <summary>
    /// The node update date field.
    /// </summary>
    public const string UpdateDate = "updateDate";

    /// <summary>
    /// The node create date field.
    /// </summary>
    public const string CreateDate = "createDate";

    /// <summary>
    /// The published URL field on the external index.
    /// </summary>
    public const string Url = "url";

    /// <summary>
    /// The assigned template identifier field.
    /// </summary>
    public const string TemplateId = "templateID";

    /// <summary>
    /// The scheduled release date field.
    /// </summary>
    public const string ReleaseDate = "releaseDate";

    /// <summary>
    /// The hierarchical node path field on the external index.
    /// </summary>
    public const string Path = "path";

    /// <summary>
    /// The trashed flag field.
    /// </summary>
    public const string Trashed = "__Trashed";

    /// <summary>
    /// Sentinel query token used when a property cannot be resolved.
    /// </summary>
    public const string UnresolvedPropertyQueryToken = "__content_search_unresolved_property__";
}

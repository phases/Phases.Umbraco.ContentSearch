namespace Phases.Umbraco.FilterNodes.Constants;

/// <summary>
/// Examine index field names used by the Filter Nodes package.
/// </summary>
public static class FilterNodesExamineFields
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
    /// The node sort order field.
    /// </summary>
    public const string SortOrder = "sortOrder";

    /// <summary>
    /// The published URL field on the external index.
    /// </summary>
    public const string Url = "url";

    /// <summary>
    /// The trashed flag field.
    /// </summary>
    public const string Trashed = "__Trashed";
}

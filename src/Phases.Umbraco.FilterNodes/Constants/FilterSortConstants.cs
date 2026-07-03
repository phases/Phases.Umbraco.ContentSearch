namespace Phases.Umbraco.FilterNodes.Constants;

/// <summary>
/// Allowed sort fields for filter search results.
/// </summary>
public static class FilterSortConstants
{
    /// <summary>
    /// Examine fields that may be used for server-side result sorting.
    /// </summary>
    public static readonly IReadOnlySet<string> AllowedSortFields =
        new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            FilterNodesExamineFields.NodeName,
            FilterNodesExamineFields.NodeTypeAlias,
            FilterNodesExamineFields.CreateDate,
            FilterNodesExamineFields.UpdateDate,
            FilterNodesExamineFields.NodeId,
        };
}

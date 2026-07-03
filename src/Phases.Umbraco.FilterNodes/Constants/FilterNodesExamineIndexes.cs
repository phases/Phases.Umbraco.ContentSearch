namespace Phases.Umbraco.FilterNodes.Constants;

/// <summary>
/// Examine index names used by Filter Nodes.
/// </summary>
internal static class FilterNodesExamineIndexes
{
    internal static string InternalIndexName { get; } =
        global::Umbraco.Cms.Core.Constants.UmbracoIndexes.InternalIndexName;

    internal static string ExternalIndexName { get; } =
        global::Umbraco.Cms.Core.Constants.UmbracoIndexes.ExternalIndexName;

    /// <summary>
    /// Indexes queried for content filtering, in priority order.
    /// </summary>
    internal static IReadOnlyList<string> ContentSearchIndexNames { get; } =
    [
        InternalIndexName,
        ExternalIndexName,
    ];
}

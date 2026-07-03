namespace Phases.Umbraco.FilterNodes.Caching;

/// <summary>
/// Default cache expiration policies for Filter Nodes metadata.
/// </summary>
public static class FilterNodesCachePolicy
{
    /// <summary>
    /// Absolute expiration for cached document type alias lists.
    /// Invalidation notifications should clear entries sooner when schema changes.
    /// </summary>
    public static readonly TimeSpan ContentTypeAliasesExpiration = TimeSpan.FromHours(6);

    /// <summary>
    /// Absolute expiration for cached property alias lists.
    /// </summary>
    public static readonly TimeSpan PropertyAliasesExpiration = TimeSpan.FromHours(6);
}

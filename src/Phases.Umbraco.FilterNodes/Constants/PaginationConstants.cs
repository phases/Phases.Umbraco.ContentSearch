namespace Phases.Umbraco.FilterNodes.Constants;

/// <summary>
/// Pagination limits for content queries.
/// </summary>
public static class PaginationConstants
{
    /// <summary>
    /// The default number of items returned per page.
    /// </summary>
    public const int DefaultPageSize = 20;

    /// <summary>
    /// The maximum allowed page size to protect server memory and response times.
    /// </summary>
    public const int MaxPageSize = 100;

    /// <summary>
    /// The maximum number of content keys resolved in a single batch hydration call.
    /// </summary>
    public const int MaxKeyBatchSize = 100;
}

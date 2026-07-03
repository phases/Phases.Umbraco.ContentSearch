using Phases.Umbraco.ContentSearch.Models;
using Phases.Umbraco.ContentSearch.Models.Enums;
using Phases.Umbraco.ContentSearch.Search.Enums;

namespace Phases.Umbraco.ContentSearch.Search.Models;

/// <summary>
/// A search request after normalization and field resolution.
/// </summary>
public sealed class NormalizedContentSearchRequest
{
    /// <summary>
    /// Gets or sets the search domain.
    /// </summary>
    public SearchDomain Domain { get; init; } = SearchDomain.Content;

    /// <summary>
    /// Gets or sets how conditions are combined.
    /// </summary>
    public SearchMatchMode MatchMode { get; init; } = SearchMatchMode.All;

    /// <summary>
    /// Gets or sets the culture context for variant properties.
    /// </summary>
    public SearchCultureContext CultureContext { get; init; } = SearchCultureContext.AllCultures;

    /// <summary>
    /// Gets or sets the normalized conditions.
    /// </summary>
    public IReadOnlyList<NormalizedSearchCondition> Conditions { get; init; } = [];

    /// <summary>
    /// Gets or sets the zero-based page index.
    /// </summary>
    public int PageIndex { get; init; }

    /// <summary>
    /// Gets or sets the page size.
    /// </summary>
    public int PageSize { get; init; } = 20;

    /// <summary>
    /// Gets or sets the sort options.
    /// </summary>
    public ContentSearchSortOptions Sort { get; init; } = new();
}

using Phases.Umbraco.ContentSearch.Models;
using Phases.Umbraco.ContentSearch.Search.Enums;
using Phases.Umbraco.ContentSearch.Search.Models;

namespace Phases.Umbraco.ContentSearch.Services;

/// <summary>
/// Context required to enrich search results with culture-aware display values.
/// </summary>
public sealed class ContentSearchEnrichmentContext
{
    /// <summary>
    /// Gets or sets the culture context applied to the search.
    /// </summary>
    public required SearchCultureContext CultureContext { get; init; }

    /// <summary>
    /// Gets or sets the normalized search conditions.
    /// </summary>
    public IReadOnlyList<NormalizedSearchCondition> Conditions { get; init; } = [];

    /// <summary>
    /// Gets or sets how conditions are combined.
    /// </summary>
    public SearchMatchMode MatchMode { get; init; } = SearchMatchMode.All;
}

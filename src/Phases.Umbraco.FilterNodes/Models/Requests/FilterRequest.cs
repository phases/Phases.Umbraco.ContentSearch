using Phases.Umbraco.FilterNodes.Models.Enums;

namespace Phases.Umbraco.FilterNodes.Models.Requests;

/// <summary>
/// Request model for filtering and searching content nodes.
/// </summary>
public sealed record FilterRequest
{
    /// <summary>
    /// Gets the pagination settings for the request.
    /// </summary>
    public PagedRequest Paging { get; init; } = new();

    /// <summary>
    /// Gets how the filter conditions are combined.
    /// </summary>
    public FilterType FilterType { get; init; } = FilterType.All;

    /// <summary>
    /// Gets the filter conditions to apply.
    /// </summary>
    public IReadOnlyList<FilterCondition> Conditions { get; init; } = [];

    /// <summary>
    /// Gets optional sort settings for the result set.
    /// </summary>
    public SortOptions? Sort { get; init; }

    /// <summary>
    /// Gets how culture-variant properties should be searched in Examine.
    /// </summary>
    public SearchCultureMode SearchCultureMode { get; init; } = SearchCultureMode.AllCultures;

    /// <summary>
    /// Gets the culture ISO code when <see cref="SearchCultureMode"/> is
    /// <see cref="SearchCultureMode.CurrentCulture"/> or
    /// <see cref="SearchCultureMode.SpecificCulture"/>.
    /// </summary>
    public string? Culture { get; init; }
}

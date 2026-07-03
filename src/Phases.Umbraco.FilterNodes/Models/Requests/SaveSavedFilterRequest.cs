using Phases.Umbraco.FilterNodes.Models.Enums;

namespace Phases.Umbraco.FilterNodes.Models.Requests;

/// <summary>
/// Request model for saving a filter configuration.
/// </summary>
public sealed record SaveSavedFilterRequest
{
    /// <summary>
    /// Gets the display name for the saved filter.
    /// </summary>
    public string Name { get; init; } = string.Empty;

    /// <summary>
    /// Gets how the filter conditions are combined.
    /// </summary>
    public FilterType FilterType { get; init; } = FilterType.All;

    /// <summary>
    /// Gets the saved filter conditions.
    /// </summary>
    public IReadOnlyList<SavedFilterCondition> Conditions { get; init; } = [];

    /// <summary>
    /// Gets the preferred page size for searches using this filter.
    /// </summary>
    public int PageSize { get; init; }

    /// <summary>
    /// Gets how culture-variant properties should be searched.
    /// </summary>
    public SearchCultureMode SearchCultureMode { get; init; } = SearchCultureMode.AllCultures;

    /// <summary>
    /// Gets the culture ISO code when <see cref="SearchCultureMode"/> is
    /// <see cref="SearchCultureMode.SpecificCulture"/>.
    /// </summary>
    public string? Culture { get; init; }
}

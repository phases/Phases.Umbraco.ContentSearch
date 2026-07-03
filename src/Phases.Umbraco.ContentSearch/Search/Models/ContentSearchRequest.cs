using System.Text.Json.Serialization;
using Phases.Umbraco.ContentSearch.Models;
using Phases.Umbraco.ContentSearch.Models.Enums;
using Phases.Umbraco.ContentSearch.Search.Enums;

namespace Phases.Umbraco.ContentSearch.Search.Models;

/// <summary>
/// A search request executed exclusively through the Examine query pipeline.
/// </summary>
public sealed class ContentSearchRequest
{
    /// <summary>
    /// Gets or sets the search domain.
    /// </summary>
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public SearchDomain Domain { get; init; } = SearchDomain.Content;

    /// <summary>
    /// Gets or sets how conditions are combined.
    /// </summary>
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public SearchMatchMode MatchMode { get; init; } = SearchMatchMode.All;

    /// <summary>
    /// Gets or sets how culture-variant properties should be searched in Examine.
    /// </summary>
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public SearchCultureMode SearchCultureMode { get; init; } = SearchCultureMode.AllCultures;

    /// <summary>
    /// Gets or sets the culture ISO code for localized field queries.
    /// </summary>
    public string? Culture { get; init; }

    /// <summary>
    /// Gets or sets the search conditions.
    /// </summary>
    public IReadOnlyList<SearchConditionRequest> Conditions { get; init; } = [];

    /// <summary>
    /// Gets or sets the zero-based page index.
    /// </summary>
    public int PageIndex { get; init; }

    /// <summary>
    /// Gets or sets the page size.
    /// </summary>
    public int PageSize { get; init; } = 20;

    /// <summary>
    /// Gets or sets the sort column identifier from the results grid.
    /// </summary>
    public string? SortColumn { get; init; }

    /// <summary>
    /// Gets or sets a value indicating whether results are sorted descending.
    /// </summary>
    public bool SortDescending { get; init; }
}

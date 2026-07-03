using Phases.Umbraco.ContentSearch.Models.Enums;
using Phases.Umbraco.ContentSearch.Search.Enums;
using Phases.Umbraco.ContentSearch.Search.Models;

namespace Phases.Umbraco.ContentSearch.SavedSearches.Models.Requests;

/// <summary>
/// Request model for saving a search configuration.
/// </summary>
public sealed record SaveSavedSearchRequest
{
    /// <summary>
    /// Gets the display name.
    /// </summary>
    public string Name { get; init; } = string.Empty;

    /// <summary>
    /// Gets the optional description.
    /// </summary>
    public string? Description { get; init; }

    /// <summary>
    /// Gets a value indicating whether the search is shared with all users.
    /// </summary>
    public bool IsShared { get; init; }

    /// <summary>
    /// Gets how conditions are combined.
    /// </summary>
    public SearchMatchMode MatchMode { get; init; } = SearchMatchMode.All;

    /// <summary>
    /// Gets how culture-variant properties should be searched.
    /// </summary>
    public SearchCultureMode SearchCultureMode { get; init; } = SearchCultureMode.AllCultures;

    /// <summary>
    /// Gets the culture ISO code for localized searches.
    /// </summary>
    public string? Culture { get; init; }

    /// <summary>
    /// Gets the search conditions.
    /// </summary>
    public IReadOnlyList<SearchConditionRequest> Conditions { get; init; } = [];

    /// <summary>
    /// Gets the preferred page size.
    /// </summary>
    public int PageSize { get; init; } = 20;

    /// <summary>
    /// Gets the preferred sort column.
    /// </summary>
    public string? SortColumn { get; init; }

    /// <summary>
    /// Gets a value indicating whether results are sorted descending.
    /// </summary>
    public bool SortDescending { get; init; }
}

/// <summary>
/// Request model for renaming or updating a saved search.
/// </summary>
public sealed record UpdateSavedSearchRequest
{
    /// <summary>
    /// Gets the updated display name.
    /// </summary>
    public string Name { get; init; } = string.Empty;

    /// <summary>
    /// Gets the updated description.
    /// </summary>
    public string? Description { get; init; }
}

/// <summary>
/// Request model for recording a recent ad-hoc search execution.
/// </summary>
public sealed record RecordRecentSearchRequest
{
    /// <summary>
    /// Gets the display name for the recent search entry.
    /// </summary>
    public string Name { get; init; } = string.Empty;

    /// <summary>
    /// Gets the optional description.
    /// </summary>
    public string? Description { get; init; }

    /// <summary>
    /// Gets the linked saved search identifier, if any.
    /// </summary>
    public Guid? SavedSearchId { get; init; }

    /// <summary>
    /// Gets how conditions are combined.
    /// </summary>
    public SearchMatchMode MatchMode { get; init; } = SearchMatchMode.All;

    /// <summary>
    /// Gets how culture-variant properties should be searched.
    /// </summary>
    public SearchCultureMode SearchCultureMode { get; init; } = SearchCultureMode.AllCultures;

    /// <summary>
    /// Gets the culture ISO code for localized searches.
    /// </summary>
    public string? Culture { get; init; }

    /// <summary>
    /// Gets the search conditions.
    /// </summary>
    public IReadOnlyList<SearchConditionRequest> Conditions { get; init; } = [];

    /// <summary>
    /// Gets the preferred page size.
    /// </summary>
    public int PageSize { get; init; } = 20;

    /// <summary>
    /// Gets the preferred sort column.
    /// </summary>
    public string? SortColumn { get; init; }

    /// <summary>
    /// Gets a value indicating whether results are sorted descending.
    /// </summary>
    public bool SortDescending { get; init; }
}

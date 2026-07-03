using Phases.Umbraco.ContentSearch.Models.Enums;
using Phases.Umbraco.ContentSearch.SavedSearches.Enums;
using Phases.Umbraco.ContentSearch.Search.Enums;
using Phases.Umbraco.ContentSearch.Search.Models;

namespace Phases.Umbraco.ContentSearch.SavedSearches.Models.Responses;

/// <summary>
/// Summary information for a saved or recent search.
/// </summary>
public record SavedSearchSummaryResponse
{
    /// <summary>
    /// Gets the saved search identifier.
    /// </summary>
    public Guid Id { get; init; }

    /// <summary>
    /// Gets the display name.
    /// </summary>
    public string Name { get; init; } = string.Empty;

    /// <summary>
    /// Gets the optional description.
    /// </summary>
    public string? Description { get; init; }

    /// <summary>
    /// Gets where the search is stored.
    /// </summary>
    public SavedSearchScope Scope { get; init; }

    /// <summary>
    /// Gets when the search was last used by the current user.
    /// </summary>
    public DateTimeOffset? LastUsed { get; init; }

    /// <summary>
    /// Gets when the search was created.
    /// </summary>
    public DateTimeOffset Created { get; init; }

    /// <summary>
    /// Gets who created the search.
    /// </summary>
    public string CreatedBy { get; init; } = string.Empty;

    /// <summary>
    /// Gets how many times the search has been executed.
    /// </summary>
    public int UsageCount { get; init; }

    /// <summary>
    /// Gets a value indicating whether the search is pinned by the current user.
    /// </summary>
    public bool IsPinned { get; init; }

    /// <summary>
    /// Gets a value indicating whether the search is favourited by the current user.
    /// </summary>
    public bool IsFavourite { get; init; }

    /// <summary>
    /// Gets a value indicating whether the current user owns the search.
    /// </summary>
    public bool IsOwnedByCurrentUser { get; init; }
}

/// <summary>
/// Full saved search details for loading into the workspace.
/// </summary>
public sealed record SavedSearchDetailResponse : SavedSearchSummaryResponse
{
    /// <summary>
    /// Gets the linked saved search identifier for recent search snapshots.
    /// </summary>
    public Guid? LinkedSavedSearchId { get; init; }

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
/// Categorized saved search collections for the current user.
/// </summary>
public sealed record SavedSearchListResponse
{
    /// <summary>
    /// Gets all saved and recent searches.
    /// </summary>
    public IReadOnlyList<SavedSearchSummaryResponse> Items { get; init; } = [];

    /// <summary>
    /// Gets recent searches.
    /// </summary>
    public IReadOnlyList<SavedSearchSummaryResponse> Recent { get; init; } = [];

    /// <summary>
    /// Gets pinned searches.
    /// </summary>
    public IReadOnlyList<SavedSearchSummaryResponse> Pinned { get; init; } = [];

    /// <summary>
    /// Gets personal searches.
    /// </summary>
    public IReadOnlyList<SavedSearchSummaryResponse> Personal { get; init; } = [];

    /// <summary>
    /// Gets shared searches.
    /// </summary>
    public IReadOnlyList<SavedSearchSummaryResponse> Shared { get; init; } = [];
}

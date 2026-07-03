using System.Text.Json.Serialization;
using Phases.Umbraco.ContentSearch.Models.Enums;
using Phases.Umbraco.ContentSearch.Search.Enums;
using Phases.Umbraco.ContentSearch.Search.Models;

namespace Phases.Umbraco.ContentSearch.Presets.Models;

/// <summary>
/// A built-in quick search preset.
/// </summary>
public sealed record ContentSearchPresetResponse
{
    /// <summary>
    /// Gets the preset identifier.
    /// </summary>
    public string Id { get; init; } = string.Empty;

    /// <summary>
    /// Gets the display name.
    /// </summary>
    public string Name { get; init; } = string.Empty;

    /// <summary>
    /// Gets the description.
    /// </summary>
    public string Description { get; init; } = string.Empty;

    /// <summary>
    /// Gets how conditions are combined.
    /// </summary>
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public SearchMatchMode MatchMode { get; init; } = SearchMatchMode.All;

    /// <summary>
    /// Gets how culture-variant properties should be searched.
    /// </summary>
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public SearchCultureMode SearchCultureMode { get; init; } = SearchCultureMode.AllCultures;

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
/// Built-in quick search presets.
/// </summary>
public sealed record ContentSearchPresetListResponse
{
    /// <summary>
    /// Gets the presets.
    /// </summary>
    public IReadOnlyList<ContentSearchPresetResponse> Presets { get; init; } = [];
}

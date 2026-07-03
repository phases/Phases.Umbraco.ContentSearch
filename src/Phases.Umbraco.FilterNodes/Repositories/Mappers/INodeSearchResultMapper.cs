using Examine;
using Phases.Umbraco.FilterNodes.Models.Examine;
using Phases.Umbraco.FilterNodes.Models.Responses;
using Phases.Umbraco.FilterNodes.Services.Interfaces;
using Umbraco.Cms.Core.Models;

namespace Phases.Umbraco.FilterNodes.Repositories.Mappers;

/// <summary>
/// Options applied when mapping content to search result DTOs.
/// </summary>
public sealed record NodeSearchResultMappingOptions
{
    /// <summary>
    /// Gets the default mapping options.
    /// </summary>
    public static NodeSearchResultMappingOptions Default { get; } = new();

    /// <summary>
    /// Gets the culture context applied to the search.
    /// </summary>
    public SearchCultureContext SearchCultureContext { get; init; } = SearchCultureContext.AllCultures;

    /// <summary>
    /// Gets the display name of the matched culture, when a single culture was searched.
    /// </summary>
    public string? MatchedCultureDisplayName { get; init; }
}

/// <summary>
/// Maps Umbraco content entities to <see cref="NodeSearchResult"/> DTOs.
/// </summary>
public interface INodeSearchResultMapper
{
    /// <summary>
    /// Maps a content entity to a search result DTO.
    /// </summary>
    /// <param name="content">The content entity.</param>
    /// <param name="searchResult">An optional Examine search result for supplemental index values.</param>
    /// <param name="options">Optional mapping options.</param>
    /// <returns>The mapped search result.</returns>
    NodeSearchResult Map(
        IContent content,
        ISearchResult? searchResult = null,
        NodeSearchResultMappingOptions? options = null);
}

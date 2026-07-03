using Phases.Umbraco.ContentSearch.Search.Models;
using Umbraco.Cms.Core.Models.Membership;

namespace Phases.Umbraco.ContentSearch.Services;

/// <summary>
/// Applies backoffice user content access rules to search results.
/// </summary>
public interface IContentSearchUserAccessService
{
    /// <summary>
    /// Gets the current backoffice user or throws when unavailable.
    /// </summary>
    IUser GetRequiredCurrentUser();

    /// <summary>
    /// Returns whether the user can browse all content without start-node restrictions.
    /// </summary>
    /// <param name="user">The backoffice user.</param>
    /// <returns><c>true</c> when no start-node filtering is required.</returns>
    bool HasUnrestrictedContentAccess(IUser user);

    /// <summary>
    /// Removes result items the user cannot browse in the backoffice.
    /// </summary>
    /// <param name="user">The backoffice user.</param>
    /// <param name="items">The mapped search result items.</param>
    /// <returns>Items the user is allowed to see.</returns>
    IReadOnlyList<ContentSearchResultItem> FilterAccessibleResults(
        IUser user,
        IReadOnlyList<ContentSearchResultItem> items);
}

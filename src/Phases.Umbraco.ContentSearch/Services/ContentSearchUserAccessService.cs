using Phases.Umbraco.ContentSearch.Search.Models;
using Umbraco.Cms.Core.Cache;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Models.Membership;
using Umbraco.Cms.Core.Security;
using Umbraco.Cms.Core.Services;

namespace Phases.Umbraco.ContentSearch.Services;

/// <summary>
/// Default implementation of <see cref="IContentSearchUserAccessService"/>.
/// </summary>
public sealed class ContentSearchUserAccessService : IContentSearchUserAccessService
{
    private readonly IBackOfficeSecurityAccessor _backOfficeSecurityAccessor;
    private readonly IEntityService _entityService;
    private readonly IContentService _contentService;
    private readonly AppCaches _appCaches;

    /// <summary>
    /// Initializes a new instance of the <see cref="ContentSearchUserAccessService"/> class.
    /// </summary>
    public ContentSearchUserAccessService(
        IBackOfficeSecurityAccessor backOfficeSecurityAccessor,
        IEntityService entityService,
        IContentService contentService,
        AppCaches appCaches)
    {
        _backOfficeSecurityAccessor = backOfficeSecurityAccessor;
        _entityService = entityService;
        _contentService = contentService;
        _appCaches = appCaches;
    }

    /// <inheritdoc />
    public IUser GetRequiredCurrentUser()
    {
        IUser? currentUser = _backOfficeSecurityAccessor.BackOfficeSecurity?.CurrentUser;

        if (currentUser is null)
        {
            throw new UnauthorizedAccessException("No backoffice user found.");
        }

        return currentUser;
    }

    /// <inheritdoc />
    public bool HasUnrestrictedContentAccess(IUser user)
    {
        ArgumentNullException.ThrowIfNull(user);

        return user.CalculateContentStartNodeIds(_entityService, _appCaches) is null;
    }

    /// <inheritdoc />
    public IReadOnlyList<ContentSearchResultItem> FilterAccessibleResults(
        IUser user,
        IReadOnlyList<ContentSearchResultItem> items)
    {
        ArgumentNullException.ThrowIfNull(user);
        ArgumentNullException.ThrowIfNull(items);

        if (items.Count == 0)
        {
            return items;
        }

        // null means the user has no start-node restrictions (e.g. administrators).
        if (user.CalculateContentStartNodeIds(_entityService, _appCaches) is null)
        {
            return items;
        }

        var contentById = _contentService
            .GetByIds(items.Select(static item => item.Id))
            .ToDictionary(static content => content.Id);

        return items
            .Where(item => contentById.TryGetValue(item.Id, out var content)
                && user.HasPathAccess(content, _entityService, _appCaches))
            .ToArray();
    }
}

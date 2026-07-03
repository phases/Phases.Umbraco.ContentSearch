using Microsoft.Extensions.Options;
using Phases.Umbraco.ContentSearch.Configuration;
using Phases.Umbraco.ContentSearch.Constants;
using Umbraco.Cms.Core.Events;
using Umbraco.Cms.Core.Notifications;
using Umbraco.Cms.Core.Services;
using UmbracoConstants = Umbraco.Cms.Core.Constants;

namespace Phases.Umbraco.ContentSearch.Extensions;

/// <summary>
/// Grants the Content Search section to the administrator user group on application start.
/// </summary>
internal sealed class ContentSearchSectionPermissionNotificationHandler
    : INotificationAsyncHandler<UmbracoApplicationStartedNotification>
{
    private readonly IUserGroupService _userGroupService;
    private readonly ContentSearchOptions _options;

    /// <summary>
    /// Initializes a new instance of the <see cref="ContentSearchSectionPermissionNotificationHandler"/> class.
    /// </summary>
    /// <param name="userGroupService">The Umbraco user group service.</param>
    /// <param name="options">The package options.</param>
    public ContentSearchSectionPermissionNotificationHandler(
        IUserGroupService userGroupService,
        IOptions<ContentSearchOptions> options)
    {
        _userGroupService = userGroupService;
        _options = options.Value;
    }

    /// <inheritdoc />
    public async Task HandleAsync(
        UmbracoApplicationStartedNotification notification,
        CancellationToken cancellationToken)
    {
        if (!_options.GrantSectionToAdminGroupOnInstall)
        {
            return;
        }

        cancellationToken.ThrowIfCancellationRequested();

        var adminGroup = await _userGroupService
            .GetAsync(UmbracoConstants.Security.AdminGroupAlias)
            .ConfigureAwait(false);

        if (adminGroup is null)
        {
            return;
        }

        if (adminGroup.AllowedSections.Contains(
                ContentSearchSectionConstants.SectionAlias,
                StringComparer.OrdinalIgnoreCase))
        {
            return;
        }

        adminGroup.AddAllowedSection(ContentSearchSectionConstants.SectionAlias);
        await _userGroupService
            .UpdateAsync(adminGroup, UmbracoConstants.Security.SuperUserKey)
            .ConfigureAwait(false);
    }
}

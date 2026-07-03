using Microsoft.AspNetCore.Authorization;
using Phases.Umbraco.ContentSearch.Constants;
using Umbraco.Cms.Core.Models.Membership;
using Umbraco.Cms.Core.Security;

namespace Phases.Umbraco.ContentSearch.Authorization;

/// <summary>
/// Ensures the current backoffice user has access to the Content Search section.
/// </summary>
public sealed class ContentSearchSectionAccessAuthorizationHandler
    : AuthorizationHandler<ContentSearchSectionAccessRequirement>
{
    private readonly IBackOfficeSecurityAccessor _backOfficeSecurityAccessor;

    /// <summary>
    /// Initializes a new instance of the <see cref="ContentSearchSectionAccessAuthorizationHandler"/> class.
    /// </summary>
    public ContentSearchSectionAccessAuthorizationHandler(IBackOfficeSecurityAccessor backOfficeSecurityAccessor)
    {
        _backOfficeSecurityAccessor = backOfficeSecurityAccessor;
    }

    /// <inheritdoc />
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        ContentSearchSectionAccessRequirement requirement)
    {
        IBackOfficeSecurity? backOfficeSecurity = _backOfficeSecurityAccessor.BackOfficeSecurity;

        if (backOfficeSecurity is null || !backOfficeSecurity.IsAuthenticated())
        {
            return Task.CompletedTask;
        }

        IUser? currentUser = backOfficeSecurity.CurrentUser;

        if (currentUser is not null
            && backOfficeSecurity.UserHasSectionAccess(
                ContentSearchSectionConstants.SectionAlias,
                currentUser))
        {
            context.Succeed(requirement);
        }

        return Task.CompletedTask;
    }
}

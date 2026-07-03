using Microsoft.AspNetCore.Authorization;

namespace Phases.Umbraco.ContentSearch.Authorization;

/// <summary>
/// Authorization requirement for access to the Content Search backoffice section.
/// </summary>
public sealed class ContentSearchSectionAccessRequirement : IAuthorizationRequirement
{
}

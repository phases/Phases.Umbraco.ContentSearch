using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Phases.Umbraco.FilterNodes.Constants;
using Umbraco.Cms.Api.Common.Attributes;
using Umbraco.Cms.Api.Common.Filters;
using Umbraco.Cms.Web.Common.Authorization;
using Umbraco.Cms.Web.Common.Routing;

namespace Phases.Umbraco.FilterNodes.Api;

/// <summary>
/// Base controller for Phases Umbraco Filter Nodes backoffice API endpoints.
/// </summary>
[ApiController]
[BackOfficeRoute(FilterNodesApiConstants.ApiRoutePrefix)]
[Authorize(Policy = AuthorizationPolicies.SectionAccessContent)]
[MapToApi(FilterNodesApiConstants.ApiName)]
[JsonOptionsName(global::Umbraco.Cms.Core.Constants.JsonOptionsNames.BackOffice)]
public abstract class PhasesUmbracoFilterNodesApiControllerBase : ControllerBase
{
}

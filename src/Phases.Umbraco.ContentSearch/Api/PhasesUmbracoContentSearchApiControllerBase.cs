using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Phases.Umbraco.ContentSearch.Authorization;
using Phases.Umbraco.ContentSearch.Constants;
using Umbraco.Cms.Api.Common.Attributes;
using Umbraco.Cms.Api.Common.Filters;
using Umbraco.Cms.Web.Common.Routing;

namespace Phases.Umbraco.ContentSearch.Api;

/// <summary>
/// Base controller for Phases Umbraco Content Search backoffice API endpoints.
/// </summary>
[ApiController]
[BackOfficeRoute(ContentSearchApiConstants.ApiRoutePrefix)]
[Authorize(Policy = ContentSearchAuthorizationPolicies.SectionAccessContentSearch)]
[MapToApi(ContentSearchApiConstants.ApiName)]
[JsonOptionsName(global::Umbraco.Cms.Core.Constants.JsonOptionsNames.BackOffice)]
public abstract class PhasesUmbracoContentSearchApiControllerBase : ControllerBase
{
}

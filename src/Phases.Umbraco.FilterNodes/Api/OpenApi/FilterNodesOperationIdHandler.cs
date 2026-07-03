using Asp.Versioning;
using Microsoft.AspNetCore.Mvc.ApiExplorer;
using Microsoft.AspNetCore.Mvc.Controllers;
using Microsoft.Extensions.Options;
using Phases.Umbraco.FilterNodes.Constants;
using Umbraco.Cms.Api.Common.OpenApi;

namespace Phases.Umbraco.FilterNodes.Api.OpenApi;

/// <summary>
/// Generates concise operation IDs for Filter Nodes API endpoints in the OpenAPI document.
/// </summary>
public sealed class FilterNodesOperationIdHandler : OperationIdHandler
{
    /// <summary>
    /// Initializes a new instance of the <see cref="FilterNodesOperationIdHandler"/> class.
    /// </summary>
    /// <param name="apiVersioningOptions">The API versioning options.</param>
    public FilterNodesOperationIdHandler(IOptions<ApiVersioningOptions> apiVersioningOptions)
        : base(apiVersioningOptions)
    {
    }

    /// <inheritdoc />
    protected override bool CanHandle(ApiDescription apiDescription, ControllerActionDescriptor controllerActionDescriptor)
    {
        return controllerActionDescriptor.ControllerTypeInfo.Namespace?
            .StartsWith(FilterNodesApiConstants.ApiControllersNamespace, StringComparison.InvariantCultureIgnoreCase) is true;
    }

    /// <inheritdoc />
    public override string Handle(ApiDescription apiDescription)
        => $"{apiDescription.ActionDescriptor.RouteValues["action"]}";
}

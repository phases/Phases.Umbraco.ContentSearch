using Asp.Versioning;
using Microsoft.AspNetCore.Mvc.ApiExplorer;
using Microsoft.AspNetCore.Mvc.Controllers;
using Microsoft.Extensions.Options;
using Phases.Umbraco.ContentSearch.Constants;
using Umbraco.Cms.Api.Common.OpenApi;

namespace Phases.Umbraco.ContentSearch.Api.OpenApi;

/// <summary>
/// Generates concise operation IDs for Content Search API endpoints in the OpenAPI document.
/// </summary>
public sealed class ContentSearchOperationIdHandler : OperationIdHandler
{
    /// <summary>
    /// Initializes a new instance of the <see cref="ContentSearchOperationIdHandler"/> class.
    /// </summary>
    /// <param name="apiVersioningOptions">The API versioning options.</param>
    public ContentSearchOperationIdHandler(IOptions<ApiVersioningOptions> apiVersioningOptions)
        : base(apiVersioningOptions)
    {
    }

    /// <inheritdoc />
    protected override bool CanHandle(ApiDescription apiDescription, ControllerActionDescriptor controllerActionDescriptor)
    {
        return controllerActionDescriptor.ControllerTypeInfo.Namespace?
            .StartsWith(ContentSearchApiConstants.ApiControllersNamespace, StringComparison.InvariantCultureIgnoreCase) is true;
    }

    /// <inheritdoc />
    public override string Handle(ApiDescription apiDescription)
        => $"{apiDescription.ActionDescriptor.RouteValues["action"]}";
}

using Phases.Umbraco.FilterNodes.Constants;
using Umbraco.Cms.Api.Management.OpenApi;

namespace Phases.Umbraco.FilterNodes.Api.OpenApi;

/// <summary>
/// Applies Umbraco backoffice security requirements to Filter Nodes API operations in Swagger.
/// </summary>
public sealed class FilterNodesOperationSecurityFilter : BackOfficeSecurityRequirementsOperationFilterBase
{
    /// <inheritdoc />
    protected override string ApiName => FilterNodesApiConstants.ApiName;
}

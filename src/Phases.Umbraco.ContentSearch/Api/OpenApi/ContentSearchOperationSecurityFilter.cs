using Phases.Umbraco.ContentSearch.Constants;
using Umbraco.Cms.Api.Management.OpenApi;

namespace Phases.Umbraco.ContentSearch.Api.OpenApi;

/// <summary>
/// Applies Umbraco backoffice security requirements to Content Search API operations in Swagger.
/// </summary>
public sealed class ContentSearchOperationSecurityFilter : BackOfficeSecurityRequirementsOperationFilterBase
{
    /// <inheritdoc />
    protected override string ApiName => ContentSearchApiConstants.ApiName;
}

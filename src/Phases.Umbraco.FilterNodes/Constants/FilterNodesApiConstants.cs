namespace Phases.Umbraco.FilterNodes.Constants;

/// <summary>
/// Shared constants for the Phases Umbraco Filter Nodes package.
/// </summary>
public static class FilterNodesApiConstants
{
    /// <summary>
    /// The OpenAPI document and API mapping name used by Umbraco backoffice endpoints.
    /// </summary>
    public const string ApiName = "phasesumbracofilternodes";

    /// <summary>
    /// The Swagger API explorer group name displayed in the backoffice.
    /// </summary>
    public const string ApiExplorerGroupName = "Phases.Umbraco.FilterNodes";

    /// <summary>
    /// The backoffice API route segment for this package.
    /// </summary>
    public const string ApiRoutePrefix = "phasesumbracofilternodes/api/v{version:apiVersion}";

    /// <summary>
    /// The root namespace for API controllers in this package.
    /// </summary>
    public const string ApiControllersNamespace = "Phases.Umbraco.FilterNodes.Api";
}

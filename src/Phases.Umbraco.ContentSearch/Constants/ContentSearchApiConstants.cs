namespace Phases.Umbraco.ContentSearch.Constants;

/// <summary>
/// Shared constants for the Phases Umbraco Content Search package.
/// </summary>
public static class ContentSearchApiConstants
{
    /// <summary>
    /// The OpenAPI document and API mapping name used by Umbraco backoffice endpoints.
    /// </summary>
    public const string ApiName = "phasesumbracocontentsearch";

    /// <summary>
    /// The Swagger API explorer group name displayed in the backoffice.
    /// </summary>
    public const string ApiExplorerGroupName = "Phases.Umbraco.ContentSearch";

    /// <summary>
    /// The backoffice API route segment for this package.
    /// </summary>
    public const string ApiRoutePrefix = "phasesumbracocontentsearch/api/v{version:apiVersion}";

    /// <summary>
    /// The root namespace for API controllers in this package.
    /// </summary>
    public const string ApiControllersNamespace = "Phases.Umbraco.ContentSearch.Api";
}

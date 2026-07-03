namespace Phases.Umbraco.FilterNodes.Models.Responses;

/// <summary>
/// Diagnostics describing how block editor metadata was discovered for a container property.
/// </summary>
public sealed record BlockDiscoveryDiagnostics
{
    /// <summary>
    /// Gets a value indicating whether block editor configuration was loaded.
    /// </summary>
    public bool ConfigurationLoaded { get; init; }

    /// <summary>
    /// Gets the number of configured block types in the data type.
    /// </summary>
    public int AllowedBlocksCount { get; init; }

    /// <summary>
    /// Gets the number of element types resolved from the configuration.
    /// </summary>
    public int ResolvedElementTypesCount { get; init; }

    /// <summary>
    /// Gets the number of element properties discovered from resolved element types.
    /// </summary>
    public int ResolvedPropertiesCount { get; init; }
}

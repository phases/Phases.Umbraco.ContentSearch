namespace Phases.Umbraco.ContentSearch.Metadata.Discovery;

/// <summary>
/// The result of reading block editor data type configuration.
/// </summary>
/// <param name="ElementTypeKeys">Distinct element type keys referenced by the configuration.</param>
/// <param name="ConfigurationLoaded">Whether block editor configuration was found and parsed.</param>
/// <param name="AllowedBlocksCount">The number of configured top-level block types.</param>
internal sealed record BlockEditorConfigurationReadResult(
    IReadOnlyList<Guid> ElementTypeKeys,
    bool ConfigurationLoaded,
    int AllowedBlocksCount)
{
    /// <summary>
    /// An empty read result.
    /// </summary>
    public static BlockEditorConfigurationReadResult Empty { get; } = new([], false, 0);
}

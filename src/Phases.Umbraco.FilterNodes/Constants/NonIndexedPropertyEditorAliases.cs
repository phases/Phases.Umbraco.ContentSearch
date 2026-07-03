namespace Phases.Umbraco.FilterNodes.Constants;

/// <summary>
/// Property editors that use Umbraco's <c>NoopPropertyIndexValueFactory</c> and therefore
/// do not appear in the Examine index unless augmented during indexing.
/// </summary>
internal static class NonIndexedPropertyEditorAliases
{
    /// <summary>
    /// Editor aliases whose populated values are written into the Internal index by Filter Nodes.
    /// </summary>
    internal static readonly HashSet<string> All = new(StringComparer.OrdinalIgnoreCase)
    {
        global::Umbraco.Cms.Core.Constants.PropertyEditors.Aliases.MediaPicker3,
        "Umbraco.MediaPicker",
        global::Umbraco.Cms.Core.Constants.PropertyEditors.Aliases.MultiUrlPicker,
        global::Umbraco.Cms.Core.Constants.PropertyEditors.Aliases.BlockList,
        global::Umbraco.Cms.Core.Constants.PropertyEditors.Aliases.BlockGrid,
    };
}

namespace Phases.Umbraco.FilterNodes.Constants;

/// <summary>
/// Property editors whose selected values are expanded into separate Examine index terms.
/// </summary>
internal static class MultiSelectPropertyEditorAliases
{
    internal static readonly HashSet<string> All = new(StringComparer.OrdinalIgnoreCase)
    {
        global::Umbraco.Cms.Core.Constants.PropertyEditors.Aliases.CheckBoxList,
        "Umbraco.DropDown.Flexible",
    };
}

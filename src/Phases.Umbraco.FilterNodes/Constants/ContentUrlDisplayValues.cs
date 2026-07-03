namespace Phases.Umbraco.FilterNodes.Constants;

/// <summary>
/// Display values returned when a content node URL cannot be opened on the frontend.
/// </summary>
public static class ContentUrlDisplayValues
{
    /// <summary>
    /// Shown when the content node has no published version.
    /// </summary>
    public const string NotPublished = "(Not Published)";

    /// <summary>
    /// Shown when the published node exists but its URL cannot be resolved.
    /// </summary>
    public const string Unavailable = "(Unavailable)";
}

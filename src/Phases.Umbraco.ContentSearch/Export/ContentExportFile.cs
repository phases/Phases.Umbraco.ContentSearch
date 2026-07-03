namespace Phases.Umbraco.ContentSearch.Export;

/// <summary>
/// A generated export payload ready to be streamed to the client.
/// </summary>
public sealed class ContentExportFile
{
    /// <summary>
    /// Gets the suggested download file name including extension.
    /// </summary>
    public required string FileName { get; init; }

    /// <summary>
    /// Gets the MIME content type for the export.
    /// </summary>
    public required string ContentType { get; init; }

    /// <summary>
    /// Gets the binary content of the export.
    /// </summary>
    public required byte[] Content { get; init; }
}

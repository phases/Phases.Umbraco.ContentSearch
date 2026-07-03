namespace Phases.Umbraco.ContentSearch.Metadata.Exceptions;

/// <summary>
/// Thrown when a requested document type alias does not exist.
/// </summary>
public sealed class ContentTypeNotFoundException : Exception
{
    /// <summary>
    /// Initializes a new instance of the <see cref="ContentTypeNotFoundException"/> class.
    /// </summary>
    /// <param name="contentTypeAlias">The missing content type alias.</param>
    public ContentTypeNotFoundException(string contentTypeAlias)
        : base($"Content type '{contentTypeAlias}' was not found.")
    {
        ContentTypeAlias = contentTypeAlias;
    }

    /// <summary>
    /// Gets the missing content type alias.
    /// </summary>
    public string ContentTypeAlias { get; }
}

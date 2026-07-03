namespace Phases.Umbraco.FilterNodes.Exceptions;

/// <summary>
/// Represents a request for a document type that does not exist.
/// </summary>
public sealed class ContentTypeNotFoundException : Exception
{
    /// <summary>
    /// Initializes a new instance of the <see cref="ContentTypeNotFoundException"/> class.
    /// </summary>
    /// <param name="contentTypeAlias">The requested document type alias.</param>
    public ContentTypeNotFoundException(string contentTypeAlias)
        : base($"The document type '{contentTypeAlias}' was not found.")
    {
        ContentTypeAlias = contentTypeAlias;
    }

    /// <summary>
    /// Gets the requested document type alias.
    /// </summary>
    public string ContentTypeAlias { get; }
}

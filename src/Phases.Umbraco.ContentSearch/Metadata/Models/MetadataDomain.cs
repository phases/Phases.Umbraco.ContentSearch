namespace Phases.Umbraco.ContentSearch.Metadata.Models;

/// <summary>
/// Identifies which schema domain metadata discovery targets.
/// </summary>
public enum MetadataDomain
{
    /// <summary>
    /// Published content document types.
    /// </summary>
    Content = 0,

    /// <summary>
    /// Media types. Reserved for future support.
    /// </summary>
    Media = 1,

    /// <summary>
    /// Member types. Reserved for future support.
    /// </summary>
    Member = 2,

    /// <summary>
    /// Dictionary items. Reserved for future support.
    /// </summary>
    Dictionary = 3,
}

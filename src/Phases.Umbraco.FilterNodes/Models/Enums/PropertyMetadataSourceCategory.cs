using System.Text.Json.Serialization;

namespace Phases.Umbraco.FilterNodes.Models.Enums;

/// <summary>
/// Describes where a filterable property definition originates.
/// </summary>
[JsonConverter(typeof(JsonStringEnumConverter))]
public enum PropertyMetadataSourceCategory
{
    /// <summary>
    /// Built-in node fields such as name and dates.
    /// </summary>
    System,

    /// <summary>
    /// A property defined directly on the document type.
    /// </summary>
    ContentType,

    /// <summary>
    /// A property inherited from a composition (including nested compositions).
    /// </summary>
    Composition,

    /// <summary>
    /// A property on an element type available in a Block Grid editor.
    /// </summary>
    BlockGrid,

    /// <summary>
    /// A property on an element type available in a Block List editor.
    /// </summary>
    BlockList,
}

using System.Text.Json.Serialization;

namespace Phases.Umbraco.FilterNodes.Models.Enums;

/// <summary>
/// Describes the filter control type to render for a property.
/// </summary>
[JsonConverter(typeof(JsonStringEnumConverter))]
public enum PropertyFilterType
{
    /// <summary>
    /// Standard free-text input.
    /// </summary>
    Text,

    /// <summary>
    /// Numeric input.
    /// </summary>
    Number,

    /// <summary>
    /// Date picker input.
    /// </summary>
    Date,

    /// <summary>
    /// Single-select dropdown populated from predefined values.
    /// </summary>
    Dropdown,

    /// <summary>
    /// Multi-select control populated from predefined values.
    /// </summary>
    MultiSelect,
}

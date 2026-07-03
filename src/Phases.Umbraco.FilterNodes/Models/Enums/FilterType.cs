using System.Text.Json.Serialization;

namespace Phases.Umbraco.FilterNodes.Models.Enums;

/// <summary>
/// Specifies how multiple filter conditions are combined when searching content nodes.
/// </summary>
[JsonConverter(typeof(JsonStringEnumConverter))]
public enum FilterType
{
    /// <summary>
    /// All conditions must match.
    /// </summary>
    All = 0,

    /// <summary>
    /// Any condition may match.
    /// </summary>
    Any = 1,
}

using System.Text.Json.Serialization;

namespace Phases.Umbraco.FilterNodes.Models.Enums;

/// <summary>
/// Specifies the comparison operator applied to a filter condition.
/// </summary>
[JsonConverter(typeof(JsonStringEnumConverter))]
public enum FilterOperator
{
    /// <summary>
    /// The property value equals the specified value.
    /// </summary>
    Equals = 0,

    /// <summary>
    /// The property value does not equal the specified value.
    /// </summary>
    NotEquals = 1,

    /// <summary>
    /// The property value contains the specified value.
    /// </summary>
    Contains = 2,

    /// <summary>
    /// The property value starts with the specified value.
    /// </summary>
    StartsWith = 3,

    /// <summary>
    /// The property value ends with the specified value.
    /// </summary>
    EndsWith = 4,

    /// <summary>
    /// The property value is greater than the specified value.
    /// </summary>
    GreaterThan = 5,

    /// <summary>
    /// The property value is greater than or equal to the specified value.
    /// </summary>
    GreaterThanOrEqual = 6,

    /// <summary>
    /// The property value is less than the specified value.
    /// </summary>
    LessThan = 7,

    /// <summary>
    /// The property value is less than or equal to the specified value.
    /// </summary>
    LessThanOrEqual = 8,

    /// <summary>
    /// The property value falls between <see cref="Requests.FilterCondition.FromDate"/> and <see cref="Requests.FilterCondition.ToDate"/>.
    /// </summary>
    Between = 9,

    /// <summary>
    /// The property value is null or empty.
    /// </summary>
    IsEmpty = 10,

    /// <summary>
    /// The property value is not null and not empty.
    /// </summary>
    IsNotEmpty = 11,
}

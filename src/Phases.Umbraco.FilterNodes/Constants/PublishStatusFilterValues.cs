using Phases.Umbraco.FilterNodes.Models.Responses;

namespace Phases.Umbraco.FilterNodes.Constants;

/// <summary>
/// Publish status filter property values exposed in the query builder.
/// </summary>
public static class PublishStatusFilterValues
{
    /// <summary>
    /// The system property alias for publish status filters.
    /// </summary>
    public const string PropertyAlias = "publishStatus";

    /// <summary>
    /// Indexed true value for published content.
    /// </summary>
    public const string Published = "1";

    /// <summary>
    /// Indexed false value for unpublished content.
    /// </summary>
    public const string Unpublished = "0";

    private static readonly HashSet<string> KnownValues = new(StringComparer.OrdinalIgnoreCase)
    {
        Published,
        Unpublished,
        bool.TrueString,
        bool.FalseString,
    };

    /// <summary>
    /// Dropdown options for the publish status system property.
    /// </summary>
    public static IReadOnlyList<PropertyFilterOption> Options { get; } =
    [
        new PropertyFilterOption { Label = "Published", Value = Published },
        new PropertyFilterOption { Label = "Unpublished", Value = Unpublished },
    ];

    /// <summary>
    /// Determines whether the alias is the publish status system property.
    /// </summary>
    public static bool IsPublishStatusProperty(string? propertyAlias)
        => !string.IsNullOrWhiteSpace(propertyAlias)
           && propertyAlias.Trim().Equals(PropertyAlias, StringComparison.OrdinalIgnoreCase);

    /// <summary>
    /// Determines whether the value is a supported publish status filter value.
    /// </summary>
    public static bool IsKnownValue(string? value)
        => !string.IsNullOrWhiteSpace(value) && KnownValues.Contains(value.Trim());

    /// <summary>
    /// Determines whether the value targets published content.
    /// </summary>
    public static bool IsPublishedValue(string? value)
        => value?.Trim() is string normalized
           && (normalized.Equals(Published, StringComparison.OrdinalIgnoreCase)
               || normalized.Equals(bool.TrueString, StringComparison.OrdinalIgnoreCase));

    /// <summary>
    /// Determines whether the value targets unpublished content.
    /// </summary>
    public static bool IsUnpublishedValue(string? value)
        => value?.Trim() is string normalized
           && (normalized.Equals(Unpublished, StringComparison.OrdinalIgnoreCase)
               || normalized.Equals(bool.FalseString, StringComparison.OrdinalIgnoreCase));
}

using Phases.Umbraco.FilterNodes.Models.Responses;

namespace Phases.Umbraco.FilterNodes.Services.Normalization;

/// <summary>
/// Translates filter UI values into values expected by the Examine index.
/// </summary>
public static class FilterPropertyValueNormalizer
{
    /// <summary>
    /// Normalizes a property filter value for Examine querying.
    /// </summary>
    /// <param name="metadata">The property metadata, when available.</param>
    /// <param name="propertyValue">The submitted property value.</param>
    /// <returns>The normalized value for Examine.</returns>
    public static string? Normalize(
        FilterablePropertyMetadata? metadata,
        string? propertyValue)
    {
        if (string.IsNullOrWhiteSpace(propertyValue))
        {
            return propertyValue?.Trim();
        }

        if (metadata is null)
        {
            return propertyValue.Trim();
        }

        if (metadata.Options.Count > 0)
        {
            return NormalizeUsingOptions(metadata, propertyValue);
        }

        if (metadata.EditorAlias?.Equals("Umbraco.TrueFalse", StringComparison.OrdinalIgnoreCase) == true)
        {
            return NormalizeTrueFalseValue(propertyValue);
        }

        return propertyValue.Trim();
    }

    private static string NormalizeUsingOptions(
        FilterablePropertyMetadata metadata,
        string propertyValue)
    {
        var values = propertyValue
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Select(value => NormalizeSingleOptionValue(metadata, value))
            .Where(static value => !string.IsNullOrWhiteSpace(value))
            .ToArray();

        return values.Length switch
        {
            0 => string.Empty,
            1 => values[0],
            _ => string.Join(',', values),
        };
    }

    private static string NormalizeSingleOptionValue(
        FilterablePropertyMetadata metadata,
        string submittedValue)
    {
        var trimmedValue = submittedValue.Trim();

        var exactMatch = metadata.Options.FirstOrDefault(option =>
            option.Value.Equals(trimmedValue, StringComparison.OrdinalIgnoreCase)
            || option.Label.Equals(trimmedValue, StringComparison.OrdinalIgnoreCase));

        if (exactMatch is not null)
        {
            return exactMatch.Value;
        }

        if (metadata.EditorAlias?.Equals("Umbraco.TrueFalse", StringComparison.OrdinalIgnoreCase) == true)
        {
            return NormalizeTrueFalseValue(trimmedValue) ?? trimmedValue;
        }

        return trimmedValue;
    }

    private static string? NormalizeTrueFalseValue(string value)
    {
        if (value.Equals("true", StringComparison.OrdinalIgnoreCase)
            || value.Equals("yes", StringComparison.OrdinalIgnoreCase)
            || value == "1")
        {
            return "1";
        }

        if (value.Equals("false", StringComparison.OrdinalIgnoreCase)
            || value.Equals("no", StringComparison.OrdinalIgnoreCase)
            || value == "0")
        {
            return "0";
        }

        return value.Trim();
    }
}

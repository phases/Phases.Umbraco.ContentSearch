using System.Text.Json;
using Umbraco.Cms.Core.Models;

namespace Phases.Umbraco.FilterNodes.Services.Examine;

/// <summary>
/// Parses multi-select property values into individual Examine index terms.
/// </summary>
internal static class MultiSelectPropertyIndexValueFormatter
{
    internal static IReadOnlyList<string> GetIndexValues(IProperty property, string? culture)
    {
        var rawValue = string.IsNullOrWhiteSpace(culture)
            ? property.GetValue(null, null)
            : property.GetValue(culture, null);

        return ParseSelectedValues(rawValue)
            .Select(static value => value.ToLowerInvariant())
            .ToArray();
    }

    internal static IReadOnlyList<string> ParseSelectedValues(object? rawValue)
    {
        switch (rawValue)
        {
            case null:
                return [];
            case IEnumerable<string> values:
                return values
                    .Where(static value => !string.IsNullOrWhiteSpace(value))
                    .ToArray();
            case string { Length: > 0 } text when text.TrimStart().StartsWith("[", StringComparison.Ordinal):
                return DeserializeJsonArray(text);
            case string { Length: > 0 } text:
                return [text];
            default:
                return [];
        }
    }

    private static string[] DeserializeJsonArray(string json)
    {
        try
        {
            return JsonSerializer.Deserialize<string[]>(json)
                ?.Where(static value => !string.IsNullOrWhiteSpace(value))
                .ToArray()
                ?? [];
        }
        catch (JsonException)
        {
            return [];
        }
    }
}

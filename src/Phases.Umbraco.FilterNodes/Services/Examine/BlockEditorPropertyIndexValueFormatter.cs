using System.Globalization;
using System.Text.Json;
using Phases.Umbraco.FilterNodes.Services;
using Umbraco.Cms.Core.Models;

namespace Phases.Umbraco.FilterNodes.Services.Examine;

/// <summary>
/// Extracts searchable text from Block Grid property values for container-level Examine indexing.
/// </summary>
internal static class BlockEditorPropertyIndexValueFormatter
{
    private static readonly HashSet<string> MetadataPropertyNames = new(StringComparer.OrdinalIgnoreCase)
    {
        "contentTypeKey",
        "udi",
        "key",
        "contentKey",
        "settingsUdi",
        "contentUdi",
        "editorAlias",
        "culture",
        "segment",
        "areas",
        "layout",
        "expose",
    };

    internal static string? GetAggregatedSearchableText(IProperty property, string? culture)
    {
        ArgumentNullException.ThrowIfNull(property);

        var rawValue = string.IsNullOrWhiteSpace(culture)
            ? property.GetValue(null, null)
            : property.GetValue(culture, null);

        return GetAggregatedSearchableText(rawValue);
    }

    internal static string? GetAggregatedSearchableText(object? rawValue)
    {
        if (rawValue is null)
        {
            return null;
        }

        var terms = new List<string>();
        CollectSearchableTerms(rawValue, terms);

        return terms.Count == 0
            ? null
            : string.Join(' ', terms);
    }

    private static void CollectSearchableTerms(object? rawValue, ICollection<string> terms)
    {
        switch (rawValue)
        {
            case null:
                return;
            case string text:
                CollectSearchableTermsFromString(text, terms);
                return;
            case JsonElement jsonElement:
                CollectSearchableTerms(jsonElement, terms);
                return;
        }
    }

    private static void CollectSearchableTermsFromString(string text, ICollection<string> terms)
    {
        var trimmed = text.Trim();
        if (trimmed.Length == 0)
        {
            return;
        }

        if (trimmed.StartsWith("{", StringComparison.Ordinal)
            || trimmed.StartsWith("[", StringComparison.Ordinal))
        {
            try
            {
                using var document = JsonDocument.Parse(trimmed);
                CollectSearchableTerms(document.RootElement, terms);
            }
            catch (JsonException)
            {
                AddSearchableTerm(trimmed, terms);
            }

            return;
        }

        AddSearchableTerm(trimmed, terms);
    }

    private static void CollectSearchableTerms(JsonElement element, ICollection<string> terms)
    {
        switch (element.ValueKind)
        {
            case JsonValueKind.Object:
                CollectSearchableTermsFromObject(element, terms);
                return;
            case JsonValueKind.Array:
                foreach (var item in element.EnumerateArray())
                {
                    CollectSearchableTerms(item, terms);
                }

                return;
            case JsonValueKind.String:
                AddSearchableTerm(element.GetString(), terms);
                return;
            case JsonValueKind.Number:
            case JsonValueKind.True:
            case JsonValueKind.False:
                AddSearchableTerm(element.GetRawText(), terms);
                return;
        }
    }

    private static void CollectSearchableTermsFromObject(
        JsonElement element,
        ICollection<string> terms)
    {
        if (element.TryGetProperty("values", out var values)
            && values.ValueKind == JsonValueKind.Array)
        {
            foreach (var valueEntry in values.EnumerateArray())
            {
                if (valueEntry.TryGetProperty("value", out var nestedValue))
                {
                    CollectSearchableTerms(nestedValue, terms);
                }
            }
        }

        foreach (var property in element.EnumerateObject())
        {
            if (MetadataPropertyNames.Contains(property.Name)
                || property.Name.Equals("values", StringComparison.OrdinalIgnoreCase))
            {
                continue;
            }

            CollectSearchableTerms(property.Value, terms);
        }
    }

    private static void AddSearchableTerm(string? value, ICollection<string> terms)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return;
        }

        var normalized = ExamineFieldQuery.StripHtmlMarkup(value) ?? value.Trim();
        if (normalized.Length == 0)
        {
            return;
        }

        if (normalized.StartsWith("{", StringComparison.Ordinal)
            || normalized.StartsWith("[", StringComparison.Ordinal))
        {
            CollectSearchableTermsFromString(normalized, terms);
            return;
        }

        if (!terms.Contains(normalized, StringComparer.OrdinalIgnoreCase))
        {
            terms.Add(normalized);
        }
    }
}

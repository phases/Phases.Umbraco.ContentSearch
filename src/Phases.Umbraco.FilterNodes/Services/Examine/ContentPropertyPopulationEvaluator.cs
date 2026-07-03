using System.Collections;
using System.Text.Json;
using Umbraco.Cms.Core.Models;
using Umbraco.Extensions;

namespace Phases.Umbraco.FilterNodes.Services.Examine;

/// <summary>
/// Determines whether a Umbraco property value should be treated as populated
/// for empty / not-empty filtering.
/// </summary>
internal static class ContentPropertyPopulationEvaluator
{
    internal static bool HasPopulatedPropertyValue(
        IProperty property,
        bool published = false,
        string? culture = null)
    {
        ArgumentNullException.ThrowIfNull(property);

        var editorAlias = property.PropertyType.PropertyEditorAlias;

        if (property.PropertyType.VariesByCulture())
        {
            if (!string.IsNullOrWhiteSpace(culture))
            {
                return HasPopulatedStoredValue(
                    property.GetValue(culture, segment: null, published),
                    editorAlias);
            }

            foreach (var propertyCulture in property.Values
                         .Select(static value => value.Culture)
                         .Where(static culture => !string.IsNullOrWhiteSpace(culture))
                         .Distinct(StringComparer.OrdinalIgnoreCase))
            {
                if (HasPopulatedStoredValue(
                        property.GetValue(propertyCulture, segment: null, published),
                        editorAlias))
                {
                    return true;
                }
            }

            return false;
        }

        return HasPopulatedStoredValue(
            property.GetValue(culture: null, segment: null, published),
            editorAlias);
    }

    internal static bool HasPopulatedStoredValue(object? value, string? propertyEditorAlias)
    {
        if (value is null)
        {
            return false;
        }

        if (value is string rawValue)
        {
            return HasPopulatedStringValue(rawValue, propertyEditorAlias);
        }

        if (value is JsonElement jsonElement)
        {
            return HasPopulatedJsonElement(jsonElement, propertyEditorAlias);
        }

        if (value is IEnumerable enumerable)
        {
            var enumerator = enumerable.GetEnumerator();
            return enumerator.MoveNext();
        }

        return true;
    }

    private static bool HasPopulatedStringValue(string rawValue, string? propertyEditorAlias)
    {
        if (string.IsNullOrWhiteSpace(rawValue))
        {
            return false;
        }

        var trimmed = rawValue.Trim();
        if (IsJsonEmptyCollection(trimmed))
        {
            return false;
        }

        if (propertyEditorAlias is not null
            && propertyEditorAlias.Equals(
                global::Umbraco.Cms.Core.Constants.PropertyEditors.Aliases.MediaPicker3,
                StringComparison.OrdinalIgnoreCase))
        {
            return HasMediaPickerStoredValue(trimmed);
        }

        if (propertyEditorAlias is not null
            && propertyEditorAlias.Equals(
                global::Umbraco.Cms.Core.Constants.PropertyEditors.Aliases.MultiUrlPicker,
                StringComparison.OrdinalIgnoreCase))
        {
            return HasJsonArrayItems(trimmed);
        }

        if (propertyEditorAlias is not null
            && (propertyEditorAlias.Equals(
                    global::Umbraco.Cms.Core.Constants.PropertyEditors.Aliases.BlockList,
                    StringComparison.OrdinalIgnoreCase)
                || propertyEditorAlias.Equals(
                    global::Umbraco.Cms.Core.Constants.PropertyEditors.Aliases.BlockGrid,
                    StringComparison.OrdinalIgnoreCase)))
        {
            return HasJsonArrayItems(trimmed);
        }

        return true;
    }

    private static bool HasPopulatedJsonElement(JsonElement jsonElement, string? propertyEditorAlias)
    {
        return jsonElement.ValueKind switch
        {
            JsonValueKind.Null or JsonValueKind.Undefined => false,
            JsonValueKind.Array => jsonElement.GetArrayLength() > 0,
            JsonValueKind.String => HasPopulatedStringValue(
                jsonElement.GetString() ?? string.Empty,
                propertyEditorAlias),
            JsonValueKind.Object => jsonElement.EnumerateObject().Any(),
            _ => true,
        };
    }

    private static bool HasMediaPickerStoredValue(string trimmed)
    {
        if (trimmed.StartsWith("[", StringComparison.Ordinal))
        {
            return HasJsonArrayItems(trimmed);
        }

        return trimmed
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Length > 0;
    }

    private static bool HasJsonArrayItems(string trimmed)
    {
        if (!trimmed.StartsWith("[", StringComparison.Ordinal))
        {
            return true;
        }

        try
        {
            using var document = JsonDocument.Parse(trimmed);
            return document.RootElement.ValueKind == JsonValueKind.Array
                && document.RootElement.GetArrayLength() > 0;
        }
        catch (JsonException)
        {
            return false;
        }
    }

    private static bool IsJsonEmptyCollection(string trimmed)
        => trimmed is "[]" or "{}" or "null";
}

using System.Text.Json;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Services;

namespace Phases.Umbraco.FilterNodes.Services.Examine;

/// <summary>
/// Reads nested block element property values from Block Grid / Block List JSON.
/// </summary>
internal static class BlockEditorPropertyValueReader
{
    internal static bool HasPopulatedElementPropertyValue(
        IProperty containerProperty,
        BlockPropertyAliasParts parts,
        IContentTypeService contentTypeService,
        string? culture = null)
    {
        ArgumentNullException.ThrowIfNull(containerProperty);
        ArgumentNullException.ThrowIfNull(contentTypeService);

        var rawValue = string.IsNullOrWhiteSpace(culture)
            ? containerProperty.GetValue(culture: null, segment: null, published: false)
            : containerProperty.GetValue(culture, segment: null, published: false);

        return HasPopulatedElementPropertyValue(rawValue, parts, contentTypeService);
    }

    internal static bool HasPopulatedElementPropertyValue(
        object? rawValue,
        BlockPropertyAliasParts parts,
        IContentTypeService contentTypeService)
    {
        if (rawValue is null)
        {
            return false;
        }

        Guid? elementTypeKey = contentTypeService.Get(parts.ElementTypeAlias)?.Key;

        return rawValue switch
        {
            string text => HasPopulatedElementPropertyValueInJson(text, parts, elementTypeKey),
            JsonElement jsonElement => HasPopulatedElementPropertyValueInJson(jsonElement, parts, elementTypeKey),
            _ => false,
        };
    }

    private static bool HasPopulatedElementPropertyValueInJson(
        string text,
        BlockPropertyAliasParts parts,
        Guid? elementTypeKey)
    {
        var trimmed = text.Trim();
        if (trimmed.Length == 0
            || trimmed is "[]" or "{}" or "null")
        {
            return false;
        }

        try
        {
            using var document = JsonDocument.Parse(trimmed);
            return HasPopulatedElementPropertyValueInJson(document.RootElement, parts, elementTypeKey);
        }
        catch (JsonException)
        {
            return false;
        }
    }

    private static bool HasPopulatedElementPropertyValueInJson(
        JsonElement root,
        BlockPropertyAliasParts parts,
        Guid? elementTypeKey)
    {
        if (root.ValueKind != JsonValueKind.Object)
        {
            return false;
        }

        if (!root.TryGetProperty("contentData", out var contentData)
            || contentData.ValueKind != JsonValueKind.Array)
        {
            return false;
        }

        foreach (var block in contentData.EnumerateArray())
        {
            if (block.ValueKind != JsonValueKind.Object)
            {
                continue;
            }

            if (elementTypeKey.HasValue
                && block.TryGetProperty("contentTypeKey", out var contentTypeKeyElement)
                && contentTypeKeyElement.ValueKind == JsonValueKind.String
                && Guid.TryParse(contentTypeKeyElement.GetString(), out var blockTypeKey)
                && blockTypeKey != elementTypeKey.Value)
            {
                continue;
            }

            if (TryReadBlockPropertyValue(block, parts.ElementPropertyAlias, out var propertyValue)
                && ContentPropertyPopulationEvaluator.HasPopulatedStoredValue(propertyValue, propertyEditorAlias: null))
            {
                return true;
            }
        }

        return false;
    }

    private static bool TryReadBlockPropertyValue(
        JsonElement block,
        string propertyAlias,
        out object? value)
    {
        if (block.TryGetProperty(propertyAlias, out var directValue))
        {
            value = ReadJsonValue(directValue);
            return true;
        }

        if (block.TryGetProperty("values", out var values)
            && values.ValueKind == JsonValueKind.Array)
        {
            foreach (var entry in values.EnumerateArray())
            {
                if (!entry.TryGetProperty("alias", out var aliasElement)
                    || aliasElement.ValueKind != JsonValueKind.String)
                {
                    continue;
                }

                if (!aliasElement.GetString()!.Equals(propertyAlias, StringComparison.OrdinalIgnoreCase))
                {
                    continue;
                }

                if (entry.TryGetProperty("value", out var nestedValue))
                {
                    value = ReadJsonValue(nestedValue);
                    return true;
                }
            }
        }

        value = null;
        return false;
    }

    private static object? ReadJsonValue(JsonElement element)
        => element.ValueKind switch
        {
            JsonValueKind.Null or JsonValueKind.Undefined => null,
            JsonValueKind.String => element.GetString(),
            JsonValueKind.Number => element.GetRawText(),
            JsonValueKind.True => true,
            JsonValueKind.False => false,
            JsonValueKind.Array => element.GetRawText(),
            JsonValueKind.Object => element.GetRawText(),
            _ => element.ToString(),
        };
}

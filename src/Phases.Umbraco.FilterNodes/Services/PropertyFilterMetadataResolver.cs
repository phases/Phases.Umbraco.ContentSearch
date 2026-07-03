using System.Text.Json;
using Phases.Umbraco.FilterNodes.Constants;
using Phases.Umbraco.FilterNodes.Models.Enums;
using Phases.Umbraco.FilterNodes.Models.Responses;
using Umbraco.Cms.Core.Models;
using Umbraco.Extensions;

namespace Phases.Umbraco.FilterNodes.Services;

/// <summary>
/// Resolves filter metadata from Umbraco property types and data types.
/// </summary>
public static class PropertyFilterMetadataResolver
{
    private static readonly HashSet<string> DateEditorAliases = new(StringComparer.OrdinalIgnoreCase)
    {
        "Umbraco.DateTime",
        "Umbraco.DateOnly",
        "Umbraco.DateTimeUnspecified",
        "Umbraco.DateTimeWithTimeZone",
    };

    private static readonly HashSet<string> NumericEditorAliases = new(StringComparer.OrdinalIgnoreCase)
    {
        "Umbraco.Integer",
        "Umbraco.Decimal",
        "Umbraco.Slider",
    };

    private static readonly PropertyFilterOption[] TrueFalseOptions =
    [
        new PropertyFilterOption { Label = "True", Value = "1" },
        new PropertyFilterOption { Label = "False", Value = "0" },
    ];

    /// <summary>
    /// Creates filter metadata for a content type property.
    /// </summary>
    /// <param name="propertyType">The property type definition.</param>
    /// <param name="dataType">The associated data type, when available.</param>
    /// <param name="groupName">The property group display name.</param>
    /// <param name="groupSortOrder">The property group sort order.</param>
    /// <param name="sourceCategory">The property metadata source category.</param>
    /// <param name="sourceName">The composition or block element type name, when applicable.</param>
    /// <param name="displayName">The hierarchical display name, when applicable.</param>
    /// <param name="sortOrder">The property sort order within its group.</param>
    /// <param name="aliasOverride">An optional alias override for composite block properties.</param>
    /// <param name="options">Optional extended metadata.</param>
    /// <returns>Filter metadata for the property.</returns>
    public static FilterablePropertyMetadata Resolve(
        IPropertyType propertyType,
        IDataType? dataType,
        string groupName = PropertyGroupMetadataResolver.DefaultGroupName,
        int groupSortOrder = int.MaxValue - 100,
        PropertyMetadataSourceCategory sourceCategory = PropertyMetadataSourceCategory.ContentType,
        string? sourceName = null,
        string? displayName = null,
        int? sortOrder = null,
        string? aliasOverride = null,
        PropertyMetadataOptions? options = null)
    {
        ArgumentNullException.ThrowIfNull(propertyType);

        var editorAlias = dataType?.EditorAlias ?? propertyType.PropertyEditorAlias;

        return new FilterablePropertyMetadata
        {
            Alias = aliasOverride ?? propertyType.Alias,
            Name = displayName ?? propertyType.Name,
            EditorAlias = editorAlias,
            DataTypeId = dataType?.Id ?? propertyType.DataTypeId,
            FilterType = ResolveFilterType(editorAlias, dataType),
            Options = ResolveOptions(editorAlias, dataType),
            GroupName = groupName,
            GroupSortOrder = groupSortOrder,
            SortOrder = sortOrder ?? propertyType.SortOrder,
            SourceCategory = sourceCategory,
            SourceName = sourceName,
            IsFilterable = options?.IsFilterable ?? true,
            IsContainer = options?.IsContainer ?? false,
            ContainerAlias = options?.ContainerAlias,
            ContainerName = options?.ContainerName,
            ContainerEditorAlias = options?.ContainerEditorAlias,
            ElementTypeAlias = options?.ElementTypeAlias,
            ElementTypeName = options?.ElementTypeName,
            DisplayPath = options?.DisplayPath ?? [],
            BlockDiscoveryDiagnostics = options?.BlockDiscoveryDiagnostics,
            VariesByCulture = options?.ContainerVariesByCulture == true
                || propertyType.VariesByCulture(),
        };
    }

    /// <summary>
    /// Creates filter metadata for a system filterable property.
    /// </summary>
    /// <param name="alias">The system property alias.</param>
    /// <param name="sortOrder">The sort order within the system group.</param>
    /// <returns>Filter metadata for the system property.</returns>
    public static FilterablePropertyMetadata ResolveSystemProperty(string alias, int sortOrder = 0)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(alias);

        if (alias.Equals(FilterConstants.CreatedDatePropertyAlias, StringComparison.OrdinalIgnoreCase)
            || alias.Equals(FilterConstants.UpdatedDatePropertyAlias, StringComparison.OrdinalIgnoreCase))
        {
            return new FilterablePropertyMetadata
            {
                Alias = alias,
                Name = alias.Equals(FilterConstants.CreatedDatePropertyAlias, StringComparison.OrdinalIgnoreCase)
                    ? "Create date"
                    : "Update date",
                FilterType = PropertyFilterType.Date,
                GroupName = PropertyMetadataSourceGroups.System,
                GroupSortOrder = PropertyMetadataSourceGroups.GetGroupSortOrder(PropertyMetadataSourceCategory.System),
                SortOrder = sortOrder,
                SourceCategory = PropertyMetadataSourceCategory.System,
            };
        }

        if (alias.Equals(FilterNodesExamineFields.NodeName, StringComparison.OrdinalIgnoreCase))
        {
            return new FilterablePropertyMetadata
            {
                Alias = alias,
                Name = "Node name",
                FilterType = PropertyFilterType.Text,
                GroupName = PropertyMetadataSourceGroups.System,
                GroupSortOrder = PropertyMetadataSourceGroups.GetGroupSortOrder(PropertyMetadataSourceCategory.System),
                SortOrder = sortOrder,
                SourceCategory = PropertyMetadataSourceCategory.System,
            };
        }

        if (PublishStatusFilterValues.IsPublishStatusProperty(alias))
        {
            return new FilterablePropertyMetadata
            {
                Alias = alias,
                Name = "Publish status",
                EditorAlias = "Umbraco.TrueFalse",
                FilterType = PropertyFilterType.Dropdown,
                Options = PublishStatusFilterValues.Options,
                GroupName = PropertyMetadataSourceGroups.System,
                GroupSortOrder = PropertyMetadataSourceGroups.GetGroupSortOrder(PropertyMetadataSourceCategory.System),
                SortOrder = sortOrder,
                SourceCategory = PropertyMetadataSourceCategory.System,
            };
        }

        return new FilterablePropertyMetadata
        {
            Alias = alias,
            Name = alias,
            FilterType = PropertyFilterType.Text,
            GroupName = PropertyMetadataSourceGroups.System,
            GroupSortOrder = PropertyMetadataSourceGroups.GetGroupSortOrder(PropertyMetadataSourceCategory.System),
            SortOrder = sortOrder,
            SourceCategory = PropertyMetadataSourceCategory.System,
        };
    }

    private static PropertyFilterType ResolveFilterType(string? editorAlias, IDataType? dataType)
    {
        if (string.IsNullOrWhiteSpace(editorAlias))
        {
            return PropertyFilterType.Text;
        }

        if (editorAlias.Equals("Umbraco.TrueFalse", StringComparison.OrdinalIgnoreCase))
        {
            return PropertyFilterType.Dropdown;
        }

        if (editorAlias.Equals("Umbraco.DropDown.Flexible", StringComparison.OrdinalIgnoreCase))
        {
            return IsMultipleChoice(dataType)
                ? PropertyFilterType.MultiSelect
                : PropertyFilterType.Dropdown;
        }

        if (editorAlias.Equals("Umbraco.RadioButtonList", StringComparison.OrdinalIgnoreCase))
        {
            return PropertyFilterType.Dropdown;
        }

        if (editorAlias.Equals("Umbraco.CheckBoxList", StringComparison.OrdinalIgnoreCase))
        {
            return PropertyFilterType.MultiSelect;
        }

        if (DateEditorAliases.Contains(editorAlias))
        {
            return PropertyFilterType.Date;
        }

        if (NumericEditorAliases.Contains(editorAlias))
        {
            return PropertyFilterType.Number;
        }

        return PropertyFilterType.Text;
    }

    private static IReadOnlyList<PropertyFilterOption> ResolveOptions(string? editorAlias, IDataType? dataType)
    {
        if (string.IsNullOrWhiteSpace(editorAlias))
        {
            return [];
        }

        if (editorAlias.Equals("Umbraco.TrueFalse", StringComparison.OrdinalIgnoreCase))
        {
            return TrueFalseOptions;
        }

        if (editorAlias.Equals("Umbraco.DropDown.Flexible", StringComparison.OrdinalIgnoreCase)
            || editorAlias.Equals("Umbraco.RadioButtonList", StringComparison.OrdinalIgnoreCase)
            || editorAlias.Equals("Umbraco.CheckBoxList", StringComparison.OrdinalIgnoreCase))
        {
            return ParseValueListOptions(dataType);
        }

        return [];
    }

    private static bool TryGetConfigurationValue(
        IDictionary<string, object> configuration,
        string key,
        out object? value)
    {
        if (configuration.TryGetValue(key, out value))
        {
            return true;
        }

        foreach (var entry in configuration)
        {
            if (entry.Key.Equals(key, StringComparison.OrdinalIgnoreCase))
            {
                value = entry.Value;
                return true;
            }
        }

        value = null;
        return false;
    }

    private static bool IsMultipleChoice(IDataType? dataType)
    {
        if (dataType?.ConfigurationData is null)
        {
            return false;
        }

        if (!TryGetConfigurationValue(dataType.ConfigurationData, "multiple", out var multipleValue))
        {
            return false;
        }

        return multipleValue switch
        {
            bool boolean => boolean,
            JsonElement { ValueKind: JsonValueKind.True } => true,
            JsonElement { ValueKind: JsonValueKind.False } => false,
            string text when bool.TryParse(text, out var parsed) => parsed,
            _ => false,
        };
    }

    private static IReadOnlyList<PropertyFilterOption> ParseValueListOptions(IDataType? dataType)
    {
        if (dataType?.ConfigurationData is null
            || !TryGetConfigurationValue(dataType.ConfigurationData, "items", out var itemsValue)
            || itemsValue is null)
        {
            return [];
        }

        return ParseItems(itemsValue)
            .Select(static item => new PropertyFilterOption
            {
                Label = item.Label,
                Value = item.Value,
            })
            .ToArray();
    }

    private static IEnumerable<(string Label, string Value)> ParseItems(object itemsValue)
    {
        switch (itemsValue)
        {
            case IEnumerable<string> stringItems:
                foreach (var item in stringItems)
                {
                    if (!string.IsNullOrWhiteSpace(item))
                    {
                        yield return (item, item);
                    }
                }

                yield break;

            case JsonElement jsonElement:
                foreach (var item in ParseJsonItems(jsonElement))
                {
                    yield return item;
                }

                yield break;

            case IEnumerable<object> objectItems:
                foreach (var item in objectItems)
                {
                    var parsed = ReadItem(item);
                    if (parsed is not null)
                    {
                        yield return parsed.Value;
                    }
                }

                yield break;
        }
    }

    private static IEnumerable<(string Label, string Value)> ParseJsonItems(JsonElement jsonElement)
    {
        if (jsonElement.ValueKind == JsonValueKind.String)
        {
            var text = jsonElement.GetString();
            if (string.IsNullOrWhiteSpace(text))
            {
                yield break;
            }

            if (text.TrimStart().StartsWith("[", StringComparison.Ordinal))
            {
                using var document = JsonDocument.Parse(text);
                foreach (var item in ParseJsonItems(document.RootElement))
                {
                    yield return item;
                }

                yield break;
            }

            yield return (text, text);
            yield break;
        }

        if (jsonElement.ValueKind != JsonValueKind.Array)
        {
            yield break;
        }

        foreach (var element in jsonElement.EnumerateArray())
        {
            var parsed = ReadItem(element);
            if (parsed is not null)
            {
                yield return parsed.Value;
            }
        }
    }

    private static (string Label, string Value)? ReadItem(object? item)
    {
        switch (item)
        {
            case null:
                return null;
            case string text when !string.IsNullOrWhiteSpace(text):
                return (text, text);
            case JsonElement { ValueKind: JsonValueKind.String } jsonString:
            {
                var value = jsonString.GetString();
                return string.IsNullOrWhiteSpace(value) ? null : (value, value);
            }
            case JsonElement { ValueKind: JsonValueKind.Number } jsonNumber:
            {
                var value = jsonNumber.GetRawText();
                return (value, value);
            }
            case JsonElement { ValueKind: JsonValueKind.Object } jsonObject:
                return ReadObjectItem(jsonObject);
            case IDictionary<string, object> dictionary:
                return ReadDictionaryItem(dictionary);
            default:
            {
                var value = item.ToString();
                return string.IsNullOrWhiteSpace(value) ? null : (value, value);
            }
        }
    }

    private static (string Label, string Value)? ReadObjectItem(JsonElement jsonObject)
    {
        var label = ReadJsonProperty(jsonObject, "name")
            ?? ReadJsonProperty(jsonObject, "Name")
            ?? ReadJsonProperty(jsonObject, "label")
            ?? ReadJsonProperty(jsonObject, "Label")
            ?? ReadJsonProperty(jsonObject, "value")
            ?? ReadJsonProperty(jsonObject, "Value")
            ?? ReadJsonProperty(jsonObject, "id")
            ?? ReadJsonProperty(jsonObject, "Id");

        if (string.IsNullOrWhiteSpace(label))
        {
            return null;
        }

        var indexedValue = ReadJsonProperty(jsonObject, "value")
            ?? ReadJsonProperty(jsonObject, "Value")
            ?? ReadJsonProperty(jsonObject, "id")
            ?? ReadJsonProperty(jsonObject, "Id")
            ?? label;

        return (label, indexedValue);
    }

    private static (string Label, string Value)? ReadDictionaryItem(IDictionary<string, object> dictionary)
    {
        var label = ReadDictionaryProperty(dictionary, "name")
            ?? ReadDictionaryProperty(dictionary, "Name")
            ?? ReadDictionaryProperty(dictionary, "label")
            ?? ReadDictionaryProperty(dictionary, "Label")
            ?? ReadDictionaryProperty(dictionary, "value")
            ?? ReadDictionaryProperty(dictionary, "Value")
            ?? ReadDictionaryProperty(dictionary, "id")
            ?? ReadDictionaryProperty(dictionary, "Id");

        if (string.IsNullOrWhiteSpace(label))
        {
            return null;
        }

        var indexedValue = ReadDictionaryProperty(dictionary, "value")
            ?? ReadDictionaryProperty(dictionary, "Value")
            ?? ReadDictionaryProperty(dictionary, "id")
            ?? ReadDictionaryProperty(dictionary, "Id")
            ?? label;

        return (label, indexedValue);
    }

    private static string? ReadJsonProperty(JsonElement jsonObject, string propertyName)
    {
        if (!jsonObject.TryGetProperty(propertyName, out var property))
        {
            return null;
        }

        return property.ValueKind switch
        {
            JsonValueKind.String => property.GetString(),
            JsonValueKind.Number => property.GetRawText(),
            JsonValueKind.True => "1",
            JsonValueKind.False => "0",
            _ => property.ToString(),
        };
    }

    private static string? ReadDictionaryProperty(IDictionary<string, object> dictionary, string propertyName)
    {
        if (!dictionary.TryGetValue(propertyName, out var value) || value is null)
        {
            return null;
        }

        return value switch
        {
            string text => text,
            bool boolean => boolean ? "1" : "0",
            JsonElement { ValueKind: JsonValueKind.String } jsonString => jsonString.GetString(),
            JsonElement { ValueKind: JsonValueKind.Number } jsonNumber => jsonNumber.GetRawText(),
            JsonElement { ValueKind: JsonValueKind.True } => "1",
            JsonElement { ValueKind: JsonValueKind.False } => "0",
            _ => value.ToString(),
        };
    }
}

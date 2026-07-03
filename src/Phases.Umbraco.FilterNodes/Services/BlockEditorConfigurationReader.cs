using System.Collections;
using System.Text.Json;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.PropertyEditors;

namespace Phases.Umbraco.FilterNodes.Services;

/// <summary>
/// Reads element type keys from Block List and Block Grid data type configuration.
/// </summary>
internal static class BlockEditorConfigurationReader
{
    /// <summary>
    /// Gets the content and settings element type keys configured for a block editor data type.
    /// </summary>
    /// <param name="dataType">The block editor data type.</param>
    /// <param name="editorAlias">The property editor alias.</param>
    /// <returns>Distinct element type keys referenced by the configuration.</returns>
    public static IReadOnlyList<Guid> GetElementTypeKeys(IDataType? dataType, string? editorAlias)
        => Read(dataType, editorAlias).ElementTypeKeys;

    /// <summary>
    /// Reads block editor configuration and returns element type keys with discovery diagnostics.
    /// </summary>
    /// <param name="dataType">The block editor data type.</param>
    /// <param name="editorAlias">The property editor alias.</param>
    /// <returns>The configuration read result.</returns>
    public static BlockEditorConfigurationReadResult Read(IDataType? dataType, string? editorAlias)
    {
        if (dataType is null || string.IsNullOrWhiteSpace(editorAlias))
        {
            return BlockEditorConfigurationReadResult.Empty;
        }

        if (editorAlias.Equals(
                global::Umbraco.Cms.Core.Constants.PropertyEditors.Aliases.BlockList,
                StringComparison.OrdinalIgnoreCase))
        {
            return ReadBlockList(dataType);
        }

        if (editorAlias.Equals(
                global::Umbraco.Cms.Core.Constants.PropertyEditors.Aliases.BlockGrid,
                StringComparison.OrdinalIgnoreCase))
        {
            return ReadBlockGrid(dataType);
        }

        return BlockEditorConfigurationReadResult.Empty;
    }

    private static BlockEditorConfigurationReadResult ReadBlockList(IDataType dataType)
    {
        var keys = new HashSet<Guid>();
        object? blocksValue = null;

        if (dataType.ConfigurationObject is BlockListConfiguration typedConfiguration)
        {
            blocksValue = typedConfiguration.Blocks;
            foreach (var key in CollectElementTypeKeysFromTypedBlockListBlocks(typedConfiguration.Blocks))
            {
                keys.Add(key);
            }
        }

        if (dataType.ConfigurationData is not null
            && TryGetConfigurationValue(dataType.ConfigurationData, "blocks", out var blocksValueFromData)
            && blocksValueFromData is not null)
        {
            blocksValue ??= blocksValueFromData;
            foreach (var key in CollectElementTypeKeys(blocksValueFromData))
            {
                keys.Add(key);
            }
        }

        return CreateResult(blocksValue, keys.ToArray());
    }

    private static BlockEditorConfigurationReadResult ReadBlockGrid(IDataType dataType)
    {
        var keys = new HashSet<Guid>();
        object? blocksValue = null;

        if (dataType.ConfigurationObject is BlockGridConfiguration typedConfiguration)
        {
            blocksValue = typedConfiguration.Blocks;
            foreach (var key in CollectElementTypeKeysFromTypedBlockGridBlocks(typedConfiguration.Blocks))
            {
                keys.Add(key);
            }
        }

        if (dataType.ConfigurationData is not null
            && TryGetConfigurationValue(dataType.ConfigurationData, "blocks", out var blocksValueFromData)
            && blocksValueFromData is not null)
        {
            blocksValue ??= blocksValueFromData;
            foreach (var key in CollectElementTypeKeys(blocksValueFromData))
            {
                keys.Add(key);
            }
        }

        return CreateResult(blocksValue, keys.ToArray());
    }

    private static BlockEditorConfigurationReadResult CreateResult(
        object? blocksValue,
        IReadOnlyList<Guid> elementTypeKeys)
    {
        var allowedBlocksCount = CountTopLevelBlocks(blocksValue);
        if (allowedBlocksCount == 0 && elementTypeKeys.Count == 0)
        {
            return BlockEditorConfigurationReadResult.Empty;
        }

        return new BlockEditorConfigurationReadResult(
            elementTypeKeys,
            ConfigurationLoaded: true,
            allowedBlocksCount);
    }

    private static int CountTopLevelBlocks(object? blocksValue)
        => blocksValue switch
        {
            null => 0,
            Array array => array.Length,
            JsonElement { ValueKind: JsonValueKind.Array } jsonArray => jsonArray.GetArrayLength(),
            System.Collections.ICollection collection => collection.Count,
            System.Collections.IEnumerable enumerable => enumerable.Cast<object?>().Count(),
            _ => 0,
        };

    private static IReadOnlyList<Guid> CollectElementTypeKeysFromTypedBlockListBlocks(
        BlockListConfiguration.BlockConfiguration[]? blocks)
    {
        if (blocks is null || blocks.Length == 0)
        {
            return [];
        }

        var keys = new HashSet<Guid>();
        foreach (BlockListConfiguration.BlockConfiguration block in blocks)
        {
            AddElementTypeKey(keys, block.ContentElementTypeKey);
            AddElementTypeKey(keys, block.SettingsElementTypeKey);
        }

        return keys.ToArray();
    }

    private static IReadOnlyList<Guid> CollectElementTypeKeysFromTypedBlockGridBlocks(
        BlockGridConfiguration.BlockGridBlockConfiguration[]? blocks)
    {
        if (blocks is null || blocks.Length == 0)
        {
            return [];
        }

        var keys = new HashSet<Guid>();
        foreach (BlockGridConfiguration.BlockGridBlockConfiguration block in blocks)
        {
            CollectElementTypeKeysFromTypedGridBlock(block, keys);
        }

        return keys.ToArray();
    }

    private static void CollectElementTypeKeysFromTypedGridBlock(
        BlockGridConfiguration.BlockGridBlockConfiguration block,
        ISet<Guid> keys)
    {
        AddElementTypeKey(keys, block.ContentElementTypeKey);
        AddElementTypeKey(keys, block.SettingsElementTypeKey);
    }

    private static IReadOnlyList<Guid> CollectElementTypeKeys(object blocksValue)
    {
        var keys = new HashSet<Guid>();

        switch (blocksValue)
        {
            case JsonElement { ValueKind: JsonValueKind.Array } jsonArray:
                foreach (var block in jsonArray.EnumerateArray())
                {
                    CollectElementTypeKeysFromBlock(block, keys);
                }

                break;

            case IEnumerable<BlockGridConfiguration.BlockGridBlockConfiguration> gridBlocks:
                foreach (var block in gridBlocks)
                {
                    CollectElementTypeKeysFromTypedGridBlock(block, keys);
                }

                break;

            case IEnumerable<BlockListConfiguration.BlockConfiguration> listBlocks:
                foreach (var block in listBlocks)
                {
                    AddElementTypeKey(keys, block.ContentElementTypeKey);
                    AddElementTypeKey(keys, block.SettingsElementTypeKey);
                }

                break;

            case IEnumerable<object> objectItems:
                foreach (var item in objectItems)
                {
                    switch (item)
                    {
                        case JsonElement jsonElement:
                            CollectElementTypeKeysFromBlock(jsonElement, keys);
                            break;
                        case IDictionary<string, object> dictionary:
                            CollectElementTypeKeysFromBlockDictionary(dictionary, keys);
                            break;
                        case BlockGridConfiguration.BlockGridBlockConfiguration gridBlock:
                            CollectElementTypeKeysFromTypedGridBlock(gridBlock, keys);
                            break;
                        case BlockListConfiguration.BlockConfiguration listBlock:
                            AddElementTypeKey(keys, listBlock.ContentElementTypeKey);
                            AddElementTypeKey(keys, listBlock.SettingsElementTypeKey);
                            break;
                    }
                }

                break;
        }

        return keys.ToArray();
    }

    private static void CollectElementTypeKeysFromBlock(JsonElement block, ISet<Guid> keys)
    {
        AddElementTypeKey(keys, ReadGuidProperty(block, "contentElementTypeKey"));
        AddElementTypeKey(keys, ReadGuidProperty(block, "settingsElementTypeKey"));

        if (!TryGetPropertyCaseInsensitive(block, "areas", out var areas)
            || areas.ValueKind != JsonValueKind.Array)
        {
            return;
        }

        foreach (var area in areas.EnumerateArray())
        {
            CollectElementTypeKeysFromArea(area, keys);
        }
    }

    private static void CollectElementTypeKeysFromBlockDictionary(
        IDictionary<string, object> block,
        ISet<Guid> keys)
    {
        AddElementTypeKey(keys, ReadGuidProperty(block, "contentElementTypeKey"));
        AddElementTypeKey(keys, ReadGuidProperty(block, "settingsElementTypeKey"));

        if (!TryGetConfigurationValue(block, "areas", out var areasValue))
        {
            return;
        }

        switch (areasValue)
        {
            case JsonElement { ValueKind: JsonValueKind.Array } jsonArray:
                foreach (var area in jsonArray.EnumerateArray())
                {
                    CollectElementTypeKeysFromArea(area, keys);
                }

                break;
            case IEnumerable<object> objectItems:
                foreach (var item in objectItems)
                {
                    if (item is JsonElement jsonElement)
                    {
                        CollectElementTypeKeysFromArea(jsonElement, keys);
                    }
                }

                break;
        }
    }

    private static void CollectElementTypeKeysFromArea(JsonElement area, ISet<Guid> keys)
    {
        if (!TryGetPropertyCaseInsensitive(area, "specifiedAllowance", out var allowance)
            || allowance.ValueKind != JsonValueKind.Array)
        {
            return;
        }

        foreach (var allowedBlock in allowance.EnumerateArray())
        {
            AddElementTypeKey(keys, ReadGuidProperty(allowedBlock, "contentElementTypeKey"));
            AddElementTypeKey(keys, ReadGuidProperty(allowedBlock, "elementTypeKey"));
            AddElementTypeKey(keys, ReadGuidProperty(allowedBlock, "settingsElementTypeKey"));
        }
    }

    private static void AddElementTypeKey(ISet<Guid> keys, Guid key)
    {
        if (key != Guid.Empty)
        {
            keys.Add(key);
        }
    }

    private static void AddElementTypeKey(ISet<Guid> keys, Guid? key)
    {
        if (key is { } value && value != Guid.Empty)
        {
            keys.Add(value);
        }
    }

    private static Guid ReadGuidProperty(JsonElement jsonObject, string propertyName)
    {
        if (!jsonObject.TryGetProperty(propertyName, out var property)
            && !TryGetPropertyCaseInsensitive(jsonObject, propertyName, out property))
        {
            return Guid.Empty;
        }

        return property.ValueKind switch
        {
            JsonValueKind.String when Guid.TryParse(property.GetString(), out var parsed) => parsed,
            _ => Guid.Empty,
        };
    }

    private static Guid ReadGuidProperty(IDictionary<string, object> dictionary, string propertyName)
    {
        if (!TryGetConfigurationValue(dictionary, propertyName, out var value) || value is null)
        {
            return Guid.Empty;
        }

        return value switch
        {
            Guid guid => guid,
            string text when Guid.TryParse(text, out var parsed) => parsed,
            JsonElement { ValueKind: JsonValueKind.String } jsonString
                when Guid.TryParse(jsonString.GetString(), out var parsed) => parsed,
            _ => Guid.Empty,
        };
    }

    private static bool TryGetPropertyCaseInsensitive(
        JsonElement jsonObject,
        string propertyName,
        out JsonElement property)
    {
        foreach (var candidate in jsonObject.EnumerateObject())
        {
            if (candidate.Name.Equals(propertyName, StringComparison.OrdinalIgnoreCase))
            {
                property = candidate.Value;
                return true;
            }
        }

        property = default;
        return false;
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
}

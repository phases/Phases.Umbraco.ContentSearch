using Phases.Umbraco.ContentSearch.Metadata.Constants;
using Phases.Umbraco.ContentSearch.Metadata.Discovery;
using Phases.Umbraco.ContentSearch.Metadata.Models;

namespace Phases.Umbraco.ContentSearch.Metadata.Discovery;

/// <summary>
/// Provides built-in system property metadata for the query builder UI.
/// </summary>
internal static class SystemPropertyMetadataProvider
{
    private static readonly string[] SystemPropertyAliases =
    [
        ContentSearchMetadataConstants.NodeNamePropertyAlias,
        ContentSearchMetadataConstants.CreatedDatePropertyAlias,
        ContentSearchMetadataConstants.UpdatedDatePropertyAlias,
        PublishStatusFilterValues.PropertyAlias,
    ];

    /// <summary>
    /// Gets metadata for all built-in system properties.
    /// </summary>
    public static IReadOnlyList<SearchablePropertyMetadata> GetSystemProperties()
    {
        var properties = new SearchablePropertyMetadata[SystemPropertyAliases.Length];

        for (var index = 0; index < SystemPropertyAliases.Length; index++)
        {
            properties[index] = SearchablePropertyMetadataResolver.ResolveSystemProperty(
                SystemPropertyAliases[index],
                index);
        }

        return properties;
    }
}

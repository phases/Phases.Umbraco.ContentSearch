using Phases.Umbraco.FilterNodes.Models.Enums;
using Phases.Umbraco.FilterNodes.Models.Examine;
using Phases.Umbraco.FilterNodes.Models.Responses;

namespace Phases.Umbraco.FilterNodes.Services.Examine;

/// <summary>
/// Enriches discovered property metadata with Examine index capabilities.
/// </summary>
public sealed class PropertyIndexCapabilityEnricher
{
    private const string ContainerSearchMode = "Container Search";
    private const string DedicatedPropertySearchMode = "Dedicated Property Search";
    private const string UnavailableSearchMode = "Unavailable";

    private readonly IExamineFieldResolver _fieldResolver;

    /// <summary>
    /// Initializes a new instance of the <see cref="PropertyIndexCapabilityEnricher"/> class.
    /// </summary>
    /// <param name="fieldResolver">The Examine field resolver.</param>
    public PropertyIndexCapabilityEnricher(IExamineFieldResolver fieldResolver)
    {
        _fieldResolver = fieldResolver;
    }

    /// <summary>
    /// Applies index capability metadata to discovered properties.
    /// </summary>
    /// <param name="properties">The discovered properties.</param>
    /// <returns>The enriched properties.</returns>
    public IReadOnlyList<FilterablePropertyMetadata> Enrich(
        IReadOnlyList<FilterablePropertyMetadata> properties)
    {
        ArgumentNullException.ThrowIfNull(properties);

        if (properties.Count == 0)
        {
            return properties;
        }

        var enrichedElements = properties
            .Select(property => property.IsContainer
                ? property
                : EnrichNonContainerProperty(property))
            .ToArray();

        return enrichedElements
            .Select(property => EnrichContainerProperty(property, enrichedElements))
            .ToArray();
    }

    private FilterablePropertyMetadata EnrichNonContainerProperty(
        FilterablePropertyMetadata property)
    {
        if (property.IsFilterable)
        {
            return property;
        }

        if (string.IsNullOrWhiteSpace(property.ContainerAlias))
        {
            return property;
        }

        var resolution = _fieldResolver.Resolve(
            property.Alias,
            property,
            SearchCultureContext.AllCultures);
        if (!resolution.IsSupported)
        {
            return property;
        }

        return property with
        {
            IsFilterable = true,
            IndexedFieldAliases = resolution.FieldNames,
        };
    }

    private FilterablePropertyMetadata EnrichContainerProperty(
        FilterablePropertyMetadata property,
        IReadOnlyList<FilterablePropertyMetadata> allProperties)
    {
        if (!property.IsContainer || !IsBlockGridContainer(property))
        {
            return property;
        }

        return EnrichBlockGridContainer(property, allProperties);
    }

    private FilterablePropertyMetadata EnrichBlockGridContainer(
        FilterablePropertyMetadata property,
        IReadOnlyList<FilterablePropertyMetadata> allProperties)
    {
        var resolution = _fieldResolver.Resolve(
            property.Alias,
            property,
            SearchCultureContext.AllCultures);
        var containerField = resolution.FieldNames.Count > 0
            ? resolution.FieldNames[0]
            : property.Alias;

        var elementProperties = allProperties
            .Where(candidate =>
                !candidate.IsContainer
                && string.Equals(
                    candidate.ContainerAlias,
                    property.Alias,
                    StringComparison.OrdinalIgnoreCase))
            .ToArray();

        var elementFieldsDetected = elementProperties
            .Count(candidate => candidate.IndexedFieldAliases is { Count: > 0 });

        var dedicatedPropertyFields = elementProperties
            .Count(candidate =>
                candidate.IsFilterable
                && candidate.IndexedFieldAliases is { Count: > 0 });

        var containerIndexed = resolution.IsSupported;

        return property with
        {
            IndexedFieldAliases = containerIndexed
                ? resolution.FieldNames
                : property.IndexedFieldAliases,
            BlockExamineDiagnostics = new BlockExamineDiagnostics
            {
                ContainerField = containerField,
                ContainerIndexed = containerIndexed,
                ElementFieldsDetected = elementFieldsDetected,
                DedicatedPropertyFields = dedicatedPropertyFields,
                SearchStrategy = ResolveSearchStrategy(containerIndexed, dedicatedPropertyFields),
                Explanation = BuildExplanation(
                    containerField,
                    containerIndexed,
                    dedicatedPropertyFields),
            },
        };
    }

    private static bool IsBlockGridContainer(FilterablePropertyMetadata property)
        => property.SourceCategory == PropertyMetadataSourceCategory.BlockGrid
            || string.Equals(
                property.EditorAlias,
                global::Umbraco.Cms.Core.Constants.PropertyEditors.Aliases.BlockGrid,
                StringComparison.OrdinalIgnoreCase)
            || string.Equals(
                property.ContainerEditorAlias,
                global::Umbraco.Cms.Core.Constants.PropertyEditors.Aliases.BlockGrid,
                StringComparison.OrdinalIgnoreCase);

    private static string ResolveSearchStrategy(
        bool containerIndexed,
        int dedicatedPropertyFields)
    {
        if (dedicatedPropertyFields > 0 && containerIndexed)
        {
            return ContainerSearchMode;
        }

        if (dedicatedPropertyFields > 0)
        {
            return DedicatedPropertySearchMode;
        }

        return containerIndexed
            ? ContainerSearchMode
            : UnavailableSearchMode;
    }

    private static string BuildExplanation(
        string containerField,
        bool containerIndexed,
        int dedicatedPropertyFields)
    {
        if (!containerIndexed)
        {
            return
                $"The Block Grid field ({containerField}) was not found in the Examine index. Individual element properties cannot be queried until indexing is configured.";
        }

        if (dedicatedPropertyFields > 0)
        {
            return
                $"The Block Grid container field ({containerField}) is indexed, and {dedicatedPropertyFields} element property field(s) are indexed separately.";
        }

        return
            $"The Block Grid content is indexed as a single field ({containerField}). Individual element properties are not indexed separately.";
    }
}

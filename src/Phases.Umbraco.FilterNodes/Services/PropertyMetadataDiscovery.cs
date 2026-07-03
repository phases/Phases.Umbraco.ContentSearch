using Phases.Umbraco.FilterNodes.Constants;
using Phases.Umbraco.FilterNodes.Models.Enums;
using Phases.Umbraco.FilterNodes.Models.Responses;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Services;
using Umbraco.Extensions;

namespace Phases.Umbraco.FilterNodes.Services;

/// <summary>
/// Discovers filterable property metadata from document types, compositions, and block editors.
/// </summary>
internal sealed class PropertyMetadataDiscovery
{
    private readonly IContentTypeService _contentTypeService;
    private readonly IDataTypeService _dataTypeService;

    /// <summary>
    /// Initializes a new instance of the <see cref="PropertyMetadataDiscovery"/> class.
    /// </summary>
    /// <param name="contentTypeService">The Umbraco content type service.</param>
    /// <param name="dataTypeService">The Umbraco data type service.</param>
    public PropertyMetadataDiscovery(
        IContentTypeService contentTypeService,
        IDataTypeService dataTypeService)
    {
        _contentTypeService = contentTypeService;
        _dataTypeService = dataTypeService;
    }

    /// <summary>
    /// Discovers all filterable properties for a document type.
    /// </summary>
    /// <param name="contentType">The document type.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>Discovered property metadata.</returns>
    public async Task<IReadOnlyList<FilterablePropertyMetadata>> DiscoverAsync(
        IContentType contentType,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(contentType);

        var properties = new List<FilterablePropertyMetadata>();

        foreach (IPropertyType property in contentType.PropertyTypes)
        {
            cancellationToken.ThrowIfCancellationRequested();
            await AddContentPropertyAsync(
                    property,
                    PropertyMetadataSourceCategory.ContentType,
                    null,
                    properties,
                    cancellationToken)
                .ConfigureAwait(false);
        }

        foreach ((IContentType composition, IPropertyType property) in EnumerateCompositionProperties(
                     contentType,
                     []))
        {
            cancellationToken.ThrowIfCancellationRequested();

            var compositionName = ResolveContentTypeName(composition);

            await AddContentPropertyAsync(
                    property,
                    PropertyMetadataSourceCategory.Composition,
                    compositionName,
                    properties,
                    cancellationToken)
                .ConfigureAwait(false);
        }

        return properties;
    }

    /// <summary>
    /// Resolves metadata for a single property alias on a document type.
    /// </summary>
    /// <param name="contentType">The document type.</param>
    /// <param name="propertyAlias">The property alias.</param>
    /// <param name="cancellationToken">The cancellation token.</param>
    /// <returns>Matching metadata, if found.</returns>
    public async Task<FilterablePropertyMetadata?> ResolvePropertyAsync(
        IContentType contentType,
        string propertyAlias,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(contentType);
        ArgumentException.ThrowIfNullOrWhiteSpace(propertyAlias);

        IReadOnlyList<FilterablePropertyMetadata> properties = await DiscoverAsync(
                contentType,
                cancellationToken)
            .ConfigureAwait(false);

        return properties.FirstOrDefault(property =>
            property.Alias.Equals(propertyAlias, StringComparison.OrdinalIgnoreCase));
    }

    private async Task AddContentPropertyAsync(
        IPropertyType property,
        PropertyMetadataSourceCategory sourceCategory,
        string? sourceName,
        List<FilterablePropertyMetadata> properties,
        CancellationToken cancellationToken)
    {
        IDataType? dataType = await _dataTypeService
            .GetAsync(property.DataTypeKey)
            .ConfigureAwait(false);

        var editorAlias = dataType?.EditorAlias ?? property.PropertyEditorAlias;
        var groupName = PropertyMetadataSourceGroups.GetGroupName(sourceCategory);
        var groupSortOrder = PropertyMetadataSourceGroups.GetGroupSortOrder(sourceCategory);

        if (IsBlockEditor(editorAlias))
        {
            var blockSourceCategory = editorAlias!.Equals(
                    global::Umbraco.Cms.Core.Constants.PropertyEditors.Aliases.BlockGrid,
                    StringComparison.OrdinalIgnoreCase)
                ? PropertyMetadataSourceCategory.BlockGrid
                : PropertyMetadataSourceCategory.BlockList;

            var containerName = property.Name;
            var containerDisplayName = PropertyMetadataSourceGroups.FormatBlockContainerName(
                containerName,
                editorAlias);

            BlockEditorConfigurationReadResult configurationReadResult =
                BlockEditorConfigurationReader.Read(dataType, editorAlias);

            BlockElementDiscoveryResult elementDiscoveryResult = await AddBlockElementPropertiesAsync(
                    property,
                    configurationReadResult,
                    editorAlias,
                    blockSourceCategory,
                    groupName,
                    groupSortOrder,
                    properties,
                    cancellationToken)
                .ConfigureAwait(false);

            properties.Add(
                PropertyFilterMetadataResolver.Resolve(
                    property,
                    dataType,
                    groupName,
                    groupSortOrder,
                    blockSourceCategory,
                    sourceName,
                    containerDisplayName,
                    property.SortOrder,
                    options: new PropertyMetadataOptions
                    {
                        IsFilterable = true,
                        IsContainer = true,
                        ContainerAlias = property.Alias,
                        ContainerName = containerName,
                        ContainerEditorAlias = editorAlias,
                        DisplayPath = [containerName],
                        BlockDiscoveryDiagnostics = new BlockDiscoveryDiagnostics
                        {
                            ConfigurationLoaded = configurationReadResult.ConfigurationLoaded,
                            AllowedBlocksCount = configurationReadResult.AllowedBlocksCount,
                            ResolvedElementTypesCount = elementDiscoveryResult.ResolvedElementTypesCount,
                            ResolvedPropertiesCount = elementDiscoveryResult.ResolvedPropertiesCount,
                        },
                    }));

            return;
        }

        var displayName = BuildHierarchicalDisplayName(sourceName, property.Name);

        properties.Add(
            PropertyFilterMetadataResolver.Resolve(
                property,
                dataType,
                groupName,
                groupSortOrder,
                sourceCategory,
                sourceName,
                displayName,
                property.SortOrder));
    }

    private async Task<BlockElementDiscoveryResult> AddBlockElementPropertiesAsync(
        IPropertyType blockProperty,
        BlockEditorConfigurationReadResult configurationReadResult,
        string editorAlias,
        PropertyMetadataSourceCategory blockSourceCategory,
        string parentGroupName,
        int parentGroupSortOrder,
        List<FilterablePropertyMetadata> properties,
        CancellationToken cancellationToken)
    {
        var containerName = blockProperty.Name;
        var resolvedElementTypesCount = 0;
        var resolvedPropertiesCount = 0;

        foreach (var elementTypeKey in configurationReadResult.ElementTypeKeys)
        {
            cancellationToken.ThrowIfCancellationRequested();

            IContentType? elementType = _contentTypeService.Get(elementTypeKey);
            if (elementType is null)
            {
                continue;
            }

            resolvedElementTypesCount++;

            var elementTypeName = ResolveContentTypeName(elementType);

            foreach (IPropertyType elementProperty in elementType.PropertyTypes)
            {
                cancellationToken.ThrowIfCancellationRequested();

                IDataType? elementDataType = await _dataTypeService
                    .GetAsync(elementProperty.DataTypeKey)
                    .ConfigureAwait(false);

                var alias = BuildBlockPropertyAlias(
                    blockProperty.Alias,
                    elementType.Alias,
                    elementProperty.Alias);

                var displayName = BuildHierarchicalDisplayName(
                    elementTypeName,
                    elementProperty.Name);

                properties.Add(
                    PropertyFilterMetadataResolver.Resolve(
                        elementProperty,
                        elementDataType,
                        parentGroupName,
                        parentGroupSortOrder,
                        blockSourceCategory,
                        elementTypeName,
                        displayName,
                        elementProperty.SortOrder,
                        alias,
                        new PropertyMetadataOptions
                        {
                            IsFilterable = false,
                            ContainerAlias = blockProperty.Alias,
                            ContainerName = containerName,
                            ContainerEditorAlias = editorAlias,
                            ContainerVariesByCulture = blockProperty.VariesByCulture(),
                            ElementTypeAlias = elementType.Alias,
                            ElementTypeName = elementTypeName,
                            DisplayPath =
                            [
                                containerName,
                                elementTypeName,
                                elementProperty.Name,
                            ],
                        }));

                resolvedPropertiesCount++;
            }
        }

        return new BlockElementDiscoveryResult(
            resolvedElementTypesCount,
            resolvedPropertiesCount);
    }

    private sealed record BlockElementDiscoveryResult(
        int ResolvedElementTypesCount,
        int ResolvedPropertiesCount);

    internal static IEnumerable<(IContentType Composition, IPropertyType Property)> EnumerateCompositionProperties(
        IContentType contentType,
        HashSet<Guid> visited)
    {
        foreach (IContentTypeComposition compositionCandidate in contentType.ContentTypeComposition)
        {
            if (compositionCandidate is not IContentType composition)
            {
                continue;
            }

            if (!visited.Add(composition.Key))
            {
                continue;
            }

            foreach (IPropertyType property in composition.PropertyTypes)
            {
                yield return (composition, property);
            }

            foreach (var nested in EnumerateCompositionProperties(composition, visited))
            {
                yield return nested;
            }
        }
    }

    internal static string BuildBlockPropertyAlias(
        string blockPropertyAlias,
        string elementTypeAlias,
        string elementPropertyAlias)
        => string.Join(
            PropertyMetadataSourceGroups.BlockPropertyAliasSeparator,
            blockPropertyAlias,
            elementTypeAlias,
            elementPropertyAlias);

    internal static string BuildHierarchicalDisplayName(string? parentName, string propertyName)
    {
        if (string.IsNullOrWhiteSpace(parentName))
        {
            return propertyName;
        }

        return $"{parentName.Trim()}{PropertyMetadataSourceGroups.HierarchySeparator}{propertyName}";
    }

    private static bool IsBlockEditor(string? editorAlias)
        => !string.IsNullOrWhiteSpace(editorAlias)
            && (editorAlias.Equals(
                    global::Umbraco.Cms.Core.Constants.PropertyEditors.Aliases.BlockList,
                    StringComparison.OrdinalIgnoreCase)
                || editorAlias.Equals(
                    global::Umbraco.Cms.Core.Constants.PropertyEditors.Aliases.BlockGrid,
                    StringComparison.OrdinalIgnoreCase));

    private static string ResolveContentTypeName(IContentType contentType)
        => string.IsNullOrWhiteSpace(contentType.Name) ? contentType.Alias : contentType.Name;
}

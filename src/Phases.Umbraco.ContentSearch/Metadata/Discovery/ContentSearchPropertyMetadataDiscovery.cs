using Phases.Umbraco.ContentSearch.Metadata.Constants;
using Phases.Umbraco.ContentSearch.Metadata.Models;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Services;
using Umbraco.Extensions;

namespace Phases.Umbraco.ContentSearch.Metadata.Discovery;

/// <summary>
/// Discovers searchable property metadata from document types, compositions, and block editors.
/// </summary>
internal sealed class ContentSearchPropertyMetadataDiscovery
{
    private readonly IContentTypeService _contentTypeService;
    private readonly IDataTypeService _dataTypeService;

    /// <summary>
    /// Initializes a new instance of the <see cref="ContentSearchPropertyMetadataDiscovery"/> class.
    /// </summary>
    public ContentSearchPropertyMetadataDiscovery(
        IContentTypeService contentTypeService,
        IDataTypeService dataTypeService)
    {
        _contentTypeService = contentTypeService;
        _dataTypeService = dataTypeService;
    }

    /// <summary>
    /// Discovers all searchable properties for a document type.
    /// </summary>
    public async Task<IReadOnlyList<SearchablePropertyMetadata>> DiscoverAsync(
        IContentType contentType,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(contentType);

        var properties = new List<SearchablePropertyMetadata>();

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

    private async Task AddContentPropertyAsync(
        IPropertyType property,
        PropertyMetadataSourceCategory sourceCategory,
        string? sourceName,
        List<SearchablePropertyMetadata> properties,
        CancellationToken cancellationToken)
    {
        IDataType? dataType = await _dataTypeService
            .GetAsync(property.DataTypeKey)
            .ConfigureAwait(false);

        var editorAlias = dataType?.EditorAlias ?? property.PropertyEditorAlias;
        var groupName = ContentSearchMetadataSourceGroups.GetGroupName(sourceCategory);
        var groupSortOrder = ContentSearchMetadataSourceGroups.GetGroupSortOrder(sourceCategory);

        if (IsBlockEditor(editorAlias))
        {
            var blockSourceCategory = editorAlias!.Equals(
                    global::Umbraco.Cms.Core.Constants.PropertyEditors.Aliases.BlockGrid,
                    StringComparison.OrdinalIgnoreCase)
                ? PropertyMetadataSourceCategory.BlockGrid
                : PropertyMetadataSourceCategory.BlockList;

            var containerName = property.Name;
            var containerDisplayName = ContentSearchMetadataSourceGroups.FormatBlockContainerName(
                containerName,
                editorAlias);

            BlockEditorConfigurationReadResult configurationReadResult =
                BlockEditorConfigurationReader.Read(dataType, editorAlias);

            await AddBlockElementPropertiesAsync(
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
                SearchablePropertyMetadataResolver.Resolve(
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
                        IsSelectable = false,
                        IsContainer = true,
                        ContainerAlias = property.Alias,
                        ContainerName = containerName,
                        ContainerEditorAlias = editorAlias,
                        DisplayPath = [containerName],
                    }));

            return;
        }

        var displayName = ContentSearchMetadataSourceGroups.BuildHierarchicalDisplayName(
            sourceName,
            property.Name);

        properties.Add(
            SearchablePropertyMetadataResolver.Resolve(
                property,
                dataType,
                groupName,
                groupSortOrder,
                sourceCategory,
                sourceName,
                displayName,
                property.SortOrder));
    }

    private async Task AddBlockElementPropertiesAsync(
        IPropertyType blockProperty,
        BlockEditorConfigurationReadResult configurationReadResult,
        string editorAlias,
        PropertyMetadataSourceCategory blockSourceCategory,
        string parentGroupName,
        int parentGroupSortOrder,
        List<SearchablePropertyMetadata> properties,
        CancellationToken cancellationToken)
    {
        var containerName = blockProperty.Name;

        foreach (var elementTypeKey in configurationReadResult.ElementTypeKeys)
        {
            cancellationToken.ThrowIfCancellationRequested();

            IContentType? elementType = _contentTypeService.Get(elementTypeKey);
            if (elementType is null)
            {
                continue;
            }

            var elementTypeName = ResolveContentTypeName(elementType);

            foreach (IPropertyType elementProperty in elementType.PropertyTypes)
            {
                cancellationToken.ThrowIfCancellationRequested();

                IDataType? elementDataType = await _dataTypeService
                    .GetAsync(elementProperty.DataTypeKey)
                    .ConfigureAwait(false);

                var alias = ContentSearchMetadataSourceGroups.BuildBlockPropertyAlias(
                    blockProperty.Alias,
                    elementType.Alias,
                    elementProperty.Alias);

                var displayName = ContentSearchMetadataSourceGroups.BuildHierarchicalDisplayName(
                    elementTypeName,
                    elementProperty.Name);

                properties.Add(
                    SearchablePropertyMetadataResolver.Resolve(
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
                            IsSelectable = true,
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
            }
        }
    }

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

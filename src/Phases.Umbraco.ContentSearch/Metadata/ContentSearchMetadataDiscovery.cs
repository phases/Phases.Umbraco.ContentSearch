using Phases.Umbraco.ContentSearch.Metadata.Constants;
using Phases.Umbraco.ContentSearch.Metadata.Discovery;
using Phases.Umbraco.ContentSearch.Metadata.Exceptions;
using Phases.Umbraco.ContentSearch.Metadata.Models;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Services;

namespace Phases.Umbraco.ContentSearch.Metadata;

/// <summary>
/// Discovers schema metadata from Umbraco services for building the search UI.
/// </summary>
public sealed class ContentSearchMetadataDiscovery : IContentSearchMetadataDiscovery
{
    private readonly IContentTypeService _contentTypeService;
    private readonly IDataTypeService _dataTypeService;
    private readonly ILanguageService _languageService;
    private readonly ContentSearchPropertyMetadataDiscovery _propertyMetadataDiscovery;

    /// <summary>
    /// Initializes a new instance of the <see cref="ContentSearchMetadataDiscovery"/> class.
    /// </summary>
    public ContentSearchMetadataDiscovery(
        IContentTypeService contentTypeService,
        IDataTypeService dataTypeService,
        ILanguageService languageService)
    {
        _contentTypeService = contentTypeService;
        _dataTypeService = dataTypeService;
        _languageService = languageService;
        _propertyMetadataDiscovery = new ContentSearchPropertyMetadataDiscovery(
            contentTypeService,
            dataTypeService);
    }

    /// <inheritdoc />
    public Task<IReadOnlyList<ContentTypeMetadata>> GetContentTypesAsync(
        MetadataDomain domain = MetadataDomain.Content,
        CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        return domain switch
        {
            MetadataDomain.Content => Task.FromResult(GetContentTypes()),
            MetadataDomain.Media or MetadataDomain.Member or MetadataDomain.Dictionary =>
                throw new NotSupportedException(
                    $"Metadata discovery for '{domain}' is not yet supported."),
            _ => throw new ArgumentOutOfRangeException(nameof(domain), domain, null),
        };
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<SearchablePropertyMetadata>> GetPropertiesAsync(
        string contentTypeAlias,
        MetadataDomain domain = MetadataDomain.Content,
        CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();
        ArgumentException.ThrowIfNullOrWhiteSpace(contentTypeAlias);

        if (ContentSearchMetadataConstants.IsReservedContentTypeAlias(contentTypeAlias))
        {
            throw new ArgumentException(
                $"The content type alias '{contentTypeAlias}' is reserved.",
                nameof(contentTypeAlias));
        }

        return domain switch
        {
            MetadataDomain.Content => await DiscoverContentPropertiesAsync(
                    contentTypeAlias,
                    cancellationToken)
                .ConfigureAwait(false),
            MetadataDomain.Media or MetadataDomain.Member or MetadataDomain.Dictionary =>
                throw new NotSupportedException(
                    $"Metadata discovery for '{domain}' is not yet supported."),
            _ => throw new ArgumentOutOfRangeException(nameof(domain), domain, null),
        };
    }

    private IReadOnlyList<ContentTypeMetadata> GetContentTypes()
        => _contentTypeService
            .GetAll()
            .Where(static contentType => !contentType.IsElement)
            .Where(static contentType =>
                !ContentSearchMetadataConstants.IsReservedContentTypeAlias(contentType.Alias))
            .GroupBy(static contentType => contentType.Alias, StringComparer.OrdinalIgnoreCase)
            .Select(static group => group.First())
            .Select(static contentType => new ContentTypeMetadata
            {
                Alias = contentType.Alias,
                Name = string.IsNullOrWhiteSpace(contentType.Name)
                    ? contentType.Alias
                    : contentType.Name,
                Icon = contentType.Icon,
            })
            .OrderBy(static contentType => contentType.Name, StringComparer.OrdinalIgnoreCase)
            .ToArray();

    private async Task<IReadOnlyList<SearchablePropertyMetadata>> DiscoverContentPropertiesAsync(
        string contentTypeAlias,
        CancellationToken cancellationToken)
    {
        IContentType? contentType = _contentTypeService.Get(contentTypeAlias);
        if (contentType is null)
        {
            throw new ContentTypeNotFoundException(contentTypeAlias);
        }

        var properties = new List<SearchablePropertyMetadata>(
            await _propertyMetadataDiscovery
                .DiscoverAsync(contentType, cancellationToken)
                .ConfigureAwait(false));

        properties.AddRange(SystemPropertyMetadataProvider.GetSystemProperties());

        IReadOnlyList<string> cultureIsoCodes = await GetCultureIsoCodesAsync(cancellationToken)
            .ConfigureAwait(false);

        return FinalizeProperties(properties, cultureIsoCodes);
    }

    private async Task<IReadOnlyList<string>> GetCultureIsoCodesAsync(CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();

        IEnumerable<ILanguage> languages = await _languageService.GetAllAsync().ConfigureAwait(false);

        return languages
            .Select(static language => language.IsoCode)
            .Where(static isoCode => !string.IsNullOrWhiteSpace(isoCode))
            .ToArray();
    }

    private static IReadOnlyList<SearchablePropertyMetadata> FinalizeProperties(
        IEnumerable<SearchablePropertyMetadata> properties,
        IReadOnlyList<string> cultureIsoCodes)
        => properties
            .GroupBy(static property => property.Alias, StringComparer.OrdinalIgnoreCase)
            .Select(static group => group.First())
            .Select(property => AttachCultures(property, cultureIsoCodes))
            .OrderBy(static property => property.GroupSortOrder)
            .ThenBy(static property => property.SortOrder)
            .ThenBy(static property => property.Name, StringComparer.OrdinalIgnoreCase)
            .ToArray();

    private static SearchablePropertyMetadata AttachCultures(
        SearchablePropertyMetadata property,
        IReadOnlyList<string> cultureIsoCodes)
    {
        if (!property.VariesByCulture)
        {
            return property;
        }

        return new SearchablePropertyMetadata
        {
            Alias = property.Alias,
            Name = property.Name,
            EditorAlias = property.EditorAlias,
            DataTypeId = property.DataTypeId,
            SourceCategory = property.SourceCategory,
            SourceName = property.SourceName,
            GroupName = property.GroupName,
            GroupSortOrder = property.GroupSortOrder,
            SortOrder = property.SortOrder,
            VariesByCulture = property.VariesByCulture,
            IsContainer = property.IsContainer,
            IsSelectable = property.IsSelectable,
            ContainerAlias = property.ContainerAlias,
            ElementTypeAlias = property.ElementTypeAlias,
            DisplayPath = property.DisplayPath,
            AvailableCultures = cultureIsoCodes,
        };
    }
}

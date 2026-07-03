using Phases.Umbraco.ContentSearch.Caching;
using Phases.Umbraco.ContentSearch.Examine;
using Phases.Umbraco.ContentSearch.Metadata.Models;
using Umbraco.Cms.Core.Cache;
using Umbraco.Cms.Core.Events;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Notifications;
using Umbraco.Cms.Core.Services;

namespace Phases.Umbraco.ContentSearch.Caching.Notifications;

/// <summary>
/// Invalidates cached metadata when data type configuration changes.
/// </summary>
public sealed class ContentSearchDataTypeCacheInvalidationNotificationHandler :
    INotificationHandler<DataTypeSavedNotification>,
    INotificationHandler<DataTypeDeletedNotification>,
    INotificationHandler<DataTypeCacheRefresherNotification>
{
    private readonly IContentSearchMetadataCache _metadataCache;
    private readonly IContentTypeService _contentTypeService;
    private readonly IExamineIndexFieldCatalog _examineIndexFieldCatalog;

    /// <summary>
    /// Initializes a new instance of the
    /// <see cref="ContentSearchDataTypeCacheInvalidationNotificationHandler"/> class.
    /// </summary>
    public ContentSearchDataTypeCacheInvalidationNotificationHandler(
        IContentSearchMetadataCache metadataCache,
        IContentTypeService contentTypeService,
        IExamineIndexFieldCatalog examineIndexFieldCatalog)
    {
        _metadataCache = metadataCache;
        _contentTypeService = contentTypeService;
        _examineIndexFieldCatalog = examineIndexFieldCatalog;
    }

    /// <inheritdoc />
    public void Handle(DataTypeSavedNotification notification)
        => InvalidateDataTypes(notification.SavedEntities);

    /// <inheritdoc />
    public void Handle(DataTypeDeletedNotification notification)
        => InvalidateDataTypes(notification.DeletedEntities);

    /// <inheritdoc />
    public void Handle(DataTypeCacheRefresherNotification notification)
    {
        if (notification.MessageObject is not DataTypeCacheRefresher.JsonPayload[] payloads)
        {
            return;
        }

        var dataTypeIds = payloads
            .Select(static payload => payload.Id)
            .ToHashSet();

        if (dataTypeIds.Count == 0)
        {
            return;
        }

        InvalidateContentTypesUsingDataTypes(dataTypeIds);
    }

    private void InvalidateDataTypes(IEnumerable<IDataType> dataTypes)
    {
        var dataTypeIds = dataTypes
            .Select(static dataType => dataType.Id)
            .ToHashSet();

        if (dataTypeIds.Count == 0)
        {
            return;
        }

        InvalidateContentTypesUsingDataTypes(dataTypeIds);
    }

    private void InvalidateContentTypesUsingDataTypes(IReadOnlySet<int> dataTypeIds)
    {
        foreach (IContentType contentType in _contentTypeService.GetAll())
        {
            if (contentType.IsElement)
            {
                continue;
            }

            if (contentType.PropertyTypes.Any(property => dataTypeIds.Contains(property.DataTypeId)))
            {
                _metadataCache.InvalidateProperties(MetadataDomain.Content, contentType.Alias);
            }
        }

        _examineIndexFieldCatalog.Invalidate();
    }
}

using Phases.Umbraco.FilterNodes.Caching;
using Umbraco.Cms.Core.Cache;
using Umbraco.Cms.Core.Events;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Notifications;
using Umbraco.Cms.Core.Services;

namespace Phases.Umbraco.FilterNodes.Caching.Notifications;

/// <summary>
/// Invalidates cached Filter Nodes metadata when data type configuration changes.
/// </summary>
public sealed class FilterNodesDataTypeCacheInvalidationNotificationHandler :
    INotificationHandler<DataTypeSavedNotification>,
    INotificationHandler<DataTypeDeletedNotification>,
    INotificationHandler<DataTypeCacheRefresherNotification>
{
    private readonly IPropertyMetadataCache _metadataCache;
    private readonly IContentTypeService _contentTypeService;

    /// <summary>
    /// Initializes a new instance of the
    /// <see cref="FilterNodesDataTypeCacheInvalidationNotificationHandler"/> class.
    /// </summary>
    /// <param name="metadataCache">The metadata cache.</param>
    /// <param name="contentTypeService">The content type service.</param>
    public FilterNodesDataTypeCacheInvalidationNotificationHandler(
        IPropertyMetadataCache metadataCache,
        IContentTypeService contentTypeService)
    {
        _metadataCache = metadataCache;
        _contentTypeService = contentTypeService;
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
                _metadataCache.InvalidatePropertyAliases(contentType.Alias);
            }
        }
    }
}

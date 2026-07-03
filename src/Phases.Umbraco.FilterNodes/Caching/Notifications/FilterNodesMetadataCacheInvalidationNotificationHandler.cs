using Phases.Umbraco.FilterNodes.Caching;
using Phases.Umbraco.FilterNodes.Services.Examine;
using Umbraco.Cms.Core.Cache;
using Umbraco.Cms.Core.Events;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Notifications;
using Umbraco.Cms.Core.Services;

namespace Phases.Umbraco.FilterNodes.Caching.Notifications;

/// <summary>
/// Invalidates cached Filter Nodes metadata when document type schema changes.
/// </summary>
public sealed class FilterNodesMetadataCacheInvalidationNotificationHandler :
    INotificationHandler<ContentTypeSavedNotification>,
    INotificationHandler<ContentTypeDeletedNotification>,
    INotificationHandler<ContentTypeMovedNotification>,
    INotificationHandler<ContentTypeCacheRefresherNotification>
{
    private readonly IPropertyMetadataCache _metadataCache;
    private readonly IContentTypeService _contentTypeService;
    private readonly IExamineIndexFieldCatalog _fieldCatalog;

    /// <summary>
    /// Initializes a new instance of the
    /// <see cref="FilterNodesMetadataCacheInvalidationNotificationHandler"/> class.
    /// </summary>
    /// <param name="metadataCache">The metadata cache.</param>
    /// <param name="contentTypeService">The content type service.</param>
    /// <param name="fieldCatalog">The Examine field catalog.</param>
    public FilterNodesMetadataCacheInvalidationNotificationHandler(
        IPropertyMetadataCache metadataCache,
        IContentTypeService contentTypeService,
        IExamineIndexFieldCatalog fieldCatalog)
    {
        _metadataCache = metadataCache;
        _contentTypeService = contentTypeService;
        _fieldCatalog = fieldCatalog;
    }

    /// <inheritdoc />
    public void Handle(ContentTypeSavedNotification notification)
        => InvalidateDocumentTypes(notification.SavedEntities);

    /// <inheritdoc />
    public void Handle(ContentTypeDeletedNotification notification)
        => InvalidateDocumentTypes(notification.DeletedEntities);

    /// <inheritdoc />
    public void Handle(ContentTypeMovedNotification notification)
    {
        _metadataCache.InvalidateContentTypeAliases();
        _fieldCatalog.Invalidate();
    }

    /// <inheritdoc />
    public void Handle(ContentTypeCacheRefresherNotification notification)
    {
        if (notification.MessageObject is not ContentTypeCacheRefresher.JsonPayload[] payloads)
        {
            return;
        }

        var documentTypePayloads = payloads
            .Where(static payload => payload.ItemType == nameof(IContentType))
            .ToArray();

        if (documentTypePayloads.Length == 0)
        {
            return;
        }

        _metadataCache.InvalidateContentTypeAliases();
        _fieldCatalog.Invalidate();

        foreach (var payload in documentTypePayloads)
        {
            IContentType? contentType = _contentTypeService.Get(payload.Id);
            if (contentType is not null && !contentType.IsElement)
            {
                _metadataCache.InvalidatePropertyAliases(contentType.Alias);
            }
        }
    }

    private void InvalidateDocumentTypes(IEnumerable<IContentType> contentTypes)
    {
        var documentTypes = contentTypes
            .Where(static contentType => !contentType.IsElement)
            .ToArray();

        if (documentTypes.Length == 0)
        {
            return;
        }

        _metadataCache.InvalidateContentTypeAliases();
        _fieldCatalog.Invalidate();

        foreach (IContentType contentType in documentTypes)
        {
            _metadataCache.InvalidatePropertyAliases(contentType.Alias);
        }
    }
}

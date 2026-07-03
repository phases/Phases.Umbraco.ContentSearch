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
/// Invalidates cached metadata when document type schema changes.
/// </summary>
public sealed class ContentSearchMetadataCacheInvalidationNotificationHandler :
    INotificationHandler<ContentTypeSavedNotification>,
    INotificationHandler<ContentTypeDeletedNotification>,
    INotificationHandler<ContentTypeMovedNotification>,
    INotificationHandler<ContentTypeCacheRefresherNotification>
{
    private readonly IContentSearchMetadataCache _metadataCache;
    private readonly IContentTypeService _contentTypeService;
    private readonly IExamineIndexFieldCatalog _examineIndexFieldCatalog;

    /// <summary>
    /// Initializes a new instance of the
    /// <see cref="ContentSearchMetadataCacheInvalidationNotificationHandler"/> class.
    /// </summary>
    public ContentSearchMetadataCacheInvalidationNotificationHandler(
        IContentSearchMetadataCache metadataCache,
        IContentTypeService contentTypeService,
        IExamineIndexFieldCatalog examineIndexFieldCatalog)
    {
        _metadataCache = metadataCache;
        _contentTypeService = contentTypeService;
        _examineIndexFieldCatalog = examineIndexFieldCatalog;
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
        _metadataCache.InvalidateContentTypes(MetadataDomain.Content);
        _examineIndexFieldCatalog.Invalidate();
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

        _metadataCache.InvalidateContentTypes(MetadataDomain.Content);

        foreach (var payload in documentTypePayloads)
        {
            IContentType? contentType = _contentTypeService.Get(payload.Id);
            if (contentType is not null && !contentType.IsElement)
            {
                _metadataCache.InvalidateProperties(MetadataDomain.Content, contentType.Alias);
            }
        }

        _examineIndexFieldCatalog.Invalidate();
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

        _metadataCache.InvalidateContentTypes(MetadataDomain.Content);

        foreach (IContentType contentType in documentTypes)
        {
            _metadataCache.InvalidateProperties(MetadataDomain.Content, contentType.Alias);
        }

        _examineIndexFieldCatalog.Invalidate();
    }
}

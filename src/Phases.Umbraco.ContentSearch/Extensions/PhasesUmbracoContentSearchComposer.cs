using Microsoft.Extensions.DependencyInjection;
using Phases.Umbraco.ContentSearch.Caching.Notifications;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using Umbraco.Cms.Core.Notifications;
using Umbraco.Cms.Infrastructure.Manifest;

namespace Phases.Umbraco.ContentSearch.Extensions;

/// <summary>
/// Umbraco composer that registers the Content Search package with the application.
/// </summary>
public sealed class PhasesUmbracoContentSearchComposer : IComposer
{
    /// <inheritdoc />
    public void Compose(IUmbracoBuilder builder)
    {
        builder.AddContentSearch();
        builder.Services.AddSingleton<IPackageManifestReader, ContentSearchPackageManifestReader>();
        builder.AddNotificationAsyncHandler<
            UmbracoApplicationStartedNotification,
            ContentSearchSectionPermissionNotificationHandler>();

        builder.AddNotificationHandler<ContentTypeSavedNotification, ContentSearchMetadataCacheInvalidationNotificationHandler>();
        builder.AddNotificationHandler<ContentTypeDeletedNotification, ContentSearchMetadataCacheInvalidationNotificationHandler>();
        builder.AddNotificationHandler<ContentTypeMovedNotification, ContentSearchMetadataCacheInvalidationNotificationHandler>();
        builder.AddNotificationHandler<ContentTypeCacheRefresherNotification, ContentSearchMetadataCacheInvalidationNotificationHandler>();
        builder.AddNotificationHandler<DataTypeSavedNotification, ContentSearchDataTypeCacheInvalidationNotificationHandler>();
        builder.AddNotificationHandler<DataTypeDeletedNotification, ContentSearchDataTypeCacheInvalidationNotificationHandler>();
        builder.AddNotificationHandler<DataTypeCacheRefresherNotification, ContentSearchDataTypeCacheInvalidationNotificationHandler>();
    }
}

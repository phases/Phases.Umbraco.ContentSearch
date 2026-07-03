using Microsoft.Extensions.DependencyInjection;
using Microsoft.OpenApi;
using Phases.Umbraco.FilterNodes.Api.OpenApi;
using Phases.Umbraco.FilterNodes.Caching;
using Phases.Umbraco.FilterNodes.Caching.Notifications;
using Phases.Umbraco.FilterNodes.Constants;
using Phases.Umbraco.FilterNodes.Repositories;
using Phases.Umbraco.FilterNodes.Repositories.Interfaces;
using Phases.Umbraco.FilterNodes.Repositories.Mappers;
using Phases.Umbraco.FilterNodes.Services;
using Phases.Umbraco.FilterNodes.Services.Caching;
using Phases.Umbraco.FilterNodes.Services.Examine;
using Phases.Umbraco.FilterNodes.Services.Interfaces;
using Phases.Umbraco.FilterNodes.Services.Normalization;
using Phases.Umbraco.FilterNodes.Services.Validation;
using Swashbuckle.AspNetCore.SwaggerGen;
using Umbraco.Cms.Api.Common.OpenApi;
using Umbraco.Cms.Core.DependencyInjection;
using Umbraco.Cms.Core.Notifications;

namespace Phases.Umbraco.FilterNodes.Extensions;

/// <summary>
/// Extension methods for registering Phases Umbraco Filter Nodes services.
/// </summary>
public static class UmbracoBuilderExtensions
{
    /// <summary>
    /// Registers all services, repositories, and OpenAPI configuration for the Filter Nodes package.
    /// </summary>
    /// <param name="builder">The Umbraco builder.</param>
    /// <returns>The Umbraco builder for method chaining.</returns>
    public static IUmbracoBuilder AddFilterNodes(this IUmbracoBuilder builder)
    {
        ArgumentNullException.ThrowIfNull(builder);

        RegisterServices(builder.Services);
        RegisterCacheInvalidation(builder);
        ConfigureOpenApi(builder.Services);

        return builder;
    }

    private static void RegisterServices(IServiceCollection services)
    {
        services.AddSingleton<IOperationIdHandler, FilterNodesOperationIdHandler>();
        services.AddSingleton<IFilterNodesCache, FilterNodesCache>();
        services.AddSingleton<IPropertyMetadataCache, PropertyMetadataCache>();

        services.AddSingleton<IExamineIndexFieldCatalog, ExamineIndexFieldCatalog>();
        services.AddSingleton<IExamineFieldResolver, ExamineFieldResolver>();
        services.AddScoped<ILanguageQueryService, LanguageQueryService>();
        services.AddScoped<PropertyIndexCapabilityEnricher>();

        services.AddScoped<IPingService, PingService>();
        services.AddScoped<IFilterRequestValidator, FilterRequestValidator>();
        services.AddScoped<IFilterRequestNormalizer, FilterRequestNormalizer>();
        services.AddScoped<INodeFilterService, NodeFilterService>();
        services.AddScoped<PropertyMetadataService>();
        services.AddScoped<IPropertyMetadataService, CachedPropertyMetadataService>();
        services.AddScoped<IExamineQueryBuilder, ExamineQueryBuilder>();
        services.AddScoped<IPublishedContentUrlResolver, PublishedContentUrlResolver>();
        services.AddScoped<INodeSearchResultMapper, NodeSearchResultMapper>();
        services.AddScoped<IContentRepository, ContentRepository>();
        services.AddScoped<IContentNodeRepository, ContentNodeRepository>();
        services.AddScoped<ISavedFilterService, SavedFilterService>();
    }

    private static void RegisterCacheInvalidation(IUmbracoBuilder builder)
    {
        builder.AddNotificationHandler<ContentTypeSavedNotification, FilterNodesMetadataCacheInvalidationNotificationHandler>();
        builder.AddNotificationHandler<ContentTypeDeletedNotification, FilterNodesMetadataCacheInvalidationNotificationHandler>();
        builder.AddNotificationHandler<ContentTypeMovedNotification, FilterNodesMetadataCacheInvalidationNotificationHandler>();
        builder.AddNotificationHandler<ContentTypeCacheRefresherNotification, FilterNodesMetadataCacheInvalidationNotificationHandler>();
        builder.AddNotificationHandler<DataTypeSavedNotification, FilterNodesDataTypeCacheInvalidationNotificationHandler>();
        builder.AddNotificationHandler<DataTypeDeletedNotification, FilterNodesDataTypeCacheInvalidationNotificationHandler>();
        builder.AddNotificationHandler<DataTypeCacheRefresherNotification, FilterNodesDataTypeCacheInvalidationNotificationHandler>();
    }

    private static void ConfigureOpenApi(IServiceCollection services)
    {
        services.Configure<SwaggerGenOptions>(options =>
        {
            options.SwaggerDoc(FilterNodesApiConstants.ApiName, new OpenApiInfo
            {
                Title = "Phases Umbraco Filter Nodes Backoffice API",
                Version = "1.0",
            });

            options.OperationFilter<FilterNodesOperationSecurityFilter>();
        });
    }
}

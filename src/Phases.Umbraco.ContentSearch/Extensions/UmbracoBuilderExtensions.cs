using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.OpenApi;
using OpenIddict.Validation.AspNetCore;
using Phases.Umbraco.ContentSearch.Api.OpenApi;
using Phases.Umbraco.ContentSearch.Authorization;
using Phases.Umbraco.ContentSearch.Caching;
using Phases.Umbraco.ContentSearch.Configuration;
using Phases.Umbraco.ContentSearch.Constants;
using Phases.Umbraco.ContentSearch.Examine;
using Phases.Umbraco.ContentSearch.Export;
using Phases.Umbraco.ContentSearch.Localization;
using Phases.Umbraco.ContentSearch.Metadata;
using Phases.Umbraco.ContentSearch.Search;
using Phases.Umbraco.ContentSearch.Search.Mapping;
using Phases.Umbraco.ContentSearch.Search.Normalization;
using Phases.Umbraco.ContentSearch.Search.Operators;
using Phases.Umbraco.ContentSearch.Presets;
using Phases.Umbraco.ContentSearch.SavedSearches;
using Phases.Umbraco.ContentSearch.Services;
using Swashbuckle.AspNetCore.SwaggerGen;
using Umbraco.Cms.Api.Common.OpenApi;
using Umbraco.Cms.Core.DependencyInjection;

namespace Phases.Umbraco.ContentSearch.Extensions;

/// <summary>
/// Extension methods for registering Phases Umbraco Content Search services.
/// </summary>
public static class UmbracoBuilderExtensions
{
    /// <summary>
    /// Registers all services and OpenAPI configuration for the Content Search package.
    /// </summary>
    /// <param name="builder">The Umbraco builder.</param>
    /// <returns>The Umbraco builder for method chaining.</returns>
    public static IUmbracoBuilder AddContentSearch(this IUmbracoBuilder builder)
    {
        ArgumentNullException.ThrowIfNull(builder);

        RegisterConfiguration(builder);
        RegisterAuthorization(builder);
        RegisterApiServices(builder.Services);
        RegisterSearchServices(builder.Services);
        RegisterExportServices(builder.Services);
        RegisterExamineServices(builder.Services);
        RegisterMetadataServices(builder.Services);
        RegisterCachingServices(builder.Services);
        RegisterSavedSearchServices(builder.Services);
        RegisterPresetServices(builder.Services);
        RegisterLocalizationServices(builder.Services);
        RegisterCultureServices(builder.Services);

        return builder;
    }

    private static void RegisterConfiguration(IUmbracoBuilder builder)
    {
        builder.Services.Configure<ContentSearchOptions>(
            builder.Config.GetSection(ContentSearchOptions.SectionName));
    }

    private static void RegisterAuthorization(IUmbracoBuilder builder)
    {
        builder.Services.AddSingleton<IAuthorizationHandler, ContentSearchSectionAccessAuthorizationHandler>();

        builder.Services.AddAuthorization(options =>
            options.AddPolicy(
                ContentSearchAuthorizationPolicies.SectionAccessContentSearch,
                policy =>
                {
                    policy.AuthenticationSchemes.Add(
                        OpenIddictValidationAspNetCoreDefaults.AuthenticationScheme);
                    policy.Requirements.Add(new ContentSearchSectionAccessRequirement());
                }));
    }

    private static void RegisterApiServices(IServiceCollection services)
    {
        services.AddSingleton<IOperationIdHandler, ContentSearchOperationIdHandler>();
        services.AddScoped<IPingService, PingService>();

        services.Configure<SwaggerGenOptions>(options =>
        {
            options.SwaggerDoc(ContentSearchApiConstants.ApiName, new OpenApiInfo
            {
                Title = "Phases Umbraco Content Search Backoffice API",
                Version = "1.0",
            });

            options.OperationFilter<ContentSearchOperationSecurityFilter>();
        });
    }

    private static void RegisterSearchServices(IServiceCollection services)
    {
        services.AddScoped<IContentSearchRequestNormalizer, ContentSearchRequestNormalizer>();
        services.AddScoped<ISearchOperatorResolver, SearchOperatorResolver>();
        services.AddScoped<IContentSearchExamineQueryBuilder, ContentSearchExamineQueryBuilder>();
        services.AddScoped<IContentSearchResultMatchExtractor, ContentSearchResultMatchExtractor>();
        services.AddScoped<IContentSearchResultMapper, ContentSearchResultMapper>();
        services.AddScoped<IExamineSearchPipeline, ExamineSearchPipeline>();
        services.AddScoped<IContentSearchExecutor, ContentSearchExecutor>();
        services.AddScoped<IContentSearchService, ContentSearchService>();
        services.AddScoped<IContentSearchUserAccessService, ContentSearchUserAccessService>();
        services.AddScoped<IContentSearchPublishedUrlResolver, ContentSearchPublishedUrlResolver>();
        services.AddScoped<IContentSearchCultureMatchEvaluator, ContentSearchCultureMatchEvaluator>();
        services.AddScoped<IContentSearchResultEnricher, ContentSearchResultEnricher>();
    }

    private static void RegisterExportServices(IServiceCollection services)
    {
        services.AddScoped<IExportService, CsvExportService>();
        services.AddScoped<IExportService, ExcelExportService>();
        services.AddScoped<IContentExportManager, ContentExportManager>();
    }

    private static void RegisterExamineServices(IServiceCollection services)
    {
        services.AddSingleton<IExamineIndexFieldCatalog, ExamineIndexFieldCatalog>();
        services.AddSingleton<IContentSearchFieldResolver, ContentSearchFieldResolver>();
        services.AddSingleton<IExamineIndexResolver, ExamineIndexResolver>();
    }

    private static void RegisterMetadataServices(IServiceCollection services)
    {
        services.AddSingleton<IContentSearchMetadataDiscovery, ContentSearchMetadataDiscovery>();
        services.AddSingleton<IContentSearchMetadataService, ContentSearchMetadataService>();
    }

    private static void RegisterCachingServices(IServiceCollection services)
    {
        services.AddSingleton<IContentSearchRuntimeCache, ContentSearchRuntimeCache>();
        services.AddSingleton<IContentSearchMetadataCache, ContentSearchMetadataCache>();
    }

    private static void RegisterSavedSearchServices(IServiceCollection services)
    {
        services.AddScoped<ISavedSearchService, SavedSearchService>();
    }

    private static void RegisterPresetServices(IServiceCollection services)
    {
        services.AddSingleton<IContentSearchPresetCatalog, ContentSearchPresetCatalog>();
    }

    private static void RegisterLocalizationServices(IServiceCollection services)
    {
        services.AddSingleton<IContentSearchLocalizationService, ContentSearchLocalizationService>();
    }

    private static void RegisterCultureServices(IServiceCollection services)
    {
        services.AddSingleton<ILanguageQueryService, LanguageQueryService>();
    }
}

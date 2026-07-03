using Phases.Umbraco.ContentSearch.Examine;
using Phases.Umbraco.ContentSearch.Metadata.Constants;
using Phases.Umbraco.ContentSearch.Models;
using Phases.Umbraco.ContentSearch.Search.Mapping;
using Phases.Umbraco.ContentSearch.Search.Models;
using Phases.Umbraco.ContentSearch.Services;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Services;
using Umbraco.Extensions;

namespace Phases.Umbraco.ContentSearch.Services;

/// <summary>
/// Enriches search results with editor-friendly display values from Umbraco services.
/// </summary>
public interface IContentSearchResultEnricher
{
    /// <summary>
    /// Enriches search results with path, date, and URL display values.
    /// </summary>
    IReadOnlyList<ContentSearchResultItem> Enrich(
        IReadOnlyList<ContentSearchResultItem> items,
        ContentSearchEnrichmentContext context);
}

/// <summary>
/// Default implementation of <see cref="IContentSearchResultEnricher"/>.
/// </summary>
public sealed class ContentSearchResultEnricher : IContentSearchResultEnricher
{
    private readonly IContentService _contentService;
    private readonly IContentTypeService _contentTypeService;
    private readonly IContentSearchPublishedUrlResolver _publishedUrlResolver;
    private readonly IContentSearchFieldResolver _fieldResolver;
    private readonly IContentSearchResultMatchExtractor _matchExtractor;
    private readonly IContentSearchCultureMatchEvaluator _cultureMatchEvaluator;

    /// <summary>
    /// Initializes a new instance of the <see cref="ContentSearchResultEnricher"/> class.
    /// </summary>
    public ContentSearchResultEnricher(
        IContentService contentService,
        IContentTypeService contentTypeService,
        IContentSearchPublishedUrlResolver publishedUrlResolver,
        IContentSearchFieldResolver fieldResolver,
        IContentSearchResultMatchExtractor matchExtractor,
        IContentSearchCultureMatchEvaluator cultureMatchEvaluator)
    {
        _contentService = contentService;
        _contentTypeService = contentTypeService;
        _publishedUrlResolver = publishedUrlResolver;
        _fieldResolver = fieldResolver;
        _matchExtractor = matchExtractor;
        _cultureMatchEvaluator = cultureMatchEvaluator;
    }

    /// <inheritdoc />
    public IReadOnlyList<ContentSearchResultItem> Enrich(
        IReadOnlyList<ContentSearchResultItem> items,
        ContentSearchEnrichmentContext context)
    {
        ArgumentNullException.ThrowIfNull(items);
        ArgumentNullException.ThrowIfNull(context);
        ArgumentNullException.ThrowIfNull(context.CultureContext);

        if (items.Count == 0)
        {
            return items;
        }

        var culture = context.CultureContext.IsSingleCulture ? context.CultureContext.Culture : null;
        var contents = _contentService
            .GetByIds(items.Select(item => item.Id))
            .ToDictionary(content => content.Id);

        var nameCache = new Dictionary<int, string>();

        if (context.CultureContext.IsSingleCulture)
        {
            return items
                .Select(item => EnrichItem(item, contents, nameCache, culture, context))
                .ToArray();
        }

        return items
            .SelectMany(item => ExpandItemForAllCultures(item, contents, nameCache, context))
            .ToArray();
    }

    private IEnumerable<ContentSearchResultItem> ExpandItemForAllCultures(
        ContentSearchResultItem item,
        IReadOnlyDictionary<int, IContent> contents,
        IDictionary<int, string> nameCache,
        ContentSearchEnrichmentContext context)
    {
        if (!contents.TryGetValue(item.Id, out var content))
        {
            yield return item;
            yield break;
        }

        var indexValues = item.IndexFieldValues ?? new Dictionary<string, string>();

        foreach (var culture in GetExpansionCultures(content, context))
        {
            if (!MatchesExpandedCulture(content, culture, indexValues, context))
            {
                continue;
            }

            yield return EnrichItem(item, contents, nameCache, culture, context);
        }
    }

    private bool MatchesExpandedCulture(
        IContent content,
        string? culture,
        IReadOnlyDictionary<string, string> indexValues,
        ContentSearchEnrichmentContext context)
    {
        var conditions = context.Conditions
            .Where(static condition =>
                !PublishStatusFilterValues.IsPublishStatusProperty(condition.PropertyAlias))
            .ToArray();

        if (!string.IsNullOrWhiteSpace(culture))
        {
            if (conditions.Length == 0)
            {
                return true;
            }

            return _cultureMatchEvaluator.MatchesCulture(
                content,
                culture,
                indexValues,
                conditions,
                context.MatchMode);
        }

        var contentConditions = conditions
            .Where(SearchConditionContentEvaluator.RequiresContentEvaluation)
            .ToArray();

        if (contentConditions.Length == 0)
        {
            return true;
        }

        return SearchConditionContentEvaluator.Matches(
            content,
            contentConditions,
            context.MatchMode,
            culture: null,
            _contentTypeService);
    }

    private static IReadOnlyList<string?> GetExpansionCultures(
        IContent content,
        ContentSearchEnrichmentContext context)
    {
        var publishStatusCondition = context.Conditions.FirstOrDefault(static condition =>
            PublishStatusFilterValues.IsPublishStatusProperty(condition.PropertyAlias));

        if (publishStatusCondition is null)
        {
            return GetPublishedCultureExpansions(content);
        }

        if (PublishStatusFilterValues.TargetsUnpublishedContent(
                publishStatusCondition.Value,
                publishStatusCondition.Operator))
        {
            if (!content.ContentType.VariesByCulture())
            {
                return [null];
            }

            var cultures = content.AvailableCultures
                .Where(static culture => !string.IsNullOrWhiteSpace(culture))
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .Select(static culture => (string?)culture)
                .ToArray();

            return cultures.Length > 0 ? cultures : [null];
        }

        return GetPublishedCultureExpansions(content);
    }

    private static IReadOnlyList<string?> GetPublishedCultureExpansions(IContent content)
    {
        var publishedCultures = ContentSearchCultureDisplayResolver.GetPublishedCultures(content);
        return publishedCultures.Count > 0
            ? publishedCultures.Select(static culture => (string?)culture).ToArray()
            : [null];
    }

    private ContentSearchResultItem EnrichItem(
        ContentSearchResultItem item,
        IReadOnlyDictionary<int, IContent> contents,
        IDictionary<int, string> nameCache,
        string? culture,
        ContentSearchEnrichmentContext context)
    {
        if (!contents.TryGetValue(item.Id, out var content))
        {
            return item;
        }

        var pathDisplay = ContentSearchContentPathResolver.Resolve(content, _contentService, nameCache);
        var createDate = content.CreateDate != default ? content.CreateDate : item.CreateDate;
        var updateDate = content.UpdateDate != default ? content.UpdateDate : item.UpdateDate;
        var resolvedDisplay = ContentSearchCultureDisplayResolver.ResolveName(content, culture);
        var (url, urlDisplay) = ResolveUrl(item, content, culture, culture ?? resolvedDisplay.MatchedCulture);
        var matchedCulture = culture ?? item.MatchedCulture ?? resolvedDisplay.MatchedCulture;
        var matchedFields = ResolveMatchedFields(item, culture, context);

        return new ContentSearchResultItem
        {
            Id = item.Id,
            Key = item.Key,
            Name = resolvedDisplay.Name ?? item.Name,
            ContentTypeAlias = item.ContentTypeAlias,
            ParentName = item.ParentName,
            Path = item.Path,
            PathDisplay = pathDisplay,
            CreateDate = createDate,
            UpdateDate = updateDate,
            MatchedCulture = matchedCulture,
            Published = ContentSearchPublishState.HasPublishedVersion(content),
            Url = url,
            UrlDisplay = urlDisplay,
            Udi = item.Udi,
            MatchedFields = matchedFields,
        };
    }

    private IReadOnlyList<ContentSearchMatchInfo> ResolveMatchedFields(
        ContentSearchResultItem item,
        string? culture,
        ContentSearchEnrichmentContext context)
    {
        if (string.IsNullOrWhiteSpace(culture)
            || item.IndexFieldValues is null
            || context.Conditions.Count == 0)
        {
            return item.MatchedFields;
        }

        var cultureConditions = context.Conditions
            .Select(condition =>
                SearchConditionCultureEvaluator.ResolveConditionForCulture(
                    condition,
                    culture,
                    _fieldResolver))
            .ToArray();

        return _matchExtractor.Extract(item.IndexFieldValues, cultureConditions);
    }

    private (string? Url, string? UrlDisplay) ResolveUrl(
        ContentSearchResultItem item,
        IContent content,
        string? culture,
        string? resolvedCulture)
    {
        var effectiveCulture = culture ?? resolvedCulture;

        if (!string.IsNullOrWhiteSpace(culture)
            && !string.IsNullOrWhiteSpace(item.Url)
            && !string.IsNullOrWhiteSpace(item.UrlDisplay)
            && item.UrlDisplay is not ContentSearchResultUrlResolver.EmptyDisplay
            && item.UrlDisplay is not "Multiple")
        {
            return (item.Url, item.UrlDisplay);
        }

        var published = _publishedUrlResolver.Resolve(content, effectiveCulture);

        if (published.Href is not null)
        {
            return (published.Href, published.Display);
        }

        if (!string.IsNullOrWhiteSpace(item.Url))
        {
            return (item.Url, item.UrlDisplay ?? published.Display);
        }

        return (null, published.Display);
    }
}

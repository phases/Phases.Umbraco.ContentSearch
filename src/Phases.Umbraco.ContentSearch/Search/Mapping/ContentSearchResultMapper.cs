using Examine;
using Phases.Umbraco.ContentSearch.Examine;
using Phases.Umbraco.ContentSearch.Models;
using Phases.Umbraco.ContentSearch.Search.Mapping;
using Phases.Umbraco.ContentSearch.Search.Models;

namespace Phases.Umbraco.ContentSearch.Search.Mapping;

/// <summary>
/// Maps Examine search results to content search result items using index fields only.
/// </summary>
public interface IContentSearchResultMapper
{
    /// <summary>
    /// Maps Examine search results to result items.
    /// </summary>
    /// <param name="searchResults">The Examine search results.</param>
    /// <param name="cultureContext">The culture context applied to the search.</param>
    /// <param name="conditions">The normalized search conditions.</param>
    /// <returns>The mapped result items.</returns>
    IReadOnlyList<ContentSearchResultItem> Map(
        IEnumerable<ISearchResult> searchResults,
        SearchCultureContext cultureContext,
        IReadOnlyList<NormalizedSearchCondition> conditions);
}

/// <summary>
/// Default implementation of <see cref="IContentSearchResultMapper"/>.
/// </summary>
public sealed class ContentSearchResultMapper : IContentSearchResultMapper
{
    private readonly IContentSearchResultMatchExtractor _matchExtractor;

    /// <summary>
    /// Initializes a new instance of the <see cref="ContentSearchResultMapper"/> class.
    /// </summary>
    /// <param name="matchExtractor">The match metadata extractor.</param>
    public ContentSearchResultMapper(IContentSearchResultMatchExtractor matchExtractor)
    {
        _matchExtractor = matchExtractor;
    }

    /// <inheritdoc />
    public IReadOnlyList<ContentSearchResultItem> Map(
        IEnumerable<ISearchResult> searchResults,
        SearchCultureContext cultureContext,
        IReadOnlyList<NormalizedSearchCondition> conditions)
    {
        ArgumentNullException.ThrowIfNull(searchResults);
        ArgumentNullException.ThrowIfNull(conditions);

        return searchResults
            .Select(result => MapResult(result, cultureContext, conditions))
            .ToArray();
    }

    private ContentSearchResultItem MapResult(
        ISearchResult result,
        SearchCultureContext cultureContext,
        IReadOnlyList<NormalizedSearchCondition> conditions)
    {
        var values = result.Values;
        var cultureCode = InferMatchedCulture(cultureContext);
        var resolvedUrl = ContentSearchResultUrlResolver.Resolve(values, cultureContext);
        var matchedFields = _matchExtractor.Extract(values, conditions);

        return new ContentSearchResultItem
        {
            Id = TryGetInt(values, ContentSearchExamineFields.NodeId, result.Id),
            Key = TryGetGuid(values, ContentSearchExamineFields.NodeKey),
            Name = GetValue(values, ContentSearchExamineFields.NodeName) ?? string.Empty,
            ContentTypeAlias = GetValue(values, ContentSearchExamineFields.NodeTypeAlias),
            ParentName = GetValue(values, "parentName"),
            CreateDate = TryGetDate(values, ContentSearchExamineFields.CreateDate),
            UpdateDate = TryGetDate(values, ContentSearchExamineFields.UpdateDate),
            Url = resolvedUrl.Href,
            UrlDisplay = resolvedUrl.Display,
            Path = GetValue(values, ContentSearchExamineFields.Path),
            Udi = BuildDocumentUdi(TryGetGuid(values, ContentSearchExamineFields.NodeKey)),
            MatchedCulture = cultureCode,
            MatchedFields = matchedFields,
            IndexFieldValues = values,
        };
    }

    private static string? InferMatchedCulture(SearchCultureContext cultureContext)
    {
        if (!cultureContext.IsSingleCulture || string.IsNullOrWhiteSpace(cultureContext.Culture))
        {
            return null;
        }

        return cultureContext.Culture;
    }

    private static string? GetValue(IReadOnlyDictionary<string, string> values, string fieldName)
        => values.TryGetValue(fieldName, out var value) && !string.IsNullOrWhiteSpace(value)
            ? value
            : null;

    private static int TryGetInt(
        IReadOnlyDictionary<string, string> values,
        string fieldName,
        string fallbackId)
    {
        if (values.TryGetValue(fieldName, out var value) && int.TryParse(value, out var parsed))
        {
            return parsed;
        }

        return int.TryParse(fallbackId, out parsed) ? parsed : 0;
    }

    private static Guid TryGetGuid(IReadOnlyDictionary<string, string> values, string fieldName)
    {
        if (values.TryGetValue(fieldName, out var value) && Guid.TryParse(value, out var parsed))
        {
            return parsed;
        }

        return Guid.Empty;
    }

    private static DateTime? TryGetDate(IReadOnlyDictionary<string, string> values, string fieldName)
    {
        if (!values.TryGetValue(fieldName, out var value))
        {
            return null;
        }

        return DateTime.TryParse(value, out var parsed) ? parsed : null;
    }

    private static string? BuildDocumentUdi(Guid key)
        => key == Guid.Empty ? null : $"umb://document/{key:D}";
}

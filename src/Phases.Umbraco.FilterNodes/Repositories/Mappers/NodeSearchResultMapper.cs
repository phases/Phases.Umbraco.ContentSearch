using Examine;
using Phases.Umbraco.FilterNodes.Models.Responses;
using Phases.Umbraco.FilterNodes.Services.Interfaces;
using Umbraco.Cms.Core.Models;

namespace Phases.Umbraco.FilterNodes.Repositories.Mappers;

/// <summary>
/// Default implementation of <see cref="INodeSearchResultMapper"/>.
/// </summary>
public sealed class NodeSearchResultMapper : INodeSearchResultMapper
{
    private readonly IPublishedContentUrlResolver _urlResolver;

    /// <summary>
    /// Initializes a new instance of the <see cref="NodeSearchResultMapper"/> class.
    /// </summary>
    public NodeSearchResultMapper(IPublishedContentUrlResolver urlResolver)
    {
        _urlResolver = urlResolver;
    }

    /// <inheritdoc />
    public NodeSearchResult Map(
        IContent content,
        ISearchResult? searchResult = null,
        NodeSearchResultMappingOptions? options = null)
    {
        ArgumentNullException.ThrowIfNull(content);

        options ??= NodeSearchResultMappingOptions.Default;

        var culture = options.SearchCultureContext.IsSingleCulture
            ? options.SearchCultureContext.Culture
            : null;

        return new NodeSearchResult
        {
            Key = content.Key,
            Id = content.Id,
            Name = content.Name ?? string.Empty,
            ContentTypeAlias = content.ContentType.Alias,
            ParentKey = null,
            CreateDate = content.CreateDate == default
                ? null
                : new DateTimeOffset(DateTime.SpecifyKind(content.CreateDate, DateTimeKind.Local)),
            UpdateDate = content.UpdateDate == default
                ? null
                : new DateTimeOffset(DateTime.SpecifyKind(content.UpdateDate, DateTimeKind.Local)),
            Url = _urlResolver.ResolveUrl(content, culture),
            MatchedCulture = options.MatchedCultureDisplayName,
        };
    }
}

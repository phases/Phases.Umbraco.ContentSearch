using Phases.Umbraco.ContentSearch.Models;

namespace Phases.Umbraco.ContentSearch.Examine;

/// <summary>
/// Resolves the external Examine index name for a search domain.
/// </summary>
public sealed class ExamineIndexResolver : IExamineIndexResolver
{
    /// <inheritdoc />
    public string ResolveIndexName(SearchDomain domain, bool useInternalContentIndex = false)
        => domain switch
        {
            SearchDomain.Content when useInternalContentIndex =>
                global::Umbraco.Cms.Core.Constants.UmbracoIndexes.InternalIndexName,
            SearchDomain.Content => ExamineIndexNames.ExternalContentIndex,
            SearchDomain.Media => ExamineIndexNames.ExternalMediaIndex,
            SearchDomain.Member => ExamineIndexNames.ExternalMemberIndex,
            _ => throw new NotSupportedException($"Search domain '{domain}' is not supported."),
        };
}

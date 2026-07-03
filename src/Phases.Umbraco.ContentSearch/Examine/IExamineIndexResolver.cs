using Phases.Umbraco.ContentSearch.Models;

namespace Phases.Umbraco.ContentSearch.Examine;

/// <summary>
/// Resolves the external Examine index name for a search domain.
/// </summary>
public interface IExamineIndexResolver
{
    /// <summary>
    /// Gets the external index name for the specified search domain.
    /// </summary>
    /// <param name="domain">The search domain.</param>
    /// <param name="useInternalContentIndex">When true, resolves the internal content index.</param>
    /// <returns>The Examine index name.</returns>
    string ResolveIndexName(SearchDomain domain, bool useInternalContentIndex = false);
}

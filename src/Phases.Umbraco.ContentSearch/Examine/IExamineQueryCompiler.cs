using Examine.Search;
using Phases.Umbraco.ContentSearch.Search.Models;

namespace Phases.Umbraco.ContentSearch.Examine;

/// <summary>
/// Compiles a <see cref="ContentSearchRequest"/> into an Examine <see cref="IQuery"/> instance.
/// </summary>
public interface IExamineQueryCompiler
{
    /// <summary>
    /// Compiles the search request into an Examine query against the resolved index.
    /// </summary>
    /// <param name="request">The search request.</param>
    /// <param name="cancellationToken">A token to cancel the operation.</param>
    /// <returns>The compiled Examine query.</returns>
    Task<IQuery> CompileAsync(
        ContentSearchRequest request,
        CancellationToken cancellationToken = default);
}

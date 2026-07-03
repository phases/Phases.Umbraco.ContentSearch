namespace Phases.Umbraco.FilterNodes.Repositories.Interfaces;

/// <summary>
/// Provides access to Umbraco content nodes for filtering operations.
/// </summary>
public interface IContentNodeRepository
{
    /// <summary>
    /// Gets the count of root content nodes in the content tree.
    /// </summary>
    /// <param name="cancellationToken">A token to cancel the operation.</param>
    /// <returns>The number of published content nodes.</returns>
    Task<int> GetPublishedNodeCountAsync(CancellationToken cancellationToken = default);
}

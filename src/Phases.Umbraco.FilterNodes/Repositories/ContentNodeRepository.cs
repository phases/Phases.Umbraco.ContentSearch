using Phases.Umbraco.FilterNodes.Repositories.Interfaces;
using Umbraco.Cms.Core.Services;

namespace Phases.Umbraco.FilterNodes.Repositories;

/// <summary>
/// Umbraco-specific implementation of <see cref="IContentNodeRepository"/>.
/// </summary>
public sealed class ContentNodeRepository : IContentNodeRepository
{
    private readonly IContentService _contentService;

    /// <summary>
    /// Initializes a new instance of the <see cref="ContentNodeRepository"/> class.
    /// </summary>
    /// <param name="contentService">The Umbraco content service.</param>
    public ContentNodeRepository(IContentService contentService)
    {
        _contentService = contentService;
    }

    /// <inheritdoc />
    public Task<int> GetPublishedNodeCountAsync(CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        var count = _contentService
            .GetRootContent()
            .Count();

        return Task.FromResult(count);
    }
}

using Phases.Umbraco.FilterNodes.Examine;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;

namespace Phases.Umbraco.FilterNodes.Extensions;

/// <summary>
/// Umbraco composer that registers the Filter Nodes package with the application.
/// </summary>
public sealed class PhasesUmbracoFilterNodesComposer : IComposer
{
    /// <inheritdoc />
    public void Compose(IUmbracoBuilder builder)
    {
        builder.AddFilterNodes();
        builder.Components().Append<FilterNodesExamineIndexingComponent>();
    }
}

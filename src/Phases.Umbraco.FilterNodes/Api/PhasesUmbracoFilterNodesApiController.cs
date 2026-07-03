using Asp.Versioning;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Phases.Umbraco.FilterNodes.Constants;
using Phases.Umbraco.FilterNodes.Services.Interfaces;

namespace Phases.Umbraco.FilterNodes.Api;

/// <summary>
/// Backoffice API controller for Phases Umbraco Filter Nodes.
/// </summary>
[ApiVersion("1.0")]
[ApiExplorerSettings(GroupName = FilterNodesApiConstants.ApiExplorerGroupName)]
public sealed class PhasesUmbracoFilterNodesApiController : PhasesUmbracoFilterNodesApiControllerBase
{
    private readonly IPingService _pingService;

    /// <summary>
    /// Initializes a new instance of the <see cref="PhasesUmbracoFilterNodesApiController"/> class.
    /// </summary>
    /// <param name="pingService">The ping service.</param>
    public PhasesUmbracoFilterNodesApiController(IPingService pingService)
    {
        _pingService = pingService;
    }

    /// <summary>
    /// Verifies that the Filter Nodes API is available.
    /// </summary>
    /// <param name="cancellationToken">A token to cancel the operation.</param>
    /// <returns>The ping response message.</returns>
    [HttpGet("ping")]
    [ProducesResponseType<string>(StatusCodes.Status200OK)]
    public async Task<string> Ping(CancellationToken cancellationToken)
    {
        var response = await _pingService.PingAsync(cancellationToken).ConfigureAwait(false);
        return response.Message;
    }
}

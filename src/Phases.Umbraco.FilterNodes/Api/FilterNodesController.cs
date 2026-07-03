using Asp.Versioning;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Phases.Umbraco.FilterNodes.Constants;
using Phases.Umbraco.FilterNodes.Exceptions;
using Phases.Umbraco.FilterNodes.Models.Requests;
using Phases.Umbraco.FilterNodes.Models.Responses;
using Phases.Umbraco.FilterNodes.Services.Interfaces;

namespace Phases.Umbraco.FilterNodes.Api;

/// <summary>
/// Authorized backoffice API for filtering Umbraco content nodes.
/// </summary>
[ApiVersion("1.0")]
[ApiExplorerSettings(GroupName = FilterNodesApiConstants.ApiExplorerGroupName)]
public sealed class FilterNodesController : PhasesUmbracoFilterNodesApiControllerBase
{
    private readonly IPropertyMetadataService _propertyMetadataService;
    private readonly INodeFilterService _nodeFilterService;
    private readonly ISavedFilterService _savedFilterService;
    private readonly ILanguageQueryService _languageQueryService;
    private readonly ILogger<FilterNodesController> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="FilterNodesController"/> class.
    /// </summary>
    /// <param name="propertyMetadataService">The property metadata service.</param>
    /// <param name="nodeFilterService">The node filter service.</param>
    /// <param name="savedFilterService">The saved filter service.</param>
    /// <param name="languageQueryService">The language query service.</param>
    /// <param name="logger">The logger.</param>
    public FilterNodesController(
        IPropertyMetadataService propertyMetadataService,
        INodeFilterService nodeFilterService,
        ISavedFilterService savedFilterService,
        ILanguageQueryService languageQueryService,
        ILogger<FilterNodesController> logger)
    {
        _propertyMetadataService = propertyMetadataService;
        _nodeFilterService = nodeFilterService;
        _savedFilterService = savedFilterService;
        _languageQueryService = languageQueryService;
        _logger = logger;
    }

    /// <summary>
    /// Gets the document type aliases available for filtering.
    /// </summary>
    /// <param name="cancellationToken">A token to cancel the operation.</param>
    /// <returns>The available document type aliases.</returns>
    [HttpGet("contenttypes")]
    [ProducesResponseType<ContentTypeAliasesResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ContentTypeAliasesResponse>> GetContentTypesAsync(
        CancellationToken cancellationToken)
    {
        return await ExecuteAsync<ContentTypeAliasesResponse>(
            nameof(GetContentTypesAsync),
            async () =>
            {
                var contentTypes = await _propertyMetadataService
                    .GetContentTypesAsync(cancellationToken)
                    .ConfigureAwait(false);

                return Ok(new ContentTypeAliasesResponse { ContentTypes = contentTypes });
            }).ConfigureAwait(false);
    }

    /// <summary>
    /// Gets the installed languages available for culture-specific filtering.
    /// </summary>
    /// <param name="cancellationToken">A token to cancel the operation.</param>
    /// <returns>The installed languages.</returns>
    [HttpGet("languages")]
    [ProducesResponseType<LanguageListResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<LanguageListResponse>> GetLanguagesAsync(
        CancellationToken cancellationToken)
    {
        return await ExecuteAsync<LanguageListResponse>(
            nameof(GetLanguagesAsync),
            async () =>
            {
                var languages = await _languageQueryService
                    .GetLanguagesAsync(cancellationToken)
                    .ConfigureAwait(false);

                return Ok(new LanguageListResponse { Languages = languages });
            }).ConfigureAwait(false);
    }

    /// <summary>
    /// Gets the filterable property aliases for the specified document type.
    /// </summary>
    /// <param name="contentTypeAlias">The document type alias.</param>
    /// <param name="cancellationToken">A token to cancel the operation.</param>
    /// <returns>The filterable property aliases.</returns>
    [HttpGet("properties/{contentTypeAlias}")]
    [ProducesResponseType<PropertyAliasesResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<PropertyAliasesResponse>> GetPropertiesAsync(
        string contentTypeAlias,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(contentTypeAlias))
        {
            return BadRequest(CreateProblem(
                StatusCodes.Status400BadRequest,
                "The content type alias is required.",
                "contentTypeAlias"));
        }

        return await ExecuteAsync<PropertyAliasesResponse>(
            nameof(GetPropertiesAsync),
            async () =>
            {
                var properties = await _propertyMetadataService
                    .GetPropertyMetadataAsync(contentTypeAlias, cancellationToken)
                    .ConfigureAwait(false);

                return Ok(new PropertyAliasesResponse
                {
                    ContentTypeAlias = contentTypeAlias,
                    Aliases = properties.Select(static property => property.Alias).ToArray(),
                    Properties = properties,
                });
            }).ConfigureAwait(false);
    }

    /// <summary>
    /// Gets filterable property metadata for multiple document types.
    /// </summary>
    /// <param name="request">The batch request.</param>
    /// <param name="cancellationToken">A token to cancel the operation.</param>
    /// <returns>Property metadata grouped by document type.</returns>
    [HttpPost("properties/batch")]
    [ProducesResponseType<BatchPropertyMetadataResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<BatchPropertyMetadataResponse>> GetPropertiesBatchAsync(
        [FromBody] BatchPropertyMetadataRequest request,
        CancellationToken cancellationToken)
    {
        if (request?.ContentTypeAliases is null || request.ContentTypeAliases.Count == 0)
        {
            return BadRequest(CreateProblem(
                StatusCodes.Status400BadRequest,
                "At least one content type alias is required.",
                "contentTypeAliases"));
        }

        if (request.ContentTypeAliases.Count > FilterConstants.MaxPropertyMetadataBatchSize)
        {
            return BadRequest(CreateProblem(
                StatusCodes.Status400BadRequest,
                $"A maximum of {FilterConstants.MaxPropertyMetadataBatchSize} content type aliases is allowed per batch request.",
                "contentTypeAliases"));
        }

        return await ExecuteAsync<BatchPropertyMetadataResponse>(
            nameof(GetPropertiesBatchAsync),
            async () =>
            {
                var items = await _propertyMetadataService
                    .GetPropertyMetadataBatchAsync(request.ContentTypeAliases, cancellationToken)
                    .ConfigureAwait(false);

                return Ok(new BatchPropertyMetadataResponse { Items = items });
            }).ConfigureAwait(false);
    }

    /// <summary>
    /// Searches content nodes using the specified filter criteria.
    /// </summary>
    /// <param name="request">The filter request.</param>
    /// <param name="cancellationToken">A token to cancel the operation.</param>
    /// <returns>A paginated collection of matching nodes.</returns>
    [HttpPost("search")]
    [ProducesResponseType<PagedResponse<NodeSearchResult>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<PagedResponse<NodeSearchResult>>> SearchAsync(
        [FromBody] FilterRequest request,
        CancellationToken cancellationToken)
    {
        if (request is null)
        {
            return BadRequest(CreateProblem(
                StatusCodes.Status400BadRequest,
                "The request body is required.",
                "request"));
        }

        return await ExecuteAsync<PagedResponse<NodeSearchResult>>(
            nameof(SearchAsync),
            async () =>
            {
                var results = await _nodeFilterService
                    .FilterAsync(request, cancellationToken)
                    .ConfigureAwait(false);

                return Ok(results);
            }).ConfigureAwait(false);
    }

    /// <summary>
    /// Gets the saved filters for the current backoffice user.
    /// </summary>
    /// <param name="cancellationToken">A token to cancel the operation.</param>
    /// <returns>The saved filters.</returns>
    [HttpGet("savedfilters")]
    [ProducesResponseType<SavedFilterListResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<SavedFilterListResponse>> GetSavedFiltersAsync(
        CancellationToken cancellationToken)
    {
        return await ExecuteAsync<SavedFilterListResponse>(
            nameof(GetSavedFiltersAsync),
            async () =>
            {
                var response = await _savedFilterService
                    .GetAllAsync(cancellationToken)
                    .ConfigureAwait(false);

                return Ok(response);
            }).ConfigureAwait(false);
    }

    /// <summary>
    /// Saves the current filter configuration for the current backoffice user.
    /// </summary>
    /// <param name="request">The save request.</param>
    /// <param name="cancellationToken">A token to cancel the operation.</param>
    /// <returns>The saved filter.</returns>
    [HttpPost("savedfilters")]
    [ProducesResponseType<SavedFilterResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<SavedFilterResponse>> SaveSavedFilterAsync(
        [FromBody] SaveSavedFilterRequest request,
        CancellationToken cancellationToken)
    {
        if (request is null)
        {
            return BadRequest(CreateProblem(
                StatusCodes.Status400BadRequest,
                "The request body is required.",
                "request"));
        }

        return await ExecuteAsync<SavedFilterResponse>(
            nameof(SaveSavedFilterAsync),
            async () =>
            {
                var response = await _savedFilterService
                    .SaveAsync(request, cancellationToken)
                    .ConfigureAwait(false);

                return Ok(response);
            }).ConfigureAwait(false);
    }

    /// <summary>
    /// Deletes a saved filter for the current backoffice user.
    /// </summary>
    /// <param name="savedFilterId">The saved filter identifier.</param>
    /// <param name="cancellationToken">A token to cancel the operation.</param>
    /// <returns>No content.</returns>
    [HttpDelete("savedfilters/{savedFilterId:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> DeleteSavedFilterAsync(
        Guid savedFilterId,
        CancellationToken cancellationToken)
    {
        return await ExecuteVoidAsync(
            nameof(DeleteSavedFilterAsync),
            async () =>
            {
                await _savedFilterService
                    .DeleteAsync(savedFilterId, cancellationToken)
                    .ConfigureAwait(false);

                return NoContent();
            }).ConfigureAwait(false);
    }

    private async Task<ActionResult<T>> ExecuteAsync<T>(
        string operationName,
        Func<Task<ActionResult<T>>> action)
    {
        try
        {
            return await action().ConfigureAwait(false);
        }
        catch (FilterRequestValidationException ex)
        {
            _logger.LogWarning(
                "Validation failed during {OperationName}: {ValidationErrors}",
                operationName,
                string.Join("; ", ex.Errors));

            return ValidationProblem(new ValidationProblemDetails(
                new Dictionary<string, string[]>
                {
                    ["request"] = ex.Errors.ToArray(),
                })
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "The filter request is invalid.",
            });
        }
        catch (ContentTypeNotFoundException ex)
        {
            _logger.LogWarning(
                "Document type '{ContentTypeAlias}' was not found during {OperationName}.",
                ex.ContentTypeAlias,
                operationName);

            return NotFound(CreateProblem(
                StatusCodes.Status404NotFound,
                ex.Message,
                "contentTypeAlias"));
        }
        catch (SavedFilterNotFoundException ex)
        {
            _logger.LogWarning(
                "Saved filter '{SavedFilterId}' was not found during {OperationName}.",
                ex.SavedFilterId,
                operationName);

            return NotFound(CreateProblem(
                StatusCodes.Status404NotFound,
                ex.Message,
                "savedFilterId"));
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(
                "Unauthorized access during {OperationName}: {Message}",
                operationName,
                ex.Message);

            return Unauthorized(CreateProblem(
                StatusCodes.Status401Unauthorized,
                ex.Message,
                operationName));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error during {OperationName}.", operationName);

            return StatusCode(
                StatusCodes.Status500InternalServerError,
                CreateProblem(
                    StatusCodes.Status500InternalServerError,
                    "An unexpected error occurred while processing the request.",
                    operationName));
        }
    }

    private static ProblemDetails CreateProblem(int statusCode, string detail, string? instance = null)
    {
        return new ProblemDetails
        {
            Status = statusCode,
            Title = GetTitle(statusCode),
            Detail = detail,
            Instance = instance,
        };
    }

    private async Task<IActionResult> ExecuteVoidAsync(
        string operationName,
        Func<Task<IActionResult>> action)
    {
        try
        {
            return await action().ConfigureAwait(false);
        }
        catch (FilterRequestValidationException ex)
        {
            _logger.LogWarning(
                "Validation failed during {OperationName}: {ValidationErrors}",
                operationName,
                string.Join("; ", ex.Errors));

            return ValidationProblem(new ValidationProblemDetails(
                new Dictionary<string, string[]>
                {
                    ["request"] = ex.Errors.ToArray(),
                })
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "The filter request is invalid.",
            });
        }
        catch (SavedFilterNotFoundException ex)
        {
            _logger.LogWarning(
                "Saved filter '{SavedFilterId}' was not found during {OperationName}.",
                ex.SavedFilterId,
                operationName);

            return NotFound(CreateProblem(
                StatusCodes.Status404NotFound,
                ex.Message,
                "savedFilterId"));
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(
                "Unauthorized access during {OperationName}: {Message}",
                operationName,
                ex.Message);

            return Unauthorized(CreateProblem(
                StatusCodes.Status401Unauthorized,
                ex.Message,
                operationName));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error during {OperationName}.", operationName);

            return StatusCode(
                StatusCodes.Status500InternalServerError,
                CreateProblem(
                    StatusCodes.Status500InternalServerError,
                    "An unexpected error occurred while processing the request.",
                    operationName));
        }
    }

    private static string GetTitle(int statusCode)
        => statusCode switch
        {
            StatusCodes.Status400BadRequest => "Bad Request",
            StatusCodes.Status401Unauthorized => "Unauthorized",
            StatusCodes.Status404NotFound => "Not Found",
            _ => "Internal Server Error",
        };
}

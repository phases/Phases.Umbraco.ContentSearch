using Asp.Versioning;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Phases.Umbraco.ContentSearch.Constants;
using Phases.Umbraco.ContentSearch.Export;
using Phases.Umbraco.ContentSearch.Export.Models;
using Phases.Umbraco.ContentSearch.Metadata.Exceptions;
using Phases.Umbraco.ContentSearch.Metadata.Models;
using Phases.Umbraco.ContentSearch.Metadata.Models.Responses;
using Phases.Umbraco.ContentSearch.Models.Responses;
using Phases.Umbraco.ContentSearch.Search.Models;
using Phases.Umbraco.ContentSearch.Presets;
using Phases.Umbraco.ContentSearch.Presets.Models;
using Phases.Umbraco.ContentSearch.SavedSearches;
using Phases.Umbraco.ContentSearch.SavedSearches.Exceptions;
using Phases.Umbraco.ContentSearch.SavedSearches.Models.Requests;
using Phases.Umbraco.ContentSearch.SavedSearches.Models.Responses;
using Phases.Umbraco.ContentSearch.Services;
using Microsoft.Extensions.Logging;

namespace Phases.Umbraco.ContentSearch.Api;

/// <summary>
/// Backoffice API controller for Phases Umbraco Content Search.
/// </summary>
[ApiVersion("1.0")]
[ApiExplorerSettings(GroupName = ContentSearchApiConstants.ApiExplorerGroupName)]
public sealed class PhasesUmbracoContentSearchApiController : PhasesUmbracoContentSearchApiControllerBase
{
    private readonly IPingService _pingService;
    private readonly IContentSearchMetadataService _metadataService;
    private readonly ILanguageQueryService _languageQueryService;
    private readonly IContentSearchService _searchService;
    private readonly ISavedSearchService _savedSearchService;
    private readonly IContentSearchPresetCatalog _presetCatalog;
    private readonly IContentExportManager _exportManager;
    private readonly ILogger<PhasesUmbracoContentSearchApiController> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="PhasesUmbracoContentSearchApiController"/> class.
    /// </summary>
    public PhasesUmbracoContentSearchApiController(
        IPingService pingService,
        IContentSearchMetadataService metadataService,
        ILanguageQueryService languageQueryService,
        IContentSearchService searchService,
        ISavedSearchService savedSearchService,
        IContentSearchPresetCatalog presetCatalog,
        IContentExportManager exportManager,
        ILogger<PhasesUmbracoContentSearchApiController> logger)
    {
        _pingService = pingService;
        _metadataService = metadataService;
        _languageQueryService = languageQueryService;
        _searchService = searchService;
        _savedSearchService = savedSearchService;
        _presetCatalog = presetCatalog;
        _exportManager = exportManager;
        _logger = logger;
    }

    /// <summary>
    /// Verifies that the Content Search API is available.
    /// </summary>
    [HttpGet("ping")]
    [ProducesResponseType<string>(StatusCodes.Status200OK)]
    public async Task<string> Ping(CancellationToken cancellationToken)
    {
        var response = await _pingService.PingAsync(cancellationToken).ConfigureAwait(false);
        return response.Message;
    }

    /// <summary>
    /// Executes a content search through the external Examine index.
    /// </summary>
    [HttpPost("search")]
    [ProducesResponseType<ContentSearchResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status501NotImplemented)]
    public async Task<ActionResult<ContentSearchResponse>> SearchAsync(
        [FromBody] ContentSearchRequest request,
        CancellationToken cancellationToken = default)
    {
        if (request is null || request.Conditions.Count == 0)
        {
            return BadRequest(CreateProblem(
                StatusCodes.Status400BadRequest,
                "At least one search condition is required.",
                "conditions"));
        }

        try
        {
            var response = await _searchService
                .SearchAsync(request, cancellationToken)
                .ConfigureAwait(false);

            return Ok(response);
        }
        catch (ArgumentException exception)
        {
            return BadRequest(CreateProblem(
                StatusCodes.Status400BadRequest,
                exception.Message,
                exception.ParamName));
        }
        catch (NotSupportedException exception)
        {
            return StatusCode(
                StatusCodes.Status501NotImplemented,
                CreateProblem(StatusCodes.Status501NotImplemented, exception.Message));
        }
        catch (UnauthorizedAccessException exception)
        {
            return Unauthorized(CreateProblem(StatusCodes.Status401Unauthorized, exception.Message));
        }
    }

    /// <summary>
    /// Exports the current search results without paging, reusing the existing search pipeline.
    /// </summary>
    [HttpPost("export")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status501NotImplemented)]
    public async Task<IActionResult> ExportAsync(
        [FromBody] ContentSearchExportRequest request,
        CancellationToken cancellationToken = default)
    {
        if (request is null || request.Search.Conditions.Count == 0)
        {
            return BadRequest(CreateProblem(
                StatusCodes.Status400BadRequest,
                "At least one search condition is required.",
                "conditions"));
        }

        try
        {
            var response = await _searchService
                .SearchForExportAsync(BuildExportSearchRequest(request.Search), cancellationToken)
                .ConfigureAwait(false);

            var result = new ContentSearchResult
            {
                Items = response.Items,
                TotalMatches = response.TotalCount,
            };

            var file = _exportManager.Export(request.Format, result);

            return File(file.Content, file.ContentType, file.FileName);
        }
        catch (ArgumentException exception)
        {
            return BadRequest(CreateProblem(
                StatusCodes.Status400BadRequest,
                exception.Message,
                exception.ParamName));
        }
        catch (NotSupportedException exception)
        {
            return StatusCode(
                StatusCodes.Status501NotImplemented,
                CreateProblem(StatusCodes.Status501NotImplemented, exception.Message));
        }
        catch (UnauthorizedAccessException exception)
        {
            return Unauthorized(CreateProblem(StatusCodes.Status401Unauthorized, exception.Message));
        }
    }

    /// <summary>
    /// Gets enabled Umbraco languages for culture-aware search configuration.
    /// </summary>
    [HttpGet("metadata/languages")]
    [ProducesResponseType<LanguageListResponse>(StatusCodes.Status200OK)]
    public async Task<ActionResult<LanguageListResponse>> GetLanguagesAsync(
        CancellationToken cancellationToken = default)
    {
        var languages = await _languageQueryService
            .GetLanguagesAsync(cancellationToken)
            .ConfigureAwait(false);

        return Ok(new LanguageListResponse { Languages = languages });
    }

    /// <summary>
    /// Gets document types available for search configuration.
    /// </summary>
    [HttpGet("metadata/content-types")]
    [ProducesResponseType<ContentTypeListResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status501NotImplemented)]
    public async Task<ActionResult<ContentTypeListResponse>> GetContentTypesAsync(
        [FromQuery] MetadataDomain domain = MetadataDomain.Content,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var contentTypes = await _metadataService
                .GetContentTypesAsync(domain, cancellationToken)
                .ConfigureAwait(false);

            return Ok(new ContentTypeListResponse { ContentTypes = contentTypes });
        }
        catch (NotSupportedException exception)
        {
            return StatusCode(
                StatusCodes.Status501NotImplemented,
                CreateProblem(StatusCodes.Status501NotImplemented, exception.Message));
        }
    }

    /// <summary>
    /// Gets searchable properties for a document type.
    /// </summary>
    [HttpGet("metadata/content-types/{contentTypeAlias}/properties")]
    [ProducesResponseType<PropertyMetadataListResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status501NotImplemented)]
    public async Task<ActionResult<PropertyMetadataListResponse>> GetPropertiesAsync(
        string contentTypeAlias,
        [FromQuery] MetadataDomain domain = MetadataDomain.Content,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(contentTypeAlias))
        {
            return BadRequest(CreateProblem(
                StatusCodes.Status400BadRequest,
                "The content type alias is required.",
                "contentTypeAlias"));
        }

        try
        {
            var properties = await _metadataService
                .GetPropertiesAsync(contentTypeAlias, domain, cancellationToken)
                .ConfigureAwait(false);

            return Ok(new PropertyMetadataListResponse
            {
                ContentTypeAlias = contentTypeAlias,
                Properties = properties,
            });
        }
        catch (ContentTypeNotFoundException exception)
        {
            return NotFound(CreateProblem(
                StatusCodes.Status404NotFound,
                exception.Message,
                "contentTypeAlias"));
        }
        catch (ArgumentException exception)
        {
            return BadRequest(CreateProblem(
                StatusCodes.Status400BadRequest,
                exception.Message,
                exception.ParamName));
        }
        catch (NotSupportedException exception)
        {
            return StatusCode(
                StatusCodes.Status501NotImplemented,
                CreateProblem(StatusCodes.Status501NotImplemented, exception.Message));
        }
    }

    /// <summary>
    /// Gets built-in quick search presets.
    /// </summary>
    [HttpGet("search-presets")]
    [ProducesResponseType<ContentSearchPresetListResponse>(StatusCodes.Status200OK)]
    public async Task<ActionResult<ContentSearchPresetListResponse>> GetSearchPresetsAsync(
        CancellationToken cancellationToken = default)
    {
        return await ExecuteAsync<ContentSearchPresetListResponse>(
            nameof(GetSearchPresetsAsync),
            async () =>
            {
                var response = await _presetCatalog
                    .GetAllAsync(cancellationToken)
                    .ConfigureAwait(false);

                return Ok(response);
            }).ConfigureAwait(false);
    }

    /// <summary>
    /// Gets a built-in quick search preset by identifier.
    /// </summary>
    [HttpGet("search-presets/{presetId}")]
    [ProducesResponseType<ContentSearchPresetResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ContentSearchPresetResponse>> GetSearchPresetByIdAsync(
        string presetId,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(presetId))
        {
            return BadRequest(CreateProblem(
                StatusCodes.Status400BadRequest,
                "The preset identifier is required.",
                "presetId"));
        }

        return await ExecuteAsync<ContentSearchPresetResponse>(
            nameof(GetSearchPresetByIdAsync),
            async () =>
            {
                var response = await _presetCatalog
                    .GetByIdAsync(presetId, cancellationToken)
                    .ConfigureAwait(false);

                if (response is null)
                {
                    return NotFound(CreateProblem(
                        StatusCodes.Status404NotFound,
                        $"Search preset '{presetId}' was not found.",
                        presetId));
                }

                return Ok(response);
            }).ConfigureAwait(false);
    }

    /// <summary>
    /// Gets saved, shared, and recent searches for the current user.
    /// </summary>
    [HttpGet("savedsearches")]
    [ProducesResponseType<SavedSearchListResponse>(StatusCodes.Status200OK)]
    public async Task<ActionResult<SavedSearchListResponse>> GetSavedSearchesAsync(
        CancellationToken cancellationToken = default)
    {
        return await ExecuteAsync<SavedSearchListResponse>(
            nameof(GetSavedSearchesAsync),
            async () =>
            {
                var response = await _savedSearchService
                    .GetAllAsync(cancellationToken)
                    .ConfigureAwait(false);

                return Ok(response);
            }).ConfigureAwait(false);
    }

    /// <summary>
    /// Gets a saved or recent search by identifier.
    /// </summary>
    [HttpGet("savedsearches/{savedSearchId:guid}")]
    [ProducesResponseType<SavedSearchDetailResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<SavedSearchDetailResponse>> GetSavedSearchByIdAsync(
        Guid savedSearchId,
        CancellationToken cancellationToken = default)
    {
        return await ExecuteAsync<SavedSearchDetailResponse>(
            nameof(GetSavedSearchByIdAsync),
            async () =>
            {
                var response = await _savedSearchService
                    .GetByIdAsync(savedSearchId, cancellationToken)
                    .ConfigureAwait(false);

                return Ok(response);
            }).ConfigureAwait(false);
    }

    /// <summary>
    /// Saves a new personal or shared search.
    /// </summary>
    [HttpPost("savedsearches")]
    [ProducesResponseType<SavedSearchDetailResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<SavedSearchDetailResponse>> SaveSavedSearchAsync(
        [FromBody] SaveSavedSearchRequest request,
        CancellationToken cancellationToken = default)
    {
        if (request is null)
        {
            return BadRequest(CreateProblem(
                StatusCodes.Status400BadRequest,
                "The request body is required.",
                "request"));
        }

        return await ExecuteAsync<SavedSearchDetailResponse>(
            nameof(SaveSavedSearchAsync),
            async () =>
            {
                var response = await _savedSearchService
                    .SaveAsync(request, cancellationToken)
                    .ConfigureAwait(false);

                return Ok(response);
            }).ConfigureAwait(false);
    }

    /// <summary>
    /// Updates the name and description of a saved search.
    /// </summary>
    [HttpPut("savedsearches/{savedSearchId:guid}")]
    [ProducesResponseType<SavedSearchDetailResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<SavedSearchDetailResponse>> UpdateSavedSearchAsync(
        Guid savedSearchId,
        [FromBody] UpdateSavedSearchRequest request,
        CancellationToken cancellationToken = default)
    {
        if (request is null)
        {
            return BadRequest(CreateProblem(
                StatusCodes.Status400BadRequest,
                "The request body is required.",
                "request"));
        }

        return await ExecuteAsync<SavedSearchDetailResponse>(
            nameof(UpdateSavedSearchAsync),
            async () =>
            {
                var response = await _savedSearchService
                    .UpdateAsync(savedSearchId, request, cancellationToken)
                    .ConfigureAwait(false);

                return Ok(response);
            }).ConfigureAwait(false);
    }

    /// <summary>
    /// Duplicates a saved search into the current user's personal collection.
    /// </summary>
    [HttpPost("savedsearches/{savedSearchId:guid}/duplicate")]
    [ProducesResponseType<SavedSearchDetailResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<SavedSearchDetailResponse>> DuplicateSavedSearchAsync(
        Guid savedSearchId,
        CancellationToken cancellationToken = default)
    {
        return await ExecuteAsync<SavedSearchDetailResponse>(
            nameof(DuplicateSavedSearchAsync),
            async () =>
            {
                var response = await _savedSearchService
                    .DuplicateAsync(savedSearchId, cancellationToken)
                    .ConfigureAwait(false);

                return Ok(response);
            }).ConfigureAwait(false);
    }

    /// <summary>
    /// Deletes a saved or recent search.
    /// </summary>
    [HttpDelete("savedsearches/{savedSearchId:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteSavedSearchAsync(
        Guid savedSearchId,
        CancellationToken cancellationToken = default)
    {
        return await ExecuteVoidAsync(
            nameof(DeleteSavedSearchAsync),
            async () =>
            {
                await _savedSearchService
                    .DeleteAsync(savedSearchId, cancellationToken)
                    .ConfigureAwait(false);

                return NoContent();
            }).ConfigureAwait(false);
    }

    /// <summary>
    /// Toggles whether a saved search is pinned for the current user.
    /// </summary>
    [HttpPost("savedsearches/{savedSearchId:guid}/pin")]
    [ProducesResponseType<SavedSearchSummaryResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<SavedSearchSummaryResponse>> ToggleSavedSearchPinAsync(
        Guid savedSearchId,
        CancellationToken cancellationToken = default)
    {
        return await ExecuteAsync<SavedSearchSummaryResponse>(
            nameof(ToggleSavedSearchPinAsync),
            async () =>
            {
                var response = await _savedSearchService
                    .TogglePinAsync(savedSearchId, cancellationToken)
                    .ConfigureAwait(false);

                return Ok(response);
            }).ConfigureAwait(false);
    }

    /// <summary>
    /// Toggles whether a saved search is favourited for the current user.
    /// </summary>
    [HttpPost("savedsearches/{savedSearchId:guid}/favourite")]
    [ProducesResponseType<SavedSearchSummaryResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<SavedSearchSummaryResponse>> ToggleSavedSearchFavouriteAsync(
        Guid savedSearchId,
        CancellationToken cancellationToken = default)
    {
        return await ExecuteAsync<SavedSearchSummaryResponse>(
            nameof(ToggleSavedSearchFavouriteAsync),
            async () =>
            {
                var response = await _savedSearchService
                    .ToggleFavouriteAsync(savedSearchId, cancellationToken)
                    .ConfigureAwait(false);

                return Ok(response);
            }).ConfigureAwait(false);
    }

    /// <summary>
    /// Records usage of a saved search.
    /// </summary>
    [HttpPost("savedsearches/{savedSearchId:guid}/use")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RecordSavedSearchUsageAsync(
        Guid savedSearchId,
        CancellationToken cancellationToken = default)
    {
        return await ExecuteVoidAsync(
            nameof(RecordSavedSearchUsageAsync),
            async () =>
            {
                await _savedSearchService
                    .RecordSavedSearchUsageAsync(savedSearchId, cancellationToken)
                    .ConfigureAwait(false);

                return NoContent();
            }).ConfigureAwait(false);
    }

    /// <summary>
    /// Records an ad-hoc search in recent searches.
    /// </summary>
    [HttpPost("savedsearches/recent")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> RecordRecentSearchAsync(
        [FromBody] RecordRecentSearchRequest request,
        CancellationToken cancellationToken = default)
    {
        if (request is null)
        {
            return BadRequest(CreateProblem(
                StatusCodes.Status400BadRequest,
                "The request body is required.",
                "request"));
        }

        return await ExecuteVoidAsync(
            nameof(RecordRecentSearchAsync),
            async () =>
            {
                await _savedSearchService
                    .RecordRecentSearchAsync(request, cancellationToken)
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
        catch (SavedSearchValidationException exception)
        {
            _logger.LogWarning(
                "Validation failed during {OperationName}: {ValidationErrors}",
                operationName,
                string.Join("; ", exception.Errors));

            return ValidationProblem(new ValidationProblemDetails(
                new Dictionary<string, string[]>
                {
                    ["request"] = exception.Errors.ToArray(),
                })
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "The saved search request is invalid.",
            });
        }
        catch (SavedSearchNotFoundException exception)
        {
            _logger.LogWarning(
                "Saved search '{SavedSearchId}' was not found during {OperationName}.",
                exception.SavedSearchId,
                operationName);

            return NotFound(CreateProblem(
                StatusCodes.Status404NotFound,
                exception.Message,
                exception.SavedSearchId.ToString()));
        }
        catch (UnauthorizedAccessException exception)
        {
            return Unauthorized(CreateProblem(
                StatusCodes.Status401Unauthorized,
                exception.Message));
        }
    }

    private async Task<IActionResult> ExecuteVoidAsync(
        string operationName,
        Func<Task<IActionResult>> action)
    {
        try
        {
            return await action().ConfigureAwait(false);
        }
        catch (SavedSearchValidationException exception)
        {
            _logger.LogWarning(
                "Validation failed during {OperationName}: {ValidationErrors}",
                operationName,
                string.Join("; ", exception.Errors));

            return ValidationProblem(new ValidationProblemDetails(
                new Dictionary<string, string[]>
                {
                    ["request"] = exception.Errors.ToArray(),
                })
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "The saved search request is invalid.",
            });
        }
        catch (SavedSearchNotFoundException exception)
        {
            _logger.LogWarning(
                "Saved search '{SavedSearchId}' was not found during {OperationName}.",
                exception.SavedSearchId,
                operationName);

            return NotFound(CreateProblem(
                StatusCodes.Status404NotFound,
                exception.Message,
                exception.SavedSearchId.ToString()));
        }
        catch (UnauthorizedAccessException exception)
        {
            return Unauthorized(CreateProblem(
                StatusCodes.Status401Unauthorized,
                exception.Message));
        }
    }

    private static ContentSearchRequest BuildExportSearchRequest(ContentSearchRequest source)
        => new()
        {
            Domain = source.Domain,
            MatchMode = source.MatchMode,
            SearchCultureMode = source.SearchCultureMode,
            Culture = source.Culture,
            Conditions = source.Conditions,
            SortColumn = source.SortColumn,
            SortDescending = source.SortDescending,
            PageIndex = 0,
            PageSize = ContentSearchExportRequest.MaxRows,
        };

    private static ProblemDetails CreateProblem(
        int statusCode,
        string detail,
        string? instance = null)
        => new()
        {
            Status = statusCode,
            Title = statusCode switch
            {
                StatusCodes.Status400BadRequest => "Bad Request",
                StatusCodes.Status404NotFound => "Not Found",
                StatusCodes.Status501NotImplemented => "Not Implemented",
                _ => "Error",
            },
            Detail = detail,
            Instance = instance,
        };
}

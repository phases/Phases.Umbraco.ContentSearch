using System.Text.Json;
using Phases.Umbraco.FilterNodes.Constants;
using Phases.Umbraco.FilterNodes.Exceptions;
using Phases.Umbraco.FilterNodes.Models.Requests;
using Phases.Umbraco.FilterNodes.Models.Responses;
using Phases.Umbraco.FilterNodes.Models.Storage;
using Phases.Umbraco.FilterNodes.Services.Interfaces;
using Phases.Umbraco.FilterNodes.Services.Validation;
using Umbraco.Cms.Core.Models.Membership;
using Umbraco.Cms.Core.Security;
using Umbraco.Cms.Core.Services;

namespace Phases.Umbraco.FilterNodes.Services;

/// <summary>
/// Persists saved filters per backoffice user using <see cref="IKeyValueService"/>.
/// </summary>
public sealed class SavedFilterService : ISavedFilterService
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        WriteIndented = false,
    };

    private readonly IKeyValueService _keyValueService;
    private readonly IBackOfficeSecurityAccessor _backOfficeSecurityAccessor;

    /// <summary>
    /// Initializes a new instance of the <see cref="SavedFilterService"/> class.
    /// </summary>
    /// <param name="keyValueService">The Umbraco key/value service.</param>
    /// <param name="backOfficeSecurityAccessor">The backoffice security accessor.</param>
    public SavedFilterService(
        IKeyValueService keyValueService,
        IBackOfficeSecurityAccessor backOfficeSecurityAccessor)
    {
        _keyValueService = keyValueService;
        _backOfficeSecurityAccessor = backOfficeSecurityAccessor;
    }

    /// <inheritdoc />
    public Task<SavedFilterListResponse> GetAllAsync(CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();

        var document = LoadDocument();
        var filters = document.Filters
            .OrderBy(filter => filter.Name, StringComparer.OrdinalIgnoreCase)
            .Select(ToResponse)
            .ToArray();

        return Task.FromResult(new SavedFilterListResponse { Filters = filters });
    }

    /// <inheritdoc />
    public Task<SavedFilterResponse> SaveAsync(
        SaveSavedFilterRequest request,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);
        cancellationToken.ThrowIfCancellationRequested();

        var validationErrors = SavedFilterRequestValidator.Validate(request);

        if (validationErrors.Count > 0)
        {
            throw new FilterRequestValidationException(validationErrors);
        }

        var document = LoadDocument();

        if (document.Filters.Count >= SavedFilterConstants.MaxSavedFiltersPerUser)
        {
            throw new FilterRequestValidationException(
            [
                $"A maximum of {SavedFilterConstants.MaxSavedFiltersPerUser} saved filters is allowed.",
            ]);
        }

        var normalizedName = request.Name.Trim();

        if (document.Filters.Any(filter =>
                filter.Name.Equals(normalizedName, StringComparison.OrdinalIgnoreCase)))
        {
            throw new FilterRequestValidationException(
            [
                "A saved filter with this name already exists.",
            ]);
        }

        var savedFilter = new SavedFilterDocument
        {
            Id = Guid.NewGuid(),
            Name = normalizedName,
            Updated = DateTimeOffset.UtcNow,
            FilterType = request.FilterType,
            PageSize = request.PageSize,
            SearchCultureMode = request.SearchCultureMode,
            Culture = string.IsNullOrWhiteSpace(request.Culture)
                ? null
                : request.Culture.Trim(),
            Conditions = request.Conditions
                .Select(NormalizeCondition)
                .ToList(),
        };

        document.Filters.Add(savedFilter);
        PersistDocument(document);

        return Task.FromResult(ToResponse(savedFilter));
    }

    /// <inheritdoc />
    public Task DeleteAsync(Guid savedFilterId, CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();

        var document = LoadDocument();
        var index = document.Filters.FindIndex(filter => filter.Id == savedFilterId);

        if (index < 0)
        {
            throw new SavedFilterNotFoundException(savedFilterId);
        }

        document.Filters.RemoveAt(index);
        PersistDocument(document);

        return Task.CompletedTask;
    }

    private SavedFilterCollectionDocument LoadDocument()
    {
        var storageKey = GetStorageKey();
        var json = _keyValueService.GetValue(storageKey);

        if (string.IsNullOrWhiteSpace(json))
        {
            return new SavedFilterCollectionDocument();
        }

        return JsonSerializer.Deserialize<SavedFilterCollectionDocument>(json, JsonOptions)
            ?? new SavedFilterCollectionDocument();
    }

    private void PersistDocument(SavedFilterCollectionDocument document)
    {
        var storageKey = GetStorageKey();
        var json = JsonSerializer.Serialize(document, JsonOptions);
        _keyValueService.SetValue(storageKey, json);
    }

    private string GetStorageKey()
    {
        var userKey = GetCurrentUserKey();
        return $"{SavedFilterConstants.KeyPrefix}:{userKey:N}";
    }

    private Guid GetCurrentUserKey()
    {
        IUser? currentUser = _backOfficeSecurityAccessor.BackOfficeSecurity?.CurrentUser;

        if (currentUser is null)
        {
            throw new UnauthorizedAccessException("No backoffice user found.");
        }

        return currentUser.Key;
    }

    private static SavedFilterCondition NormalizeCondition(SavedFilterCondition condition)
    {
        return condition with
        {
            ContentTypeAlias = condition.ContentTypeAlias.Trim(),
            PropertyAlias = condition.PropertyAlias.Trim(),
            PropertyValue = condition.PropertyValue.Trim(),
            FromDate = string.IsNullOrWhiteSpace(condition.FromDate)
                ? null
                : condition.FromDate.Trim(),
            ToDate = string.IsNullOrWhiteSpace(condition.ToDate)
                ? null
                : condition.ToDate.Trim(),
        };
    }

    private static SavedFilterResponse ToResponse(SavedFilterDocument document)
    {
        return new SavedFilterResponse
        {
            Id = document.Id,
            Name = document.Name,
            Updated = document.Updated,
            FilterType = document.FilterType,
            PageSize = document.PageSize,
            SearchCultureMode = document.SearchCultureMode,
            Culture = document.Culture,
            Conditions = document.Conditions,
        };
    }
}

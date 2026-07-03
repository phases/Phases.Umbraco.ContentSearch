using System.Text.Json;
using Microsoft.Extensions.Options;
using Phases.Umbraco.ContentSearch.Configuration;
using Phases.Umbraco.ContentSearch.SavedSearches.Constants;
using Phases.Umbraco.ContentSearch.SavedSearches.Enums;
using Phases.Umbraco.ContentSearch.SavedSearches.Exceptions;
using Phases.Umbraco.ContentSearch.SavedSearches.Models.Requests;
using Phases.Umbraco.ContentSearch.SavedSearches.Models.Responses;
using Phases.Umbraco.ContentSearch.SavedSearches.Models.Storage;
using Phases.Umbraco.ContentSearch.SavedSearches.Validation;
using Phases.Umbraco.ContentSearch.Models.Enums;
using Phases.Umbraco.ContentSearch.Search.Models;
using Umbraco.Cms.Core.Models.Membership;
using Umbraco.Cms.Core.Security;
using Umbraco.Cms.Core.Services;

namespace Phases.Umbraco.ContentSearch.SavedSearches;

/// <summary>
/// Persists saved searches using Umbraco <see cref="IKeyValueService"/>.
/// </summary>
public sealed class SavedSearchService : ISavedSearchService
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        WriteIndented = false,
    };

    private readonly IKeyValueService _keyValueService;
    private readonly IBackOfficeSecurityAccessor _backOfficeSecurityAccessor;
    private readonly ContentSearchOptions _options;

    /// <summary>
    /// Initializes a new instance of the <see cref="SavedSearchService"/> class.
    /// </summary>
    public SavedSearchService(
        IKeyValueService keyValueService,
        IBackOfficeSecurityAccessor backOfficeSecurityAccessor,
        IOptions<ContentSearchOptions> options)
    {
        _keyValueService = keyValueService;
        _backOfficeSecurityAccessor = backOfficeSecurityAccessor;
        _options = options.Value;
    }

    /// <inheritdoc />
    public Task<SavedSearchListResponse> GetAllAsync(CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();

        var currentUser = GetCurrentUser();
        var personal = LoadPersonalDocument(currentUser.Key);
        var shared = LoadSharedDocument();
        var preferences = LoadPreferencesDocument(currentUser.Key);
        var recent = LoadRecentDocument(currentUser.Key);

        var summaries = new List<SavedSearchSummaryResponse>();

        foreach (var search in personal.Searches)
        {
            summaries.Add(ToSummary(search, SavedSearchScope.Personal, preferences, currentUser.Key));
        }

        foreach (var search in shared.Searches)
        {
            summaries.Add(ToSummary(search, SavedSearchScope.Shared, preferences, currentUser.Key));
        }

        foreach (var search in recent.Searches)
        {
            summaries.Add(ToRecentSummary(search));
        }

        var ordered = summaries
            .OrderByDescending(item => item.LastUsed ?? item.Created)
            .ThenBy(item => item.Name, StringComparer.OrdinalIgnoreCase)
            .ToArray();

        return Task.FromResult(new SavedSearchListResponse
        {
            Items = ordered,
            Recent = ordered.Where(item => item.Scope == SavedSearchScope.Recent).ToArray(),
            Pinned = ordered.Where(item => item.IsPinned).ToArray(),
            Personal = ordered.Where(item => item.Scope == SavedSearchScope.Personal).ToArray(),
            Shared = ordered.Where(item => item.Scope == SavedSearchScope.Shared).ToArray(),
        });
    }

    /// <inheritdoc />
    public Task<SavedSearchDetailResponse> GetByIdAsync(
        Guid savedSearchId,
        CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();

        var currentUser = GetCurrentUser();
        var located = LocateSavedSearch(savedSearchId, currentUser.Key, includeRecent: true);

        if (located.RecentDocument is not null)
        {
            return Task.FromResult(ToDetail(
                SavedSearchScope.Recent,
                located.RecentDocument,
                located.Preferences,
                currentUser.Key));
        }

        return Task.FromResult(ToDetail(
            located.SummaryScope,
            located.Document!,
            located.Preferences,
            currentUser.Key));
    }

    /// <inheritdoc />
    public Task<SavedSearchDetailResponse> SaveAsync(
        SaveSavedSearchRequest request,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);
        cancellationToken.ThrowIfCancellationRequested();
        ValidateSave(request);

        var currentUser = GetCurrentUser();
        var now = DateTimeOffset.UtcNow;
        var document = new SavedSearchDocument
        {
            Id = Guid.NewGuid(),
            Name = request.Name.Trim(),
            Description = NormalizeDescription(request.Description),
            Definition = ToDefinitionDocument(request),
            Created = now,
            Updated = now,
            CreatedByUserKey = currentUser.Key,
            CreatedByUserName = currentUser.Name ?? currentUser.Username,
            UsageCount = 0,
        };

        if (request.IsShared)
        {
            var shared = LoadSharedDocument();

            if (shared.Searches.Count >= SavedSearchConstants.MaxShared)
            {
                throw new SavedSearchValidationException(
                [
                    $"A maximum of {SavedSearchConstants.MaxShared} shared searches is allowed.",
                ]);
            }

            EnsureUniqueName(document.Name, shared.Searches);
            shared.Searches.Add(document);
            PersistSharedDocument(shared);
        }
        else
        {
            var personal = LoadPersonalDocument(currentUser.Key);

            if (personal.Searches.Count >= SavedSearchConstants.MaxPersonalPerUser)
            {
                throw new SavedSearchValidationException(
                [
                    $"A maximum of {SavedSearchConstants.MaxPersonalPerUser} personal searches is allowed.",
                ]);
            }

            EnsureUniqueName(document.Name, personal.Searches);
            personal.Searches.Add(document);
            PersistPersonalDocument(currentUser.Key, personal);
        }

        var preferences = LoadPreferencesDocument(currentUser.Key);
        var scope = request.IsShared ? SavedSearchScope.Shared : SavedSearchScope.Personal;

        return Task.FromResult(ToDetail(scope, document, preferences, currentUser.Key));
    }

    /// <inheritdoc />
    public Task<SavedSearchDetailResponse> UpdateAsync(
        Guid savedSearchId,
        UpdateSavedSearchRequest request,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);
        cancellationToken.ThrowIfCancellationRequested();

        var errors = SavedSearchRequestValidator.ValidateUpdate(request);

        if (errors.Count > 0)
        {
            throw new SavedSearchValidationException(errors);
        }

        var currentUser = GetCurrentUser();
        var located = LocateSavedSearch(savedSearchId, currentUser.Key, includeRecent: false);
        EnsureCanModify(located, currentUser.Key);

        var normalizedName = request.Name.Trim();
        var collection = located.Collection!;

        if (collection.Any(search =>
                search.Id != savedSearchId &&
                search.Name.Equals(normalizedName, StringComparison.OrdinalIgnoreCase)))
        {
            throw new SavedSearchValidationException(
            [
                "A saved search with this name already exists.",
            ]);
        }

        located.Document!.Name = normalizedName;
        located.Document.Description = NormalizeDescription(request.Description);
        located.Document.Updated = DateTimeOffset.UtcNow;
        PersistLocatedCollection(located, currentUser.Key);

        return Task.FromResult(ToDetail(
            located.SummaryScope,
            located.Document,
            located.Preferences,
            currentUser.Key));
    }

    /// <inheritdoc />
    public async Task<SavedSearchDetailResponse> DuplicateAsync(
        Guid savedSearchId,
        CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();

        var currentUser = GetCurrentUser();
        var source = await GetByIdAsync(savedSearchId, cancellationToken).ConfigureAwait(false);
        var duplicateName = CreateDuplicateName(source.Name, currentUser.Key);

        return await SaveAsync(
            new SaveSavedSearchRequest
            {
                Name = duplicateName,
                Description = source.Description,
                IsShared = false,
                MatchMode = source.MatchMode,
                SearchCultureMode = source.SearchCultureMode,
                Culture = source.Culture,
                Conditions = source.Conditions,
                PageSize = source.PageSize,
                SortColumn = source.SortColumn,
                SortDescending = source.SortDescending,
            },
            cancellationToken).ConfigureAwait(false);
    }

    /// <inheritdoc />
    public Task DeleteAsync(Guid savedSearchId, CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();

        var currentUser = GetCurrentUser();

        if (TryDeleteRecent(savedSearchId, currentUser.Key))
        {
            return Task.CompletedTask;
        }

        var located = LocateSavedSearch(savedSearchId, currentUser.Key, includeRecent: false);
        EnsureCanModify(located, currentUser.Key);

        located.Collection!.RemoveAll(search => search.Id == savedSearchId);
        PersistLocatedCollection(located, currentUser.Key);
        RemovePreferencesForSearch(currentUser.Key, savedSearchId);

        return Task.CompletedTask;
    }

    /// <inheritdoc />
    public Task<SavedSearchSummaryResponse> TogglePinAsync(
        Guid savedSearchId,
        CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();

        var currentUser = GetCurrentUser();
        var located = LocateSavedSearch(savedSearchId, currentUser.Key, includeRecent: false);
        var preferences = located.Preferences;

        if (preferences.PinnedIds.Contains(savedSearchId))
        {
            preferences.PinnedIds.Remove(savedSearchId);
        }
        else
        {
            preferences.PinnedIds.Add(savedSearchId);
        }

        PersistPreferencesDocument(currentUser.Key, preferences);

        return Task.FromResult(ToSummary(
            located.Document!,
            located.SummaryScope,
            preferences,
            currentUser.Key));
    }

    /// <inheritdoc />
    public Task<SavedSearchSummaryResponse> ToggleFavouriteAsync(
        Guid savedSearchId,
        CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();

        var currentUser = GetCurrentUser();
        var located = LocateSavedSearch(savedSearchId, currentUser.Key, includeRecent: false);
        var preferences = located.Preferences;

        if (preferences.FavouriteIds.Contains(savedSearchId))
        {
            preferences.FavouriteIds.Remove(savedSearchId);
        }
        else
        {
            preferences.FavouriteIds.Add(savedSearchId);
        }

        PersistPreferencesDocument(currentUser.Key, preferences);

        return Task.FromResult(ToSummary(
            located.Document!,
            located.SummaryScope,
            preferences,
            currentUser.Key));
    }

    /// <inheritdoc />
    public Task RecordSavedSearchUsageAsync(Guid savedSearchId, CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();

        var currentUser = GetCurrentUser();
        var located = LocateSavedSearch(savedSearchId, currentUser.Key, includeRecent: false);
        var now = DateTimeOffset.UtcNow;

        located.Document!.UsageCount++;
        located.Document.Updated = now;
        PersistLocatedCollection(located, currentUser.Key);

        var preferences = located.Preferences;
        preferences.LastUsedBySearchId[savedSearchId.ToString("N")] = now;
        PersistPreferencesDocument(currentUser.Key, preferences);

        UpsertRecentFromSavedSearch(located.Document, currentUser.Key, now);

        return Task.CompletedTask;
    }

    /// <inheritdoc />
    public Task RecordRecentSearchAsync(
        RecordRecentSearchRequest request,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(request);
        cancellationToken.ThrowIfCancellationRequested();

        var errors = SavedSearchRequestValidator.ValidateRecent(request, _options);

        if (errors.Count > 0)
        {
            throw new SavedSearchValidationException(errors);
        }

        var currentUser = GetCurrentUser();
        var now = DateTimeOffset.UtcNow;
        var recent = LoadRecentDocument(currentUser.Key);
        var definition = ToDefinitionDocument(request);
        var signature = BuildDefinitionSignature(definition);

        var existing = recent.Searches.FirstOrDefault(entry =>
            entry.SavedSearchId == request.SavedSearchId &&
            BuildDefinitionSignature(entry.Definition) == signature);

        if (existing is not null)
        {
            existing.LastUsed = now;
            existing.UsageCount++;
            existing.Name = request.Name.Trim();
            existing.Description = NormalizeDescription(request.Description);
            existing.Definition = definition;
        }
        else
        {
            recent.Searches.Insert(0, new RecentSearchDocument
            {
                Id = Guid.NewGuid(),
                SavedSearchId = request.SavedSearchId,
                Name = request.Name.Trim(),
                Description = NormalizeDescription(request.Description),
                Definition = definition,
                LastUsed = now,
                UsageCount = 1,
            });
        }

        recent.Searches = recent.Searches
            .OrderByDescending(entry => entry.LastUsed)
            .Take(SavedSearchConstants.MaxRecent)
            .ToList();

        PersistRecentDocument(currentUser.Key, recent);

        if (request.SavedSearchId is Guid savedSearchId)
        {
            return RecordSavedSearchUsageAsync(savedSearchId, cancellationToken);
        }

        return Task.CompletedTask;
    }

    private void ValidateSave(SaveSavedSearchRequest request)
    {
        var errors = SavedSearchRequestValidator.ValidateSave(request, _options);

        if (errors.Count > 0)
        {
            throw new SavedSearchValidationException(errors);
        }
    }

    private string CreateDuplicateName(string sourceName, Guid userKey)
    {
        var personal = LoadPersonalDocument(userKey);
        var baseName = $"{sourceName.Trim()} (Copy)";
        var candidate = baseName;
        var index = 2;

        while (personal.Searches.Any(search =>
                   search.Name.Equals(candidate, StringComparison.OrdinalIgnoreCase)))
        {
            candidate = $"{baseName} {index}";
            index++;
        }

        return candidate;
    }

    private void UpsertRecentFromSavedSearch(
        SavedSearchDocument document,
        Guid userKey,
        DateTimeOffset lastUsed)
    {
        var recent = LoadRecentDocument(userKey);
        var existing = recent.Searches.FirstOrDefault(entry => entry.SavedSearchId == document.Id);

        if (existing is not null)
        {
            existing.LastUsed = lastUsed;
            existing.UsageCount++;
            existing.Name = document.Name;
            existing.Description = document.Description;
            existing.Definition = CloneDefinition(document.Definition);
        }
        else
        {
            recent.Searches.Insert(0, new RecentSearchDocument
            {
                Id = Guid.NewGuid(),
                SavedSearchId = document.Id,
                Name = document.Name,
                Description = document.Description,
                Definition = CloneDefinition(document.Definition),
                LastUsed = lastUsed,
                UsageCount = 1,
            });
        }

        recent.Searches = recent.Searches
            .OrderByDescending(entry => entry.LastUsed)
            .Take(SavedSearchConstants.MaxRecent)
            .ToList();

        PersistRecentDocument(userKey, recent);
    }

    private bool TryDeleteRecent(Guid savedSearchId, Guid userKey)
    {
        var recent = LoadRecentDocument(userKey);
        var removed = recent.Searches.RemoveAll(entry => entry.Id == savedSearchId);

        if (removed == 0)
        {
            return false;
        }

        PersistRecentDocument(userKey, recent);
        return true;
    }

    private void RemovePreferencesForSearch(Guid userKey, Guid savedSearchId)
    {
        var preferences = LoadPreferencesDocument(userKey);
        preferences.PinnedIds.Remove(savedSearchId);
        preferences.FavouriteIds.Remove(savedSearchId);
        preferences.LastUsedBySearchId.Remove(savedSearchId.ToString("N"));
        PersistPreferencesDocument(userKey, preferences);
    }

    private static void EnsureCanModify(LocatedSavedSearch located, Guid currentUserKey)
    {
        if (located.SummaryScope == SavedSearchScope.Shared &&
            located.Document!.CreatedByUserKey != currentUserKey)
        {
            throw new SavedSearchValidationException(
            [
                "Only the creator can modify a shared search.",
            ]);
        }
    }

    private static void EnsureUniqueName(
        string name,
        IReadOnlyList<SavedSearchDocument> searches)
    {
        if (searches.Any(search =>
                search.Name.Equals(name, StringComparison.OrdinalIgnoreCase)))
        {
            throw new SavedSearchValidationException(
            [
                "A saved search with this name already exists.",
            ]);
        }
    }

    private LocatedSavedSearch LocateSavedSearch(
        Guid savedSearchId,
        Guid userKey,
        bool includeRecent)
    {
        var preferences = LoadPreferencesDocument(userKey);
        var personal = LoadPersonalDocument(userKey);
        var personalMatch = personal.Searches.FirstOrDefault(search => search.Id == savedSearchId);

        if (personalMatch is not null)
        {
            return new LocatedSavedSearch
            {
                SummaryScope = SavedSearchScope.Personal,
                Document = personalMatch,
                Collection = personal.Searches,
                IsSharedCollection = false,
                Preferences = preferences,
            };
        }

        var shared = LoadSharedDocument();
        var sharedMatch = shared.Searches.FirstOrDefault(search => search.Id == savedSearchId);

        if (sharedMatch is not null)
        {
            return new LocatedSavedSearch
            {
                SummaryScope = SavedSearchScope.Shared,
                Document = sharedMatch,
                Collection = shared.Searches,
                IsSharedCollection = true,
                Preferences = preferences,
            };
        }

        if (includeRecent)
        {
            var recent = LoadRecentDocument(userKey);
            var recentMatch = recent.Searches.FirstOrDefault(search => search.Id == savedSearchId);

            if (recentMatch is not null)
            {
                return new LocatedSavedSearch
                {
                    SummaryScope = SavedSearchScope.Recent,
                    RecentDocument = recentMatch,
                    Preferences = preferences,
                };
            }
        }

        throw new SavedSearchNotFoundException(savedSearchId);
    }

    private void PersistLocatedCollection(LocatedSavedSearch located, Guid userKey)
    {
        if (located.IsSharedCollection)
        {
            PersistSharedDocument(new SharedSavedSearchCollectionDocument
            {
                Searches = located.Collection ?? [],
            });
            return;
        }

        PersistPersonalDocument(userKey, new PersonalSavedSearchCollectionDocument
        {
            Searches = located.Collection ?? [],
        });
    }

    private IUser GetCurrentUser()
    {
        IUser? currentUser = _backOfficeSecurityAccessor.BackOfficeSecurity?.CurrentUser;

        if (currentUser is null)
        {
            throw new UnauthorizedAccessException("No backoffice user found.");
        }

        return currentUser;
    }

    private PersonalSavedSearchCollectionDocument LoadPersonalDocument(Guid userKey)
        => LoadDocument<PersonalSavedSearchCollectionDocument>($"{SavedSearchConstants.PersonalKeyPrefix}:{userKey:N}")
           ?? new PersonalSavedSearchCollectionDocument();

    private SharedSavedSearchCollectionDocument LoadSharedDocument()
        => LoadDocument<SharedSavedSearchCollectionDocument>(SavedSearchConstants.SharedStorageKey)
           ?? new SharedSavedSearchCollectionDocument();

    private SavedSearchUserPreferencesDocument LoadPreferencesDocument(Guid userKey)
        => LoadDocument<SavedSearchUserPreferencesDocument>($"{SavedSearchConstants.PreferencesKeyPrefix}:{userKey:N}")
           ?? new SavedSearchUserPreferencesDocument();

    private RecentSearchCollectionDocument LoadRecentDocument(Guid userKey)
        => LoadDocument<RecentSearchCollectionDocument>($"{SavedSearchConstants.RecentKeyPrefix}:{userKey:N}")
           ?? new RecentSearchCollectionDocument();

    private TDocument? LoadDocument<TDocument>(string storageKey)
    {
        var json = _keyValueService.GetValue(storageKey);

        if (string.IsNullOrWhiteSpace(json))
        {
            return default;
        }

        try
        {
            return JsonSerializer.Deserialize<TDocument>(json, JsonOptions);
        }
        catch (JsonException)
        {
            return default;
        }
    }

    private void PersistPersonalDocument(Guid userKey, PersonalSavedSearchCollectionDocument document)
        => PersistDocument($"{SavedSearchConstants.PersonalKeyPrefix}:{userKey:N}", document);

    private void PersistSharedDocument(SharedSavedSearchCollectionDocument document)
        => PersistDocument(SavedSearchConstants.SharedStorageKey, document);

    private void PersistPreferencesDocument(Guid userKey, SavedSearchUserPreferencesDocument document)
        => PersistDocument($"{SavedSearchConstants.PreferencesKeyPrefix}:{userKey:N}", document);

    private void PersistRecentDocument(Guid userKey, RecentSearchCollectionDocument document)
        => PersistDocument($"{SavedSearchConstants.RecentKeyPrefix}:{userKey:N}", document);

    private void PersistDocument<TDocument>(string storageKey, TDocument document)
    {
        var json = JsonSerializer.Serialize(document, JsonOptions);
        _keyValueService.SetValue(storageKey, json);
    }

    private SavedSearchSummaryResponse ToSummary(
        SavedSearchDocument document,
        SavedSearchScope scope,
        SavedSearchUserPreferencesDocument preferences,
        Guid currentUserKey)
    {
        return new SavedSearchSummaryResponse
        {
            Id = document.Id,
            Name = document.Name,
            Description = document.Description,
            Scope = scope,
            LastUsed = GetLastUsed(preferences, document.Id),
            Created = document.Created,
            CreatedBy = document.CreatedByUserName,
            UsageCount = document.UsageCount,
            IsPinned = preferences.PinnedIds.Contains(document.Id),
            IsFavourite = preferences.FavouriteIds.Contains(document.Id),
            IsOwnedByCurrentUser = document.CreatedByUserKey == currentUserKey,
        };
    }

    private SavedSearchSummaryResponse ToRecentSummary(RecentSearchDocument document)
    {
        return new SavedSearchSummaryResponse
        {
            Id = document.Id,
            Name = document.Name,
            Description = document.Description,
            Scope = SavedSearchScope.Recent,
            LastUsed = document.LastUsed,
            Created = document.LastUsed,
            CreatedBy = "You",
            UsageCount = document.UsageCount,
            IsPinned = false,
            IsFavourite = false,
            IsOwnedByCurrentUser = true,
        };
    }

    private SavedSearchDetailResponse ToDetail(
        SavedSearchScope scope,
        SavedSearchDocument document,
        SavedSearchUserPreferencesDocument preferences,
        Guid currentUserKey)
    {
        var summary = ToSummary(document, scope, preferences, currentUserKey);

        return new SavedSearchDetailResponse
        {
            Id = summary.Id,
            Name = summary.Name,
            Description = summary.Description,
            Scope = summary.Scope,
            LastUsed = summary.LastUsed,
            Created = summary.Created,
            CreatedBy = summary.CreatedBy,
            UsageCount = summary.UsageCount,
            IsPinned = summary.IsPinned,
            IsFavourite = summary.IsFavourite,
            IsOwnedByCurrentUser = summary.IsOwnedByCurrentUser,
            MatchMode = document.Definition.MatchMode,
            SearchCultureMode = document.Definition.SearchCultureMode,
            Culture = document.Definition.Culture,
            Conditions = ToConditionRequests(document.Definition.Conditions),
            PageSize = document.Definition.PageSize,
            SortColumn = document.Definition.SortColumn,
            SortDescending = document.Definition.SortDescending,
        };
    }

    private SavedSearchDetailResponse ToDetail(
        SavedSearchScope scope,
        RecentSearchDocument document,
        SavedSearchUserPreferencesDocument preferences,
        Guid currentUserKey)
    {
        var summary = ToRecentSummary(document);

        return new SavedSearchDetailResponse
        {
            Id = summary.Id,
            Name = summary.Name,
            Description = summary.Description,
            Scope = summary.Scope,
            LastUsed = summary.LastUsed,
            Created = summary.Created,
            CreatedBy = summary.CreatedBy,
            UsageCount = summary.UsageCount,
            IsPinned = summary.IsPinned,
            IsFavourite = summary.IsFavourite,
            IsOwnedByCurrentUser = summary.IsOwnedByCurrentUser,
            MatchMode = document.Definition.MatchMode,
            SearchCultureMode = document.Definition.SearchCultureMode,
            Culture = document.Definition.Culture,
            Conditions = ToConditionRequests(document.Definition.Conditions),
            PageSize = document.Definition.PageSize,
            SortColumn = document.Definition.SortColumn,
            SortDescending = document.Definition.SortDescending,
            LinkedSavedSearchId = document.SavedSearchId,
        };
    }

    private static DateTimeOffset? GetLastUsed(
        SavedSearchUserPreferencesDocument preferences,
        Guid savedSearchId)
    {
        return preferences.LastUsedBySearchId.TryGetValue(
            savedSearchId.ToString("N"),
            out var lastUsed)
            ? lastUsed
            : null;
    }

    private static SavedSearchDefinitionDocument ToDefinitionDocument(SaveSavedSearchRequest request)
        => new()
        {
            MatchMode = request.MatchMode,
            SearchCultureMode = request.SearchCultureMode,
            Culture = NormalizeCulture(request.Culture, request.SearchCultureMode),
            Conditions = request.Conditions.Select(ToConditionDocument).ToList(),
            PageSize = request.PageSize,
            SortColumn = request.SortColumn,
            SortDescending = request.SortDescending,
        };

    private static SavedSearchDefinitionDocument ToDefinitionDocument(RecordRecentSearchRequest request)
        => new()
        {
            MatchMode = request.MatchMode,
            SearchCultureMode = request.SearchCultureMode,
            Culture = NormalizeCulture(request.Culture, request.SearchCultureMode),
            Conditions = request.Conditions.Select(ToConditionDocument).ToList(),
            PageSize = request.PageSize,
            SortColumn = request.SortColumn,
            SortDescending = request.SortDescending,
        };

    private static SavedSearchConditionDocument ToConditionDocument(SearchConditionRequest condition)
        => new()
        {
            ContentTypeAlias = condition.ContentTypeAlias.Trim(),
            PropertyAlias = condition.PropertyAlias.Trim(),
            Operator = condition.Operator.Trim(),
            Value = condition.Value?.Trim(),
        };

    private static IReadOnlyList<SearchConditionRequest> ToConditionRequests(
        IReadOnlyList<SavedSearchConditionDocument> conditions)
        => conditions
            .Select(condition => new SearchConditionRequest
            {
                ContentTypeAlias = condition.ContentTypeAlias,
                PropertyAlias = condition.PropertyAlias,
                Operator = condition.Operator,
                Value = condition.Value,
            })
            .ToArray();

    private static SavedSearchDefinitionDocument CloneDefinition(SavedSearchDefinitionDocument definition)
        => new()
        {
            MatchMode = definition.MatchMode,
            SearchCultureMode = definition.SearchCultureMode,
            Culture = definition.Culture,
            Conditions = definition.Conditions
                .Select(condition => new SavedSearchConditionDocument
                {
                    ContentTypeAlias = condition.ContentTypeAlias,
                    PropertyAlias = condition.PropertyAlias,
                    Operator = condition.Operator,
                    Value = condition.Value,
                })
                .ToList(),
            PageSize = definition.PageSize,
            SortColumn = definition.SortColumn,
            SortDescending = definition.SortDescending,
        };

    private static string? NormalizeCulture(string? culture, SearchCultureMode mode)
        => mode == SearchCultureMode.SpecificCulture &&
           !string.IsNullOrWhiteSpace(culture)
            ? culture.Trim()
            : null;

    private static string? NormalizeDescription(string? description)
        => string.IsNullOrWhiteSpace(description) ? null : description.Trim();

    private static string BuildDefinitionSignature(SavedSearchDefinitionDocument definition)
        => JsonSerializer.Serialize(definition, JsonOptions);

    private sealed class LocatedSavedSearch
    {
        public SavedSearchScope SummaryScope { get; init; }

        public SavedSearchDocument? Document { get; init; }

        public RecentSearchDocument? RecentDocument { get; init; }

        public List<SavedSearchDocument>? Collection { get; init; }

        public bool IsSharedCollection { get; init; }

        public SavedSearchUserPreferencesDocument Preferences { get; init; } = new();
    }
}

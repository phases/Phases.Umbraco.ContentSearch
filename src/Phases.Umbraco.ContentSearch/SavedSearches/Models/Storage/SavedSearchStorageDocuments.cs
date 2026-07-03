using Phases.Umbraco.ContentSearch.Models.Enums;
using Phases.Umbraco.ContentSearch.Search.Enums;

namespace Phases.Umbraco.ContentSearch.SavedSearches.Models.Storage;

/// <summary>
/// Root document for a user's personal saved searches.
/// </summary>
internal sealed class PersonalSavedSearchCollectionDocument
{
    public int Version { get; set; } = 1;

    public List<SavedSearchDocument> Searches { get; set; } = [];
}

/// <summary>
/// Root document for shared saved searches.
/// </summary>
internal sealed class SharedSavedSearchCollectionDocument
{
    public int Version { get; set; } = 1;

    public List<SavedSearchDocument> Searches { get; set; } = [];
}

/// <summary>
/// A persisted saved search definition.
/// </summary>
internal sealed class SavedSearchDocument
{
    public Guid Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    public SavedSearchDefinitionDocument Definition { get; set; } = new();

    public DateTimeOffset Created { get; set; }

    public DateTimeOffset Updated { get; set; }

    public Guid CreatedByUserKey { get; set; }

    public string CreatedByUserName { get; set; } = string.Empty;

    public int UsageCount { get; set; }
}

/// <summary>
/// The executable search definition stored with a saved or recent search.
/// </summary>
internal sealed class SavedSearchDefinitionDocument
{
    public SearchMatchMode MatchMode { get; set; } = SearchMatchMode.All;

    public SearchCultureMode SearchCultureMode { get; set; } = SearchCultureMode.AllCultures;

    public string? Culture { get; set; }

    public List<SavedSearchConditionDocument> Conditions { get; set; } = [];

    public int PageSize { get; set; } = 20;

    public string? SortColumn { get; set; }

    public bool SortDescending { get; set; }
}

/// <summary>
/// A single condition stored with a saved search.
/// </summary>
internal sealed class SavedSearchConditionDocument
{
    public string ContentTypeAlias { get; set; } = string.Empty;

    public string PropertyAlias { get; set; } = string.Empty;

    public string Operator { get; set; } = string.Empty;

    public string? Value { get; set; }
}

/// <summary>
/// Per-user pin, favourite, and last-used preferences.
/// </summary>
internal sealed class SavedSearchUserPreferencesDocument
{
    public int Version { get; set; } = 1;

    public List<Guid> PinnedIds { get; set; } = [];

    public List<Guid> FavouriteIds { get; set; } = [];

    public Dictionary<string, DateTimeOffset> LastUsedBySearchId { get; set; } = [];
}

/// <summary>
/// Root document for a user's recent searches.
/// </summary>
internal sealed class RecentSearchCollectionDocument
{
    public int Version { get; set; } = 1;

    public List<RecentSearchDocument> Searches { get; set; } = [];
}

/// <summary>
/// A recently executed search snapshot.
/// </summary>
internal sealed class RecentSearchDocument
{
    public Guid Id { get; set; }

    public Guid? SavedSearchId { get; set; }

    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    public SavedSearchDefinitionDocument Definition { get; set; } = new();

    public DateTimeOffset LastUsed { get; set; }

    public int UsageCount { get; set; } = 1;
}

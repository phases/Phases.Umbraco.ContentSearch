using Phases.Umbraco.FilterNodes.Models.Enums;
using Phases.Umbraco.FilterNodes.Models.Requests;

namespace Phases.Umbraco.FilterNodes.Models.Storage;

/// <summary>
/// Root document stored in Umbraco key-value storage.
/// </summary>
internal sealed class SavedFilterCollectionDocument
{
    public int Version { get; set; } = 1;

    public List<SavedFilterDocument> Filters { get; set; } = [];
}

/// <summary>
/// A saved filter persisted for a backoffice user.
/// </summary>
internal sealed class SavedFilterDocument
{
    public Guid Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public DateTimeOffset Updated { get; set; }

    public FilterType FilterType { get; set; } = FilterType.All;

    public int PageSize { get; set; }

    public SearchCultureMode SearchCultureMode { get; set; } = SearchCultureMode.AllCultures;

    public string? Culture { get; set; }

    public List<SavedFilterCondition> Conditions { get; set; } = [];
}

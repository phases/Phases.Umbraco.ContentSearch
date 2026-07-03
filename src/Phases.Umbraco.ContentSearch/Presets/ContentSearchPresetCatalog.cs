using Phases.Umbraco.ContentSearch.Metadata.Constants;
using Phases.Umbraco.ContentSearch.Models.Enums;
using Phases.Umbraco.ContentSearch.Presets.Models;
using Phases.Umbraco.ContentSearch.Search.Enums;
using Phases.Umbraco.ContentSearch.Search.Models;

namespace Phases.Umbraco.ContentSearch.Presets;

/// <summary>
/// Built-in generic quick search presets for common editorial tasks.
/// </summary>
public sealed class ContentSearchPresetCatalog : IContentSearchPresetCatalog
{
    /// <inheritdoc />
    public Task<ContentSearchPresetListResponse> GetAllAsync(CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();

        return Task.FromResult(new ContentSearchPresetListResponse
        {
            Presets = BuildPresets(),
        });
    }

    /// <inheritdoc />
    public Task<ContentSearchPresetResponse?> GetByIdAsync(
        string presetId,
        CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();

        var preset = BuildPresets()
            .FirstOrDefault(item => item.Id.Equals(presetId, StringComparison.OrdinalIgnoreCase));

        return Task.FromResult(preset);
    }

    private static IReadOnlyList<ContentSearchPresetResponse> BuildPresets()
    {
        var sevenDaysAgo = DateTimeOffset.UtcNow.AddDays(-7).ToString("O");
        var wildcard = ContentSearchMetadataConstants.WildcardContentTypeAlias;

        return
        [
            CreatePreset(
                "recently-created",
                "Recently Created Content",
                "Published content created in the last 7 days.",
                conditions:
                [
                    Condition(wildcard, ContentSearchMetadataConstants.CreatedDatePropertyAlias, "greaterThan", sevenDaysAgo),
                ],
                sortColumn: "createDate",
                sortDescending: true),
            CreatePreset(
                "recently-updated",
                "Recently Updated Content",
                "Published content updated in the last 7 days.",
                conditions:
                [
                    Condition(wildcard, ContentSearchMetadataConstants.UpdatedDatePropertyAlias, "greaterThan", sevenDaysAgo),
                ],
                sortColumn: "updateDate",
                sortDescending: true),
        ];
    }

    private static ContentSearchPresetResponse CreatePreset(
        string id,
        string name,
        string description,
        IReadOnlyList<SearchConditionRequest> conditions,
        SearchMatchMode matchMode = SearchMatchMode.All,
        string? sortColumn = null,
        bool sortDescending = false)
        => new()
        {
            Id = id,
            Name = name,
            Description = description,
            MatchMode = matchMode,
            SearchCultureMode = SearchCultureMode.AllCultures,
            Conditions = conditions,
            PageSize = 20,
            SortColumn = sortColumn,
            SortDescending = sortDescending,
        };

    private static SearchConditionRequest Condition(
        string contentTypeAlias,
        string propertyAlias,
        string @operator,
        string? value = null)
        => new()
        {
            ContentTypeAlias = contentTypeAlias,
            PropertyAlias = propertyAlias,
            Operator = @operator,
            Value = value,
        };
}

using System.Text.Json.Serialization;
using Phases.Umbraco.ContentSearch.Search.Models;

namespace Phases.Umbraco.ContentSearch.Export.Models;

/// <summary>
/// Request to export the current search results.
/// </summary>
/// <remarks>
/// The export reuses the same query the grid is displaying (filters, culture, sorting and
/// scope) so the generated file mirrors what the editor currently sees. No new search logic
/// is introduced; the existing search pipeline produces the rows that are formatted.
/// </remarks>
public sealed class ContentSearchExportRequest
{
    /// <summary>
    /// The maximum number of rows included in a single export.
    /// </summary>
    public const int MaxRows = 10000;

    /// <summary>
    /// Gets or sets the export format.
    /// </summary>
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public ContentExportFormat Format { get; init; } = ContentExportFormat.Csv;

    /// <summary>
    /// Gets or sets the search that defines the result set to export.
    /// </summary>
    public ContentSearchRequest Search { get; init; } = new();
}

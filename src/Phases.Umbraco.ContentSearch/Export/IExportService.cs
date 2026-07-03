using Phases.Umbraco.ContentSearch.Search.Models;

namespace Phases.Umbraco.ContentSearch.Export;

/// <summary>
/// Generates a downloadable export from an already executed search result.
/// </summary>
/// <remarks>
/// Implementations never perform searching; they only format the supplied
/// <see cref="ContentSearchResult"/>. Add a new implementation (for example PDF or JSON)
/// to support additional formats without touching the search pipeline.
/// </remarks>
public interface IExportService
{
    /// <summary>
    /// Gets the export format this service produces.
    /// </summary>
    ContentExportFormat Format { get; }

    /// <summary>
    /// Builds an export file from the supplied search result.
    /// </summary>
    /// <param name="result">The already available search result.</param>
    /// <param name="columns">The ordered columns to export.</param>
    /// <returns>The generated export file.</returns>
    ContentExportFile Export(
        ContentSearchResult result,
        IReadOnlyList<ContentExportColumn> columns);
}

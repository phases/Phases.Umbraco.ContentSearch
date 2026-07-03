using Phases.Umbraco.ContentSearch.Search.Models;

namespace Phases.Umbraco.ContentSearch.Export;

/// <summary>
/// Resolves the appropriate <see cref="IExportService"/> and generates an export file.
/// </summary>
public interface IContentExportManager
{
    /// <summary>
    /// Generates an export file from an already available search result.
    /// </summary>
    /// <param name="format">The requested export format.</param>
    /// <param name="result">The already available search result.</param>
    /// <returns>The generated export file.</returns>
    ContentExportFile Export(ContentExportFormat format, ContentSearchResult result);
}

/// <summary>
/// Default implementation of <see cref="IContentExportManager"/> that delegates to the
/// registered <see cref="IExportService"/> matching the requested format.
/// </summary>
public sealed class ContentExportManager : IContentExportManager
{
    private readonly IReadOnlyDictionary<ContentExportFormat, IExportService> _services;

    /// <summary>
    /// Initializes a new instance of the <see cref="ContentExportManager"/> class.
    /// </summary>
    /// <param name="exportServices">The registered export services.</param>
    public ContentExportManager(IEnumerable<IExportService> exportServices)
    {
        ArgumentNullException.ThrowIfNull(exportServices);

        _services = exportServices.ToDictionary(service => service.Format);
    }

    /// <inheritdoc />
    public ContentExportFile Export(ContentExportFormat format, ContentSearchResult result)
    {
        ArgumentNullException.ThrowIfNull(result);

        if (!_services.TryGetValue(format, out var service))
        {
            throw new NotSupportedException($"Export format '{format}' is not supported.");
        }

        return service.Export(result, ContentExportColumns.Default);
    }
}

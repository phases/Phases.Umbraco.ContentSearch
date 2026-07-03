using System.Globalization;

namespace Phases.Umbraco.ContentSearch.Export;

/// <summary>
/// Builds consistent, timestamped export file names.
/// </summary>
internal static class ContentExportFileNaming
{
    private const string BaseName = "content-search-results";

    internal static string Build(ContentExportFormat format)
    {
        var timestamp = DateTime.Now.ToString("yyyyMMdd-HHmmss", CultureInfo.InvariantCulture);
        return $"{BaseName}-{timestamp}.{GetExtension(format)}";
    }

    private static string GetExtension(ContentExportFormat format) => format switch
    {
        ContentExportFormat.Csv => "csv",
        ContentExportFormat.Excel => "xlsx",
        _ => "dat",
    };
}

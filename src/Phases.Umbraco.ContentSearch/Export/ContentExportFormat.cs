namespace Phases.Umbraco.ContentSearch.Export;

/// <summary>
/// Supported content search export formats.
/// </summary>
public enum ContentExportFormat
{
    /// <summary>
    /// Comma separated values (UTF-8 with BOM, Excel compatible).
    /// </summary>
    Csv = 0,

    /// <summary>
    /// Microsoft Excel workbook (.xlsx).
    /// </summary>
    Excel = 1,
}

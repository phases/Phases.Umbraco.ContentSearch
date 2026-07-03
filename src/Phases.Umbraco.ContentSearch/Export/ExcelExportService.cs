using ClosedXML.Excel;
using Phases.Umbraco.ContentSearch.Search.Models;

namespace Phases.Umbraco.ContentSearch.Export;

/// <summary>
/// Produces a styled .xlsx workbook using ClosedXML.
/// </summary>
public sealed class ExcelExportService : IExportService
{
    private const string ContentTypeValue =
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    private const string WorksheetName = "Search Results";
    private const string DateNumberFormat = "yyyy-mm-dd hh:mm";

    /// <inheritdoc />
    public ContentExportFormat Format => ContentExportFormat.Excel;

    /// <inheritdoc />
    public ContentExportFile Export(
        ContentSearchResult result,
        IReadOnlyList<ContentExportColumn> columns)
    {
        ArgumentNullException.ThrowIfNull(result);
        ArgumentNullException.ThrowIfNull(columns);

        using var workbook = new XLWorkbook();
        var worksheet = workbook.Worksheets.Add(WorksheetName);

        WriteHeader(worksheet, columns);
        WriteRows(worksheet, result.Items, columns);
        ApplyFormatting(worksheet, columns, result.Items.Count);

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);

        return new ContentExportFile
        {
            FileName = ContentExportFileNaming.Build(ContentExportFormat.Excel),
            ContentType = ContentTypeValue,
            Content = stream.ToArray(),
        };
    }

    private static void WriteHeader(
        IXLWorksheet worksheet,
        IReadOnlyList<ContentExportColumn> columns)
    {
        for (var columnIndex = 0; columnIndex < columns.Count; columnIndex++)
        {
            var cell = worksheet.Cell(1, columnIndex + 1);
            cell.Value = columns[columnIndex].Header;
            cell.Style.Font.Bold = true;
        }
    }

    private static void WriteRows(
        IXLWorksheet worksheet,
        IReadOnlyList<ContentSearchResultItem> items,
        IReadOnlyList<ContentExportColumn> columns)
    {
        for (var rowIndex = 0; rowIndex < items.Count; rowIndex++)
        {
            var item = items[rowIndex];

            for (var columnIndex = 0; columnIndex < columns.Count; columnIndex++)
            {
                WriteCell(
                    worksheet.Cell(rowIndex + 2, columnIndex + 1),
                    columns[columnIndex],
                    item);
            }
        }
    }

    private static void WriteCell(
        IXLCell cell,
        ContentExportColumn column,
        ContentSearchResultItem item)
    {
        switch (column.Type)
        {
            case ContentExportColumnType.Date when column.GetDate is not null:
                var date = column.GetDate(item);
                if (date.HasValue)
                {
                    cell.Value = date.Value;
                    cell.Style.DateFormat.Format = DateNumberFormat;
                }

                break;

            case ContentExportColumnType.Url:
                WriteUrlCell(cell, column, item);
                break;

            case ContentExportColumnType.Number:
                var text = column.GetText(item);
                if (long.TryParse(text, out var number))
                {
                    cell.Value = number;
                }
                else
                {
                    cell.Value = text ?? string.Empty;
                }

                break;

            default:
                cell.Value = column.GetText(item) ?? string.Empty;
                break;
        }
    }

    private static void WriteUrlCell(
        IXLCell cell,
        ContentExportColumn column,
        ContentSearchResultItem item)
    {
        var display = column.GetText(item);
        var url = column.GetUrl?.Invoke(item);

        cell.Value = display ?? url ?? string.Empty;

        if (!string.IsNullOrWhiteSpace(url) &&
            Uri.TryCreate(url, UriKind.Absolute, out var uri))
        {
            cell.SetHyperlink(new XLHyperlink(uri));
            cell.Style.Font.Underline = XLFontUnderlineValues.Single;
            cell.Style.Font.FontColor = XLColor.Blue;
        }
    }

    private static void ApplyFormatting(
        IXLWorksheet worksheet,
        IReadOnlyList<ContentExportColumn> columns,
        int rowCount)
    {
        var usedRange = worksheet.Range(1, 1, rowCount + 1, columns.Count);
        usedRange.SetAutoFilter();

        worksheet.SheetView.FreezeRows(1);
        worksheet.Columns().AdjustToContents();
    }
}

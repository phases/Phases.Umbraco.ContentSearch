using System.Text;
using Phases.Umbraco.ContentSearch.Search.Models;

namespace Phases.Umbraco.ContentSearch.Export;

/// <summary>
/// Produces a UTF-8 (with BOM) CSV export that opens cleanly in Excel.
/// </summary>
public sealed class CsvExportService : IExportService
{
    private const string ContentTypeValue = "text/csv";
    private const string LineEnding = "\r\n";

    /// <inheritdoc />
    public ContentExportFormat Format => ContentExportFormat.Csv;

    /// <inheritdoc />
    public ContentExportFile Export(
        ContentSearchResult result,
        IReadOnlyList<ContentExportColumn> columns)
    {
        ArgumentNullException.ThrowIfNull(result);
        ArgumentNullException.ThrowIfNull(columns);

        var builder = new StringBuilder();

        builder.Append(string.Join(',', columns.Select(column => Escape(column.Header))));
        builder.Append(LineEnding);

        foreach (var item in result.Items)
        {
            builder.Append(string.Join(',', columns.Select(column => Escape(column.GetText(item)))));
            builder.Append(LineEnding);
        }

        // UTF-8 with BOM so Excel detects the encoding correctly.
        var encoding = new UTF8Encoding(encoderShouldEmitUTF8Identifier: true);

        return new ContentExportFile
        {
            FileName = ContentExportFileNaming.Build(ContentExportFormat.Csv),
            ContentType = ContentTypeValue,
            Content = encoding.GetBytes(builder.ToString()),
        };
    }

    private static string Escape(string? value)
    {
        if (string.IsNullOrEmpty(value))
        {
            return string.Empty;
        }

        var sanitized = GuardAgainstFormulaInjection(value);
        var requiresQuoting =
            sanitized.IndexOfAny(['"', ',', '\n', '\r']) >= 0;

        if (!requiresQuoting)
        {
            return sanitized;
        }

        return $"\"{sanitized.Replace("\"", "\"\"")}\"";
    }

    private static string GuardAgainstFormulaInjection(string value)
    {
        return value[0] is '=' or '+' or '-' or '@'
            ? "'" + value
            : value;
    }
}

using System.Globalization;
using Phases.Umbraco.ContentSearch.Search.Models;

namespace Phases.Umbraco.ContentSearch.Export;

/// <summary>
/// Defines the default, ordered set of columns shared by every export format.
/// </summary>
public static class ContentExportColumns
{
    /// <summary>
    /// The date format used by text-based exports.
    /// </summary>
    public const string DateTextFormat = "yyyy-MM-dd HH:mm";

    /// <summary>
    /// Gets the default exported columns in display order.
    /// </summary>
    public static IReadOnlyList<ContentExportColumn> Default { get; } =
    [
        new ContentExportColumn
        {
            Header = "Name",
            GetText = static item => item.Name,
        },
        new ContentExportColumn
        {
            Header = "Content Type",
            GetText = static item => item.ContentTypeAlias,
        },
        new ContentExportColumn
        {
            Header = "Match",
            GetText = static item => FormatMatches(item.MatchedFields),
        },
        new ContentExportColumn
        {
            Header = "Path",
            GetText = static item => item.PathDisplay ?? item.Path,
        },
        new ContentExportColumn
        {
            Header = "URL",
            Type = ContentExportColumnType.Url,
            GetText = static item => item.UrlDisplay ?? item.Url,
            GetUrl = static item => item.Url,
        },
        new ContentExportColumn
        {
            Header = "Created",
            Type = ContentExportColumnType.Date,
            GetText = static item => FormatDate(item.CreateDate),
            GetDate = static item => item.CreateDate,
        },
        new ContentExportColumn
        {
            Header = "Updated",
            Type = ContentExportColumnType.Date,
            GetText = static item => FormatDate(item.UpdateDate),
            GetDate = static item => item.UpdateDate,
        },
        new ContentExportColumn
        {
            Header = "Culture",
            GetText = static item => item.MatchedCulture,
        },
        new ContentExportColumn
        {
            Header = "Published",
            GetText = static item => item.Published is null
                ? null
                : item.Published.Value ? "Yes" : "No",
        },
        new ContentExportColumn
        {
            Header = "Node Id",
            Type = ContentExportColumnType.Number,
            GetText = static item => item.Id.ToString(CultureInfo.InvariantCulture),
        },
        new ContentExportColumn
        {
            Header = "UDI",
            GetText = static item => item.Udi,
        },
    ];

    private static string? FormatDate(DateTime? value)
        => value?.ToString(DateTextFormat, CultureInfo.InvariantCulture);

    private static string? FormatMatches(IReadOnlyList<ContentSearchMatchInfo> matches)
    {
        if (matches.Count == 0)
        {
            return null;
        }

        return string.Join(
            "; ",
            matches.Select(FormatMatch).Where(static text => !string.IsNullOrWhiteSpace(text)));
    }

    private static string FormatMatch(ContentSearchMatchInfo match)
    {
        var snippet = NormalizeWhitespace(match.Snippet);

        if (!string.IsNullOrWhiteSpace(snippet))
        {
            return $"{match.PropertyName}: {snippet}";
        }

        return string.IsNullOrWhiteSpace(match.OperatorLabel)
            ? match.PropertyName
            : $"{match.PropertyName} ({match.OperatorLabel})";
    }

    private static string? NormalizeWhitespace(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return null;
        }

        return string.Join(
            ' ',
            value.Split((char[]?)null, StringSplitOptions.RemoveEmptyEntries));
    }
}

using Phases.Umbraco.ContentSearch.Search.Models;

namespace Phases.Umbraco.ContentSearch.Export;

/// <summary>
/// Describes how a single column is rendered across every export format.
/// </summary>
public sealed class ContentExportColumn
{
    /// <summary>
    /// Gets the column header text.
    /// </summary>
    public required string Header { get; init; }

    /// <summary>
    /// Gets the semantic type used by formats that support rich rendering.
    /// </summary>
    public ContentExportColumnType Type { get; init; } = ContentExportColumnType.Text;

    /// <summary>
    /// Gets the textual representation of the cell value.
    /// </summary>
    public required Func<ContentSearchResultItem, string?> GetText { get; init; }

    /// <summary>
    /// Gets the raw date value when <see cref="Type"/> is <see cref="ContentExportColumnType.Date"/>.
    /// </summary>
    public Func<ContentSearchResultItem, DateTime?>? GetDate { get; init; }

    /// <summary>
    /// Gets the navigable URL when <see cref="Type"/> is <see cref="ContentExportColumnType.Url"/>.
    /// </summary>
    public Func<ContentSearchResultItem, string?>? GetUrl { get; init; }
}

/// <summary>
/// Semantic column types used to drive format-specific rendering.
/// </summary>
public enum ContentExportColumnType
{
    /// <summary>
    /// Plain text value.
    /// </summary>
    Text = 0,

    /// <summary>
    /// Numeric value.
    /// </summary>
    Number = 1,

    /// <summary>
    /// Date/time value.
    /// </summary>
    Date = 2,

    /// <summary>
    /// Navigable URL value (rendered as a hyperlink where supported).
    /// </summary>
    Url = 3,
}

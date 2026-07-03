using Phases.Umbraco.ContentSearch.Examine;

namespace Phases.Umbraco.ContentSearch.Search.Sorting;

/// <summary>
/// Resolves results grid sort columns to Examine sort fields.
/// </summary>
public static class ContentSearchSortFieldResolver
{
  private static readonly IReadOnlyDictionary<string, string> ColumnToField =
      new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
      {
          ["name"] = ContentSearchExamineFields.NodeName,
          ["contentType"] = ContentSearchExamineFields.NodeTypeAlias,
          ["path"] = ContentSearchExamineFields.Path,
          ["createDate"] = ContentSearchExamineFields.CreateDate,
          ["updateDate"] = ContentSearchExamineFields.UpdateDate,
          ["url"] = ContentSearchExamineFields.Url,
      };

    /// <summary>
    /// Resolves a grid column alias to an Examine sort field.
    /// </summary>
    /// <param name="column">The grid column alias.</param>
    /// <returns>The Examine field name.</returns>
    public static string ResolveField(string? column)
        => !string.IsNullOrWhiteSpace(column)
           && ColumnToField.TryGetValue(column.Trim(), out var field)
            ? field
            : ContentSearchExamineFields.NodeName;

    /// <summary>
    /// Determines whether the column can be sorted server-side in Examine.
    /// </summary>
    /// <param name="column">The grid column alias.</param>
    /// <returns><c>true</c> when the column is sortable.</returns>
    public static bool IsSortable(string? column)
        => !string.IsNullOrWhiteSpace(column) && ColumnToField.ContainsKey(column.Trim());
}

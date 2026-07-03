using Lucene.Net.QueryParsers.Classic;

namespace Phases.Umbraco.ContentSearch.Examine;

/// <summary>
/// Builds native Lucene phrase queries for exact text property matches.
/// </summary>
internal static class ExaminePhraseFieldQuery
{
    /// <summary>
    /// Builds a native query that matches an exact phrase in a field.
    /// </summary>
    internal static string BuildPhraseEqualsQuery(string fieldName, string value)
    {
        var field = EscapeFieldName(fieldName);
        var escapedValue = QueryParser.Escape(value);
        return $"+{field}:\"{escapedValue}\"";
    }

    /// <summary>
    /// Builds a native query that excludes an exact phrase in a field.
    /// </summary>
    internal static string BuildNegatedPhraseEqualsQuery(string fieldName, string value)
    {
        var field = EscapeFieldName(fieldName);
        var escapedValue = QueryParser.Escape(value);
        return $"-{field}:\"{escapedValue}\"";
    }

    /// <summary>
    /// Builds a native OR query across multiple fields for an exact phrase.
    /// </summary>
    internal static string BuildGroupedPhraseEqualsQuery(IReadOnlyList<string> fieldNames, string value)
    {
        if (fieldNames.Count == 1)
        {
            return BuildPhraseEqualsQuery(fieldNames[0], value);
        }

        var clauses = fieldNames
            .Select(field => BuildPhraseEqualsQuery(field, value).TrimStart('+'))
            .ToArray();

        return $"+({string.Join(" OR ", clauses)})";
    }

    /// <summary>
    /// Builds a native query that excludes a phrase match across any of the fields.
    /// </summary>
    internal static string BuildGroupedNegatedPhraseEqualsQuery(IReadOnlyList<string> fieldNames, string value)
    {
        if (fieldNames.Count == 1)
        {
            return BuildNegatedPhraseEqualsQuery(fieldNames[0], value);
        }

        var clauses = fieldNames
            .Select(field => BuildPhraseEqualsQuery(field, value).TrimStart('+'))
            .ToArray();

        return $"-({string.Join(" OR ", clauses)})";
    }

    /// <summary>
    /// Builds a native query that excludes a wildcard pattern across all fields.
    /// </summary>
    internal static string BuildGroupedNegatedWildcardQuery(IReadOnlyList<string> fieldNames, string pattern)
    {
        var clauses = fieldNames
            .Select(field => $"-{EscapeFieldName(field)}:{pattern}");

        return $"+(*:* {string.Join(" ", clauses)})";
    }

    /// <summary>
    /// Builds a native query that excludes an explicit value across all fields.
    /// </summary>
    internal static string BuildGroupedNegatedExplicitQuery(IReadOnlyList<string> fieldNames, string value)
    {
        var escapedValue = QueryParser.Escape(value);
        var clauses = fieldNames
            .Select(field => $"-{EscapeFieldName(field)}:{escapedValue}");

        return $"+(*:* {string.Join(" ", clauses)})";
    }

    private static string EscapeFieldName(string fieldName)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(fieldName);

        return fieldName
            .Replace("\\", "\\\\", StringComparison.Ordinal)
            .Replace(":", "\\:", StringComparison.Ordinal)
            .Replace(" ", "\\ ", StringComparison.Ordinal);
    }
}

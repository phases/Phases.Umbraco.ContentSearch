namespace Phases.Umbraco.FilterNodes.Services;

/// <summary>
/// Builds native Lucene queries for empty / non-empty property field checks.
/// </summary>
/// <remarks>
/// Umbraco typically omits unset property values from the Examine index rather than indexing
/// an empty string. Examine's fluent <c>Field</c> API also rejects empty values, so these
/// checks use native Lucene range syntax (wildcards such as <c>?*</c> are not used because
/// Examine's query parser disallows leading wildcard characters). A minimum bound of
/// <c>\u0001</c> excludes explicit empty strings while still matching all real property values.
/// </remarks>
internal static class ExamineEmptyFieldQuery
{
    // Lucene string ranges treat "" as below any real indexed character value.
    private const string MinimumIndexedCharacter = "\u0001";

    /// <summary>
    /// Builds a native query that matches documents where the field is missing or empty.
    /// </summary>
    internal static string BuildIsEmptyQuery(string fieldName)
    {
        var field = EscapeFieldName(fieldName);
        return $"*:* -{field}:[{MinimumIndexedCharacter} TO *]";
    }

    /// <summary>
    /// Builds a native query that matches documents where the field contains a value.
    /// </summary>
    internal static string BuildIsNotEmptyQuery(string fieldName)
    {
        var field = EscapeFieldName(fieldName);
        return $"+{field}:[{MinimumIndexedCharacter} TO *]";
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

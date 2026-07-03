namespace Phases.Umbraco.ContentSearch.Examine;

/// <summary>
/// Builds native Lucene queries for empty / non-empty property field checks.
/// </summary>
internal static class ExamineEmptyFieldQuery
{
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

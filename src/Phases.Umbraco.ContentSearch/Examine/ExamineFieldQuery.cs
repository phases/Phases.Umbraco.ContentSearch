using System.Text.RegularExpressions;
using Examine;
using Examine.Search;
using Lucene.Net.QueryParsers.Classic;
using Umbraco.Extensions;

namespace Phases.Umbraco.ContentSearch.Examine;

/// <summary>
/// Builds Examine field values for property comparisons.
/// </summary>
internal static class ExamineFieldQuery
{
    /// <summary>
    /// Creates an equals value for Examine field queries.
    /// </summary>
    internal static IExamineValue ToEqualsValue(string value, bool isNumeric = false)
    {
        if (isNumeric)
        {
            return new ExamineValue(Examineness.Explicit, value);
        }

        return value.Escape();
    }

    /// <summary>
    /// Creates a contains wildcard value for Examine field queries.
    /// </summary>
    internal static IExamineValue ToContainsValue(string value)
    {
        var terms = TokenizeSearchTerms(value);
        if (terms.Length == 0)
        {
            return string.Empty.MultipleCharacterWildcard();
        }

        if (terms.Length == 1)
        {
            return terms[0].MultipleCharacterWildcard();
        }

        var pattern = string.Join(
            " ",
            terms.Select(static term => term.MultipleCharacterWildcard().Value));

        return new ExamineValue(Examineness.ComplexWildcard, pattern);
    }

    /// <summary>
    /// Creates a starts-with wildcard value for Examine field queries.
    /// </summary>
    internal static IExamineValue ToStartsWithValue(string value)
    {
        var escaped = QueryParser.Escape(value);
        return new ExamineValue(Examineness.ComplexWildcard, $"{escaped}*");
    }

    /// <summary>
    /// Creates an ends-with wildcard value for Examine field queries.
    /// </summary>
    internal static IExamineValue ToEndsWithValue(string value)
    {
        var escaped = QueryParser.Escape(value);
        return new ExamineValue(Examineness.ComplexWildcard, $"*{escaped}");
    }

    /// <summary>
    /// Builds a Lucene wildcard pattern for negated contains queries.
    /// </summary>
    internal static string ToContainsPattern(string value)
        => $"*{QueryParser.Escape(value)}*";

    private static string[] TokenizeSearchTerms(string value)
        => value
            .Split((char[]?)null, StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
}

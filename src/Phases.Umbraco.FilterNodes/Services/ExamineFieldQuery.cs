using System.Text.RegularExpressions;
using Examine;
using Examine.Search;
using Phases.Umbraco.FilterNodes.Models.Enums;
using Umbraco.Cms.Infrastructure.Examine;
using Umbraco.Extensions;

namespace Phases.Umbraco.FilterNodes.Services;

/// <summary>
/// Builds Examine field values for property comparisons.
/// </summary>
internal static class ExamineFieldQuery
{
    private static readonly Regex HtmlTagRegex = new("<[^>]+>", RegexOptions.Compiled);

    /// <summary>
    /// Umbraco's internal index uses a whitespace analyzer for user-defined properties.
    /// Dropdown and text values with spaces require phrase matching so "3 R" does not match "1 R".
    /// Checkbox and multi-select values are indexed as separate lowercase terms by
    /// FilterNodes examine indexing so phrase matching can be used safely.
    /// </summary>
    internal static IExamineValue ToEqualsValue(string value, PropertyFilterType? filterType)
    {
        if (filterType is PropertyFilterType.Number)
        {
            return new ExamineValue(Examineness.Explicit, value);
        }

        if (filterType is PropertyFilterType.Dropdown or PropertyFilterType.MultiSelect)
        {
            return value.ToLowerInvariant().Escape();
        }

        return value.Escape();
    }

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

    internal static string? StripHtmlMarkup(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return null;
        }

        var stripped = HtmlTagRegex.Replace(value, " ");
        stripped = Regex.Replace(stripped, "\\s+", " ").Trim();

        return stripped.Length == 0
            ? null
            : stripped;
    }

    private static string[] TokenizeSearchTerms(string value)
        => value
            .Split((char[]?)null, StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
}

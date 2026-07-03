using Phases.Umbraco.ContentSearch.Examine;
using Phases.Umbraco.ContentSearch.Models;

namespace Phases.Umbraco.ContentSearch.Search.Mapping;

/// <summary>
/// Resolves frontend URLs for search result rows based on culture context.
/// </summary>
public static class ContentSearchResultUrlResolver
{
    internal const string EmptyDisplay = "—";
    internal const string MultipleDisplay = "Multiple";
    private const string NotPublishedValue = "Not published";

    public sealed record ResolvedUrl(string? Href, string Display);

    internal static ResolvedUrl Resolve(
        IReadOnlyDictionary<string, string> values,
        SearchCultureContext cultureContext)
    {
        if (cultureContext.IsSingleCulture && !string.IsNullOrWhiteSpace(cultureContext.Culture))
        {
            return ResolveForCulture(values, cultureContext.Culture);
        }

        return ResolveForAllCultures(values);
    }

    private static ResolvedUrl ResolveForCulture(
        IReadOnlyDictionary<string, string> values,
        string culture)
    {
        var cultureField = ExamineCultureFieldExpander.BuildCultureFieldName(
            ContentSearchExamineFields.Url,
            culture);
        var url = GetPublishedUrl(GetValue(values, cultureField))
            ?? GetPublishedUrl(GetValue(values, ContentSearchExamineFields.Url));

        return url is null
            ? new ResolvedUrl(null, EmptyDisplay)
            : new ResolvedUrl(url, ToRelativeDisplay(url));
    }

    private static ResolvedUrl ResolveForAllCultures(IReadOnlyDictionary<string, string> values)
    {
        var invariantUrl = GetPublishedUrl(GetValue(values, ContentSearchExamineFields.Url));

        if (invariantUrl is not null)
        {
            return new ResolvedUrl(invariantUrl, ToRelativeDisplay(invariantUrl));
        }

        if (GetDistinctPublishedCultureUrls(values).Count > 0)
        {
            return new ResolvedUrl(null, MultipleDisplay);
        }

        return new ResolvedUrl(null, EmptyDisplay);
    }

    private static List<string> GetDistinctPublishedCultureUrls(
        IReadOnlyDictionary<string, string> values)
    {
        return values
            .Where(static pair => IsCultureSpecificUrlField(pair.Key))
            .Select(static pair => GetPublishedUrl(pair.Value))
            .Where(static url => url is not null)
            .Cast<string>()
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();
    }

    private static bool IsCultureSpecificUrlField(string fieldName)
    {
        const string baseField = ContentSearchExamineFields.Url;

        if (!fieldName.StartsWith($"{baseField}_", StringComparison.OrdinalIgnoreCase))
        {
            return false;
        }

        var suffix = fieldName[(baseField.Length + 1)..];

        return suffix.Length > 0 && !suffix.Contains('_', StringComparison.Ordinal);
    }

    private static string? GetValue(IReadOnlyDictionary<string, string> values, string fieldName)
        => values.TryGetValue(fieldName, out var value) && !string.IsNullOrWhiteSpace(value)
            ? value
            : null;

    private static string? GetPublishedUrl(string? value)
    {
        var normalized = value?.Trim();

        if (string.IsNullOrWhiteSpace(normalized)
            || normalized.Equals(NotPublishedValue, StringComparison.OrdinalIgnoreCase)
            || normalized.Equals(EmptyDisplay, StringComparison.Ordinal))
        {
            return null;
        }

        return normalized;
    }

    private static string ToRelativeDisplay(string url)
    {
        if (url.StartsWith("/", StringComparison.Ordinal))
        {
            return url;
        }

        if (Uri.TryCreate(url, UriKind.Absolute, out var absolute))
        {
            var relative = absolute.PathAndQuery;

            if (!string.IsNullOrEmpty(absolute.Fragment))
            {
                relative += absolute.Fragment;
            }

            return string.IsNullOrEmpty(relative) ? "/" : relative;
        }

        return url;
    }
}

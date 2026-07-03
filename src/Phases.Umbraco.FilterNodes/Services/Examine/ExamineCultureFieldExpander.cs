using Phases.Umbraco.FilterNodes.Models.Enums;
using Phases.Umbraco.FilterNodes.Models.Examine;

namespace Phases.Umbraco.FilterNodes.Services.Examine;

/// <summary>
/// Expands logical Examine field names to culture-specific index fields.
/// </summary>
internal static class ExamineCultureFieldExpander
{
    /// <summary>
    /// Expands base field names for culture-variant properties.
    /// </summary>
    /// <param name="baseFieldNames">The base Examine field names.</param>
    /// <param name="variesByCulture">Whether the property varies by culture.</param>
    /// <param name="cultureContext">The search culture context.</param>
    /// <param name="catalog">The Examine field catalog.</param>
    /// <param name="availableCultures">Optional installed culture ISO codes.</param>
    /// <returns>The culture-aware Examine field names.</returns>
    internal static IReadOnlyList<string> Expand(
        IReadOnlyList<string> baseFieldNames,
        bool variesByCulture,
        SearchCultureContext cultureContext,
        IReadOnlySet<string> catalog,
        IReadOnlyList<string>? availableCultures = null)
    {
        if (baseFieldNames.Count == 0 || !variesByCulture)
        {
            return baseFieldNames;
        }

        return cultureContext.Mode switch
        {
            SearchCultureMode.AllCultures => ExpandAllCultures(
                baseFieldNames,
                catalog,
                availableCultures),
            SearchCultureMode.CurrentCulture or SearchCultureMode.SpecificCulture
                when cultureContext.IsSingleCulture => ExpandSingleCulture(
                    baseFieldNames,
                    cultureContext.Culture!,
                    catalog),
            _ => baseFieldNames,
        };
    }

    /// <summary>
    /// Builds the culture-specific field name for a base field and culture.
    /// </summary>
    /// <param name="baseFieldName">The base field name.</param>
    /// <param name="culture">The culture ISO code.</param>
    /// <returns>The culture-specific field name.</returns>
    internal static string BuildCultureFieldName(string baseFieldName, string culture)
        => $"{baseFieldName}_{culture.ToLowerInvariant()}";

    internal static bool HasCultureSpecificFields(
        IReadOnlySet<string> catalog,
        IReadOnlyList<string> baseFieldNames)
        => GetCultureSpecificFields(catalog, baseFieldNames).Count > 0;

    internal static IReadOnlyList<string> GetCultureSpecificFields(
        IReadOnlySet<string> catalog,
        IReadOnlyList<string> baseFieldNames)
    {
        if (catalog.Count == 0 || baseFieldNames.Count == 0)
        {
            return [];
        }

        return baseFieldNames
            .SelectMany(baseField => catalog
                .Where(field => IsCultureSpecificField(field, baseField))
                .OrderBy(static field => field, StringComparer.OrdinalIgnoreCase))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();
    }

    internal static IReadOnlyList<string> ExtractCulturesFromFields(
        IReadOnlyList<string> cultureFields,
        IReadOnlyList<string> baseFieldNames)
    {
        var cultures = new List<string>();

        foreach (var cultureField in cultureFields)
        {
            foreach (var baseField in baseFieldNames)
            {
                if (!IsCultureSpecificField(cultureField, baseField))
                {
                    continue;
                }

                cultures.Add(cultureField[(baseField.Length + 1)..]);
            }
        }

        return cultures
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();
    }

    private static IReadOnlyList<string> ExpandSingleCulture(
        IReadOnlyList<string> baseFieldNames,
        string culture,
        IReadOnlySet<string> catalog)
    {
        return baseFieldNames
            .Select(baseField => ResolveCultureFieldName(baseField, culture, catalog))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();
    }

    private static IReadOnlyList<string> ExpandAllCultures(
        IReadOnlyList<string> baseFieldNames,
        IReadOnlySet<string> catalog,
        IReadOnlyList<string>? availableCultures)
    {
        var expanded = new List<string>();

        foreach (var baseField in baseFieldNames)
        {
            var cultureFieldsFromCatalog = catalog
                .Where(field => IsCultureSpecificField(field, baseField))
                .OrderBy(static field => field, StringComparer.OrdinalIgnoreCase)
                .ToArray();

            var fieldsForBaseField = new List<string>();

            if (availableCultures is { Count: > 0 })
            {
                var indexedLanguageFields = availableCultures
                    .Select(culture => BuildCultureFieldName(baseField, culture))
                    .Where(catalog.Contains)
                    .Distinct(StringComparer.OrdinalIgnoreCase)
                    .ToArray();

                if (cultureFieldsFromCatalog.Length > 0)
                {
                    fieldsForBaseField.AddRange(cultureFieldsFromCatalog);
                }
                else if (indexedLanguageFields.Length > 0)
                {
                    fieldsForBaseField.AddRange(indexedLanguageFields);
                }
            }
            else if (cultureFieldsFromCatalog.Length > 0)
            {
                fieldsForBaseField.AddRange(cultureFieldsFromCatalog);
            }

            if (catalog.Contains(baseField))
            {
                fieldsForBaseField.Add(baseField);
            }

            if (fieldsForBaseField.Count == 0)
            {
                fieldsForBaseField.Add(baseField);
            }

            expanded.AddRange(fieldsForBaseField);
        }

        return expanded
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();
    }

    private static bool IsCultureSpecificField(string fieldName, string baseField)
    {
        if (!fieldName.StartsWith($"{baseField}_", StringComparison.OrdinalIgnoreCase))
        {
            return false;
        }

        var suffix = fieldName[(baseField.Length + 1)..];

        return suffix.Length > 0 && !suffix.Contains('_', StringComparison.Ordinal);
    }

    private static string ResolveCultureFieldName(
        string baseField,
        string culture,
        IReadOnlySet<string> catalog)
    {
        var cultureField = BuildCultureFieldName(baseField, culture);

        if (catalog.Contains(cultureField))
        {
            return cultureField;
        }

        return catalog.Contains(baseField)
            ? baseField
            : cultureField;
    }
}

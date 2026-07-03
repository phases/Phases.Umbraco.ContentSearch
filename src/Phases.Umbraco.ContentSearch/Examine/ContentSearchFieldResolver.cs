using Phases.Umbraco.ContentSearch.Examine.Models;
using Phases.Umbraco.ContentSearch.Metadata.Constants;
using Phases.Umbraco.ContentSearch.Metadata.Models;
using Phases.Umbraco.ContentSearch.Models;
using Umbraco.Cms.Infrastructure.Examine;

namespace Phases.Umbraco.ContentSearch.Examine;

/// <summary>
/// Maps logical property aliases to culture-aware Examine index field names.
/// </summary>
public sealed class ContentSearchFieldResolver : IContentSearchFieldResolver
{
    private readonly IExamineIndexFieldCatalog _fieldCatalog;

    /// <summary>
    /// Initializes a new instance of the <see cref="ContentSearchFieldResolver"/> class.
    /// </summary>
    /// <param name="fieldCatalog">The Examine field catalog.</param>
    public ContentSearchFieldResolver(IExamineIndexFieldCatalog fieldCatalog)
    {
        _fieldCatalog = fieldCatalog;
    }

    /// <inheritdoc />
    public ExamineFieldResolution Resolve(
        string propertyAlias,
        SearchablePropertyMetadata? metadata = null,
        SearchCultureContext? cultureContext = null)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(propertyAlias);

        cultureContext ??= SearchCultureContext.AllCultures;

        ExamineFieldResolution baseResolution = ResolveBase(propertyAlias, metadata);
        if (!baseResolution.IsSupported)
        {
            return baseResolution;
        }

        IReadOnlySet<string> catalog = _fieldCatalog.GetFieldNames();
        IReadOnlyList<string> invariantBaseFieldNames = NormalizeToCultureInvariantBaseNames(
            baseResolution.FieldNames);
        IReadOnlyList<string> cultureFieldsInCatalog = ExamineCultureFieldExpander.GetCultureSpecificFields(
            catalog,
            invariantBaseFieldNames);

        var variesByCulture = metadata switch
        {
            { VariesByCulture: true } => true,
            { VariesByCulture: false }
                when ContentSearchMetadataConstants.IsCultureInvariantSystemProperty(propertyAlias) => false,
            { VariesByCulture: false }
                when propertyAlias.Equals(
                    ContentSearchMetadataConstants.NodeNamePropertyAlias,
                    StringComparison.OrdinalIgnoreCase) => cultureFieldsInCatalog.Count > 0,
            { VariesByCulture: false }
                when cultureFieldsInCatalog.Count > 0
                    && (BlockPropertyAliasParser.TryParse(propertyAlias, out _)
                        || metadata?.ContainerAlias is not null
                        || metadata?.IsContainer == true) => true,
            { VariesByCulture: false } => false,
            null => cultureFieldsInCatalog.Count > 0,
        };

        if (!variesByCulture)
        {
            return baseResolution with { VariesByCulture = false };
        }

        IReadOnlyList<string>? availableCultures = metadata?.AvailableCultures;
        if (availableCultures is null or { Count: 0 } && cultureFieldsInCatalog.Count > 0)
        {
            availableCultures = ExamineCultureFieldExpander.ExtractCulturesFromFields(
                cultureFieldsInCatalog,
                invariantBaseFieldNames);
        }

        IReadOnlyList<string> expandedFields = ExamineCultureFieldExpander.Expand(
            invariantBaseFieldNames,
            variesByCulture: true,
            cultureContext,
            catalog,
            availableCultures);

        if (expandedFields.Count == 0)
        {
            return Unsupported();
        }

        return CreateResolution(expandedFields, baseResolution.Strategy, variesByCulture: true);
    }

    private ExamineFieldResolution ResolveBase(
        string propertyAlias,
        SearchablePropertyMetadata? metadata)
    {
        if (metadata?.IsContainer == true)
        {
            var containerAlias = metadata.ContainerAlias ?? propertyAlias;
            return CreateResolution(
                [containerAlias],
                ExamineFieldResolutionStrategy.ContainerOnly);
        }

        if (metadata?.ContainerAlias is not null
            && metadata.ElementTypeAlias is not null
            && BlockPropertyAliasParser.TryParse(propertyAlias, out var metadataParts))
        {
            return ResolveBlockElement(metadataParts, metadata);
        }

        if (BlockPropertyAliasParser.TryParse(propertyAlias, out var parts))
        {
            return ResolveBlockElement(parts, metadata);
        }

        return CreateResolution(
            [ResolveSystemFieldAlias(propertyAlias)],
            ExamineFieldResolutionStrategy.Direct);
    }

    private ExamineFieldResolution ResolveBlockElement(
        BlockPropertyAliasParts parts,
        SearchablePropertyMetadata? metadata)
    {
        IReadOnlyList<string> fieldNames = FindIndexedBlockFields(parts);
        if (fieldNames.Count > 0)
        {
            return CreateResolution(fieldNames, ExamineFieldResolutionStrategy.NestedBlock);
        }

        var containerAlias = metadata?.ContainerAlias ?? parts.ContainerAlias;

        return CreateResolution(
            [containerAlias],
            ExamineFieldResolutionStrategy.ContainerOnly);
    }

    private IReadOnlyList<string> FindIndexedBlockFields(BlockPropertyAliasParts parts)
    {
        IReadOnlySet<string> catalog = _fieldCatalog.GetFieldNames();
        if (catalog.Count == 0)
        {
            return [];
        }

        var candidates = new[]
        {
            BuildCompositeAlias(parts),
            $"{parts.ContainerAlias}.{parts.ElementPropertyAlias}",
            $"{parts.ContainerAlias}__{parts.ElementPropertyAlias}",
            $"{parts.ContainerAlias}-{parts.ElementPropertyAlias}",
            $"{parts.ContainerAlias}_{parts.ElementPropertyAlias}",
        };

        var exactMatches = candidates
            .Where(catalog.Contains)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();

        if (exactMatches.Length > 0)
        {
            return exactMatches;
        }

        var fuzzyMatches = catalog
            .Where(field => !IsRawField(field))
            .Where(field => MatchesBlockFieldPrefix(field, parts.ContainerAlias))
            .Where(field => FieldEndsWithPropertyAlias(field, parts.ElementPropertyAlias))
            .Where(field => !field.Contains(".items[", StringComparison.Ordinal))
            .OrderBy(static field => field.Length)
            .ThenBy(static field => field, StringComparer.OrdinalIgnoreCase)
            .ToArray();

        if (fuzzyMatches.Length == 0)
        {
            return [];
        }

        var elementTypeMatches = fuzzyMatches
            .Where(field => field.Contains(parts.ElementTypeAlias, StringComparison.OrdinalIgnoreCase))
            .ToArray();

        if (elementTypeMatches.Length > 0)
        {
            return elementTypeMatches;
        }

        return fuzzyMatches;
    }

    private static string BuildCompositeAlias(BlockPropertyAliasParts parts)
        => string.Join(
            ContentSearchMetadataConstants.BlockPropertyAliasSeparator,
            parts.ContainerAlias,
            parts.ElementTypeAlias,
            parts.ElementPropertyAlias);

    private static bool IsRawField(string fieldName)
        => fieldName.StartsWith(
            UmbracoExamineFieldNames.RawFieldPrefix,
            StringComparison.OrdinalIgnoreCase);

    private static bool MatchesBlockFieldPrefix(string fieldName, string containerAlias)
    {
        return fieldName.StartsWith($"{containerAlias}.", StringComparison.OrdinalIgnoreCase)
            || fieldName.StartsWith($"{containerAlias}__", StringComparison.OrdinalIgnoreCase)
            || fieldName.StartsWith($"{containerAlias}_", StringComparison.OrdinalIgnoreCase)
            || fieldName.StartsWith($"{containerAlias}-", StringComparison.OrdinalIgnoreCase)
            || fieldName.Equals(containerAlias, StringComparison.OrdinalIgnoreCase);
    }

    private static bool FieldEndsWithPropertyAlias(string fieldName, string elementPropertyAlias)
    {
        if (fieldName.Equals(elementPropertyAlias, StringComparison.OrdinalIgnoreCase))
        {
            return true;
        }

        char[] separators = ['.', '_', '-'];
        foreach (var separator in separators)
        {
            var suffix = $"{separator}{elementPropertyAlias}";
            if (fieldName.EndsWith(suffix, StringComparison.OrdinalIgnoreCase))
            {
                return true;
            }
        }

        var cultureSeparatorIndex = fieldName.LastIndexOf('_');
        if (cultureSeparatorIndex > 0 && cultureSeparatorIndex < fieldName.Length - 1)
        {
            var cultureSuffix = fieldName[(cultureSeparatorIndex + 1)..];
            if (cultureSuffix.Contains('-', StringComparison.Ordinal))
            {
                var withoutCultureSuffix = fieldName[..cultureSeparatorIndex];
                if (withoutCultureSuffix.Equals(elementPropertyAlias, StringComparison.OrdinalIgnoreCase))
                {
                    return true;
                }

                foreach (var separator in separators)
                {
                    var suffix = $"{separator}{elementPropertyAlias}";
                    if (withoutCultureSuffix.EndsWith(suffix, StringComparison.OrdinalIgnoreCase))
                    {
                        return true;
                    }
                }
            }
        }

        return fieldName.EndsWith(
            $"{ContentSearchMetadataConstants.BlockPropertyAliasSeparator}{elementPropertyAlias}",
            StringComparison.OrdinalIgnoreCase);
    }

    private static string ResolveSystemFieldAlias(string propertyAlias)
    {
        if (propertyAlias.Equals(
                ContentSearchMetadataConstants.NodeNamePropertyAlias,
                StringComparison.OrdinalIgnoreCase))
        {
            return ContentSearchExamineFields.NodeName;
        }

        if (propertyAlias.Equals(
                ContentSearchMetadataConstants.CreatedDatePropertyAlias,
                StringComparison.OrdinalIgnoreCase))
        {
            return ContentSearchExamineFields.CreateDate;
        }

        if (propertyAlias.Equals(
                ContentSearchMetadataConstants.UpdatedDatePropertyAlias,
                StringComparison.OrdinalIgnoreCase))
        {
            return ContentSearchExamineFields.UpdateDate;
        }

        if (propertyAlias.Equals(
                ContentSearchMetadataConstants.TemplateIdPropertyAlias,
                StringComparison.OrdinalIgnoreCase))
        {
            return ContentSearchExamineFields.TemplateId;
        }

        if (propertyAlias.Equals(
                ContentSearchMetadataConstants.UrlPropertyAlias,
                StringComparison.OrdinalIgnoreCase))
        {
            return ContentSearchExamineFields.Url;
        }

        if (propertyAlias.Equals(
                ContentSearchMetadataConstants.ReleaseDatePropertyAlias,
                StringComparison.OrdinalIgnoreCase))
        {
            return ContentSearchExamineFields.ReleaseDate;
        }

        return propertyAlias;
    }

    private static ExamineFieldResolution CreateResolution(
        IReadOnlyList<string> fieldNames,
        ExamineFieldResolutionStrategy strategy,
        bool variesByCulture = false)
        => new()
        {
            FieldNames = fieldNames,
            Strategy = strategy,
            VariesByCulture = variesByCulture,
        };

    private static ExamineFieldResolution Unsupported()
        => new()
        {
            FieldNames = [],
            Strategy = ExamineFieldResolutionStrategy.Unsupported,
        };

    private static IReadOnlyList<string> NormalizeToCultureInvariantBaseNames(
        IReadOnlyList<string> fieldNames)
        => fieldNames
            .Select(StripCultureSuffixIfPresent)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();

    private static string StripCultureSuffixIfPresent(string fieldName)
    {
        var separatorIndex = fieldName.LastIndexOf('_');
        if (separatorIndex <= 0 || separatorIndex >= fieldName.Length - 1)
        {
            return fieldName;
        }

        var suffix = fieldName[(separatorIndex + 1)..];
        if (!suffix.Contains('-', StringComparison.Ordinal))
        {
            return fieldName;
        }

        return fieldName[..separatorIndex];
    }
}

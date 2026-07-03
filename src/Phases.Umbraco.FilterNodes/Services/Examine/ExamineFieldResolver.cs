using Phases.Umbraco.FilterNodes.Constants;
using Phases.Umbraco.FilterNodes.Models.Examine;
using Phases.Umbraco.FilterNodes.Models.Responses;
using Umbraco.Cms.Infrastructure.Examine;

namespace Phases.Umbraco.FilterNodes.Services.Examine;

/// <summary>
/// Maps logical FilterNodes property aliases to Umbraco Internal Examine field names.
/// </summary>
public sealed class ExamineFieldResolver : IExamineFieldResolver
{
    private readonly IExamineIndexFieldCatalog _fieldCatalog;

    /// <summary>
    /// Initializes a new instance of the <see cref="ExamineFieldResolver"/> class.
    /// </summary>
    /// <param name="fieldCatalog">The Examine field catalog.</param>
    public ExamineFieldResolver(IExamineIndexFieldCatalog fieldCatalog)
    {
        _fieldCatalog = fieldCatalog;
    }

    /// <inheritdoc />
    public ExamineFieldResolution Resolve(
        string propertyAlias,
        FilterablePropertyMetadata? metadata = null,
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
        IReadOnlyList<string> cultureFieldsInCatalog = ExamineCultureFieldExpander.GetCultureSpecificFields(
            catalog,
            baseResolution.FieldNames);

        var variesByCulture = metadata?.VariesByCulture ?? false
            || cultureFieldsInCatalog.Count > 0
            || metadata is { AvailableCultures.Count: > 0 };

        if (!variesByCulture)
        {
            return baseResolution;
        }

        IReadOnlyList<string>? availableCultures = metadata?.AvailableCultures;
        if (availableCultures is null or { Count: 0 } && cultureFieldsInCatalog.Count > 0)
        {
            availableCultures = ExamineCultureFieldExpander.ExtractCulturesFromFields(
                cultureFieldsInCatalog,
                baseResolution.FieldNames);
        }

        IReadOnlyList<string> expandedFields = ExamineCultureFieldExpander.Expand(
            baseResolution.FieldNames,
            variesByCulture: true,
            cultureContext,
            catalog,
            availableCultures);

        if (expandedFields.Count == 0)
        {
            return Unsupported();
        }

        return CreateResolution(expandedFields, baseResolution.Strategy);
    }

    private ExamineFieldResolution ResolveBase(
        string propertyAlias,
        FilterablePropertyMetadata? metadata)
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
            [propertyAlias],
            ExamineFieldResolutionStrategy.Direct);
    }

    private ExamineFieldResolution ResolveBlockElement(
        BlockPropertyAliasParts parts,
        FilterablePropertyMetadata? metadata)
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

        return elementTypeMatches.Length > 0
            ? [elementTypeMatches[0]]
            : [fuzzyMatches[0]];
    }

    private static string BuildCompositeAlias(BlockPropertyAliasParts parts)
        => string.Join(
            PropertyMetadataSourceGroups.BlockPropertyAliasSeparator,
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

        var separators = new[] { '.', '_', '-', };
        foreach (var separator in separators)
        {
            var suffix = $"{separator}{elementPropertyAlias}";
            if (fieldName.EndsWith(suffix, StringComparison.OrdinalIgnoreCase))
            {
                return true;
            }
        }

        return fieldName.EndsWith(
            $"{PropertyMetadataSourceGroups.BlockPropertyAliasSeparator}{elementPropertyAlias}",
            StringComparison.OrdinalIgnoreCase);
    }

    private static ExamineFieldResolution CreateResolution(
        IReadOnlyList<string> fieldNames,
        ExamineFieldResolutionStrategy strategy)
        => new()
        {
            FieldNames = fieldNames,
            Strategy = strategy,
        };

    private static ExamineFieldResolution Unsupported()
        => new()
        {
            FieldNames = [],
            Strategy = ExamineFieldResolutionStrategy.Unsupported,
        };
}

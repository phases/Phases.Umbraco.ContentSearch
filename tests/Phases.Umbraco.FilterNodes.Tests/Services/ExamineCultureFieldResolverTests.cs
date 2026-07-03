using Phases.Umbraco.FilterNodes.Models.Enums;
using Phases.Umbraco.FilterNodes.Models.Examine;
using Phases.Umbraco.FilterNodes.Models.Responses;
using Phases.Umbraco.FilterNodes.Services.Examine;
using Xunit;

namespace Phases.Umbraco.FilterNodes.Tests.Services;

public sealed class ExamineCultureFieldResolverTests
{
    [Fact]
    public void Resolve_invariant_property_uses_base_field()
    {
        var catalog = CreateCatalog("seoTitle", "seoTitle_en-us");
        var resolver = new ExamineFieldResolver(catalog);
        var metadata = CreateMetadata(variesByCulture: false);

        ExamineFieldResolution resolution = resolver.Resolve(
            "seoTitle",
            metadata,
            SearchCultureContext.AllCultures);

        Assert.Equal(["seoTitle"], resolution.FieldNames);
    }

    [Fact]
    public void Resolve_variant_property_all_cultures_uses_all_indexed_culture_fields()
    {
        var catalog = CreateCatalog("seoTitle_en-us", "seoTitle_da-dk", "seoTitle");
        var resolver = new ExamineFieldResolver(catalog);
        var metadata = CreateMetadata(variesByCulture: true);

        ExamineFieldResolution resolution = resolver.Resolve(
            "seoTitle",
            metadata,
            SearchCultureContext.AllCultures);

        Assert.Equal(
            ["seoTitle", "seoTitle_da-dk", "seoTitle_en-us"],
            resolution.FieldNames.OrderBy(static field => field, StringComparer.Ordinal));
    }

    [Fact]
    public void Resolve_variant_property_specific_culture_uses_single_field()
    {
        var catalog = CreateCatalog("mainContent_en-us", "mainContent_da-dk");
        var resolver = new ExamineFieldResolver(catalog);
        var metadata = CreateMetadata(variesByCulture: true);
        var cultureContext = new SearchCultureContext
        {
            Mode = SearchCultureMode.SpecificCulture,
            Culture = "da-DK",
        };

        ExamineFieldResolution resolution = resolver.Resolve(
            "mainContent",
            metadata,
            cultureContext);

        Assert.Equal(["mainContent_da-dk"], resolution.FieldNames);
    }

    [Fact]
    public void Resolve_block_grid_container_variant_property_uses_culture_suffix()
    {
        var catalog = CreateCatalog("bgCheck_en-us", "bgCheck_da-dk");
        var resolver = new ExamineFieldResolver(catalog);
        var metadata = new FilterablePropertyMetadata
        {
            Alias = "bgCheck",
            Name = "BG Check",
            FilterType = PropertyFilterType.Text,
            IsFilterable = true,
            IsContainer = true,
            ContainerAlias = "bgCheck",
            VariesByCulture = true,
        };
        var cultureContext = new SearchCultureContext
        {
            Mode = SearchCultureMode.SpecificCulture,
            Culture = "en-US",
        };

        ExamineFieldResolution resolution = resolver.Resolve(
            "bgCheck",
            metadata,
            cultureContext);

        Assert.Equal(ExamineFieldResolutionStrategy.ContainerOnly, resolution.Strategy);
        Assert.Equal(["bgCheck_en-us"], resolution.FieldNames);
    }

    [Fact]
    public void Resolve_infers_culture_fields_from_catalog_when_metadata_is_missing()
    {
        var catalog = CreateCatalog("mainContent_en-us", "mainContent");
        var resolver = new ExamineFieldResolver(catalog);

        ExamineFieldResolution resolution = resolver.Resolve(
            "mainContent",
            metadata: null,
            SearchCultureContext.AllCultures);

        Assert.Equal(["mainContent_en-us", "mainContent"], resolution.FieldNames);
    }

    [Fact]
    public void Resolve_uses_language_cultures_when_catalog_only_has_base_field()
    {
        var catalog = CreateCatalog("mainContent");
        var resolver = new ExamineFieldResolver(catalog);
        var metadata = new FilterablePropertyMetadata
        {
            Alias = "mainContent",
            Name = "Main Content",
            FilterType = PropertyFilterType.Text,
            VariesByCulture = true,
            AvailableCultures = ["en-US", "da-DK"],
        };

        ExamineFieldResolution resolution = resolver.Resolve(
            "mainContent",
            metadata,
            SearchCultureContext.AllCultures);

        Assert.Equal(["mainContent"], resolution.FieldNames);
    }

    [Fact]
    public void Resolve_specific_culture_falls_back_to_base_field_when_culture_field_missing()
    {
        var catalog = CreateCatalog("mainContent");
        var resolver = new ExamineFieldResolver(catalog);
        var metadata = new FilterablePropertyMetadata
        {
            Alias = "mainContent",
            Name = "Main Content",
            FilterType = PropertyFilterType.Text,
            VariesByCulture = true,
        };
        var cultureContext = new SearchCultureContext
        {
            Mode = SearchCultureMode.SpecificCulture,
            Culture = "da-DK",
        };

        ExamineFieldResolution resolution = resolver.Resolve(
            "mainContent",
            metadata,
            cultureContext);

        Assert.Equal(["mainContent"], resolution.FieldNames);
    }

    [Fact]
    public void Resolve_block_grid_element_variant_property_uses_container_culture_fields()
    {
        var catalog = CreateCatalog("bgCheck_en-us", "bgCheck_da-dk");
        var resolver = new ExamineFieldResolver(catalog);
        var metadata = new FilterablePropertyMetadata
        {
            Alias = "bgCheck__blockGridComponent2__bgTitle",
            Name = "BG Title",
            FilterType = PropertyFilterType.Text,
            IsFilterable = true,
            ContainerAlias = "bgCheck",
            ElementTypeAlias = "blockGridComponent2",
            VariesByCulture = true,
        };
        var cultureContext = new SearchCultureContext
        {
            Mode = SearchCultureMode.SpecificCulture,
            Culture = "da-DK",
        };

        ExamineFieldResolution resolution = resolver.Resolve(
            "bgCheck__blockGridComponent2__bgTitle",
            metadata,
            cultureContext);

        Assert.Equal(ExamineFieldResolutionStrategy.ContainerOnly, resolution.Strategy);
        Assert.Equal(["bgCheck_da-dk"], resolution.FieldNames);
    }

    private static FilterablePropertyMetadata CreateMetadata(bool variesByCulture)
        => new()
        {
            Alias = "seoTitle",
            Name = "SEO Title",
            FilterType = PropertyFilterType.Text,
            VariesByCulture = variesByCulture,
        };

    private static IExamineIndexFieldCatalog CreateCatalog(params string[] fieldNames)
        => new InMemoryExamineIndexFieldCatalog(fieldNames);

    private sealed class InMemoryExamineIndexFieldCatalog : IExamineIndexFieldCatalog
    {
        private readonly HashSet<string> _fieldNames;

        public InMemoryExamineIndexFieldCatalog(IEnumerable<string> fieldNames)
        {
            _fieldNames = fieldNames.ToHashSet(StringComparer.OrdinalIgnoreCase);
        }

        public IReadOnlySet<string> GetFieldNames() => _fieldNames;

        public void Invalidate()
        {
        }
    }
}

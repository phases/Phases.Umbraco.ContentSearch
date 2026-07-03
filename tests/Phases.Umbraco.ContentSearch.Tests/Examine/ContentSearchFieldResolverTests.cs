using Phases.Umbraco.ContentSearch.Examine;
using Phases.Umbraco.ContentSearch.Examine.Models;
using Phases.Umbraco.ContentSearch.Metadata.Models;
using Phases.Umbraco.ContentSearch.Models;
using Phases.Umbraco.ContentSearch.Models.Enums;
using Xunit;

namespace Phases.Umbraco.ContentSearch.Tests.Examine;

public sealed class ContentSearchFieldResolverTests
{
    [Fact]
    public void Resolve_invariant_property_uses_base_field()
    {
        var catalog = CreateCatalog("seoTitle", "seoTitle_en-us");
        var resolver = new ContentSearchFieldResolver(catalog);
        var metadata = CreateMetadata(variesByCulture: false);

        ExamineFieldResolution resolution = resolver.Resolve(
            "seoTitle",
            metadata,
            SearchCultureContext.AllCultures);

        Assert.Equal(["seoTitle"], resolution.FieldNames);
        Assert.False(resolution.VariesByCulture);
    }

    [Fact]
    public void Resolve_variant_property_all_cultures_uses_all_indexed_culture_fields()
    {
        var catalog = CreateCatalog("seoTitle_en-us", "seoTitle_da-dk", "seoTitle");
        var resolver = new ContentSearchFieldResolver(catalog);
        var metadata = CreateMetadata(variesByCulture: true);

        ExamineFieldResolution resolution = resolver.Resolve(
            "seoTitle",
            metadata,
            SearchCultureContext.AllCultures);

        Assert.Equal(
            ["seoTitle", "seoTitle_da-dk", "seoTitle_en-us"],
            resolution.FieldNames.OrderBy(static field => field, StringComparer.Ordinal));
        Assert.True(resolution.VariesByCulture);
    }

    [Fact]
    public void Resolve_variant_property_specific_culture_uses_single_field()
    {
        var catalog = CreateCatalog("mainContent_en-us", "mainContent_da-dk");
        var resolver = new ContentSearchFieldResolver(catalog);
        var metadata = CreateMetadata(variesByCulture: true, alias: "mainContent");
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
    public void Resolve_uses_language_cultures_when_catalog_only_has_base_field()
    {
        var catalog = CreateCatalog("mainContent");
        var resolver = new ContentSearchFieldResolver(catalog);
        var metadata = new SearchablePropertyMetadata
        {
            Alias = "mainContent",
            Name = "Main Content",
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
    public void Resolve_block_container_variant_property_uses_culture_suffix()
    {
        var catalog = CreateCatalog("bgCheck_en-us", "bgCheck_da-dk");
        var resolver = new ContentSearchFieldResolver(catalog);
        var metadata = new SearchablePropertyMetadata
        {
            Alias = "bgCheck",
            Name = "BG Check",
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
    public void Resolve_block_element_uses_dedicated_indexed_field_when_available()
    {
        var catalog = CreateCatalog("bgCheck__blockGridComponent2__bgTitle");
        var resolver = new ContentSearchFieldResolver(catalog);
        var metadata = new SearchablePropertyMetadata
        {
            Alias = "bgCheck__blockGridComponent2__bgTitle",
            Name = "BG Title",
            ContainerAlias = "bgCheck",
            ElementTypeAlias = "blockGridComponent2",
            VariesByCulture = false,
        };

        ExamineFieldResolution resolution = resolver.Resolve(
            "bgCheck__blockGridComponent2__bgTitle",
            metadata,
            SearchCultureContext.AllCultures);

        Assert.Equal(ExamineFieldResolutionStrategy.NestedBlock, resolution.Strategy);
        Assert.Equal(["bgCheck__blockGridComponent2__bgTitle"], resolution.FieldNames);
    }

    [Fact]
    public void Resolve_block_element_all_cultures_includes_all_matching_culture_fields()
    {
        var catalog = CreateCatalog(
            "bgCheck__blockGridComponent2__isActive_en-us",
            "bgCheck__blockGridComponent2__isActive_da-dk");
        var resolver = new ContentSearchFieldResolver(catalog);
        var metadata = new SearchablePropertyMetadata
        {
            Alias = "bgCheck__blockGridComponent2__isActive",
            Name = "Is Active",
            ContainerAlias = "bgCheck",
            ElementTypeAlias = "blockGridComponent2",
            VariesByCulture = true,
            AvailableCultures = ["en-US", "da-DK"],
        };

        ExamineFieldResolution resolution = resolver.Resolve(
            "bgCheck__blockGridComponent2__isActive",
            metadata,
            SearchCultureContext.AllCultures);

        Assert.Equal(ExamineFieldResolutionStrategy.NestedBlock, resolution.Strategy);
        Assert.Equal(
            ["bgCheck__blockGridComponent2__isActive_da-dk", "bgCheck__blockGridComponent2__isActive_en-us"],
            resolution.FieldNames.OrderBy(static field => field, StringComparer.Ordinal));
    }

    [Fact]
    public void Resolve_block_element_all_cultures_expands_when_metadata_invariant_but_catalog_has_culture_fields()
    {
        var catalog = CreateCatalog(
            "blog__descriptionBlog__isActive_en-us",
            "blog__descriptionBlog__isActive_da-dk");
        var resolver = new ContentSearchFieldResolver(catalog);
        var metadata = new SearchablePropertyMetadata
        {
            Alias = "blog__descriptionBlog__isActive",
            Name = "Is Active",
            ContainerAlias = "blog",
            ElementTypeAlias = "descriptionBlog",
            VariesByCulture = false,
            AvailableCultures = ["en-US", "da-DK"],
        };

        ExamineFieldResolution resolution = resolver.Resolve(
            "blog__descriptionBlog__isActive",
            metadata,
            SearchCultureContext.AllCultures);

        Assert.Equal(ExamineFieldResolutionStrategy.NestedBlock, resolution.Strategy);
        Assert.Equal(
            ["blog__descriptionBlog__isActive_da-dk", "blog__descriptionBlog__isActive_en-us"],
            resolution.FieldNames.OrderBy(static field => field, StringComparer.Ordinal));
        Assert.True(resolution.VariesByCulture);
    }

    [Fact]
    public void Resolve_system_node_name_expands_to_culture_fields_when_indexed()
    {
        var catalog = CreateCatalog("nodeName", "nodeName_en-us", "nodeName_da-dk");
        var resolver = new ContentSearchFieldResolver(catalog);
        var metadata = new SearchablePropertyMetadata
        {
            Alias = "nodeName",
            Name = "Node name",
            SourceCategory = PropertyMetadataSourceCategory.System,
            VariesByCulture = false,
        };

        ExamineFieldResolution resolution = resolver.Resolve(
            "nodeName",
            metadata,
            SearchCultureContext.AllCultures);

        Assert.Contains("nodeName_en-us", resolution.FieldNames);
        Assert.Contains("nodeName_da-dk", resolution.FieldNames);
        Assert.True(resolution.VariesByCulture);
    }

    [Fact]
    public void Resolve_system_create_date_does_not_expand_to_culture_fields()
    {
        var catalog = CreateCatalog("createDate", "createDate_en-us");
        var resolver = new ContentSearchFieldResolver(catalog);
        var metadata = new SearchablePropertyMetadata
        {
            Alias = "createDate",
            Name = "Create date",
            SourceCategory = PropertyMetadataSourceCategory.System,
            VariesByCulture = false,
        };

        ExamineFieldResolution resolution = resolver.Resolve(
            "createDate",
            metadata,
            SearchCultureContext.AllCultures);

        Assert.Equal(["createDate"], resolution.FieldNames);
        Assert.False(resolution.VariesByCulture);
    }

    [Fact]
    public void Resolve_specific_culture_falls_back_to_base_field_when_culture_field_missing()
    {
        var catalog = CreateCatalog("mainContent");
        var resolver = new ContentSearchFieldResolver(catalog);
        var metadata = CreateMetadata(variesByCulture: true, alias: "mainContent");
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

    private static SearchablePropertyMetadata CreateMetadata(
        bool variesByCulture,
        string alias = "seoTitle")
        => new()
        {
            Alias = alias,
            Name = alias,
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

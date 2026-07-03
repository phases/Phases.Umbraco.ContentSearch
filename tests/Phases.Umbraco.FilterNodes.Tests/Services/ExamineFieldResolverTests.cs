using Phases.Umbraco.FilterNodes.Models.Examine;
using Phases.Umbraco.FilterNodes.Models.Responses;
using Phases.Umbraco.FilterNodes.Services.Examine;
using Xunit;

namespace Phases.Umbraco.FilterNodes.Tests.Services;

public sealed class ExamineFieldResolverTests
{
    [Fact]
    public void Resolve_direct_property_uses_alias()
    {
        var catalog = CreateCatalog("blogTitle", "bodyText");
        var resolver = new ExamineFieldResolver(catalog);

        ExamineFieldResolution resolution = resolver.Resolve("blogTitle");

        Assert.Equal(ExamineFieldResolutionStrategy.Direct, resolution.Strategy);
        Assert.Equal(["blogTitle"], resolution.FieldNames);
    }

    [Fact]
    public void Resolve_block_element_uses_dot_notation_when_indexed()
    {
        var catalog = CreateCatalog("mainContent.title", "mainContent");
        var resolver = new ExamineFieldResolver(catalog);

        ExamineFieldResolution resolution = resolver.Resolve("mainContent__heroBlock__title");

        Assert.Equal(ExamineFieldResolutionStrategy.NestedBlock, resolution.Strategy);
        Assert.Equal(["mainContent.title"], resolution.FieldNames);
    }

    [Fact]
    public void Resolve_block_element_uses_composite_alias_when_indexed()
    {
        var catalog = CreateCatalog("mainContent__heroBlock__title");
        var resolver = new ExamineFieldResolver(catalog);

        ExamineFieldResolution resolution = resolver.Resolve("mainContent__heroBlock__title");

        Assert.Equal(ExamineFieldResolutionStrategy.NestedBlock, resolution.Strategy);
        Assert.Equal(["mainContent__heroBlock__title"], resolution.FieldNames);
    }

    [Fact]
    public void Resolve_block_element_falls_back_to_container_when_element_field_not_indexed()
    {
        var catalog = CreateCatalog("mainContent");
        var resolver = new ExamineFieldResolver(catalog);

        ExamineFieldResolution resolution = resolver.Resolve("mainContent__heroBlock__title");

        Assert.Equal(ExamineFieldResolutionStrategy.ContainerOnly, resolution.Strategy);
        Assert.Equal(["mainContent"], resolution.FieldNames);
    }

    [Fact]
    public void Resolve_container_property_uses_container_alias()
    {
        var catalog = CreateCatalog("mainContent");
        var resolver = new ExamineFieldResolver(catalog);
        var metadata = new FilterablePropertyMetadata
        {
            Alias = "mainContent",
            Name = "Main Content (Block Grid)",
            FilterType = Models.Enums.PropertyFilterType.Text,
            IsContainer = true,
            ContainerAlias = "mainContent",
        };

        ExamineFieldResolution resolution = resolver.Resolve("mainContent", metadata);

        Assert.Equal(ExamineFieldResolutionStrategy.ContainerOnly, resolution.Strategy);
        Assert.Equal(["mainContent"], resolution.FieldNames);
    }

    [Fact]
    public void Enricher_marks_block_element_filterable_when_indexed()
    {
        var catalog = CreateCatalog("mainContent.title");
        var enricher = new PropertyIndexCapabilityEnricher(new ExamineFieldResolver(catalog));
        var properties = new List<FilterablePropertyMetadata>
        {
            new()
            {
                Alias = "mainContent__heroBlock__title",
                Name = "Title",
                FilterType = Models.Enums.PropertyFilterType.Text,
                IsFilterable = false,
                ContainerAlias = "mainContent",
                ElementTypeAlias = "heroBlock",
            },
        };

        IReadOnlyList<FilterablePropertyMetadata> enriched = enricher.Enrich(properties);

        var property = Assert.Single(enriched);
        Assert.True(property.IsFilterable);
        Assert.Equal(["mainContent.title"], property.IndexedFieldAliases);
    }

    [Fact]
    public void Enricher_adds_block_grid_examine_diagnostics_for_container()
    {
        var catalog = CreateCatalog("bgCheck");
        var enricher = new PropertyIndexCapabilityEnricher(new ExamineFieldResolver(catalog));
        var properties = new List<FilterablePropertyMetadata>
        {
            new()
            {
                Alias = "bgCheck",
                Name = "BG Check",
                FilterType = Models.Enums.PropertyFilterType.Text,
                IsFilterable = true,
                IsContainer = true,
                ContainerAlias = "bgCheck",
                EditorAlias = global::Umbraco.Cms.Core.Constants.PropertyEditors.Aliases.BlockGrid,
                SourceCategory = Models.Enums.PropertyMetadataSourceCategory.BlockGrid,
            },
            new()
            {
                Alias = "bgCheck__blockGridComponent2__bgTitle",
                Name = "BG Title",
                FilterType = Models.Enums.PropertyFilterType.Text,
                IsFilterable = false,
                ContainerAlias = "bgCheck",
                ElementTypeAlias = "blockGridComponent2",
            },
        };

        IReadOnlyList<FilterablePropertyMetadata> enriched = enricher.Enrich(properties);

        var container = Assert.Single(enriched, property => property.IsContainer);
        Assert.NotNull(container.BlockExamineDiagnostics);
        Assert.Equal("bgCheck", container.BlockExamineDiagnostics.ContainerField);
        Assert.True(container.BlockExamineDiagnostics.ContainerIndexed);
        Assert.Equal(1, container.BlockExamineDiagnostics.ElementFieldsDetected);
        Assert.Equal(1, container.BlockExamineDiagnostics.DedicatedPropertyFields);
        Assert.Equal("Container Search", container.BlockExamineDiagnostics.SearchStrategy);
        Assert.Contains("bgCheck", container.BlockExamineDiagnostics.Explanation, StringComparison.Ordinal);
    }

    [Fact]
    public void Enricher_counts_dedicated_block_grid_element_fields_when_indexed()
    {
        var catalog = CreateCatalog("bgCheck", "bgCheck__blockGridComponent2__bgTitle");
        var enricher = new PropertyIndexCapabilityEnricher(new ExamineFieldResolver(catalog));
        var properties = new List<FilterablePropertyMetadata>
        {
            new()
            {
                Alias = "bgCheck",
                Name = "BG Check",
                FilterType = Models.Enums.PropertyFilterType.Text,
                IsFilterable = true,
                IsContainer = true,
                ContainerAlias = "bgCheck",
                EditorAlias = global::Umbraco.Cms.Core.Constants.PropertyEditors.Aliases.BlockGrid,
                SourceCategory = Models.Enums.PropertyMetadataSourceCategory.BlockGrid,
            },
            new()
            {
                Alias = "bgCheck__blockGridComponent2__bgTitle",
                Name = "BG Title",
                FilterType = Models.Enums.PropertyFilterType.Text,
                IsFilterable = false,
                ContainerAlias = "bgCheck",
                ElementTypeAlias = "blockGridComponent2",
            },
        };

        IReadOnlyList<FilterablePropertyMetadata> enriched = enricher.Enrich(properties);

        var container = Assert.Single(enriched, property => property.IsContainer);
        Assert.NotNull(container.BlockExamineDiagnostics);
        Assert.Equal(1, container.BlockExamineDiagnostics.ElementFieldsDetected);
        Assert.Equal(1, container.BlockExamineDiagnostics.DedicatedPropertyFields);
        Assert.Equal("Container Search", container.BlockExamineDiagnostics.SearchStrategy);
    }

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

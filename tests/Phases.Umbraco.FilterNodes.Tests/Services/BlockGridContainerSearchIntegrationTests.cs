using Examine.Lucene.Analyzers;
using Examine.Search;
using Lucene.Net.Analysis;
using Lucene.Net.Documents;
using Lucene.Net.Index;
using Lucene.Net.QueryParsers.Classic;
using Lucene.Net.Search;
using Lucene.Net.Store;
using Lucene.Net.Util;
using Phases.Umbraco.FilterNodes.Models.Enums;
using Phases.Umbraco.FilterNodes.Models.Examine;
using Phases.Umbraco.FilterNodes.Models.Requests;
using Phases.Umbraco.FilterNodes.Services;
using Phases.Umbraco.FilterNodes.Services.Examine;
using Xunit;

namespace Phases.Umbraco.FilterNodes.Tests.Services;

public sealed class BlockGridContainerSearchIntegrationTests
{
    private const LuceneVersion LuceneVersion = LuceneVersion.LUCENE_48;

    [Fact]
    public void Contains_on_bgCheck_matches_indexed_block_grid_container_value()
    {
        using var directory = CreateBlockGridContainerIndex();

        var examineValue = ExamineFieldQuery.ToContainsValue("BGTitle");
        var query = CreateFieldQuery("bgCheck", examineValue);

        Assert.Equal(["1"], Search(directory, query));
    }

    [Fact]
    public void Contains_on_multi_word_phrase_matches_tokenized_index_value()
    {
        using var directory = CreateCultureVariantBlockGridIndex();

        var examineValue = ExamineFieldQuery.ToContainsValue("Lorem ipsum dolor sit amet");
        var query = CreateFieldQuery("mainContent_en-us", examineValue);

        Assert.Equal(["1"], Search(directory, query));
    }

    [Fact]
    public void Resolve_block_grid_container_maps_to_bgCheck_field()
    {
        var catalog = new InMemoryExamineIndexFieldCatalog("bgCheck");
        var resolver = new ExamineFieldResolver(catalog);
        var metadata = new Models.Responses.FilterablePropertyMetadata
        {
            Alias = "bgCheck",
            Name = "BG Check",
            FilterType = PropertyFilterType.Text,
            IsFilterable = true,
            IsContainer = true,
            ContainerAlias = "bgCheck",
            EditorAlias = global::Umbraco.Cms.Core.Constants.PropertyEditors.Aliases.BlockGrid,
            SourceCategory = Models.Enums.PropertyMetadataSourceCategory.BlockGrid,
        };

        ExamineFieldResolution resolution = resolver.Resolve("bgCheck", metadata);

        Assert.Equal(ExamineFieldResolutionStrategy.ContainerOnly, resolution.Strategy);
        Assert.Equal(["bgCheck"], resolution.FieldNames);
    }

    [Fact]
    public void Resolve_block_grid_element_without_dedicated_field_falls_back_to_container()
    {
        var catalog = new InMemoryExamineIndexFieldCatalog("bgCheck");
        var resolver = new ExamineFieldResolver(catalog);
        var metadata = new Models.Responses.FilterablePropertyMetadata
        {
            Alias = "bgCheck__blockGridComponent2__bgTitle",
            Name = "BG Title",
            FilterType = PropertyFilterType.Text,
            IsFilterable = true,
            ContainerAlias = "bgCheck",
            ElementTypeAlias = "blockGridComponent2",
            VariesByCulture = true,
        };

        ExamineFieldResolution resolution = resolver.Resolve(
            "bgCheck__blockGridComponent2__bgTitle",
            metadata,
            SearchCultureContext.AllCultures);

        Assert.Equal(ExamineFieldResolutionStrategy.ContainerOnly, resolution.Strategy);
        Assert.Equal(["bgCheck"], resolution.FieldNames);
    }

    [Fact]
    public void Resolve_block_grid_element_without_dedicated_field_is_unsupported_without_metadata()
    {
        var catalog = new InMemoryExamineIndexFieldCatalog("bgCheck");
        var resolver = new ExamineFieldResolver(catalog);

        ExamineFieldResolution resolution = resolver.Resolve("bgCheck__blockGridComponent2__bgTitle");

        Assert.Equal(ExamineFieldResolutionStrategy.ContainerOnly, resolution.Strategy);
        Assert.Equal(["bgCheck"], resolution.FieldNames);
    }

    [Fact]
    public void Resolve_block_grid_element_uses_dedicated_field_when_indexed()
    {
        var catalog = new InMemoryExamineIndexFieldCatalog(
            "bgCheck",
            "bgCheck__blockGridComponent2__bgTitle");
        var resolver = new ExamineFieldResolver(catalog);

        ExamineFieldResolution resolution = resolver.Resolve("bgCheck__blockGridComponent2__bgTitle");

        Assert.Equal(ExamineFieldResolutionStrategy.NestedBlock, resolution.Strategy);
        Assert.Equal(["bgCheck__blockGridComponent2__bgTitle"], resolution.FieldNames);
    }

    private static RAMDirectory CreateBlockGridContainerIndex()
    {
        var directory = new RAMDirectory();
        using Analyzer analyzer = new CultureInvariantWhitespaceAnalyzer();
        var config = new IndexWriterConfig(LuceneVersion, analyzer)
        {
            OpenMode = OpenMode.CREATE,
        };

        using var writer = new IndexWriter(directory, config);
        var document = new Document
        {
            new StringField("id", "1", Field.Store.YES),
            new TextField("nodeTypeAlias", "blog", Field.Store.YES),
            new TextField("bgCheck", "BGTitle", Field.Store.YES),
        };

        writer.AddDocument(document);
        writer.Commit();

        return directory;
    }

    private static RAMDirectory CreateCultureVariantBlockGridIndex()
    {
        var directory = new RAMDirectory();
        using Analyzer analyzer = new CultureInvariantWhitespaceAnalyzer();
        var config = new IndexWriterConfig(LuceneVersion, analyzer)
        {
            OpenMode = OpenMode.CREATE,
        };

        using var writer = new IndexWriter(directory, config);
        var document = new Document
        {
            new StringField("id", "1", Field.Store.YES),
            new TextField("nodeTypeAlias", "standardPage", Field.Store.YES),
            new TextField(
                "mainContent_en-us",
                "Lorem ipsum dolor sit amet",
                Field.Store.YES),
        };

        writer.AddDocument(document);
        writer.Commit();

        return directory;
    }

    private static Query CreateFieldQuery(string field, IExamineValue examineValue)
    {
        using Analyzer analyzer = new CultureInvariantWhitespaceAnalyzer();
        var parser = new QueryParser(LuceneVersion, field, analyzer);
        return parser.Parse(examineValue.Value);
    }

    private static string[] Search(RAMDirectory directory, Query query)
    {
        using var reader = DirectoryReader.Open(directory);
        var searcher = new IndexSearcher(reader);
        var hits = searcher.Search(query, 10);

        return hits.ScoreDocs
            .Select(scoreDoc => reader.Document(scoreDoc.Doc).Get("id"))
            .Where(static id => id is not null)
            .Cast<string>()
            .ToArray();
    }

    private sealed class InMemoryExamineIndexFieldCatalog : IExamineIndexFieldCatalog
    {
        private readonly HashSet<string> _fieldNames;

        public InMemoryExamineIndexFieldCatalog(params string[] fieldNames)
        {
            _fieldNames = fieldNames.ToHashSet(StringComparer.OrdinalIgnoreCase);
        }

        public IReadOnlySet<string> GetFieldNames() => _fieldNames;

        public void Invalidate()
        {
        }
    }
}

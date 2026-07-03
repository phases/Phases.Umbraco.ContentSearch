using Examine.Lucene.Analyzers;
using Examine.Search;
using Lucene.Net.Analysis;
using Lucene.Net.Documents;
using Lucene.Net.Index;
using Lucene.Net.QueryParsers.Classic;
using Lucene.Net.Search;
using Lucene.Net.Store;
using Lucene.Net.Util;
using Phases.Umbraco.ContentSearch.Examine;
using Xunit;

namespace Phases.Umbraco.ContentSearch.Tests.Examine;

public sealed class ExamineFieldQueryIntegrationTests
{
    private const LuceneVersion LuceneVersion = LuceneVersion.LUCENE_48;

    [Fact]
    public void Tokenized_contains_value_matches_multi_word_property_value()
    {
        using var directory = CreatePageTitleIndex();

        var examineValue = ExamineFieldQuery.ToContainsValue("standardPage 666");
        var query = CreateFieldQuery("pageTitle", examineValue);

        Assert.Equal(["1"], Search(directory, query));
    }

    [Fact]
    public void Phrase_equals_native_query_matches_exact_multi_word_property_value()
    {
        using var directory = CreatePageTitleIndex();

        var query = CreateNativeFieldQuery(
            "pageTitle",
            ExaminePhraseFieldQuery.BuildPhraseEqualsQuery("pageTitle", "standardPage 666"));

        Assert.Equal(["1"], Search(directory, query));
    }

    private static RAMDirectory CreatePageTitleIndex()
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
            new TextField("pageTitle", "standardPage 666", Field.Store.YES),
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

    private static Query CreateNativeFieldQuery(string field, string nativeQuery)
    {
        using Analyzer analyzer = new CultureInvariantWhitespaceAnalyzer();
        var parser = new QueryParser(LuceneVersion, field, analyzer);
        return parser.Parse(nativeQuery.TrimStart('+'));
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
}

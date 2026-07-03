using Lucene.Net.Analysis.Standard;
using Lucene.Net.Documents;
using Lucene.Net.Index;
using Lucene.Net.QueryParsers.Classic;
using Lucene.Net.Search;
using Lucene.Net.Store;
using Lucene.Net.Util;
using Xunit;

namespace Phases.Umbraco.FilterNodes.Tests.Services;

public sealed class ExamineTextFieldQueryIntegrationTests
{
    private const LuceneVersion LuceneVersion = LuceneVersion.LUCENE_48;

    [Fact]
    public void Tokenized_equals_query_matches_any_title_containing_shared_terms()
    {
        using var directory = CreateBlogTitleIndex();

        var tokenizedQuery = "blogTitle:blog";

        Assert.Equal(["1", "2", "3"], Search(directory, tokenizedQuery).OrderBy(static id => id));
    }

    [Fact]
    public void Phrase_equals_query_matches_only_exact_title()
    {
        using var directory = CreateBlogTitleIndex();

        var phraseQuery = "blogTitle:\"Blog 01\"";

        Assert.Equal(["1"], Search(directory, phraseQuery));
    }

    private static RAMDirectory CreateBlogTitleIndex()
    {
        var directory = new RAMDirectory();
        IndexDocuments(
            directory,
            PopulatedField("1", "blogTitle", "Blog 01"),
            PopulatedField("2", "blogTitle", "Blog 02"),
            PopulatedField("3", "blogTitle", "Blog 03"));

        return directory;
    }

    private static Document PopulatedField(string id, string fieldName, string fieldValue)
    {
        var document = new Document
        {
            new StringField("id", id, Field.Store.YES),
        };
        document.Add(new TextField(fieldName, fieldValue, Field.Store.YES));

        return document;
    }

    private static void IndexDocuments(RAMDirectory directory, params Document[] documents)
    {
        var analyzer = new StandardAnalyzer(LuceneVersion);
        var config = new IndexWriterConfig(LuceneVersion, analyzer)
        {
            OpenMode = OpenMode.CREATE,
        };

        using var writer = new IndexWriter(directory, config);
        foreach (var document in documents)
        {
            writer.AddDocument(document);
        }

        writer.Commit();
    }

    private static IReadOnlyList<string> Search(RAMDirectory directory, string queryText)
    {
        using var reader = DirectoryReader.Open(directory);
        var searcher = new IndexSearcher(reader);
        var analyzer = new StandardAnalyzer(LuceneVersion);
        var parser = new QueryParser(LuceneVersion, "id", analyzer);

        var query = parser.Parse(queryText);
        var hits = searcher.Search(query, reader.MaxDoc);

        return hits.ScoreDocs
            .Select(scoreDoc => reader.Document(scoreDoc.Doc).Get("id"))
            .Where(static id => id is not null)
            .Cast<string>()
            .ToArray();
    }
}

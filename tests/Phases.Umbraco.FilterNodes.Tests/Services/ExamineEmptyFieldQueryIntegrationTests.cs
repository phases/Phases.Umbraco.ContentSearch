using Lucene.Net.Analysis.Standard;
using Lucene.Net.Documents;
using Lucene.Net.Index;
using Lucene.Net.QueryParsers.Classic;
using Lucene.Net.Search;
using Lucene.Net.Store;
using Lucene.Net.Util;
using Phases.Umbraco.FilterNodes.Services;
using Xunit;

namespace Phases.Umbraco.FilterNodes.Tests.Services;

public sealed class ExamineEmptyFieldQueryIntegrationTests
{
    private const LuceneVersion LuceneVersion = LuceneVersion.LUCENE_48;

    [Fact]
    public void IsEmpty_returns_nodes_with_missing_unset_or_empty_property_values()
    {
        using var directory = new RAMDirectory();
        IndexDocuments(
            directory,
            MissingField("1"),
            EmptyField("2", "bodyText"),
            PopulatedField("3", "bodyText", "Hello"),
            PopulatedField("4", "category", "news"),
            MissingField("5"),
            PopulatedField("6", "isFeatured", "0"),
            PopulatedField("7", "publishDate", "20240101"));

        var results = Search(directory, ExamineEmptyFieldQuery.BuildIsEmptyQuery("bodyText"));

        Assert.Equal(["1", "2", "4", "5", "6", "7"], results.OrderBy(static id => id));
    }

    [Fact]
    public void IsNotEmpty_returns_nodes_with_populated_property_values()
    {
        using var directory = new RAMDirectory();
        IndexDocuments(
            directory,
            MissingField("1"),
            EmptyField("2", "bodyText"),
            PopulatedField("3", "bodyText", "Hello"),
            PopulatedField("4", "category", "news"),
            PopulatedField("5", "isFeatured", "1"),
            PopulatedField("6", "isFeatured", "0"),
            PopulatedField("7", "publishDate", "20240615"));

        Assert.Equal(["3"], Search(directory, ExamineEmptyFieldQuery.BuildIsNotEmptyQuery("bodyText")).OrderBy(static id => id));
        Assert.Equal(["4"], Search(directory, ExamineEmptyFieldQuery.BuildIsNotEmptyQuery("category")).OrderBy(static id => id));
        Assert.Equal(["5", "6"], Search(directory, ExamineEmptyFieldQuery.BuildIsNotEmptyQuery("isFeatured")).OrderBy(static id => id));
        Assert.Equal(["7"], Search(directory, ExamineEmptyFieldQuery.BuildIsNotEmptyQuery("publishDate")).OrderBy(static id => id));
    }

    [Fact]
    public void IsEmpty_or_IsNotEmpty_returns_all_documents_for_the_field()
    {
        using var directory = new RAMDirectory();
        IndexDocuments(
            directory,
            MissingField("1"),
            EmptyField("2", "blogTitle"),
            PopulatedField("3", "blogTitle", "Blog 02 Title"),
            PopulatedField("4", "blogTitle", "Blog 03 Title"),
            PopulatedField("5", "category", "news"));

        var isEmptyQuery = ExamineEmptyFieldQuery.BuildIsEmptyQuery("blogTitle");
        var isNotEmptyQuery = ExamineEmptyFieldQuery.BuildIsNotEmptyQuery("blogTitle");
        var combinedQuery = $"({isEmptyQuery}) OR ({isNotEmptyQuery})";

        var results = Search(directory, combinedQuery);

        Assert.Equal(["1", "2", "3", "4", "5"], results.OrderBy(static id => id));
    }

    [Fact]
    public void IsNotEmpty_returns_media_picker_nodes_when_population_marker_is_indexed()
    {
        using var directory = new RAMDirectory();
        IndexDocuments(
            directory,
            MissingField("1"),
            PopulatedField("2", "blogImage", "\u0002"),
            PopulatedField("3", "blogImage", "\u0002"));

        var results = Search(directory, ExamineEmptyFieldQuery.BuildIsNotEmptyQuery("blogImage"));

        Assert.Equal(["2", "3"], results.OrderBy(static id => id));
    }

    [Fact]
    public void IsEmpty_returns_media_picker_nodes_without_population_marker()
    {
        using var directory = new RAMDirectory();
        IndexDocuments(
            directory,
            MissingField("1"),
            PopulatedField("2", "blogImage", "\u0002"),
            MissingField("3"));

        var results = Search(directory, ExamineEmptyFieldQuery.BuildIsEmptyQuery("blogImage"));

        Assert.Equal(["1", "3"], results.OrderBy(static id => id));
    }

    private static Document MissingField(string id)
    {
        var document = new Document
        {
            new StringField("id", id, Field.Store.YES),
        };

        return document;
    }

    private static Document EmptyField(string id, string fieldName)
    {
        var document = MissingField(id);
        document.Add(new StringField(fieldName, string.Empty, Field.Store.YES));
        return document;
    }

    private static Document PopulatedField(string id, string fieldName, string fieldValue)
    {
        var document = MissingField(id);
        document.Add(new StringField(fieldName, fieldValue, Field.Store.YES));
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

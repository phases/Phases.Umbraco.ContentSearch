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
using Phases.Umbraco.FilterNodes.Services;
using Xunit;

namespace Phases.Umbraco.FilterNodes.Tests.Services;

public sealed class ExamineRadioButtonQueryIntegrationTests
{
    private const LuceneVersion LuceneVersion = LuceneVersion.LUCENE_48;

    [Fact]
    public void Phrase_query_matches_exact_radio_value_but_not_other_values_with_shared_token()
    {
        using var directory = CreateRadioFieldIndex();

        var phraseQuery = CreatePhraseQuery("rdBlog", "3 R");

        Assert.Equal(["3"], Search(directory, phraseQuery));
    }

    [Fact]
    public void Analyzed_field_query_matches_unrelated_radio_values_with_shared_token()
    {
        using var directory = CreateRadioFieldIndex();

        using Analyzer analyzer = new CultureInvariantWhitespaceAnalyzer();
        var parser = new QueryParser(LuceneVersion, "rdBlog", analyzer);
        var analyzedQuery = parser.Parse("3 R");

        var ids = Search(directory, analyzedQuery);

        Assert.Contains("1", ids);
        Assert.Contains("3", ids);
    }

    [Fact]
    public void Dropdown_equals_uses_phrase_style_query_value()
    {
        var examineValue = ExamineFieldQuery.ToEqualsValue("3 R", PropertyFilterType.Dropdown);

        Assert.Equal(Examineness.Escaped, examineValue.Examineness);
        Assert.Equal("3 r", examineValue.Value);
    }

    private static RAMDirectory CreateRadioFieldIndex()
    {
        var directory = new RAMDirectory();
        using Analyzer analyzer = new CultureInvariantWhitespaceAnalyzer();
        var config = new IndexWriterConfig(LuceneVersion, analyzer)
        {
            OpenMode = OpenMode.CREATE,
        };

        using var writer = new IndexWriter(directory, config);
        AddDocument(writer, "1", "1 R");
        AddDocument(writer, "3", "3 R");
        writer.Commit();

        return directory;
    }

    private static void AddDocument(IndexWriter writer, string id, string radioValue)
    {
        var document = new Document
        {
            new StringField("id", id, Field.Store.YES),
            new TextField("rdBlog", radioValue, Field.Store.YES),
        };

        writer.AddDocument(document);
    }

    private static PhraseQuery CreatePhraseQuery(string field, string text)
    {
        var phraseQuery = new PhraseQuery { Slop = 0 };

        foreach (var value in text.ToLowerInvariant().Split(' ', StringSplitOptions.RemoveEmptyEntries))
        {
            phraseQuery.Add(new Term(field, value));
        }

        return phraseQuery;
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

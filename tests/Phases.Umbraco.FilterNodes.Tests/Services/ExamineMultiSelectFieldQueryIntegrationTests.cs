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

public sealed class ExamineMultiSelectFieldQueryIntegrationTests
{
    private const LuceneVersion LuceneVersion = LuceneVersion.LUCENE_48;

    [Fact]
    public void Phrase_query_matches_expanded_multiselect_value_but_not_other_values()
    {
        using var directory = CreateCheckListIndex();

        var examineValue = ExamineFieldQuery.ToEqualsValue("One check", PropertyFilterType.MultiSelect);
        var phraseQuery = CreatePhraseQuery("checkList", examineValue.Value);

        Assert.Equal(["1"], Search(directory, phraseQuery));
    }

    [Fact]
    public void MultiSelect_equals_uses_lowercased_phrase_style_query_value()
    {
        var examineValue = ExamineFieldQuery.ToEqualsValue("One check", PropertyFilterType.MultiSelect);

        Assert.Equal(Examineness.Escaped, examineValue.Examineness);
        Assert.Equal("one check", examineValue.Value);
    }

    private static RAMDirectory CreateCheckListIndex()
    {
        var directory = new RAMDirectory();
        using Analyzer analyzer = new CultureInvariantWhitespaceAnalyzer();
        var config = new IndexWriterConfig(LuceneVersion, analyzer)
        {
            OpenMode = OpenMode.CREATE,
        };

        using var writer = new IndexWriter(directory, config);
        AddDocument(writer, "1", "one check", "two check");
        AddDocument(writer, "2", "two check", "three check");
        writer.Commit();

        return directory;
    }

    private static void AddDocument(
        IndexWriter writer,
        string id,
        params string[] checkListValues)
    {
        var document = new Document
        {
            new StringField("id", id, Field.Store.YES),
        };

        foreach (var value in checkListValues)
        {
            document.Add(new TextField("checkList", value, Field.Store.YES));
        }

        writer.AddDocument(document);
    }

    private static Query CreatePhraseQuery(string field, string phrase)
    {
        using Analyzer analyzer = new CultureInvariantWhitespaceAnalyzer();
        var parser = new QueryParser(LuceneVersion, field, analyzer);
        return parser.Parse($"\"{QueryParser.Escape(phrase)}\"");
    }

    private static IEnumerable<string> Search(RAMDirectory directory, Query query)
    {
        using var reader = DirectoryReader.Open(directory);
        var searcher = new IndexSearcher(reader);
        var hits = searcher.Search(query, 10);

        for (var index = 0; index < hits.ScoreDocs.Length; index++)
        {
            var document = searcher.Doc(hits.ScoreDocs[index].Doc);
            yield return document.Get("id");
        }
    }
}

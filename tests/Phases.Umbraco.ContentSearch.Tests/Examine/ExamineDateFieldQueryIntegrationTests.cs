using Examine.Lucene.Analyzers;
using Lucene.Net.Analysis;
using Lucene.Net.Documents;
using Lucene.Net.Index;
using Lucene.Net.QueryParsers.Classic;
using Lucene.Net.Search;
using Lucene.Net.Store;
using Lucene.Net.Util;
using Phases.Umbraco.ContentSearch.Examine;
using Phases.Umbraco.ContentSearch.Examine.Models;
using Phases.Umbraco.ContentSearch.Metadata.Models;
using Phases.Umbraco.ContentSearch.Search.Enums;
using Phases.Umbraco.ContentSearch.Search.Models;
using Xunit;

namespace Phases.Umbraco.ContentSearch.Tests.Examine;

public sealed class ExamineDateFieldQueryIntegrationTests
{
    private const LuceneVersion LuceneVersion = LuceneVersion.LUCENE_48;

    [Fact]
    public void Equals_query_matches_umbraco_date_storage_format()
    {
        using var directory = CreateDatePickerIndex("2026-07-01 00:00:00");

        var nativeQuery = ExamineDateFieldQuery.BuildQuery(
            "datePicker",
            CreateCondition(
                SearchOperator.Equals,
                fromDate: new DateTimeOffset(2026, 7, 1, 0, 0, 0, TimeSpan.Zero),
                toDate: new DateTimeOffset(2026, 7, 1, 23, 59, 59, TimeSpan.Zero)));

        Assert.Equal(["1"], Search(directory, nativeQuery));
    }

    [Fact]
    public void GreaterThan_query_excludes_same_day_value()
    {
        using var directory = CreateDatePickerIndex("2026-07-01 00:00:00");

        var nativeQuery = ExamineDateFieldQuery.BuildQuery(
            "datePicker",
            CreateCondition(
                SearchOperator.GreaterThan,
                fromDate: new DateTimeOffset(2026, 7, 1, 0, 0, 0, TimeSpan.Zero)));

        Assert.Empty(Search(directory, nativeQuery));
    }

    [Fact]
    public void GreaterThan_query_matches_later_date_value()
    {
        using var directory = CreateDatePickerIndex("2026-07-02 00:00:00");

        var nativeQuery = ExamineDateFieldQuery.BuildQuery(
            "datePicker",
            CreateCondition(
                SearchOperator.GreaterThan,
                fromDate: new DateTimeOffset(2026, 7, 1, 0, 0, 0, TimeSpan.Zero)));

        Assert.Equal(["1"], Search(directory, nativeQuery));
    }

    [Fact]
    public void GreaterThan_query_matches_future_year_value()
    {
        using var directory = CreateDatePickerIndex("2028-03-10 00:00:00");

        var nativeQuery = ExamineDateFieldQuery.BuildQuery(
            "datePicker",
            CreateCondition(
                SearchOperator.GreaterThan,
                fromDate: new DateTimeOffset(2026, 7, 1, 0, 0, 0, TimeSpan.Zero)));

        Assert.Equal(["1"], Search(directory, nativeQuery));
    }

    [Fact]
    public void LessThan_query_excludes_same_day_value()
    {
        using var directory = CreateDatePickerIndex("2026-07-01 00:00:00");

        var nativeQuery = ExamineDateFieldQuery.BuildQuery(
            "datePicker",
            CreateCondition(
                SearchOperator.LessThan,
                toDate: new DateTimeOffset(2026, 7, 1, 0, 0, 0, TimeSpan.Zero)));

        Assert.Empty(Search(directory, nativeQuery));
    }

    [Fact]
    public void Between_query_matches_value_inside_range()
    {
        using var directory = CreateDatePickerIndex("2026-07-15 00:00:00");

        var nativeQuery = ExamineDateFieldQuery.BuildQuery(
            "datePicker",
            CreateCondition(
                SearchOperator.Between,
                fromDate: new DateTimeOffset(2026, 7, 1, 0, 0, 0, TimeSpan.Zero),
                toDate: new DateTimeOffset(2026, 7, 31, 0, 0, 0, TimeSpan.Zero)));

        Assert.Equal(["1"], Search(directory, nativeQuery));
    }

    [Fact]
    public void Between_query_parses_value_range_when_dates_are_not_normalized()
    {
        using var directory = CreateDatePickerIndex("2026-07-15 00:00:00");

        var nativeQuery = ExamineDateFieldQuery.BuildQuery(
            "datePicker",
            CreateCondition(
                SearchOperator.Between,
                value: "2026-07-01..2026-07-31"));

        Assert.Equal(["1"], Search(directory, nativeQuery));
    }

    [Fact]
    public void LessThan_query_matches_earlier_date_value()
    {
        using var directory = CreateDatePickerIndex("2026-06-30 00:00:00");

        var nativeQuery = ExamineDateFieldQuery.BuildQuery(
            "datePicker",
            CreateCondition(
                SearchOperator.LessThan,
                toDate: new DateTimeOffset(2026, 7, 1, 0, 0, 0, TimeSpan.Zero)));

        Assert.Equal(["1"], Search(directory, nativeQuery));
    }

    [Fact]
    public void Today_query_matches_current_day_value()
    {
        var today = DateTimeOffset.UtcNow.Date;
        using var directory = CreateDatePickerIndex($"{today:yyyy-MM-dd} 00:00:00");

        var nativeQuery = ExamineDateFieldQuery.BuildQuery(
            "datePicker",
            CreateCondition(
                SearchOperator.Today,
                fromDate: today,
                toDate: today));

        Assert.Equal(["1"], Search(directory, nativeQuery));
    }

    private static RAMDirectory CreateDatePickerIndex(string storedValue)
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
            new TextField("datePicker", storedValue, Field.Store.YES),
        };

        writer.AddDocument(document);
        writer.Commit();

        return directory;
    }

    private static NormalizedSearchCondition CreateCondition(
        SearchOperator searchOperator,
        DateTimeOffset? fromDate = null,
        DateTimeOffset? toDate = null,
        string? value = null)
        => new()
        {
            ContentTypeAlias = "content",
            PropertyAlias = "datePicker",
            Operator = searchOperator,
            Value = value,
            FromDate = fromDate,
            ToDate = toDate,
            ResolvedExamineFieldNames = ["datePicker"],
            ResolutionStrategy = ExamineFieldResolutionStrategy.Direct,
            Metadata = new SearchablePropertyMetadata
            {
                Alias = "datePicker",
                Name = "DatePicker",
                EditorAlias = "Umbraco.DateTime",
            },
        };

    private static string[] Search(RAMDirectory directory, string nativeQuery)
    {
        using Analyzer analyzer = new CultureInvariantWhitespaceAnalyzer();
        var parser = new QueryParser(LuceneVersion, "datePicker", analyzer)
        {
            AllowLeadingWildcard = true,
        };

        var query = parser.Parse(nativeQuery.TrimStart('+'));
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

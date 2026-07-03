using Examine;
using Examine.Search;
using Microsoft.Extensions.Logging;
using Phases.Umbraco.ContentSearch.Metadata.Constants;
using Phases.Umbraco.ContentSearch.Search.Enums;
using Phases.Umbraco.ContentSearch.Search.Models;
using Umbraco.Cms.Infrastructure.Examine;
using Umbraco.Extensions;

namespace Phases.Umbraco.ContentSearch.Examine;

/// <summary>
/// Default implementation of <see cref="IContentSearchExamineQueryBuilder"/>.
/// </summary>
public sealed class ContentSearchExamineQueryBuilder : IContentSearchExamineQueryBuilder
{
    private readonly ILogger<ContentSearchExamineQueryBuilder> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="ContentSearchExamineQueryBuilder"/> class.
    /// </summary>
    /// <param name="logger">The logger.</param>
    public ContentSearchExamineQueryBuilder(ILogger<ContentSearchExamineQueryBuilder> logger)
    {
        _logger = logger;
    }

    /// <inheritdoc />
    public Task<IBooleanOperation> BuildAsync(
        NormalizedContentSearchRequest request,
        IBooleanOperation query,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request);
        ArgumentNullException.ThrowIfNull(query);
        cancellationToken.ThrowIfCancellationRequested();

        if (request.Conditions.Count == 0)
        {
            return Task.FromResult(query);
        }

        _logger.LogDebug(
            "Building Examine query with {ConditionCount} condition(s) using {MatchMode} logic.",
            request.Conditions.Count,
            request.MatchMode);

        IBooleanOperation booleanQuery = request.MatchMode == SearchMatchMode.Any
            ? BuildAnyQuery(query, request.Conditions)
            : BuildAllQuery(query, request.Conditions);

        return Task.FromResult(booleanQuery);
    }

    private static IBooleanOperation BuildAllQuery(
        IBooleanOperation query,
        IReadOnlyList<NormalizedSearchCondition> conditions)
    {
        IBooleanOperation operation = ApplyCondition(query.And(), conditions[0]);

        for (var index = 1; index < conditions.Count; index++)
        {
            operation = ApplyCondition(operation.And(), conditions[index]);
        }

        return operation;
    }

    private static IBooleanOperation BuildAnyQuery(
        IBooleanOperation query,
        IReadOnlyList<NormalizedSearchCondition> conditions)
    {
        var baseQuery = query.And();

        if (conditions.Count == 1)
        {
            return ApplyCondition(baseQuery, conditions[0]);
        }

        IBooleanOperation? operation = null;

        foreach (var condition in conditions)
        {
            operation = operation is null
                ? ApplyCondition(baseQuery, condition)
                : ApplyCondition(operation.Or(), condition);
        }

        return operation ?? ApplyCondition(baseQuery, conditions[0]);
    }

    private static IBooleanOperation ApplyCondition(
        IQuery query,
        NormalizedSearchCondition condition)
    {
        var hasContentType = !ContentSearchMetadataConstants.IsReservedContentTypeAlias(
            condition.ContentTypeAlias);
        var hasProperty = !string.IsNullOrWhiteSpace(condition.PropertyAlias);

        if (hasContentType && hasProperty)
        {
            return ApplyPropertyCondition(
                query.NodeTypeAlias(condition.ContentTypeAlias).And(),
                condition);
        }

        if (hasContentType)
        {
            return query.NodeTypeAlias(condition.ContentTypeAlias);
        }

        if (hasProperty)
        {
            return ApplyPropertyCondition(query, condition);
        }

        return query.Field("__IndexType", IndexTypes.Content);
    }

    private static IBooleanOperation ApplyPropertyCondition(
        IQuery query,
        NormalizedSearchCondition condition)
    {
        if (!condition.IsSupported)
        {
            return query.NativeQuery($"+id:{ContentSearchExamineFields.UnresolvedPropertyQueryToken}");
        }

        var fields = condition.ResolvedExamineFieldNames;

        if (condition.Operator is SearchOperator.IsEmpty or SearchOperator.IsNotEmpty)
        {
            return ApplyFieldCondition(query, fields, condition);
        }

        if (condition.Operator is SearchOperator.IsTrue or SearchOperator.IsFalse)
        {
            return ApplyFieldCondition(query, fields, condition);
        }

        if (IsDateProperty(condition) || IsRelativeDateOperator(condition.Operator))
        {
            return ApplyDateCondition(query, fields, condition);
        }

        if (IsNumericProperty(condition))
        {
            return ApplyNumericCondition(query, fields, condition);
        }

        return ApplyFieldCondition(query, fields, condition);
    }

    private static IBooleanOperation ApplyFieldCondition(
        IQuery query,
        IReadOnlyList<string> fields,
        NormalizedSearchCondition condition)
    {
        var value = condition.Value ?? string.Empty;

        return condition.Operator switch
        {
            SearchOperator.NotEquals => ApplyNegatedGroupedFieldEqualsQuery(query, fields, value),
            SearchOperator.Contains => ApplyGroupedFieldWildcardQuery(query, fields, ExamineFieldQuery.ToContainsValue(value)),
            SearchOperator.NotContains => ApplyNegatedGroupedFieldPatternQuery(query, fields, ExamineFieldQuery.ToContainsPattern(value)),
            SearchOperator.ContainsAny => ApplyContainsAnyQuery(query, fields, value),
            SearchOperator.ContainsAll => ApplyContainsAllQuery(query, fields, value),
            SearchOperator.StartsWith => ApplyGroupedFieldWildcardQuery(query, fields, ExamineFieldQuery.ToStartsWithValue(value)),
            SearchOperator.EndsWith => ApplyGroupedFieldWildcardQuery(query, fields, ExamineFieldQuery.ToEndsWithValue(value)),
            SearchOperator.IsEmpty => ApplyIsEmptyQuery(query, fields),
            SearchOperator.IsNotEmpty => ApplyIsNotEmptyQuery(query, fields),
            SearchOperator.IsTrue => ApplyGroupedFieldPhraseAlternativesQuery(query, fields, ["1", "true"]),
            SearchOperator.IsFalse => ApplyGroupedFieldPhraseAlternativesQuery(query, fields, ["0", "false"]),
            _ => ApplyGroupedFieldEqualsQuery(query, fields, value),
        };
    }

    private static IBooleanOperation ApplyGroupedFieldPhraseAlternativesQuery(
        IQuery query,
        IReadOnlyList<string> fields,
        IReadOnlyList<string> values)
    {
        if (fields.Count == 1 && values.Count == 1)
        {
            return query.NativeQuery(ExaminePhraseFieldQuery.BuildPhraseEqualsQuery(fields[0], values[0]));
        }

        var clauses = fields
            .SelectMany(field =>
                values.Select(value =>
                    ExaminePhraseFieldQuery.BuildPhraseEqualsQuery(field, value).TrimStart('+')))
            .ToArray();

        return query.NativeQuery($"+({string.Join(" OR ", clauses)})");
    }

    private static IBooleanOperation ApplyGroupedFieldEqualsQuery(
        IQuery query,
        IReadOnlyList<string> fields,
        string value,
        bool isNumeric = false)
    {
        if (isNumeric)
        {
            return ApplyGroupedFieldExamineValueQuery(
                query,
                fields,
                ExamineFieldQuery.ToEqualsValue(value, isNumeric: true));
        }

        return query.NativeQuery(ExaminePhraseFieldQuery.BuildGroupedPhraseEqualsQuery(fields, value));
    }

    private static IBooleanOperation ApplyNegatedGroupedFieldEqualsQuery(
        IQuery query,
        IReadOnlyList<string> fields,
        string value,
        bool isNumeric = false)
    {
        if (isNumeric)
        {
            return ApplyNegatedGroupedFieldExamineValueQuery(
                query,
                fields,
                ExamineFieldQuery.ToEqualsValue(value, isNumeric: true));
        }

        return query.NativeQuery(ExaminePhraseFieldQuery.BuildGroupedNegatedPhraseEqualsQuery(fields, value));
    }

    private static IBooleanOperation ApplyNegatedGroupedFieldPatternQuery(
        IQuery query,
        IReadOnlyList<string> fields,
        string pattern)
        => query.NativeQuery(ExaminePhraseFieldQuery.BuildGroupedNegatedWildcardQuery(fields, pattern));

    private static IBooleanOperation ApplyNegatedGroupedFieldExamineValueQuery(
        IQuery query,
        IReadOnlyList<string> fields,
        IExamineValue examineValue)
        => query.NativeQuery(
            ExaminePhraseFieldQuery.BuildGroupedNegatedExplicitQuery(fields, examineValue.Value));

    private static IBooleanOperation ApplyGroupedFieldExamineValueQuery(
        IQuery query,
        IReadOnlyList<string> fields,
        IExamineValue examineValue)
    {
        if (fields.Count == 1)
        {
            return query.Field(fields[0], examineValue);
        }

        IBooleanOperation? operation = null;

        foreach (var field in fields)
        {
            operation = operation is null
                ? (IBooleanOperation)query.Field(field, examineValue)
                : operation.Or().Field(field, examineValue);
        }

        return operation!;
    }

    private static IBooleanOperation ApplyGroupedFieldWildcardQuery(
        IQuery query,
        IReadOnlyList<string> fields,
        IExamineValue examineValue)
    {
        if (fields.Count == 1)
        {
            return query.Field(fields[0], examineValue);
        }

        IBooleanOperation? operation = null;

        foreach (var field in fields)
        {
            operation = operation is null
                ? (IBooleanOperation)query.Field(field, examineValue)
                : operation.Or().Field(field, examineValue);
        }

        return operation!;
    }

    private static IBooleanOperation ApplyGroupedFieldPatternQuery(
        IQuery query,
        IReadOnlyList<string> fields,
        string pattern)
    {
        if (fields.Count == 1)
        {
            return query.Field(fields[0], pattern);
        }

        return query.GroupedOr(
            fields.ToArray(),
            fields.Select(_ => pattern).ToArray());
    }

    private static IBooleanOperation ApplyIsEmptyQuery(IQuery query, IReadOnlyList<string> fields)
    {
        if (fields.Count == 1)
        {
            return query.NativeQuery(ExamineEmptyFieldQuery.BuildIsEmptyQuery(fields[0]));
        }

        var combinedQuery = string.Join(
            " AND ",
            fields.Select(ExamineEmptyFieldQuery.BuildIsEmptyQuery));

        return query.NativeQuery(combinedQuery);
    }

    private static IBooleanOperation ApplyIsNotEmptyQuery(IQuery query, IReadOnlyList<string> fields)
    {
        if (fields.Count == 1)
        {
            return query.NativeQuery(ExamineEmptyFieldQuery.BuildIsNotEmptyQuery(fields[0]));
        }

        var combinedQuery = string.Join(
            " OR ",
            fields.Select(ExamineEmptyFieldQuery.BuildIsNotEmptyQuery));

        return query.NativeQuery(combinedQuery);
    }

    private static IBooleanOperation ApplyDateCondition(
        IQuery query,
        IReadOnlyList<string> fields,
        NormalizedSearchCondition condition)
    {
        if (IsSystemDateField(condition))
        {
            return ApplySystemDateCondition(query, fields, condition);
        }

        return query.NativeQuery(ExamineDateFieldQuery.BuildGroupedQuery(fields, condition));
    }

    private static IBooleanOperation ApplySystemDateCondition(
        IQuery query,
        IReadOnlyList<string> fields,
        NormalizedSearchCondition condition)
    {
        var from = condition.FromDate?.UtcDateTime;
        var to = condition.ToDate?.UtcDateTime;
        IBooleanOperation? operation = null;

        foreach (var field in fields)
        {
            var fieldQuery = BuildSystemDateRangeQuery(
                query,
                field,
                condition.Operator,
                from,
                to);

            operation = operation is null
                ? fieldQuery
                : BuildSystemDateRangeQuery(operation.Or(), field, condition.Operator, from, to);
        }

        return operation!;
    }

    private static IBooleanOperation BuildSystemDateRangeQuery(
        IQuery query,
        string field,
        SearchOperator @operator,
        DateTime? from,
        DateTime? to)
        => @operator switch
        {
            SearchOperator.GreaterThan => query.RangeQuery<DateTime>(new[] { field }, from ?? to, null),
            SearchOperator.GreaterThanOrEqual => query.RangeQuery<DateTime>(new[] { field }, from ?? to, null),
            SearchOperator.LessThan => query.RangeQuery<DateTime>(new[] { field }, null, to ?? from),
            SearchOperator.LessThanOrEqual => query.RangeQuery<DateTime>(new[] { field }, null, to ?? from),
            SearchOperator.Between => query.RangeQuery<DateTime>(new[] { field }, from, to),
            SearchOperator.Today
                or SearchOperator.Yesterday
                or SearchOperator.Last7Days
                or SearchOperator.Last30Days
                or SearchOperator.ThisMonth
                or SearchOperator.LastMonth
                or SearchOperator.ThisYear => query.RangeQuery<DateTime>(new[] { field }, from, to),
            SearchOperator.Equals => query.RangeQuery<DateTime>(new[] { field }, from, to),
            _ => query.RangeQuery<DateTime>(new[] { field }, from, to),
        };

    private static bool IsSystemDateField(NormalizedSearchCondition condition)
    {
        var alias = condition.PropertyAlias;

        return alias.Equals(ContentSearchMetadataConstants.CreatedDatePropertyAlias, StringComparison.OrdinalIgnoreCase)
            || alias.Equals(ContentSearchMetadataConstants.UpdatedDatePropertyAlias, StringComparison.OrdinalIgnoreCase)
            || alias.Equals(ContentSearchMetadataConstants.ReleaseDatePropertyAlias, StringComparison.OrdinalIgnoreCase);
    }

    private static IBooleanOperation ApplyNumericCondition(
        IQuery query,
        IReadOnlyList<string> fields,
        NormalizedSearchCondition condition)
    {
        if (condition.Operator == SearchOperator.Between
            && condition.FromNumber.HasValue
            && condition.ToNumber.HasValue)
        {
            return fields.Count == 1
                ? query.RangeQuery<decimal>(
                    fields.ToArray(),
                    condition.FromNumber,
                    condition.ToNumber)
                : query.GroupedOr(
                    fields.ToArray(),
                    fields.Select(_ => condition.FromNumber!.Value.ToString()).ToArray());
        }

        if (condition.Operator == SearchOperator.GreaterThan && condition.FromNumber.HasValue)
        {
            return ApplyGroupedFieldEqualsQuery(
                query,
                fields,
                condition.FromNumber.Value.ToString(),
                isNumeric: true);
        }

        if (condition.Operator == SearchOperator.GreaterThanOrEqual && condition.FromNumber.HasValue)
        {
            return ApplyGroupedFieldEqualsQuery(
                query,
                fields,
                condition.FromNumber.Value.ToString(),
                isNumeric: true);
        }

        if (condition.Operator == SearchOperator.LessThan && condition.ToNumber.HasValue)
        {
            return ApplyGroupedFieldEqualsQuery(
                query,
                fields,
                condition.ToNumber.Value.ToString(),
                isNumeric: true);
        }

        if (condition.Operator == SearchOperator.LessThanOrEqual && condition.ToNumber.HasValue)
        {
            return ApplyGroupedFieldEqualsQuery(
                query,
                fields,
                condition.ToNumber.Value.ToString(),
                isNumeric: true);
        }

        return ApplyGroupedFieldEqualsQuery(
            query,
            fields,
            condition.Value ?? string.Empty,
            isNumeric: true);
    }

    private static IBooleanOperation ApplyContainsAnyQuery(
        IQuery query,
        IReadOnlyList<string> fields,
        string value)
    {
        var terms = SplitMultiValue(value);
        if (terms.Length <= 1)
        {
            var singleTerm = terms.Length == 1 ? terms[0] : value;
            return ApplyGroupedFieldPatternQuery(query, fields, $"*{singleTerm}*");
        }

        IBooleanOperation? operation = null;

        foreach (var term in terms)
        {
            operation = operation is null
                ? ApplyGroupedFieldPatternQuery(query, fields, $"*{term}*")
                : ApplyGroupedFieldPatternQuery(operation.Or(), fields, $"*{term}*");
        }

        return operation!;
    }

    private static IBooleanOperation ApplyContainsAllQuery(
        IQuery query,
        IReadOnlyList<string> fields,
        string value)
    {
        var terms = SplitMultiValue(value);
        if (terms.Length <= 1)
        {
            return ApplyGroupedFieldPatternQuery(query, fields, $"*{value}*");
        }

        var operation = ApplyGroupedFieldPatternQuery(query, fields, $"*{terms[0]}*");

        for (var index = 1; index < terms.Length; index++)
        {
            operation = ApplyGroupedFieldPatternQuery(operation.And(), fields, $"*{terms[index]}*");
        }

        return operation;
    }

    private static string[] SplitMultiValue(string value)
        => value.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

    private static bool IsRelativeDateOperator(SearchOperator @operator)
        => @operator is SearchOperator.Today
            or SearchOperator.Yesterday
            or SearchOperator.Last7Days
            or SearchOperator.Last30Days
            or SearchOperator.ThisMonth
            or SearchOperator.LastMonth
            or SearchOperator.ThisYear;

    private static bool IsDateProperty(NormalizedSearchCondition condition)
    {
        var alias = condition.PropertyAlias;

        return alias.Equals(ContentSearchMetadataConstants.CreatedDatePropertyAlias, StringComparison.OrdinalIgnoreCase)
            || alias.Equals(ContentSearchMetadataConstants.UpdatedDatePropertyAlias, StringComparison.OrdinalIgnoreCase)
            || alias.Equals(ContentSearchMetadataConstants.ReleaseDatePropertyAlias, StringComparison.OrdinalIgnoreCase)
            || condition.Metadata?.EditorAlias?.Contains("Date", StringComparison.OrdinalIgnoreCase) == true;
    }

    private static bool IsNumericProperty(NormalizedSearchCondition condition)
        => condition.PropertyAlias.Equals(
               ContentSearchMetadataConstants.TemplateIdPropertyAlias,
               StringComparison.OrdinalIgnoreCase)
           || condition.Metadata?.EditorAlias?.Contains("Numeric", StringComparison.OrdinalIgnoreCase) == true
           || condition.Metadata?.EditorAlias?.Contains("Integer", StringComparison.OrdinalIgnoreCase) == true
           || condition.Metadata?.EditorAlias?.Contains("Decimal", StringComparison.OrdinalIgnoreCase) == true;
}

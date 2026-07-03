using Examine;
using Examine.Search;
using Microsoft.Extensions.Logging;
using Phases.Umbraco.FilterNodes.Constants;
using Phases.Umbraco.FilterNodes.Models.Enums;
using Phases.Umbraco.FilterNodes.Models.Examine;
using Phases.Umbraco.FilterNodes.Models.Requests;
using Phases.Umbraco.FilterNodes.Services.Examine;
using Phases.Umbraco.FilterNodes.Services.Interfaces;
using Phases.Umbraco.FilterNodes.Services.Validation;
using Umbraco.Cms.Infrastructure.Examine;
using Umbraco.Extensions;

namespace Phases.Umbraco.FilterNodes.Services;

/// <summary>
/// Default implementation of <see cref="IExamineQueryBuilder"/>.
/// </summary>
public sealed class ExamineQueryBuilder : IExamineQueryBuilder
{
    private readonly IExamineFieldResolver _fieldResolver;
    private readonly ILogger<ExamineQueryBuilder> _logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="ExamineQueryBuilder"/> class.
    /// </summary>
    /// <param name="fieldResolver">The Examine field resolver.</param>
    /// <param name="logger">The logger.</param>
    public ExamineQueryBuilder(
        IExamineFieldResolver fieldResolver,
        ILogger<ExamineQueryBuilder> logger)
    {
        _fieldResolver = fieldResolver;
        _logger = logger;
    }

    /// <inheritdoc />
    public Task<IBooleanOperation> BuildAsync(
        FilterRequest request,
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
            "Building Examine query with {ConditionCount} condition(s) using {FilterType} logic.",
            request.Conditions.Count,
            request.FilterType);

        IBooleanOperation booleanQuery = request.FilterType == FilterType.Any
            ? BuildAnyQuery(query, request.Conditions)
            : BuildAllQuery(query, request.Conditions);

        return Task.FromResult(booleanQuery);
    }

    private IBooleanOperation BuildAllQuery(IBooleanOperation query, IReadOnlyList<FilterCondition> conditions)
    {
        IBooleanOperation operation = ApplyCondition(query.And(), conditions[0]);

        for (var index = 1; index < conditions.Count; index++)
        {
            operation = ApplyCondition(operation.And(), conditions[index]);
        }

        return operation;
    }

    private IBooleanOperation BuildAnyQuery(IBooleanOperation query, IReadOnlyList<FilterCondition> conditions)
    {
        var baseQuery = query.And();

        if (conditions.Count == 1)
        {
            return ApplyCondition(baseQuery, conditions[0]);
        }

        var groupedOrFields = new List<string>();
        var groupedOrValues = new List<string>();
        var otherConditions = new List<FilterCondition>();

        foreach (var condition in conditions)
        {
            if (TryCreateGroupedOrClause(condition, out var field, out var value))
            {
                groupedOrFields.Add(field);
                groupedOrValues.Add(value);
            }
            else
            {
                otherConditions.Add(condition);
            }
        }

        IBooleanOperation? operation = null;

        if (groupedOrFields.Count > 0)
        {
            operation = baseQuery.GroupedOr(groupedOrFields.ToArray(), groupedOrValues.ToArray());
        }

        foreach (var condition in otherConditions)
        {
            operation = operation is null
                ? ApplyCondition(baseQuery, condition)
                : ApplyCondition(operation.Or(), condition);
        }

        return operation ?? ApplyCondition(baseQuery, conditions[0]);
    }

    private IBooleanOperation ApplyCondition(IQuery query, FilterCondition condition)
    {
        var hasContentType = !string.IsNullOrWhiteSpace(condition.ContentTypeAlias);
        var hasProperty = !string.IsNullOrWhiteSpace(condition.PropertyAlias);

        if (hasContentType && hasProperty)
        {
            return ApplyPropertyCondition(
                query.NodeTypeAlias(condition.ContentTypeAlias!).And(),
                condition);
        }

        if (hasContentType)
        {
            return query.NodeTypeAlias(condition.ContentTypeAlias!);
        }

        if (hasProperty && !hasContentType)
        {
            return ApplyPropertyCondition(query, condition);
        }

        if (condition.FromDate.HasValue || condition.ToDate.HasValue)
        {
            return query.RangeQuery<DateTime>(
                new[] { FilterNodesExamineFields.UpdateDate },
                condition.FromDate?.UtcDateTime,
                condition.ToDate?.UtcDateTime);
        }

        return query.Field("__IndexType", IndexTypes.Content);
    }

    private IBooleanOperation ApplyPropertyCondition(IQuery query, FilterCondition condition)
    {
        var propertyAlias = condition.PropertyAlias!;
        var resolution = ResolveExamineFields(condition);

        LogExamineFieldResolution(condition, propertyAlias, resolution);

        if (!resolution.IsSupported)
        {
            _logger.LogWarning(
                "No Examine fields were resolved for property alias '{PropertyAlias}'. Strategy={Strategy}. The query will match no documents.",
                propertyAlias,
                resolution.Strategy);

            return query.NativeQuery("+id:__filter_nodes_unresolved_property__");
        }

        if (IsSystemDateField(propertyAlias))
        {
            return ApplyDateCondition(query, resolution.FieldNames[0], condition);
        }

        return ApplyFieldCondition(query, resolution, condition);
    }

    private ExamineFieldResolution ResolveExamineFields(FilterCondition condition)
    {
        if (condition.ResolvedExamineFieldNames is { Count: > 0 }
            && condition.ExamineResolutionStrategy.HasValue
            && condition.ExamineResolutionStrategy.Value != ExamineFieldResolutionStrategy.Unsupported)
        {
            return new ExamineFieldResolution
            {
                FieldNames = condition.ResolvedExamineFieldNames,
                Strategy = condition.ExamineResolutionStrategy.Value,
            };
        }

        return _fieldResolver.Resolve(condition.PropertyAlias!);
    }

    private void LogExamineFieldResolution(
        FilterCondition condition,
        string propertyAlias,
        ExamineFieldResolution resolution)
    {
        var filterOperator = condition.FilterOperator ?? FilterOperator.Equals;
        var propertyValue = condition.PropertyValue ?? string.Empty;
        var examineFields = resolution.FieldNames.Count == 0
            ? "(none)"
            : string.Join(", ", resolution.FieldNames);

        _logger.LogInformation(
            "Examine filter condition mapped. PropertyAlias={PropertyAlias}, ContentTypeAlias={ContentTypeAlias}, Strategy={Strategy}, ExamineFields={ExamineFields}, Operator={Operator}, Value={Value}, ExaminePattern={ExaminePattern}",
            propertyAlias,
            condition.ContentTypeAlias ?? "(none)",
            resolution.Strategy,
            examineFields,
            filterOperator,
            propertyValue,
            DescribeExamineValue(filterOperator, propertyValue, condition.PropertyFilterType));

        if (BlockPropertyAliasParser.TryParse(propertyAlias, out var blockParts))
        {
            _logger.LogInformation(
                "Block property resolution detail. ContainerAlias={ContainerAlias}, ElementTypeAlias={ElementTypeAlias}, ElementPropertyAlias={ElementPropertyAlias}, ExamineFields={ExamineFields}",
                blockParts.ContainerAlias,
                blockParts.ElementTypeAlias,
                blockParts.ElementPropertyAlias,
                examineFields);
        }
    }

    private static IBooleanOperation ApplyFieldCondition(
        IQuery query,
        ExamineFieldResolution resolution,
        FilterCondition condition)
    {
        var fields = resolution.FieldNames;
        var value = condition.PropertyValue ?? string.Empty;

        if (value.Contains(',', StringComparison.Ordinal)
            && condition.FilterOperator is FilterOperator.Equals or FilterOperator.Contains)
        {
            var values = value
                .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

            if (values.Length > 1)
            {
                if (condition.FilterOperator == FilterOperator.Contains)
                {
                    return ApplyGroupedFieldQuery(
                        query,
                        fields,
                        values.Select(static item => ExamineFieldQuery.ToContainsValue(item)).ToArray());
                }

                return ApplyMultiSelectEqualsQuery(query, fields, values, condition.PropertyFilterType);
            }
        }

        if (condition.FilterOperator == FilterOperator.Equals
            && condition.PropertyFilterType == PropertyFilterType.MultiSelect)
        {
            return ApplyMultiSelectEqualsQuery(query, fields, [value], condition.PropertyFilterType);
        }

        if (condition.FilterOperator == FilterOperator.NotEquals
            && condition.PropertyFilterType == PropertyFilterType.MultiSelect)
        {
            var values = value
                .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

            return (IBooleanOperation)ApplyMultiSelectEqualsQuery(
                    query,
                    fields,
                    values,
                    condition.PropertyFilterType)
                .Not();
        }

        return condition.FilterOperator switch
        {
            FilterOperator.NotEquals => (IBooleanOperation)ApplyGroupedFieldValueQuery(
                query,
                fields,
                value,
                condition.PropertyFilterType,
                isContains: false).Not(),
            FilterOperator.Contains => ApplyGroupedFieldValueQuery(
                query,
                fields,
                value,
                condition.PropertyFilterType,
                isContains: true),
            FilterOperator.StartsWith => ApplyGroupedFieldPatternQuery(
                query,
                fields,
                $"{value}*"),
            FilterOperator.EndsWith => ApplyGroupedFieldPatternQuery(
                query,
                fields,
                $"*{value}"),
            FilterOperator.Between => query.RangeQuery<DateTime>(
                fields.ToArray(),
                condition.FromDate?.UtcDateTime,
                condition.ToDate?.UtcDateTime),
            FilterOperator.IsEmpty => ApplyIsEmptyQuery(query, fields),
            FilterOperator.IsNotEmpty => ApplyIsNotEmptyQuery(query, fields),
            _ => ApplyGroupedFieldValueQuery(
                query,
                fields,
                value,
                condition.PropertyFilterType,
                isContains: false),
        };
    }

    private static IBooleanOperation ApplyGroupedFieldValueQuery(
        IQuery query,
        IReadOnlyList<string> fields,
        string value,
        PropertyFilterType? propertyFilterType,
        bool isContains)
    {
        if (fields.Count == 1)
        {
            return query.Field(
                fields[0],
                isContains
                    ? ExamineFieldQuery.ToContainsValue(value)
                    : ExamineFieldQuery.ToEqualsValue(value, propertyFilterType));
        }

        var pattern = isContains
            ? ExamineFieldQuery.ToContainsValue(value)
            : ExamineFieldQuery.ToEqualsValue(value, propertyFilterType);

        return query.GroupedOr(
            fields.ToArray(),
            fields.Select(_ => pattern.Value).ToArray());
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

    private static string DescribeExamineValue(
        FilterOperator filterOperator,
        string value,
        PropertyFilterType? propertyFilterType)
    {
        return filterOperator switch
        {
            FilterOperator.Contains => ExamineFieldQuery.ToContainsValue(value).Value,
            FilterOperator.StartsWith => $"{value}*",
            FilterOperator.EndsWith => $"*{value}",
            FilterOperator.IsEmpty or FilterOperator.IsNotEmpty => "(native empty query)",
            _ => ExamineFieldQuery.ToEqualsValue(value, propertyFilterType).Value,
        };
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

    private static IBooleanOperation ApplyGroupedFieldQuery(
        IQuery query,
        IReadOnlyList<string> fields,
        IReadOnlyList<IExamineValue> values)
    {
        if (fields.Count == 1)
        {
            return query.GroupedOr(
                values.Select(_ => fields[0]).ToArray(),
                values.Select(static value => value.Value).ToArray());
        }

        IBooleanOperation? operation = null;

        foreach (var value in values)
        {
            var groupedOr = query.GroupedOr(
                fields.ToArray(),
                fields.Select(_ => value.Value).ToArray());

            operation = operation is null
                ? groupedOr
                : operation.Or().GroupedOr(
                    fields.ToArray(),
                    fields.Select(_ => value.Value).ToArray());
        }

        return operation ?? query.Field(fields[0], values[0]);
    }

    private static IBooleanOperation ApplyDateCondition(IQuery query, string field, FilterCondition condition)
    {
        var from = condition.FromDate?.UtcDateTime;
        var to = condition.ToDate?.UtcDateTime;
        var filterOperator = FilterOperatorResolver.ResolveDateOperator(condition);

        return filterOperator switch
        {
            FilterOperator.GreaterThan => query.RangeQuery<DateTime>(new[] { field }, from ?? to, null),
            FilterOperator.GreaterThanOrEqual => query.RangeQuery<DateTime>(new[] { field }, from ?? to, null),
            FilterOperator.LessThan => query.RangeQuery<DateTime>(new[] { field }, null, to ?? from),
            FilterOperator.LessThanOrEqual => query.RangeQuery<DateTime>(new[] { field }, null, to ?? from),
            _ => query.RangeQuery<DateTime>(new[] { field }, from, to),
        };
    }

    private static bool IsSystemDateField(string field)
    {
        return field.Equals(FilterNodesExamineFields.CreateDate, StringComparison.OrdinalIgnoreCase)
            || field.Equals(FilterNodesExamineFields.UpdateDate, StringComparison.OrdinalIgnoreCase);
    }

    private static bool TryCreateGroupedOrClause(
        FilterCondition condition,
        out string field,
        out string value)
    {
        field = string.Empty;
        value = string.Empty;

        if (!string.IsNullOrWhiteSpace(condition.ContentTypeAlias)
            && string.IsNullOrWhiteSpace(condition.PropertyAlias))
        {
            field = FilterNodesExamineFields.NodeTypeAlias;
            value = condition.ContentTypeAlias;
            return true;
        }

        return false;
    }

    private static IBooleanOperation ApplyMultiSelectEqualsQuery(
        IQuery query,
        IReadOnlyList<string> fields,
        IReadOnlyList<string> values,
        PropertyFilterType? propertyFilterType)
    {
        var patterns = values
            .Select(value => ExamineFieldQuery.ToEqualsValue(value, propertyFilterType))
            .ToArray();

        if (patterns.Length == 0)
        {
            return query.Field(fields[0], ExamineFieldQuery.ToContainsValue(string.Empty));
        }

        if (patterns.Length == 1)
        {
            if (fields.Count == 1)
            {
                return query.Field(fields[0], patterns[0]);
            }

            return query.GroupedOr(
                fields.ToArray(),
                fields.Select(_ => patterns[0].Value).ToArray());
        }

        var fieldList = fields.ToArray();
        IBooleanOperation? operation = null;

        foreach (var pattern in patterns)
        {
            var clause = fields.Count == 1
                ? query.Field(fields[0], pattern)
                : query.GroupedOr(
                    fieldList,
                    fieldList.Select(_ => pattern.Value).ToArray());

            operation = operation is null ? clause : operation.Or().GroupedOr(
                fieldList,
                fieldList.Select(_ => pattern.Value).ToArray());
        }

        return operation ?? query.Field(fields[0], patterns[0]);
    }
}

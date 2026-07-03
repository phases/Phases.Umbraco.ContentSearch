using Phases.Umbraco.FilterNodes.Constants;
using Phases.Umbraco.FilterNodes.Exceptions;
using Phases.Umbraco.FilterNodes.Models.Enums;
using Phases.Umbraco.FilterNodes.Models.Requests;
using Phases.Umbraco.FilterNodes.Services.Examine;
using Phases.Umbraco.FilterNodes.Services.Interfaces;

namespace Phases.Umbraco.FilterNodes.Services.Validation;

/// <summary>
/// Default implementation of <see cref="IFilterRequestValidator"/>.
/// </summary>
public sealed class FilterRequestValidator : IFilterRequestValidator
{
    private readonly ILanguageQueryService _languageQueryService;

    /// <summary>
    /// Initializes a new instance of the <see cref="FilterRequestValidator"/> class.
    /// </summary>
    /// <param name="languageQueryService">The language query service.</param>
    public FilterRequestValidator(ILanguageQueryService languageQueryService)
    {
        _languageQueryService = languageQueryService;
    }

    /// <inheritdoc />
    public void Validate(FilterRequest request)
    {
        ArgumentNullException.ThrowIfNull(request);

        var errors = new List<string>();

        ValidatePaging(request.Paging, errors);
        ValidateSort(request.Sort, errors);
        ValidateSearchCulture(request, errors);
        ValidateMatchMode(request, errors);
        ValidateConditions(request.Conditions, errors);

        if (errors.Count > 0)
        {
            throw new FilterRequestValidationException(errors);
        }
    }

    private void ValidateSearchCulture(FilterRequest request, ICollection<string> errors)
    {
        if (request.SearchCultureMode is SearchCultureMode.AllCultures)
        {
            return;
        }

        if (string.IsNullOrWhiteSpace(request.Culture))
        {
            errors.Add(
                "Culture is required when SearchCultureMode is CurrentCulture or SpecificCulture.");
            return;
        }

        var installedCultures = _languageQueryService
            .GetLanguagesAsync()
            .GetAwaiter()
            .GetResult()
            .Select(static language => language.IsoCode)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        if (!installedCultures.Contains(request.Culture))
        {
            errors.Add($"Culture '{request.Culture}' is not an installed language.");
        }
    }

    private static void ValidateSort(SortOptions? sort, ICollection<string> errors)
    {
        if (sort is null || string.IsNullOrWhiteSpace(sort.Field))
        {
            return;
        }

        if (!FilterSortConstants.AllowedSortFields.Contains(sort.Field))
        {
            errors.Add($"Sort.Field '{sort.Field}' is not supported.");
        }
    }

    private static void ValidateMatchMode(FilterRequest request, ICollection<string> errors)
    {
        if (!FilterRequestSearchPlanner.SupportsAnyMatchMode(request))
        {
            errors.Add(
                "FilterType Any is not supported when combining multiple conditions that include Is Empty or Is Not Empty. Use All conditions instead.");
        }
    }

    private static void ValidatePaging(PagedRequest paging, ICollection<string> errors)
    {
        if (paging.Page < 1)
        {
            errors.Add("Paging.Page must be greater than or equal to 1.");
        }

        if (paging.PageSize < 1)
        {
            errors.Add("Paging.PageSize must be greater than or equal to 1.");
        }
        else if (paging.PageSize > PaginationConstants.MaxPageSize)
        {
            errors.Add($"Paging.PageSize must not exceed {PaginationConstants.MaxPageSize}.");
        }
    }

    private static void ValidateConditions(IReadOnlyList<FilterCondition> conditions, ICollection<string> errors)
    {
        if (conditions.Count == 0)
        {
            errors.Add("At least one filter condition is required.");
            return;
        }

        if (conditions.Count > FilterConstants.MaxConditionCount)
        {
            errors.Add($"A maximum of {FilterConstants.MaxConditionCount} filter conditions is allowed.");
        }

        for (var index = 0; index < conditions.Count; index++)
        {
            ValidateCondition(conditions[index], index, errors);
        }
    }

    private static void ValidateCondition(FilterCondition condition, int index, ICollection<string> errors)
    {
        var prefix = $"Conditions[{index}]";

        switch (FilterConditionClassifier.Classify(condition))
        {
            case FilterConditionKind.ContentType:
                ValidateContentTypeCondition(condition, prefix, errors);
                break;

            case FilterConditionKind.CreatedDate:
            case FilterConditionKind.UpdatedDate:
                ValidateDateCondition(condition, prefix, errors);
                break;

            case FilterConditionKind.PublishStatus:
                ValidatePublishStatusCondition(condition, prefix, errors);
                break;

            case FilterConditionKind.Property:
                ValidatePropertyCondition(condition, prefix, errors);
                break;
        }
    }

    private static void ValidateContentTypeCondition(
        FilterCondition condition,
        string prefix,
        ICollection<string> errors)
    {
        if (string.IsNullOrWhiteSpace(condition.ContentTypeAlias))
        {
            errors.Add($"{prefix}.ContentTypeAlias is required for content type filters.");
            return;
        }

        if (HasPropertyFields(condition) || HasDateFields(condition))
        {
            errors.Add($"{prefix} content type filters cannot include property or date values.");
        }
    }

    private static void ValidatePropertyCondition(
        FilterCondition condition,
        string prefix,
        ICollection<string> errors)
    {
        if (string.IsNullOrWhiteSpace(condition.PropertyAlias))
        {
            errors.Add($"{prefix}.PropertyAlias is required for property filters.");
            return;
        }

        if (string.IsNullOrWhiteSpace(condition.ContentTypeAlias))
        {
            if (!FilterConstants.IsEntireSiteSystemProperty(condition.PropertyAlias))
            {
                errors.Add($"{prefix}.ContentTypeAlias is required for property filters.");
            }
        }
        else if (FilterConstants.IsReservedContentTypeAlias(condition.ContentTypeAlias))
        {
            errors.Add($"{prefix}.ContentTypeAlias must be a document type alias.");
        }

        ValidateOperatorRequirements(condition, prefix, errors, requiresValue: true);
    }

    private static void ValidatePublishStatusCondition(
        FilterCondition condition,
        string prefix,
        ICollection<string> errors)
    {
        if (string.IsNullOrWhiteSpace(condition.PropertyValue)
            || !PublishStatusFilterValues.IsKnownValue(condition.PropertyValue))
        {
            errors.Add($"{prefix}.PropertyValue must be a supported publish status value.");
        }

        if (string.IsNullOrWhiteSpace(condition.ContentTypeAlias))
        {
            if (!FilterConstants.IsEntireSiteSystemProperty(condition.PropertyAlias))
            {
                errors.Add($"{prefix}.ContentTypeAlias is required for publish status filters.");
            }
        }
        else if (FilterConstants.IsReservedContentTypeAlias(condition.ContentTypeAlias))
        {
            errors.Add($"{prefix}.ContentTypeAlias must be a document type alias.");
        }

        if (condition.FromDate.HasValue || condition.ToDate.HasValue)
        {
            errors.Add($"{prefix} publish status filters cannot include date values.");
        }
    }

    private static void ValidateDateCondition(
        FilterCondition condition,
        string prefix,
        ICollection<string> errors)
    {
        if (!condition.FromDate.HasValue && !condition.ToDate.HasValue)
        {
            errors.Add($"{prefix} requires at least one of FromDate or ToDate.");
        }

        if (condition.FromDate.HasValue
            && condition.ToDate.HasValue
            && condition.FromDate.Value > condition.ToDate.Value)
        {
            errors.Add($"{prefix}.FromDate must be earlier than or equal to ToDate.");
        }

        if (string.IsNullOrWhiteSpace(condition.ContentTypeAlias))
        {
            if (!FilterConstants.IsEntireSiteSystemProperty(condition.PropertyAlias))
            {
                errors.Add($"{prefix}.ContentTypeAlias is required for date filters.");
            }
        }
        else if (FilterConstants.IsReservedContentTypeAlias(condition.ContentTypeAlias))
        {
            errors.Add($"{prefix}.ContentTypeAlias must be a document type alias.");
        }

        if (!string.IsNullOrWhiteSpace(condition.PropertyValue))
        {
            errors.Add($"{prefix} date filters cannot include PropertyValue.");
        }

        var filterOperator = FilterOperatorResolver.ResolveDateOperator(condition);

        if (filterOperator is not (FilterOperator.Between
            or FilterOperator.GreaterThan
            or FilterOperator.GreaterThanOrEqual
            or FilterOperator.LessThan
            or FilterOperator.LessThanOrEqual))
        {
            errors.Add($"{prefix} date filters support only range-based operators.");
        }

        if (filterOperator == FilterOperator.Between
            && (!condition.FromDate.HasValue || !condition.ToDate.HasValue))
        {
            errors.Add($"{prefix} requires both FromDate and ToDate when FilterOperator is Between.");
        }
    }

    private static void ValidateOperatorRequirements(
        FilterCondition condition,
        string prefix,
        ICollection<string> errors,
        bool requiresValue)
    {
        var filterOperator = condition.FilterOperator ?? FilterOperator.Equals;

        if (filterOperator is FilterOperator.IsEmpty or FilterOperator.IsNotEmpty)
        {
            return;
        }

        if (filterOperator == FilterOperator.Between)
        {
            if (!condition.FromDate.HasValue || !condition.ToDate.HasValue)
            {
                errors.Add($"{prefix} requires both FromDate and ToDate when FilterOperator is Between.");
            }

            return;
        }

        if (requiresValue && string.IsNullOrWhiteSpace(condition.PropertyValue))
        {
            errors.Add($"{prefix}.PropertyValue is required for FilterOperator {filterOperator}.");
        }
    }

    private static bool HasPropertyFields(FilterCondition condition)
    {
        return !string.IsNullOrWhiteSpace(condition.PropertyAlias)
            || !string.IsNullOrWhiteSpace(condition.PropertyValue)
            || condition.FilterOperator.HasValue;
    }

    private static bool HasDateFields(FilterCondition condition)
    {
        return condition.FromDate.HasValue || condition.ToDate.HasValue;
    }
}

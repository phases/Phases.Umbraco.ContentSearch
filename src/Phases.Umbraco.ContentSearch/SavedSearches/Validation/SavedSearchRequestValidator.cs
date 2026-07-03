using Phases.Umbraco.ContentSearch.Configuration;
using Phases.Umbraco.ContentSearch.SavedSearches.Constants;
using Phases.Umbraco.ContentSearch.SavedSearches.Models.Requests;
using Microsoft.Extensions.Options;

namespace Phases.Umbraco.ContentSearch.SavedSearches.Validation;

/// <summary>
/// Validates saved search requests.
/// </summary>
internal static class SavedSearchRequestValidator
{
    /// <summary>
    /// Validates a save request.
    /// </summary>
    /// <param name="request">The save request.</param>
    /// <param name="options">Content search options.</param>
    /// <returns>Validation error messages.</returns>
    public static IReadOnlyList<string> ValidateSave(
        SaveSavedSearchRequest request,
        ContentSearchOptions options)
    {
        var errors = new List<string>();
        ValidateName(request.Name, errors);
        ValidateDescription(request.Description, errors);

        if (request.Conditions.Count == 0)
        {
            errors.Add("At least one condition is required.");
        }

        ValidatePageSize(request.PageSize, options.MaxPageSize, errors);
        ValidateConditions(request.Conditions, errors);

        return errors;
    }

    /// <summary>
    /// Validates an update request.
    /// </summary>
    /// <param name="request">The update request.</param>
    /// <returns>Validation error messages.</returns>
    public static IReadOnlyList<string> ValidateUpdate(UpdateSavedSearchRequest request)
    {
        var errors = new List<string>();
        ValidateName(request.Name, errors);
        ValidateDescription(request.Description, errors);
        return errors;
    }

    /// <summary>
    /// Validates a recent search record request.
    /// </summary>
    /// <param name="request">The recent search request.</param>
    /// <param name="options">Content search options.</param>
    /// <returns>Validation error messages.</returns>
    public static IReadOnlyList<string> ValidateRecent(
        RecordRecentSearchRequest request,
        ContentSearchOptions options)
    {
        var errors = new List<string>();
        ValidateName(request.Name, errors);
        ValidateDescription(request.Description, errors);

        if (request.Conditions.Count == 0)
        {
            errors.Add("At least one condition is required.");
        }

        ValidatePageSize(request.PageSize, options.MaxPageSize, errors);
        ValidateConditions(request.Conditions, errors);

        return errors;
    }

    private static void ValidateName(string? name, ICollection<string> errors)
    {
        var normalized = name?.Trim() ?? string.Empty;

        if (string.IsNullOrWhiteSpace(normalized))
        {
            errors.Add("Name is required.");
            return;
        }

        if (normalized.Length > SavedSearchConstants.MaxNameLength)
        {
            errors.Add($"Name must not exceed {SavedSearchConstants.MaxNameLength} characters.");
        }
    }

    private static void ValidateDescription(string? description, ICollection<string> errors)
    {
        if (description is null)
        {
            return;
        }

        if (description.Trim().Length > SavedSearchConstants.MaxDescriptionLength)
        {
            errors.Add(
                $"Description must not exceed {SavedSearchConstants.MaxDescriptionLength} characters.");
        }
    }

    private static void ValidatePageSize(int pageSize, int maxPageSize, ICollection<string> errors)
    {
        if (pageSize < 1)
        {
            errors.Add("PageSize must be greater than or equal to 1.");
            return;
        }

        if (pageSize > maxPageSize)
        {
            errors.Add($"PageSize must not exceed {maxPageSize}.");
        }
    }

    private static void ValidateConditions(
        IReadOnlyList<Search.Models.SearchConditionRequest> conditions,
        ICollection<string> errors)
    {
        for (var index = 0; index < conditions.Count; index++)
        {
            var condition = conditions[index];
            var prefix = $"Conditions[{index}]";

            if (string.IsNullOrWhiteSpace(condition.ContentTypeAlias))
            {
                errors.Add($"{prefix}.ContentTypeAlias is required.");
            }

            if (string.IsNullOrWhiteSpace(condition.PropertyAlias))
            {
                errors.Add($"{prefix}.PropertyAlias is required.");
            }

            if (string.IsNullOrWhiteSpace(condition.Operator))
            {
                errors.Add($"{prefix}.Operator is required.");
            }
        }
    }
}

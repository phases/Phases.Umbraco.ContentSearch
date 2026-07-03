using Phases.Umbraco.FilterNodes.Constants;
using Phases.Umbraco.FilterNodes.Models.Requests;

namespace Phases.Umbraco.FilterNodes.Services.Validation;

/// <summary>
/// Validates saved filter requests.
/// </summary>
internal static class SavedFilterRequestValidator
{
    /// <summary>
    /// Validates the save request.
    /// </summary>
    /// <param name="request">The save request.</param>
    /// <returns>Validation error messages.</returns>
    public static IReadOnlyList<string> Validate(SaveSavedFilterRequest request)
    {
        var errors = new List<string>();
        var name = request.Name?.Trim() ?? string.Empty;

        if (string.IsNullOrWhiteSpace(name))
        {
            errors.Add("Name is required.");
        }
        else if (name.Length > SavedFilterConstants.MaxNameLength)
        {
            errors.Add($"Name must not exceed {SavedFilterConstants.MaxNameLength} characters.");
        }

        if (request.Conditions.Count == 0)
        {
            errors.Add("At least one condition is required.");
        }

        if (request.PageSize < 1)
        {
            errors.Add("PageSize must be greater than or equal to 1.");
        }
        else if (request.PageSize > PaginationConstants.MaxPageSize)
        {
            errors.Add($"PageSize must not exceed {PaginationConstants.MaxPageSize}.");
        }

        for (var index = 0; index < request.Conditions.Count; index++)
        {
            ValidateCondition(request.Conditions[index], index, errors);
        }

        return errors;
    }

    private static void ValidateCondition(
        SavedFilterCondition condition,
        int index,
        ICollection<string> errors)
    {
        var prefix = $"Conditions[{index}]";

        if (string.IsNullOrWhiteSpace(condition.ContentTypeAlias))
        {
            errors.Add($"{prefix}.ContentTypeAlias is required.");
        }
        else if (FilterConstants.IsReservedContentTypeAlias(condition.ContentTypeAlias))
        {
            errors.Add($"{prefix}.ContentTypeAlias must be a document type alias.");
        }

        if (string.IsNullOrWhiteSpace(condition.PropertyAlias))
        {
            errors.Add($"{prefix}.PropertyAlias is required.");
        }
    }
}

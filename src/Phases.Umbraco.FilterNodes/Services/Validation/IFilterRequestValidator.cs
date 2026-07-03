using Phases.Umbraco.FilterNodes.Models.Requests;

namespace Phases.Umbraco.FilterNodes.Services.Validation;

/// <summary>
/// Validates <see cref="FilterRequest"/> instances before filtering is executed.
/// </summary>
public interface IFilterRequestValidator
{
    /// <summary>
    /// Validates the specified filter request.
    /// </summary>
    /// <param name="request">The request to validate.</param>
    /// <exception cref="Exceptions.FilterRequestValidationException">
    /// Thrown when the request fails validation.
    /// </exception>
    void Validate(FilterRequest request);
}

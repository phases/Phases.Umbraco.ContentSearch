using Phases.Umbraco.FilterNodes.Models.Requests;

namespace Phases.Umbraco.FilterNodes.Services.Normalization;

/// <summary>
/// Normalizes validated <see cref="FilterRequest"/> instances for repository execution.
/// </summary>
public interface IFilterRequestNormalizer
{
    /// <summary>
    /// Returns a normalized copy of the specified filter request.
    /// </summary>
    /// <param name="request">The validated request.</param>
    /// <returns>A normalized request ready for Examine querying.</returns>
    FilterRequest Normalize(FilterRequest request);
}

using Phases.Umbraco.FilterNodes.Models.Examine;
using Phases.Umbraco.FilterNodes.Models.Responses;

namespace Phases.Umbraco.FilterNodes.Services.Examine;

/// <summary>
/// Resolves logical property aliases to Examine index field names.
/// </summary>
public interface IExamineFieldResolver
{
    /// <summary>
    /// Resolves a property alias to Examine field names.
    /// </summary>
    /// <param name="propertyAlias">The logical property alias.</param>
    /// <param name="metadata">Optional property metadata.</param>
    /// <param name="cultureContext">Optional culture context for variant properties.</param>
    /// <returns>The field resolution.</returns>
    ExamineFieldResolution Resolve(
        string propertyAlias,
        FilterablePropertyMetadata? metadata = null,
        SearchCultureContext? cultureContext = null);
}

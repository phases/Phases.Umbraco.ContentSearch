using Phases.Umbraco.ContentSearch.Examine.Models;
using Phases.Umbraco.ContentSearch.Metadata.Constants;
using Phases.Umbraco.ContentSearch.Metadata.Models;
using Phases.Umbraco.ContentSearch.Models;

namespace Phases.Umbraco.ContentSearch.Examine;

/// <summary>
/// Resolves searchable property aliases to culture-aware Examine index fields.
/// </summary>
public interface IContentSearchFieldResolver
{
    /// <summary>
    /// Resolves the Examine fields for a property alias.
    /// </summary>
    /// <param name="propertyAlias">The property alias.</param>
    /// <param name="metadata">Optional property metadata.</param>
    /// <param name="cultureContext">Optional culture context.</param>
    /// <returns>The field resolution.</returns>
    ExamineFieldResolution Resolve(
        string propertyAlias,
        SearchablePropertyMetadata? metadata = null,
        SearchCultureContext? cultureContext = null);
}

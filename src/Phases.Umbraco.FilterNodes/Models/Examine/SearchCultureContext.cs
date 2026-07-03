using Phases.Umbraco.FilterNodes.Models.Enums;

namespace Phases.Umbraco.FilterNodes.Models.Examine;

/// <summary>
/// Culture selection applied when resolving Examine fields for variant properties.
/// </summary>
public sealed record SearchCultureContext
{
    /// <summary>
    /// Gets the default context that searches all culture-specific fields.
    /// </summary>
    public static SearchCultureContext AllCultures { get; } = new()
    {
        Mode = SearchCultureMode.AllCultures,
    };

    /// <summary>
    /// Gets how culture-specific fields should be resolved.
    /// </summary>
    public SearchCultureMode Mode { get; init; } = SearchCultureMode.AllCultures;

    /// <summary>
    /// Gets the target culture ISO code when <see cref="Mode"/> is
    /// <see cref="SearchCultureMode.CurrentCulture"/> or
    /// <see cref="SearchCultureMode.SpecificCulture"/>.
    /// </summary>
    public string? Culture { get; init; }

    /// <summary>
    /// Gets a value indicating whether a single culture field should be queried.
    /// </summary>
    public bool IsSingleCulture =>
        Mode is SearchCultureMode.CurrentCulture or SearchCultureMode.SpecificCulture
        && !string.IsNullOrWhiteSpace(Culture);

    /// <summary>
    /// Creates a context from a filter request.
    /// </summary>
    /// <param name="mode">The search culture mode.</param>
    /// <param name="culture">The optional culture ISO code.</param>
    /// <returns>The search culture context.</returns>
    public static SearchCultureContext FromRequest(SearchCultureMode? mode, string? culture)
    {
        var resolvedMode = mode ?? SearchCultureMode.AllCultures;

        return resolvedMode switch
        {
            SearchCultureMode.CurrentCulture or SearchCultureMode.SpecificCulture
                when string.IsNullOrWhiteSpace(culture) => AllCultures,
            _ => new SearchCultureContext
            {
                Mode = resolvedMode,
                Culture = culture?.Trim(),
            },
        };
    }
}

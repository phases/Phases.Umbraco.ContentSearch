using Phases.Umbraco.ContentSearch.Models.Responses;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Services;

namespace Phases.Umbraco.ContentSearch.Services;

/// <summary>
/// Default implementation of <see cref="ILanguageQueryService"/>.
/// </summary>
public sealed class LanguageQueryService : ILanguageQueryService
{
    private readonly ILanguageService _languageService;

    /// <summary>
    /// Initializes a new instance of the <see cref="LanguageQueryService"/> class.
    /// </summary>
    /// <param name="languageService">The Umbraco language service.</param>
    public LanguageQueryService(ILanguageService languageService)
    {
        _languageService = languageService;
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<LanguageListItem>> GetLanguagesAsync(
        CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        IEnumerable<ILanguage> languages = await _languageService
            .GetAllAsync()
            .ConfigureAwait(false);

        return languages
            .OrderByDescending(static language => language.IsDefault)
            .ThenBy(static language => language.CultureName, StringComparer.OrdinalIgnoreCase)
            .ThenBy(static language => language.IsoCode, StringComparer.OrdinalIgnoreCase)
            .Select(static language => new LanguageListItem
            {
                IsoCode = language.IsoCode,
                Name = FormatLanguageName(language),
            })
            .ToArray();
    }

    /// <inheritdoc />
    public async Task<string> GetCultureDisplayNameAsync(
        string culture,
        CancellationToken cancellationToken = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(culture);
        cancellationToken.ThrowIfCancellationRequested();

        ILanguage? language = await _languageService
            .GetAsync(culture)
            .ConfigureAwait(false);

        return language is null
            ? culture
            : FormatLanguageName(language);
    }

    private static string FormatLanguageName(ILanguage language)
    {
        var cultureName = language.CultureName?.Trim();

        if (string.IsNullOrWhiteSpace(cultureName))
        {
            return language.IsoCode;
        }

        return $"{cultureName} ({language.IsoCode})";
    }
}

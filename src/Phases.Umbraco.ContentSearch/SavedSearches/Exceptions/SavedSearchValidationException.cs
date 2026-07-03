namespace Phases.Umbraco.ContentSearch.SavedSearches.Exceptions;

/// <summary>
/// Thrown when a saved search request fails validation.
/// </summary>
public sealed class SavedSearchValidationException : Exception
{
    /// <summary>
    /// Initializes a new instance of the <see cref="SavedSearchValidationException"/> class.
    /// </summary>
    /// <param name="errors">The validation error messages.</param>
    public SavedSearchValidationException(IReadOnlyList<string> errors)
        : base(string.Join("; ", errors))
    {
        Errors = errors;
    }

    /// <summary>
    /// Gets the validation error messages.
    /// </summary>
    public IReadOnlyList<string> Errors { get; }
}

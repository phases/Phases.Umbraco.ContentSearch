namespace Phases.Umbraco.ContentSearch.SavedSearches.Exceptions;

/// <summary>
/// Thrown when a saved search cannot be found.
/// </summary>
public sealed class SavedSearchNotFoundException : Exception
{
    /// <summary>
    /// Initializes a new instance of the <see cref="SavedSearchNotFoundException"/> class.
    /// </summary>
    /// <param name="savedSearchId">The missing saved search identifier.</param>
    public SavedSearchNotFoundException(Guid savedSearchId)
        : base($"Saved search '{savedSearchId}' was not found.")
    {
        SavedSearchId = savedSearchId;
    }

    /// <summary>
    /// Gets the missing saved search identifier.
    /// </summary>
    public Guid SavedSearchId { get; }
}

namespace Phases.Umbraco.FilterNodes.Exceptions;

/// <summary>
/// Thrown when a saved filter cannot be found for the current user.
/// </summary>
public sealed class SavedFilterNotFoundException : Exception
{
    /// <summary>
    /// Initializes a new instance of the <see cref="SavedFilterNotFoundException"/> class.
    /// </summary>
    /// <param name="savedFilterId">The saved filter identifier.</param>
    public SavedFilterNotFoundException(Guid savedFilterId)
        : base($"Saved filter '{savedFilterId}' was not found.")
    {
        SavedFilterId = savedFilterId;
    }

    /// <summary>
    /// Gets the saved filter identifier.
    /// </summary>
    public Guid SavedFilterId { get; }
}

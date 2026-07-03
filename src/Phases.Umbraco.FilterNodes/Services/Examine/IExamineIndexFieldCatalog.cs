namespace Phases.Umbraco.FilterNodes.Services.Examine;

/// <summary>
/// Provides access to the field names available in the Internal Examine index.
/// </summary>
public interface IExamineIndexFieldCatalog
{
    /// <summary>
    /// Gets the field names currently present in the Internal index.
    /// </summary>
    /// <returns>The indexed field names.</returns>
    IReadOnlySet<string> GetFieldNames();

    /// <summary>
    /// Clears any cached field catalog so the next lookup re-reads the index.
    /// </summary>
    void Invalidate();
}

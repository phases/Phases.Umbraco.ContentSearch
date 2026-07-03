namespace Phases.Umbraco.ContentSearch.Configuration;

/// <summary>
/// Package-wide configuration bound from <c>Umbraco:CMS:ContentSearch</c>.
/// </summary>
public sealed class ContentSearchOptions
{
    /// <summary>
    /// The configuration section name.
    /// </summary>
    public const string SectionName = "Umbraco:CMS:ContentSearch";

    /// <summary>
    /// Gets or sets the default page size for search results.
    /// </summary>
    public int DefaultPageSize { get; set; } = 20;

    /// <summary>
    /// Gets or sets the maximum page size allowed for search requests.
    /// </summary>
    public int MaxPageSize { get; set; } = 100;

    /// <summary>
    /// Gets or sets the maximum number of rows included in a single export.
    /// </summary>
    public int MaxExportRows { get; set; } = 10_000;

    /// <summary>
    /// Gets or sets the maximum number of expanded rows scanned for all-cultures or post-filter searches.
    /// </summary>
    public int MaxExpansionRows { get; set; } = 5_000;

    /// <summary>
    /// Gets or sets the maximum number of Examine rows scanned when resolving restricted-user pagination.
    /// </summary>
    public int MaxRestrictedScanRows { get; set; } = 10_000;

    /// <summary>
    /// Gets or sets a value indicating whether the administrator group is granted the Content Search section on startup.
    /// </summary>
    public bool GrantSectionToAdminGroupOnInstall { get; set; } = true;
}

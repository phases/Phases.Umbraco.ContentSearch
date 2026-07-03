namespace Phases.Umbraco.FilterNodes.Models.Enums;

/// <summary>
/// Identifies the type of a single filter condition.
/// </summary>
public enum FilterConditionKind
{
    /// <summary>
    /// Filters by document type alias.
    /// </summary>
    ContentType = 0,

    /// <summary>
    /// Filters by a custom property value.
    /// </summary>
    Property = 1,

    /// <summary>
    /// Filters by node creation date.
    /// </summary>
    CreatedDate = 2,

    /// <summary>
    /// Filters by node update date.
    /// </summary>
    UpdatedDate = 3,

    /// <summary>
    /// Filters by publish status.
    /// </summary>
    PublishStatus = 4,
}

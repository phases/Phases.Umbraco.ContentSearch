namespace Phases.Umbraco.ContentSearch.Search.Enums;

/// <summary>
/// Comparison operators supported by the Examine query builder.
/// </summary>
public enum SearchOperator
{
    Equals,
    NotEquals,
    Contains,
    NotContains,
    StartsWith,
    EndsWith,
    GreaterThan,
    GreaterThanOrEqual,
    LessThan,
    LessThanOrEqual,
    Between,
    Today,
    Yesterday,
    Last7Days,
    Last30Days,
    ThisMonth,
    LastMonth,
    ThisYear,
    IsTrue,
    IsFalse,
    ContainsAny,
    ContainsAll,
    IsEmpty,
    IsNotEmpty,
}

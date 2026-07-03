using Phases.Umbraco.ContentSearch.Metadata.Constants;
using Phases.Umbraco.ContentSearch.Search.Enums;
using Xunit;

namespace Phases.Umbraco.ContentSearch.Tests.Metadata;

public sealed class PublishStatusFilterValuesTests
{
    [Theory]
    [InlineData(SearchOperator.IsTrue, PublishStatusFilterValues.Published)]
    [InlineData(SearchOperator.IsFalse, PublishStatusFilterValues.Unpublished)]
    public void ResolveTargetValue_maps_boolean_operators(SearchOperator @operator, string expected)
    {
        var value = PublishStatusFilterValues.ResolveTargetValue(value: null, @operator);

        Assert.Equal(expected, value);
    }

    [Theory]
    [InlineData(SearchOperator.IsFalse, true)]
    [InlineData(SearchOperator.IsTrue, false)]
    public void TargetsUnpublishedContent_detects_unpublished_filters(
        SearchOperator @operator,
        bool expected)
    {
        Assert.Equal(
            expected,
            PublishStatusFilterValues.TargetsUnpublishedContent(value: null, @operator));
    }
}

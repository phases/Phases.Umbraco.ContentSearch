using Phases.Umbraco.FilterNodes.Constants;
using Xunit;

namespace Phases.Umbraco.FilterNodes.Tests.Services;

public sealed class PublishStatusFilterValuesTests
{
    [Theory]
    [InlineData("1", true)]
    [InlineData("true", true)]
    [InlineData("0", true)]
    [InlineData("false", true)]
    public void IsKnownValue_accepts_boolean_publish_status_values(string value, bool expected)
    {
        Assert.Equal(expected, PublishStatusFilterValues.IsKnownValue(value));
    }

    [Theory]
    [InlineData("1", true)]
    [InlineData("true", true)]
    [InlineData("0", false)]
    [InlineData("false", false)]
    [InlineData("published", false)]
    public void IsPublishedValue_only_matches_true_values(string value, bool expected)
    {
        Assert.Equal(expected, PublishStatusFilterValues.IsPublishedValue(value));
    }

    [Theory]
    [InlineData("0", true)]
    [InlineData("false", true)]
    [InlineData("1", false)]
    [InlineData("true", false)]
    public void IsUnpublishedValue_only_matches_false_values(string value, bool expected)
    {
        Assert.Equal(expected, PublishStatusFilterValues.IsUnpublishedValue(value));
    }
}

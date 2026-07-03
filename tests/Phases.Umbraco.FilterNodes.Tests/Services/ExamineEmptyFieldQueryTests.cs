using Phases.Umbraco.FilterNodes.Services;
using Xunit;

namespace Phases.Umbraco.FilterNodes.Tests.Services;

public sealed class ExamineEmptyFieldQueryTests
{
    [Fact]
    public void BuildIsEmptyQuery_matches_missing_fields_and_explicit_empty_strings()
    {
        var query = ExamineEmptyFieldQuery.BuildIsEmptyQuery("bodyText");

        Assert.Equal("*:* -bodyText:[\u0001 TO *]", query);
    }

    [Fact]
    public void BuildIsNotEmptyQuery_matches_populated_fields_but_not_empty_strings()
    {
        var query = ExamineEmptyFieldQuery.BuildIsNotEmptyQuery("bodyText");

        Assert.Equal("+bodyText:[\u0001 TO *]", query);
    }

    [Theory]
    [InlineData("category")]
    [InlineData("isFeatured")]
    [InlineData("publishDate")]
    public void BuildIsEmptyQuery_uses_property_alias_for_all_property_types(string propertyAlias)
    {
        var query = ExamineEmptyFieldQuery.BuildIsEmptyQuery(propertyAlias);

        Assert.Contains($"{propertyAlias}:[\u0001 TO *]", query, StringComparison.Ordinal);
    }
}

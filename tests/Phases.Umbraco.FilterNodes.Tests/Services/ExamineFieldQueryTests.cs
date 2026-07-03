using Examine.Search;
using Phases.Umbraco.FilterNodes.Models.Enums;
using Phases.Umbraco.FilterNodes.Services;
using Xunit;

namespace Phases.Umbraco.FilterNodes.Tests.Services;

public sealed class ExamineFieldQueryTests
{
    [Fact]
    public void ToEqualsValue_uses_phrase_match_for_dropdown_properties_with_spaces()
    {
        var examineValue = ExamineFieldQuery.ToEqualsValue("3 R", PropertyFilterType.Dropdown);

        Assert.Equal(Examineness.Escaped, examineValue.Examineness);
    }

    [Fact]
    public void ToEqualsValue_uses_explicit_value_for_numeric_properties()
    {
        var examineValue = ExamineFieldQuery.ToEqualsValue("42", PropertyFilterType.Number);

        Assert.Equal(Examineness.Explicit, examineValue.Examineness);
        Assert.Equal("42", examineValue.Value);
    }

    [Fact]
    public void ToEqualsValue_uses_phrase_match_for_multiselect_properties()
    {
        var examineValue = ExamineFieldQuery.ToEqualsValue("One check", PropertyFilterType.MultiSelect);

        Assert.Equal(Examineness.Escaped, examineValue.Examineness);
        Assert.Equal("one check", examineValue.Value);
    }

    [Fact]
    public void ToEqualsValue_uses_phrase_match_for_text_properties()
    {
        var examineValue = ExamineFieldQuery.ToEqualsValue("Blog 01", PropertyFilterType.Text);

        Assert.Equal(Examineness.Escaped, examineValue.Examineness);
    }
}

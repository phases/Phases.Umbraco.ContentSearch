using Phases.Umbraco.FilterNodes.Services.Examine;
using Xunit;

namespace Phases.Umbraco.FilterNodes.Tests.Services;

public sealed class MultiSelectPropertyIndexValueFormatterTests
{
    [Fact]
    public void ParseSelectedValues_deserializes_json_checkbox_values()
    {
        var values = MultiSelectPropertyIndexValueFormatter.ParseSelectedValues(
            "[\"One check\",\"Two check\"]");

        Assert.Equal(["One check", "Two check"], values);
    }

    [Fact]
    public void ParseSelectedValues_reads_string_enumerables()
    {
        var values = MultiSelectPropertyIndexValueFormatter.ParseSelectedValues(
            new[] { "One check", "Two check" });

        Assert.Equal(["One check", "Two check"], values);
    }
}

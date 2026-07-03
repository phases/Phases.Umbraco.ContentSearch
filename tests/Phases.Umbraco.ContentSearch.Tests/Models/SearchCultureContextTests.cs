using Phases.Umbraco.ContentSearch.Models;
using Phases.Umbraco.ContentSearch.Models.Enums;
using Xunit;

namespace Phases.Umbraco.ContentSearch.Tests.Models;

public sealed class SearchCultureContextTests
{
    [Fact]
    public void FromRequest_without_culture_falls_back_to_all_cultures_for_current_mode()
    {
        var context = SearchCultureContext.FromRequest(
            SearchCultureMode.CurrentCulture,
            culture: null);

        Assert.Equal(SearchCultureMode.AllCultures, context.Mode);
        Assert.Null(context.Culture);
    }

    [Fact]
    public void FromRequest_with_culture_preserves_specific_mode()
    {
        var context = SearchCultureContext.FromRequest(
            SearchCultureMode.SpecificCulture,
            "da-DK");

        Assert.Equal(SearchCultureMode.SpecificCulture, context.Mode);
        Assert.Equal("da-DK", context.Culture);
        Assert.True(context.IsSingleCulture);
    }

    [Fact]
    public void IsSingleCulture_is_false_for_all_cultures()
    {
        Assert.False(SearchCultureContext.AllCultures.IsSingleCulture);
    }
}

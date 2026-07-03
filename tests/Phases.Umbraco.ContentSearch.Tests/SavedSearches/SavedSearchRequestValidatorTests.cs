using Xunit;
using Phases.Umbraco.ContentSearch.Configuration;
using Phases.Umbraco.ContentSearch.Models.Enums;
using Phases.Umbraco.ContentSearch.SavedSearches.Models.Requests;
using Phases.Umbraco.ContentSearch.SavedSearches.Validation;
using Phases.Umbraco.ContentSearch.Search.Enums;
using Phases.Umbraco.ContentSearch.Search.Models;

namespace Phases.Umbraco.ContentSearch.Tests.SavedSearches;

public sealed class SavedSearchRequestValidatorTests
{
    [Fact]
    public void ValidateSave_ReturnsError_WhenNameMissing()
    {
        var errors = SavedSearchRequestValidator.ValidateSave(
            new SaveSavedSearchRequest
            {
                Conditions =
                [
                    new SearchConditionRequest
                    {
                        ContentTypeAlias = "article",
                        PropertyAlias = "title",
                        Operator = "contains",
                        Value = "news",
                    },
                ],
            },
            new ContentSearchOptions());

        Assert.Contains("Name is required.", errors);
    }

    [Fact]
    public void ValidateSave_ReturnsError_WhenConditionsMissing()
    {
        var errors = SavedSearchRequestValidator.ValidateSave(
            new SaveSavedSearchRequest { Name = "Articles" },
            new ContentSearchOptions());

        Assert.Contains("At least one condition is required.", errors);
    }

    [Fact]
    public void ValidateSave_ReturnsNoErrors_ForValidRequest()
    {
        var errors = SavedSearchRequestValidator.ValidateSave(
            new SaveSavedSearchRequest
            {
                Name = "Articles",
                Description = "Published articles",
                MatchMode = SearchMatchMode.All,
                SearchCultureMode = SearchCultureMode.AllCultures,
                PageSize = 20,
                Conditions =
                [
                    new SearchConditionRequest
                    {
                        ContentTypeAlias = "article",
                        PropertyAlias = "title",
                        Operator = "contains",
                        Value = "news",
                    },
                ],
            },
            new ContentSearchOptions());

        Assert.Empty(errors);
    }
}

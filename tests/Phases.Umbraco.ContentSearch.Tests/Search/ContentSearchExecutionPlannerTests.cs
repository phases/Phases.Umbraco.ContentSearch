using Phases.Umbraco.ContentSearch.Examine.Models;
using Phases.Umbraco.ContentSearch.Search;
using Phases.Umbraco.ContentSearch.Search.Enums;
using Phases.Umbraco.ContentSearch.Search.Mapping;
using Phases.Umbraco.ContentSearch.Search.Models;
using Xunit;

namespace Phases.Umbraco.ContentSearch.Tests.Search;

public sealed class ContentSearchExecutionPlannerTests
{
    [Fact]
    public void Create_moves_is_empty_conditions_to_content_evaluation()
    {
        var request = new NormalizedContentSearchRequest
        {
            MatchMode = SearchMatchMode.All,
            Conditions =
            [
                new NormalizedSearchCondition
                {
                    ContentTypeAlias = "content",
                    PropertyAlias = "rte",
                    Operator = SearchOperator.IsEmpty,
                    ResolvedExamineFieldNames = ["rte", "rte_en-us"],
                    ResolutionStrategy = ExamineFieldResolutionStrategy.Direct,
                },
                new NormalizedSearchCondition
                {
                    ContentTypeAlias = "content",
                    PropertyAlias = "pageTitle",
                    Operator = SearchOperator.Contains,
                    Value = "hello",
                    ResolvedExamineFieldNames = ["pageTitle"],
                    ResolutionStrategy = ExamineFieldResolutionStrategy.Direct,
                },
            ],
        };

        var plan = ContentSearchExecutionPlanner.Create(request);

        Assert.True(plan.RequiresContentEvaluation);
        Assert.Single(plan.ContentConditions);
        Assert.Equal(SearchOperator.IsEmpty, plan.ContentConditions[0].Operator);
        Assert.Equal(2, plan.ExamineRequest.Conditions.Count);
        Assert.Contains(
            plan.ExamineRequest.Conditions,
            condition => condition.PropertyAlias == "pageTitle");
        Assert.Contains(
            plan.ExamineRequest.Conditions,
            condition => string.IsNullOrWhiteSpace(condition.PropertyAlias));
    }
}

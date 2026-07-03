using Microsoft.Extensions.Options;
using Moq;
using Phases.Umbraco.ContentSearch.Configuration;
using Phases.Umbraco.ContentSearch.Examine;
using Phases.Umbraco.ContentSearch.Examine.Models;
using Phases.Umbraco.ContentSearch.Metadata.Constants;
using Phases.Umbraco.ContentSearch.Search.Models;
using Phases.Umbraco.ContentSearch.Search.Normalization;
using Phases.Umbraco.ContentSearch.Search.Operators;
using Phases.Umbraco.ContentSearch.Services;
using Xunit;

namespace Phases.Umbraco.ContentSearch.Tests.Search;

public sealed class ContentSearchRequestNormalizerTests
{
    [Fact]
    public async Task NormalizeAsync_caps_page_size_to_MaxPageSize_by_default()
    {
        var normalizer = CreateNormalizer(maxPageSize: 100, maxExportRows: 10_000);

        var normalized = await normalizer.NormalizeAsync(
            CreateRequest(pageSize: 10_000),
            CancellationToken.None);

        Assert.Equal(100, normalized.PageSize);
    }

    [Fact]
    public async Task NormalizeAsync_uses_export_page_size_cap_when_provided()
    {
        var normalizer = CreateNormalizer(maxPageSize: 100, maxExportRows: 10_000);

        var normalized = await normalizer.NormalizeAsync(
            CreateRequest(pageSize: 10_000),
            CancellationToken.None,
            pageSizeCap: 10_000);

        Assert.Equal(10_000, normalized.PageSize);
    }

    private static ContentSearchRequestNormalizer CreateNormalizer(int maxPageSize, int maxExportRows)
    {
        var metadataService = new Mock<IContentSearchMetadataService>();
        var fieldResolver = new Mock<IContentSearchFieldResolver>();
        fieldResolver
            .Setup(resolver => resolver.Resolve(
                It.IsAny<string>(),
                It.IsAny<Phases.Umbraco.ContentSearch.Metadata.Models.SearchablePropertyMetadata>(),
                It.IsAny<Phases.Umbraco.ContentSearch.Models.SearchCultureContext>()))
            .Returns(new ExamineFieldResolution
            {
                FieldNames = ["nodeName"],
                Strategy = ExamineFieldResolutionStrategy.Direct,
            });

        return new ContentSearchRequestNormalizer(
            metadataService.Object,
            fieldResolver.Object,
            new SearchOperatorResolver(),
            Options.Create(new ContentSearchOptions
            {
                MaxPageSize = maxPageSize,
                MaxExportRows = maxExportRows,
            }));
    }

    private static ContentSearchRequest CreateRequest(int pageSize)
        => new()
        {
            Conditions =
            [
                new SearchConditionRequest
                {
                    ContentTypeAlias = ContentSearchMetadataConstants.WildcardContentTypeAlias,
                    PropertyAlias = ContentSearchExamineFields.NodeName,
                    Operator = "contains",
                    Value = "home",
                },
            ],
            PageSize = pageSize,
        };
}

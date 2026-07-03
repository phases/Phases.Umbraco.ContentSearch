using Phases.Umbraco.FilterNodes.Services.Examine;
using Xunit;

namespace Phases.Umbraco.FilterNodes.Tests.Services;

public sealed class BlockEditorPropertyIndexValueFormatterTests
{
    [Fact]
    public void GetAggregatedSearchableText_extracts_flat_block_grid_content_data_properties()
    {
        const string json = """
            {
              "layout": {
                "Umbraco.BlockGrid": [
                  {
                    "contentUdi": "umb://element/abc",
                    "areas": [],
                    "columnSpan": 12,
                    "rowSpan": 1
                  }
                ]
              },
              "contentData": [
                {
                  "contentTypeKey": "03c43074-a4ba-4bd2-92b1-c3a35a0eed4d",
                  "udi": "umb://element/abc",
                  "bgTitle": "BGTitle"
                }
              ],
              "settingsData": []
            }
            """;

        var text = BlockEditorPropertyIndexValueFormatter.GetAggregatedSearchableText(json);

        Assert.Equal("BGTitle", text);
    }

    [Fact]
    public void GetAggregatedSearchableText_extracts_values_array_block_grid_content()
    {
        const string json = """
            {
              "contentData": [
                {
                  "contentTypeKey": "03c43074-a4ba-4bd2-92b1-c3a35a0eed4d",
                  "udi": "umb://element/abc",
                  "values": [
                    {
                      "editorAlias": "Umbraco.TextBox",
                      "alias": "bgTitle",
                      "value": "BGTitle"
                    }
                  ]
                }
              ],
              "settingsData": []
            }
            """;

        var text = BlockEditorPropertyIndexValueFormatter.GetAggregatedSearchableText(json);

        Assert.Equal("BGTitle", text);
    }

    [Fact]
    public void GetAggregatedSearchableText_aggregates_multiple_block_property_values()
    {
        const string json = """
            {
              "contentData": [
                {
                  "contentTypeKey": "03c43074-a4ba-4bd2-92b1-c3a35a0eed4d",
                  "udi": "umb://element/abc",
                  "bgTitle": "BGTitle",
                  "nameOfBg": "NameOfBG"
                }
              ],
              "settingsData": []
            }
            """;

        var text = BlockEditorPropertyIndexValueFormatter.GetAggregatedSearchableText(json);

        Assert.Equal("BGTitle NameOfBG", text);
    }

    [Fact]
    public void GetAggregatedSearchableText_returns_null_for_empty_block_grid()
    {
        const string json = """
            {
              "layout": { "Umbraco.BlockGrid": [] },
              "contentData": [],
              "settingsData": []
            }
            """;

        var text = BlockEditorPropertyIndexValueFormatter.GetAggregatedSearchableText(json);

        Assert.Null(text);
    }
}

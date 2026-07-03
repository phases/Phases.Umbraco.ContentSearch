using Examine;
using Phases.Umbraco.FilterNodes.Constants;
using Phases.Umbraco.FilterNodes.Services.Examine;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Infrastructure.Examine;
using Umbraco.Extensions;

namespace Phases.Umbraco.FilterNodes.Examine;

/// <summary>
/// Augments Umbraco Examine content indexes with populated markers and searchable Block Grid
/// text for property editors that Umbraco skips by default.
/// </summary>
public sealed class FilterNodesExamineIndexingComponent : IAsyncComponent
{
    internal const string PopulatedMarkerValue = "\u0002";

    private readonly IExamineManager _examineManager;
    private readonly IContentService _contentService;
    private readonly List<IIndex> _registeredIndexes = [];

    /// <summary>
    /// Initializes a new instance of the <see cref="FilterNodesExamineIndexingComponent"/> class.
    /// </summary>
    /// <param name="examineManager">The Examine manager.</param>
    /// <param name="contentService">The Umbraco content service.</param>
    public FilterNodesExamineIndexingComponent(
        IExamineManager examineManager,
        IContentService contentService)
    {
        _examineManager = examineManager;
        _contentService = contentService;
    }

    /// <inheritdoc />
    public Task InitializeAsync(bool isRestarting, CancellationToken cancellationToken)
    {
        foreach (var indexName in FilterNodesExamineIndexes.ContentSearchIndexNames)
        {
            if (_examineManager.TryGetIndex(indexName, out IIndex? index) && index is not null)
            {
                index.TransformingIndexValues += OnTransformingIndexValues;
                _registeredIndexes.Add(index);
            }
        }

        return Task.CompletedTask;
    }

    /// <inheritdoc />
    public Task TerminateAsync(bool isRestarting, CancellationToken cancellationToken)
    {
        foreach (IIndex index in _registeredIndexes)
        {
            index.TransformingIndexValues -= OnTransformingIndexValues;
        }

        _registeredIndexes.Clear();
        return Task.CompletedTask;
    }

    private void OnTransformingIndexValues(object? sender, IndexingItemEventArgs e)
    {
        if (e.ValueSet.Category != IndexTypes.Content)
        {
            return;
        }

        if (!int.TryParse(e.ValueSet.Id, out var contentId))
        {
            return;
        }

        IContent? content = _contentService.GetById(contentId);
        if (content is null)
        {
            return;
        }

        var updatedValues = e.ValueSet.Values.ToDictionary(
            static pair => pair.Key,
            static pair => (IEnumerable<object>)pair.Value);

        var changed = false;

        foreach (IProperty property in content.Properties)
        {
            if (!NonIndexedPropertyEditorAliases.All.Contains(property.PropertyType.PropertyEditorAlias))
            {
                continue;
            }

            if (!property.PropertyType.VariesByCulture())
            {
                changed |= TryAddNonIndexedPropertyIndexValues(property, null, null, updatedValues);
                continue;
            }

            foreach (var culture in content.AvailableCultures)
            {
                changed |= TryAddNonIndexedPropertyIndexValues(
                    property,
                    culture.ToLowerInvariant(),
                    culture,
                    updatedValues);
            }
        }

        foreach (IProperty property in content.Properties)
        {
            if (!MultiSelectPropertyEditorAliases.All.Contains(property.PropertyType.PropertyEditorAlias))
            {
                continue;
            }

            if (!property.PropertyType.VariesByCulture())
            {
                changed |= TrySetMultiSelectIndexValues(property, null, null, updatedValues);
                continue;
            }

            foreach (var culture in content.AvailableCultures)
            {
                changed |= TrySetMultiSelectIndexValues(
                    property,
                    culture.ToLowerInvariant(),
                    culture,
                    updatedValues);
            }
        }

        if (!changed)
        {
            return;
        }

        e.SetValues(updatedValues.ToDictionary(
            static pair => pair.Key,
            static pair => (IEnumerable<object?>)pair.Value));
    }

    private static bool TryAddNonIndexedPropertyIndexValues(
        IProperty property,
        string? cultureSuffix,
        string? culture,
        IDictionary<string, IEnumerable<object>> values)
    {
        var hasValue = ContentPropertyPopulationEvaluator.HasPopulatedPropertyValue(
            property,
            culture: culture);

        if (!hasValue)
        {
            return false;
        }

        var fieldName = string.IsNullOrWhiteSpace(cultureSuffix)
            ? property.Alias
            : $"{property.Alias}_{cultureSuffix}";

        var indexValues = new List<object> { PopulatedMarkerValue };

        if (IsBlockGridProperty(property))
        {
            var searchableText = BlockEditorPropertyIndexValueFormatter.GetAggregatedSearchableText(
                property,
                culture);

            if (!string.IsNullOrWhiteSpace(searchableText))
            {
                indexValues.Add(searchableText);
            }
        }

        values[fieldName] = indexValues;
        return true;
    }

    private static bool IsBlockGridProperty(IProperty property)
        => property.PropertyType.PropertyEditorAlias.Equals(
            global::Umbraco.Cms.Core.Constants.PropertyEditors.Aliases.BlockGrid,
            StringComparison.OrdinalIgnoreCase);

    private static bool TrySetMultiSelectIndexValues(
        IProperty property,
        string? cultureSuffix,
        string? culture,
        IDictionary<string, IEnumerable<object>> values)
    {
        var indexValues = MultiSelectPropertyIndexValueFormatter.GetIndexValues(property, culture);
        if (indexValues.Count == 0)
        {
            return false;
        }

        var fieldName = string.IsNullOrWhiteSpace(cultureSuffix)
            ? property.Alias
            : $"{property.Alias}_{cultureSuffix}";

        values[fieldName] = indexValues
            .Select(static value => (object)value)
            .ToArray();
        return true;
    }
}

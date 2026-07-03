using Examine;
using Examine.Lucene.Providers;
using Microsoft.Extensions.Logging;
using Phases.Umbraco.FilterNodes.Constants;

namespace Phases.Umbraco.FilterNodes.Services.Examine;

/// <summary>
/// Reads field names from Umbraco content Examine indexes used by Filter Nodes.
/// </summary>
public sealed class ExamineIndexFieldCatalog : IExamineIndexFieldCatalog
{
    private readonly IExamineManager _examineManager;
    private readonly ILogger<ExamineIndexFieldCatalog> _logger;
    private readonly object _sync = new();
    private HashSet<string>? _fieldNames;

    /// <summary>
    /// Initializes a new instance of the <see cref="ExamineIndexFieldCatalog"/> class.
    /// </summary>
    /// <param name="examineManager">The Examine manager.</param>
    /// <param name="logger">The logger.</param>
    public ExamineIndexFieldCatalog(
        IExamineManager examineManager,
        ILogger<ExamineIndexFieldCatalog> logger)
    {
        _examineManager = examineManager;
        _logger = logger;
    }

    /// <inheritdoc />
    public IReadOnlySet<string> GetFieldNames()
    {
        lock (_sync)
        {
            return _fieldNames ??= ReadFieldNames();
        }
    }

    /// <inheritdoc />
    public void Invalidate()
    {
        lock (_sync)
        {
            _fieldNames = null;
        }
    }

    private HashSet<string> ReadFieldNames()
    {
        var fieldNames = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        foreach (var indexName in FilterNodesExamineIndexes.ContentSearchIndexNames)
        {
            if (!_examineManager.TryGetIndex(indexName, out IIndex? index) || index is null)
            {
                _logger.LogWarning(
                    "Examine index '{IndexName}' was not found while reading field catalog.",
                    indexName);
                continue;
            }

            if (index is not LuceneIndex luceneIndex)
            {
                _logger.LogWarning(
                    "Examine index '{IndexName}' is not a Lucene index. Field names will be skipped.",
                    index.Name);
                continue;
            }

            try
            {
                foreach (var fieldName in luceneIndex.GetFieldNames())
                {
                    fieldNames.Add(fieldName);
                }
            }
            catch (Exception exception)
            {
                _logger.LogWarning(
                    exception,
                    "Failed to read field names from Examine index '{IndexName}'.",
                    index.Name);
            }
        }

        return fieldNames;
    }
}

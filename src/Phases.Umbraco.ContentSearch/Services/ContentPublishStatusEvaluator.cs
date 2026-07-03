using Phases.Umbraco.ContentSearch.Metadata.Constants;
using Umbraco.Cms.Core.Models;
using Umbraco.Extensions;

namespace Phases.Umbraco.ContentSearch.Services;

/// <summary>
/// Evaluates publish status filter values against Umbraco content and schedules.
/// </summary>
internal static class ContentPublishStatusEvaluator
{
    internal static bool Matches(
        IContent content,
        string targetStatus,
        ContentScheduleCollection schedules,
        string? culture)
    {
        ArgumentNullException.ThrowIfNull(content);
        ArgumentException.ThrowIfNullOrWhiteSpace(targetStatus);
        ArgumentNullException.ThrowIfNull(schedules);

        if (!PublishStatusFilterValues.IsKnownValue(targetStatus))
        {
            return false;
        }

        if (content.ContentType.VariesByCulture())
        {
            return string.IsNullOrWhiteSpace(culture)
                ? EvaluateAnyCulture(content, schedules, targetStatus)
                : MatchesCulture(content, schedules, targetStatus, culture.Trim());
        }

        return MatchesCulture(content, schedules, targetStatus, culture: null);
    }

    private static bool EvaluateAnyCulture(
        IContent content,
        ContentScheduleCollection schedules,
        string targetStatus)
    {
        var availableCultures = content.AvailableCultures
            .Where(static culture => !string.IsNullOrWhiteSpace(culture))
            .ToArray();

        foreach (var culture in availableCultures)
        {
            if (MatchesCulture(content, schedules, targetStatus, culture))
            {
                return true;
            }
        }

        // Variant content without any available cultures cannot be published in any culture.
        return availableCultures.Length == 0
            && PublishStatusFilterValues.IsUnpublishedValue(targetStatus);
    }

    private static bool MatchesCulture(
        IContent content,
        ContentScheduleCollection schedules,
        string targetStatus,
        string? culture)
    {
        var normalizedCulture = string.IsNullOrWhiteSpace(culture)
            ? null
            : culture.Trim();

        if (content.ContentType.VariesByCulture() && normalizedCulture is null)
        {
            return PublishStatusFilterValues.IsUnpublishedValue(targetStatus);
        }

        var status = content.GetStatus(schedules, normalizedCulture);

        if (PublishStatusFilterValues.IsPublishedValue(targetStatus))
        {
            return status == ContentStatus.Published;
        }

        if (PublishStatusFilterValues.IsUnpublishedValue(targetStatus))
        {
            return status != ContentStatus.Published;
        }

        return false;
    }

    internal static ContentScheduleCollection ToScheduleCollection(IEnumerable<ContentSchedule> schedules)
    {
        var collection = new ContentScheduleCollection();

        foreach (var schedule in schedules)
        {
            collection.Add(schedule);
        }

        return collection;
    }
}

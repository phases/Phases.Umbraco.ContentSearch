using Phases.Umbraco.FilterNodes.Constants;

namespace Phases.Umbraco.FilterNodes.Services.Examine;

/// <summary>
/// Parses composite aliases used for block element properties.
/// </summary>
internal static class BlockPropertyAliasParser
{
    /// <summary>
    /// Attempts to parse a composite block element property alias.
    /// </summary>
    /// <param name="alias">The property alias.</param>
    /// <param name="parts">The parsed alias segments.</param>
    /// <returns><c>true</c> when the alias matches the block element format.</returns>
    public static bool TryParse(string alias, out BlockPropertyAliasParts parts)
    {
        parts = default;

        if (string.IsNullOrWhiteSpace(alias))
        {
            return false;
        }

        var segments = alias.Split(
            PropertyMetadataSourceGroups.BlockPropertyAliasSeparator,
            StringSplitOptions.None);

        if (segments.Length != 3
            || segments.Any(static segment => string.IsNullOrWhiteSpace(segment)))
        {
            return false;
        }

        parts = new BlockPropertyAliasParts(segments[0], segments[1], segments[2]);
        return true;
    }
}

/// <summary>
/// Segments of a composite block element property alias.
/// </summary>
/// <param name="ContainerAlias">The block container property alias.</param>
/// <param name="ElementTypeAlias">The block element type alias.</param>
/// <param name="ElementPropertyAlias">The element property alias.</param>
internal readonly record struct BlockPropertyAliasParts(
    string ContainerAlias,
    string ElementTypeAlias,
    string ElementPropertyAlias);

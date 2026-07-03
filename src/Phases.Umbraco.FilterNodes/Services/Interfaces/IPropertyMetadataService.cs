using Phases.Umbraco.FilterNodes.Models.Requests;
using Phases.Umbraco.FilterNodes.Models.Responses;

namespace Phases.Umbraco.FilterNodes.Services.Interfaces;

/// <summary>
/// Provides metadata used to construct and validate filter conditions in the backoffice.
/// </summary>
public interface IPropertyMetadataService
{
    /// <summary>
    /// Gets the document types that can be targeted by filters.
    /// </summary>
    /// <param name="cancellationToken">A token to cancel the operation.</param>
    /// <returns>Document types available for filtering.</returns>
    Task<IReadOnlyList<ContentTypeListItem>> GetContentTypesAsync(
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the aliases of document types that can be targeted by filters.
    /// </summary>
    /// <param name="cancellationToken">A token to cancel the operation.</param>
    /// <returns>Document type aliases available for filtering.</returns>
    Task<IReadOnlyList<string>> GetContentTypeAliasesAsync(
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the property metadata available for filtering on the specified document type.
    /// </summary>
    /// <param name="contentTypeAlias">The document type alias.</param>
    /// <param name="cancellationToken">A token to cancel the operation.</param>
    /// <returns>Property metadata that may be used in filter conditions.</returns>
    Task<IReadOnlyList<FilterablePropertyMetadata>> GetPropertyMetadataAsync(
        string contentTypeAlias,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets property metadata for multiple document types in one request.
    /// </summary>
    /// <param name="contentTypeAliases">The document type aliases.</param>
    /// <param name="cancellationToken">A token to cancel the operation.</param>
    /// <returns>Property metadata grouped by document type.</returns>
    Task<IReadOnlyList<PropertyAliasesResponse>> GetPropertyMetadataBatchAsync(
        IReadOnlyList<string> contentTypeAliases,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Determines whether the specified filter condition is supported for the current schema.
    /// </summary>
    /// <param name="condition">The filter condition to validate.</param>
    /// <param name="cancellationToken">A token to cancel the operation.</param>
    /// <returns><c>true</c> when the condition can be applied; otherwise, <c>false</c>.</returns>
    Task<bool> SupportsFilterConditionAsync(
        FilterCondition condition,
        CancellationToken cancellationToken = default);
}

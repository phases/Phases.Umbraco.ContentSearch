namespace Phases.Umbraco.FilterNodes.Exceptions;

/// <summary>
/// Represents validation failures for a <see cref="Models.Requests.FilterRequest"/>.
/// </summary>
public sealed class FilterRequestValidationException : Exception
{
    /// <summary>
    /// Initializes a new instance of the <see cref="FilterRequestValidationException"/> class.
    /// </summary>
    /// <param name="errors">The validation error messages.</param>
    public FilterRequestValidationException(IReadOnlyList<string> errors)
        : base(BuildMessage(errors))
    {
        Errors = errors;
    }

    /// <summary>
    /// Gets the validation error messages.
    /// </summary>
    public IReadOnlyList<string> Errors { get; }

    private static string BuildMessage(IReadOnlyList<string> errors)
    {
        return errors.Count == 1
            ? errors[0]
            : $"The filter request is invalid: {string.Join(" ", errors)}";
    }
}

import type {
  ProblemDetails,
  ValidationProblemDetails,
} from "../../models/filter-models.js";

/**
 * Represents a failed Filter Nodes API request.
 */
export class FilterApiError extends Error {
  readonly status: number;
  readonly title?: string;
  readonly detail?: string;
  readonly instance?: string;
  readonly validationErrors?: Readonly<Record<string, readonly string[]>>;

  constructor(
    message: string,
    status: number,
    options?: {
      title?: string;
      detail?: string;
      instance?: string;
      validationErrors?: Readonly<Record<string, readonly string[]>>;
      cause?: unknown;
    },
  ) {
    super(message);
    this.name = "FilterApiError";
    this.status = status;
    this.title = options?.title;
    this.detail = options?.detail;
    this.instance = options?.instance;
    this.validationErrors = options?.validationErrors;

    if (options?.cause !== undefined) {
      (this as Error & { cause?: unknown }).cause = options.cause;
    }
  }

  /**
   * Creates a {@link FilterApiError} from a non-success {@link Response}.
   */
  static async fromResponse(response: Response): Promise<FilterApiError> {
    const problem = await tryParseProblemDetails(response);
    return FilterApiError.fromProblem(problem, response);
  }

  /**
   * Creates a {@link FilterApiError} from a parsed API problem payload.
   * Use this when the HTTP client has already consumed the response body.
   */
  static fromProblem(
    problem: ProblemDetails | string | undefined,
    response: Response,
  ): FilterApiError {
    const status = response.status;

    if (typeof problem === "string") {
      return new FilterApiError(
        problem || response.statusText || "The Filter Nodes API request failed.",
        status,
      );
    }

    if (problem && isValidationProblemDetails(problem)) {
      const errors = problem.errors ?? {};
      const messages = Object.values(errors).flat();

      return new FilterApiError(
        messages[0] ?? problem.detail ?? problem.title ?? response.statusText,
        status,
        {
          title: problem.title,
          detail: problem.detail,
          instance: problem.instance,
          validationErrors: errors,
        },
      );
    }

    if (problem) {
      return new FilterApiError(
        problem.detail ?? problem.title ?? response.statusText,
        status,
        {
          title: problem.title,
          detail: problem.detail,
          instance: problem.instance,
        },
      );
    }

    return new FilterApiError(
      response.statusText || "The Filter Nodes API request failed.",
      status,
    );
  }
}

async function tryParseProblemDetails(
  response: Response,
): Promise<ProblemDetails | undefined> {
  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("json")) {
    return undefined;
  }

  try {
    return (await response.json()) as ProblemDetails;
  } catch {
    return undefined;
  }
}

function isValidationProblemDetails(
  problem: ProblemDetails,
): problem is ValidationProblemDetails {
  return "errors" in problem && problem.errors !== undefined;
}

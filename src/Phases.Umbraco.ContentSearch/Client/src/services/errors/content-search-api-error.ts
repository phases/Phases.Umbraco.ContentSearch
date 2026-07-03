import type { ProblemDetails } from "../../models/api.models.js";

/**
 * Represents a failed Content Search API request.
 */
export class ContentSearchApiError extends Error {
  readonly status: number;
  readonly title?: string;
  readonly detail?: string;
  readonly instance?: string;

  constructor(
    message: string,
    status: number,
    options?: {
      title?: string;
      detail?: string;
      instance?: string;
      cause?: unknown;
    },
  ) {
    super(message);
    this.name = "ContentSearchApiError";
    this.status = status;
    this.title = options?.title;
    this.detail = options?.detail;
    this.instance = options?.instance;

    if (options?.cause !== undefined) {
      (this as Error & { cause?: unknown }).cause = options.cause;
    }
  }

  static fromProblem(
    problem: ProblemDetails | string | undefined,
    response: Response,
  ): ContentSearchApiError {
    const status = response.status;

    if (typeof problem === "string") {
      return new ContentSearchApiError(
        problem || response.statusText || "The Content Search API request failed.",
        status,
      );
    }

    if (problem) {
      return new ContentSearchApiError(
        problem.detail ?? problem.title ?? response.statusText,
        status,
        {
          title: problem.title,
          detail: problem.detail,
          instance: problem.instance,
        },
      );
    }

    return new ContentSearchApiError(
      response.statusText || "The Content Search API request failed.",
      status,
    );
  }
}

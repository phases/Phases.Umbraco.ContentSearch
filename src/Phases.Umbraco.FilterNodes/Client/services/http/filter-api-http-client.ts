import { umbHttpClient } from "@umbraco-cms/backoffice/http-client";
import { FilterApiError } from "../errors/filter-api-error.js";
import type { ProblemDetails } from "../../models/filter-models.js";
import { FILTER_API_BASE_PATH } from "../config/filter-api-paths.js";

/**
 * Abstraction for authenticated HTTP calls to the Filter Nodes API.
 */
export interface IFilterApiHttpClient {
  /**
   * Sends an authenticated GET request.
   */
  get<TResponse>(relativePath: string, signal?: AbortSignal): Promise<TResponse>;

  /**
   * Sends an authenticated POST request.
   */
  post<TResponse>(
    relativePath: string,
    body: unknown,
    signal?: AbortSignal,
  ): Promise<TResponse>;

  /**
   * Sends an authenticated DELETE request.
   */
  delete<TResponse>(relativePath: string, signal?: AbortSignal): Promise<TResponse>;
}

const BACKOFFICE_SECURITY = [
  {
    scheme: "bearer",
    type: "http",
  },
] as const;

type UmbHttpClientResult<TResponse> = {
  data?: TResponse;
  error?: unknown;
  response: Response;
};

/**
 * Umbraco backoffice HTTP client backed by {@link umbHttpClient}, which includes
 * cookie auth and 401 retry handling via the core API interceptors.
 */
export class UmbFilterApiHttpClient implements IFilterApiHttpClient {
  get<TResponse>(relativePath: string, signal?: AbortSignal): Promise<TResponse> {
    return this.#send<TResponse>("GET", relativePath, undefined, signal);
  }

  post<TResponse>(
    relativePath: string,
    body: unknown,
    signal?: AbortSignal,
  ): Promise<TResponse> {
    return this.#send<TResponse>("POST", relativePath, body, signal);
  }

  delete<TResponse>(relativePath: string, signal?: AbortSignal): Promise<TResponse> {
    return this.#send<TResponse>("DELETE", relativePath, undefined, signal);
  }

  async #send<TResponse>(
    method: "GET" | "POST" | "DELETE",
    relativePath: string,
    body: unknown,
    signal?: AbortSignal,
  ): Promise<TResponse> {
    const url = buildApiUrl(relativePath);
    const requestOptions = {
      url,
      security: BACKOFFICE_SECURITY,
      signal,
      ...(body !== undefined ? { body } : {}),
    };

    const result = (method === "GET"
      ? await umbHttpClient.get<TResponse>(requestOptions)
      : method === "POST"
        ? await umbHttpClient.post<TResponse>(requestOptions)
        : await umbHttpClient.delete<TResponse>(requestOptions)) as UmbHttpClientResult<TResponse>;

    return this.#unwrapResponse(result);
  }

  async #unwrapResponse<TResponse>(
    result: UmbHttpClientResult<TResponse>,
  ): Promise<TResponse> {
    const { data, error, response } = result;

    if (error || !response.ok) {
      throw FilterApiError.fromProblem(
        error as ProblemDetails | string | undefined,
        response,
      );
    }

    if (response.status === 204) {
      return undefined as TResponse;
    }

    return data as unknown as TResponse;
  }
}

/**
 * Creates an {@link IFilterApiHttpClient} configured for the Umbraco backoffice.
 */
export function createUmbFilterApiHttpClient(): IFilterApiHttpClient {
  return new UmbFilterApiHttpClient();
}

function buildApiUrl(relativePath: string): string {
  const normalizedRelativePath = relativePath.replace(/^\/+/, "");
  return `${FILTER_API_BASE_PATH.replace(/\/+$/, "")}/${normalizedRelativePath}`;
}

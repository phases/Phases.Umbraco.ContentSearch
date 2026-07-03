import { umbHttpClient } from "@umbraco-cms/backoffice/http-client";
import { ContentSearchApiError } from "../errors/content-search-api-error.js";
import type { ProblemDetails } from "../../models/api.models.js";
import { CONTENT_SEARCH_API_BASE_PATH } from "../config/content-search-api-paths.js";

export interface IContentSearchApiHttpClient {
  get<TResponse>(relativePath: string, signal?: AbortSignal): Promise<TResponse>;
  post<TResponse>(
    relativePath: string,
    body: unknown,
    signal?: AbortSignal,
  ): Promise<TResponse>;
  put<TResponse>(
    relativePath: string,
    body: unknown,
    signal?: AbortSignal,
  ): Promise<TResponse>;
  delete(relativePath: string, signal?: AbortSignal): Promise<void>;
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

export class UmbContentSearchApiHttpClient implements IContentSearchApiHttpClient {
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

  put<TResponse>(
    relativePath: string,
    body: unknown,
    signal?: AbortSignal,
  ): Promise<TResponse> {
    return this.#send<TResponse>("PUT", relativePath, body, signal);
  }

  delete(relativePath: string, signal?: AbortSignal): Promise<void> {
    return this.#send<void>("DELETE", relativePath, undefined, signal);
  }

  async #send<TResponse>(
    method: "GET" | "POST" | "PUT" | "DELETE",
    relativePath: string,
    body: unknown | undefined,
    signal?: AbortSignal,
  ): Promise<TResponse> {
    const url = buildApiUrl(relativePath);
    const result = (await (method === "GET"
      ? umbHttpClient.get<TResponse>({
          url,
          security: BACKOFFICE_SECURITY,
          signal,
        })
      : method === "POST"
        ? umbHttpClient.post<TResponse>({
            url,
            security: BACKOFFICE_SECURITY,
            signal,
            body,
          })
        : method === "PUT"
          ? umbHttpClient.put<TResponse>({
              url,
              security: BACKOFFICE_SECURITY,
              signal,
              body,
            })
          : umbHttpClient.delete<TResponse>({
              url,
              security: BACKOFFICE_SECURITY,
              signal,
            }))) as UmbHttpClientResult<TResponse>;

    return this.#unwrapResponse(result);
  }

  async #unwrapResponse<TResponse>(
    result: UmbHttpClientResult<TResponse>,
  ): Promise<TResponse> {
    const { data, error, response } = result;

    if (error || !response.ok) {
      throw ContentSearchApiError.fromProblem(
        error as ProblemDetails | string | undefined,
        response,
      );
    }

    return data as TResponse;
  }
}

export function createUmbContentSearchApiHttpClient(): IContentSearchApiHttpClient {
  return new UmbContentSearchApiHttpClient();
}

function buildApiUrl(relativePath: string): string {
  const normalizedRelativePath = relativePath.replace(/^\/+/, "");
  return `${CONTENT_SEARCH_API_BASE_PATH.replace(/\/+$/, "")}/${normalizedRelativePath}`;
}

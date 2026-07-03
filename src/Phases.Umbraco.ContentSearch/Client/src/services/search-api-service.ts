import type {
  ContentSearchApiRequest,
  ContentSearchApiResponse,
} from "../models/search-api.models.js";
import { ContentSearchApiPaths } from "./config/content-search-api-paths.js";
import { ContentSearchApiError } from "./errors/content-search-api-error.js";
import {
  createUmbContentSearchApiHttpClient,
  type IContentSearchApiHttpClient,
} from "./http/content-search-api-http-client.js";

export class SearchApiService {
  #httpClient: IContentSearchApiHttpClient;

  constructor(httpClient: IContentSearchApiHttpClient) {
    this.#httpClient = httpClient;
  }

  search(
    request: ContentSearchApiRequest,
    signal?: AbortSignal,
  ): Promise<ContentSearchApiResponse> {
    return this.#httpClient.post<ContentSearchApiResponse>(
      ContentSearchApiPaths.search,
      request,
      signal,
    );
  }
}

export function createSearchApiService(
  httpClient?: IContentSearchApiHttpClient,
): SearchApiService {
  return new SearchApiService(httpClient ?? createUmbContentSearchApiHttpClient());
}

export { ContentSearchApiError };

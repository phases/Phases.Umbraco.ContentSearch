import type {
  SearchPreset,
  SearchPresetListResponse,
} from "../models/search-preset.models.js";
import { ContentSearchApiPaths } from "./config/content-search-api-paths.js";
import {
  createUmbContentSearchApiHttpClient,
  type IContentSearchApiHttpClient,
} from "./http/content-search-api-http-client.js";

export class SearchPresetApiService {
  #httpClient: IContentSearchApiHttpClient;

  constructor(httpClient: IContentSearchApiHttpClient) {
    this.#httpClient = httpClient;
  }

  getPresets(signal?: AbortSignal): Promise<SearchPresetListResponse> {
    return this.#httpClient.get<SearchPresetListResponse>(
      ContentSearchApiPaths.searchPresets,
      signal,
    );
  }

  getPreset(presetId: string, signal?: AbortSignal): Promise<SearchPreset> {
    return this.#httpClient.get<SearchPreset>(
      ContentSearchApiPaths.searchPreset(presetId),
      signal,
    );
  }
}

export function createSearchPresetApiService(
  httpClient?: IContentSearchApiHttpClient,
): SearchPresetApiService {
  return new SearchPresetApiService(httpClient ?? createUmbContentSearchApiHttpClient());
}

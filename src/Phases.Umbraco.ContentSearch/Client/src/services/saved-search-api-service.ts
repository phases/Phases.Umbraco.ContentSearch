import type {
  RecordRecentSearchRequest,
  SaveSavedSearchRequest,
  SavedSearchDetail,
  SavedSearchListResponse,
  SavedSearchSummary,
  UpdateSavedSearchRequest,
} from "../models/saved-search.models.js";
import { ContentSearchApiPaths } from "./config/content-search-api-paths.js";
import {
  createUmbContentSearchApiHttpClient,
  type IContentSearchApiHttpClient,
} from "./http/content-search-api-http-client.js";

export class SavedSearchApiService {
  #httpClient: IContentSearchApiHttpClient;

  constructor(httpClient: IContentSearchApiHttpClient) {
    this.#httpClient = httpClient;
  }

  getSavedSearches(signal?: AbortSignal): Promise<SavedSearchListResponse> {
    return this.#httpClient.get<SavedSearchListResponse>(
      ContentSearchApiPaths.savedSearches,
      signal,
    );
  }

  getSavedSearch(savedSearchId: string, signal?: AbortSignal): Promise<SavedSearchDetail> {
    return this.#httpClient.get<SavedSearchDetail>(
      ContentSearchApiPaths.savedSearch(savedSearchId),
      signal,
    );
  }

  saveSavedSearch(
    request: SaveSavedSearchRequest,
    signal?: AbortSignal,
  ): Promise<SavedSearchDetail> {
    return this.#httpClient.post<SavedSearchDetail>(
      ContentSearchApiPaths.savedSearches,
      request,
      signal,
    );
  }

  updateSavedSearch(
    savedSearchId: string,
    request: UpdateSavedSearchRequest,
    signal?: AbortSignal,
  ): Promise<SavedSearchDetail> {
    return this.#httpClient.put<SavedSearchDetail>(
      ContentSearchApiPaths.savedSearch(savedSearchId),
      request,
      signal,
    );
  }

  duplicateSavedSearch(
    savedSearchId: string,
    signal?: AbortSignal,
  ): Promise<SavedSearchDetail> {
    return this.#httpClient.post<SavedSearchDetail>(
      ContentSearchApiPaths.savedSearchDuplicate(savedSearchId),
      {},
      signal,
    );
  }

  deleteSavedSearch(savedSearchId: string, signal?: AbortSignal): Promise<void> {
    return this.#httpClient.delete(
      ContentSearchApiPaths.savedSearch(savedSearchId),
      signal,
    );
  }

  togglePin(savedSearchId: string, signal?: AbortSignal): Promise<SavedSearchSummary> {
    return this.#httpClient.post<SavedSearchSummary>(
      ContentSearchApiPaths.savedSearchPin(savedSearchId),
      {},
      signal,
    );
  }

  toggleFavourite(
    savedSearchId: string,
    signal?: AbortSignal,
  ): Promise<SavedSearchSummary> {
    return this.#httpClient.post<SavedSearchSummary>(
      ContentSearchApiPaths.savedSearchFavourite(savedSearchId),
      {},
      signal,
    );
  }

  recordUsage(savedSearchId: string, signal?: AbortSignal): Promise<void> {
    return this.#httpClient.post<void>(
      ContentSearchApiPaths.savedSearchUse(savedSearchId),
      {},
      signal,
    );
  }

  recordRecent(request: RecordRecentSearchRequest, signal?: AbortSignal): Promise<void> {
    return this.#httpClient.post<void>(
      ContentSearchApiPaths.savedSearchRecent,
      request,
      signal,
    );
  }
}

export function createSavedSearchApiService(
  httpClient?: IContentSearchApiHttpClient,
): SavedSearchApiService {
  return new SavedSearchApiService(httpClient ?? createUmbContentSearchApiHttpClient());
}

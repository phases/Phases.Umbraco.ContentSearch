import type {
  BatchPropertyMetadataResponse,
  ContentTypeAliasesResponse,
  FilterRequest,
  LanguageListResponse,
  NodeSearchResult,
  PagedResponse,
  PropertyAliasesResponse,
} from "../models/filter-models.js";
import type {
  SaveSavedFilterRequest,
  SavedFilter,
  SavedFilterListResponse,
} from "../models/saved-filter-models.js";
import { FilterApiError } from "./errors/filter-api-error.js";
import { FilterApiPaths } from "./config/filter-api-paths.js";
import {
  createUmbFilterApiHttpClient,
  type IFilterApiHttpClient,
} from "./http/filter-api-http-client.js";

/**
 * Service for communicating with the Filter Nodes backoffice API.
 */
export class FilterApiService {
  #httpClient: IFilterApiHttpClient;

  constructor(httpClient: IFilterApiHttpClient) {
    this.#httpClient = httpClient;
  }

  /**
   * Gets the document type aliases available for filtering.
   */
  async getContentTypes(
    signal?: AbortSignal,
  ): Promise<ContentTypeAliasesResponse> {
    return this.#httpClient.get<ContentTypeAliasesResponse>(
      FilterApiPaths.contentTypes,
      signal,
    );
  }

  /**
   * Gets the installed languages available for culture-specific filtering.
   */
  async getLanguages(signal?: AbortSignal): Promise<LanguageListResponse> {
    return this.#httpClient.get<LanguageListResponse>(
      FilterApiPaths.languages,
      signal,
    );
  }

  /**
   * Gets the filterable property aliases for a document type.
   */
  async getProperties(
    contentTypeAlias: string,
    signal?: AbortSignal,
  ): Promise<PropertyAliasesResponse> {
    const normalizedAlias = contentTypeAlias?.trim();

    if (!normalizedAlias) {
      throw new FilterApiError("Content type alias is required.", 400, {
        title: "Bad Request",
        detail: "The content type alias is required.",
        instance: "contentTypeAlias",
      });
    }

    return this.#httpClient.get<PropertyAliasesResponse>(
      FilterApiPaths.properties(normalizedAlias),
      signal,
    );
  }

  /**
   * Gets filterable property metadata for multiple document types.
   */
  async getPropertiesBatch(
    contentTypeAliases: readonly string[],
    signal?: AbortSignal,
  ): Promise<BatchPropertyMetadataResponse> {
    const normalizedAliases = [
      ...new Set(
        contentTypeAliases
          .map((alias) => alias?.trim())
          .filter((alias): alias is string => Boolean(alias)),
      ),
    ];

    if (normalizedAliases.length === 0) {
      throw new FilterApiError("At least one content type alias is required.", 400, {
        title: "Bad Request",
        detail: "At least one content type alias is required.",
        instance: "contentTypeAliases",
      });
    }

    return this.#httpClient.post<BatchPropertyMetadataResponse>(
      FilterApiPaths.propertiesBatch,
      { contentTypeAliases: normalizedAliases },
      signal,
    );
  }

  /**
   * Searches content nodes using the specified filter criteria.
   */
  async search(
    request: FilterRequest,
    signal?: AbortSignal,
  ): Promise<PagedResponse<NodeSearchResult>> {
    if (!request) {
      throw new FilterApiError("Filter request is required.", 400, {
        title: "Bad Request",
        detail: "The request body is required.",
        instance: "request",
      });
    }

    return this.#httpClient.post<PagedResponse<NodeSearchResult>>(
      FilterApiPaths.search,
      request,
      signal,
    );
  }

  /**
   * Gets saved filters for the current backoffice user.
   */
  async getSavedFilters(
    signal?: AbortSignal,
  ): Promise<SavedFilterListResponse> {
    return this.#httpClient.get<SavedFilterListResponse>(
      FilterApiPaths.savedFilters,
      signal,
    );
  }

  /**
   * Saves a filter configuration for the current backoffice user.
   */
  async saveSavedFilter(
    request: SaveSavedFilterRequest,
    signal?: AbortSignal,
  ): Promise<SavedFilter> {
    if (!request?.name?.trim()) {
      throw new FilterApiError("Saved filter name is required.", 400, {
        title: "Bad Request",
        detail: "Name is required.",
        instance: "name",
      });
    }

    return this.#httpClient.post<SavedFilter>(
      FilterApiPaths.savedFilters,
      request,
      signal,
    );
  }

  /**
   * Deletes a saved filter for the current backoffice user.
   */
  async deleteSavedFilter(
    savedFilterId: string,
    signal?: AbortSignal,
  ): Promise<void> {
    const normalizedId = savedFilterId?.trim();

    if (!normalizedId) {
      throw new FilterApiError("Saved filter id is required.", 400, {
        title: "Bad Request",
        detail: "The saved filter id is required.",
        instance: "savedFilterId",
      });
    }

    await this.#httpClient.delete<void>(
      FilterApiPaths.savedFilter(normalizedId),
      signal,
    );
  }
}

/**
 * Creates a {@link FilterApiService} configured for the Umbraco backoffice.
 */
export function createFilterApiService(
  httpClient?: IFilterApiHttpClient,
): FilterApiService {
  return new FilterApiService(httpClient ?? createUmbFilterApiHttpClient());
}

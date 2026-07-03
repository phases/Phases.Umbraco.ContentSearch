import type {
  ContentTypeListResponse,
  PropertyMetadataListResponse,
  SearchPropertyMetadata,
} from "../models/metadata.models.js";
import type { LanguageListItem, LanguageListResponse } from "../models/search-culture.models.js";
import type { SearchContentTypeOption } from "../models/search-builder.models.js";
import { ContentSearchApiError } from "./errors/content-search-api-error.js";
import { ContentSearchApiPaths } from "./config/content-search-api-paths.js";
import {
  createUmbContentSearchApiHttpClient,
  type IContentSearchApiHttpClient,
} from "./http/content-search-api-http-client.js";

/**
 * Lazy-loading metadata API with in-memory request caching for the query builder UI.
 */
export class MetadataApiService {
  #httpClient: IContentSearchApiHttpClient;
  #contentTypesPromise?: Promise<readonly SearchContentTypeOption[]>;
  #languagesPromise?: Promise<readonly LanguageListItem[]>;
  #propertiesPromises = new Map<string, Promise<readonly SearchPropertyMetadata[]>>();

  constructor(httpClient: IContentSearchApiHttpClient) {
    this.#httpClient = httpClient;
  }

  /**
   * Loads document types once and caches the in-flight request.
   */
  getContentTypes(signal?: AbortSignal): Promise<readonly SearchContentTypeOption[]> {
    if (!this.#contentTypesPromise) {
      this.#contentTypesPromise = this.#loadContentTypes(signal);
    }

    return this.#contentTypesPromise;
  }

  /**
   * Loads enabled Umbraco languages once and caches the in-flight request.
   */
  getLanguages(signal?: AbortSignal): Promise<readonly LanguageListItem[]> {
    if (!this.#languagesPromise) {
      this.#languagesPromise = this.#loadLanguages(signal);
    }

    return this.#languagesPromise;
  }

  /**
   * Lazily loads full property metadata for a document type, including tree containers.
   */
  getPropertyMetadata(
    contentTypeAlias: string,
    signal?: AbortSignal,
  ): Promise<readonly SearchPropertyMetadata[]> {
    const normalizedAlias = contentTypeAlias?.trim();

    if (!normalizedAlias) {
      return Promise.resolve([]);
    }

    const existing = this.#propertiesPromises.get(normalizedAlias);
    if (existing) {
      return existing;
    }

    const promise = this.#loadPropertyMetadata(normalizedAlias, signal);
    this.#propertiesPromises.set(normalizedAlias, promise);
    return promise;
  }

  /**
   * Clears cached metadata. Useful after schema changes without a full reload.
   */
  clearCache(): void {
    this.#contentTypesPromise = undefined;
    this.#languagesPromise = undefined;
    this.#propertiesPromises.clear();
  }

  async #loadContentTypes(
    signal?: AbortSignal,
  ): Promise<readonly SearchContentTypeOption[]> {
    const response = await this.#httpClient.get<ContentTypeListResponse>(
      ContentSearchApiPaths.contentTypes,
      signal,
    );

    return response.contentTypes ?? [];
  }

  async #loadLanguages(signal?: AbortSignal): Promise<readonly LanguageListItem[]> {
    const response = await this.#httpClient.get<LanguageListResponse>(
      ContentSearchApiPaths.languages,
      signal,
    );

    return response.languages ?? [];
  }

  async #loadPropertyMetadata(
    contentTypeAlias: string,
    signal?: AbortSignal,
  ): Promise<readonly SearchPropertyMetadata[]> {
    try {
      const response = await this.#httpClient.get<PropertyMetadataListResponse>(
        ContentSearchApiPaths.properties(contentTypeAlias),
        signal,
      );

      return response.properties ?? [];
    } catch (error) {
      this.#propertiesPromises.delete(contentTypeAlias);

      if (error instanceof ContentSearchApiError) {
        throw error;
      }

      throw error;
    }
  }
}

export function createMetadataApiService(
  httpClient?: IContentSearchApiHttpClient,
): MetadataApiService {
  return new MetadataApiService(httpClient ?? createUmbContentSearchApiHttpClient());
}

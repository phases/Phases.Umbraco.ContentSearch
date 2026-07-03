import type {
  ContentExportFormat,
  ContentSearchExportFile,
  ContentSearchExportRequest,
} from "../models/search-export.models.js";
import type { ProblemDetails } from "../models/api.models.js";
import { getFileNameFromContentDisposition } from "../utils/file-download.utils.js";
import {
  CONTENT_SEARCH_API_BASE_PATH,
  ContentSearchApiPaths,
} from "./config/content-search-api-paths.js";
import { ContentSearchApiError } from "./errors/content-search-api-error.js";

export interface ContentSearchExportAuthConfig {
  readonly base?: string;
  readonly credentials?: RequestCredentials;
  readonly token: () => Promise<string | undefined>;
}

const DEFAULT_FILE_NAMES: Record<ContentExportFormat, string> = {
  Csv: "content-search-results.csv",
  Excel: "content-search-results.xlsx",
};

export class ExportApiService {
  async export(
    request: ContentSearchExportRequest,
    auth: ContentSearchExportAuthConfig,
    signal?: AbortSignal,
  ): Promise<ContentSearchExportFile> {
    const token = await auth.token();
    const url = this.#buildUrl(auth.base);

    const response = await fetch(url, {
      method: "POST",
      credentials: auth.credentials ?? "same-origin",
      signal,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw await this.#toError(response);
    }

    const blob = await response.blob();
    const fileName = getFileNameFromContentDisposition(
      response.headers.get("content-disposition"),
      DEFAULT_FILE_NAMES[request.format],
    );

    return { blob, fileName };
  }

  #buildUrl(base?: string): string {
    const normalizedBase = (base ?? "").replace(/\/+$/, "");
    const basePath = CONTENT_SEARCH_API_BASE_PATH.replace(/\/+$/, "");
    return `${normalizedBase}${basePath}/${ContentSearchApiPaths.export}`;
  }

  async #toError(response: Response): Promise<ContentSearchApiError> {
    let problem: ProblemDetails | string | undefined;

    try {
      problem = (await response.json()) as ProblemDetails;
    } catch {
      problem = undefined;
    }

    return ContentSearchApiError.fromProblem(problem, response);
  }
}

export function createExportApiService(): ExportApiService {
  return new ExportApiService();
}

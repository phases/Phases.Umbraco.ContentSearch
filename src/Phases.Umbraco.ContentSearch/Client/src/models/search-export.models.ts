import type { ContentSearchApiRequest } from "./search-api.models.js";

export type ContentExportFormat = "Csv" | "Excel";

export const CONTENT_SEARCH_EXPORT = "content-search-export";

export interface ContentSearchExportEventDetail {
  readonly format: ContentExportFormat;
}

export interface ContentSearchExportRequest {
  readonly format: ContentExportFormat;
  readonly search: ContentSearchApiRequest;
}

export interface ContentSearchExportFile {
  readonly blob: Blob;
  readonly fileName: string;
}

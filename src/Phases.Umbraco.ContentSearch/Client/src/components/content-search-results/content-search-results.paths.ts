import { UMB_EDIT_DOCUMENT_WORKSPACE_PATH_PATTERN } from "@umbraco-cms/backoffice/document";
import { UmbVariantId } from "@umbraco-cms/backoffice/variant";

export interface DocumentEditPathOptions {
  readonly key: string;
  readonly cultureCode?: string | null;
}

/**
 * Builds an absolute Umbraco backoffice URL for editing a document.
 * Appends a variant segment when a culture code is known.
 */
export function getDocumentEditPath(key: string): string;
export function getDocumentEditPath(options: DocumentEditPathOptions): string;
export function getDocumentEditPath(
  keyOrOptions: string | DocumentEditPathOptions,
): string {
  const key = typeof keyOrOptions === "string" ? keyOrOptions : keyOrOptions.key;
  const cultureCode =
    typeof keyOrOptions === "string" ? undefined : keyOrOptions.cultureCode?.trim();

  const basePath = UMB_EDIT_DOCUMENT_WORKSPACE_PATH_PATTERN.generateAbsolute({
    unique: key,
  });

  if (!cultureCode) {
    return basePath;
  }

  const variantSegment = UmbVariantId.Create({
    culture: cultureCode,
    segment: null,
  }).toString();

  return `${trimTrailingSlash(basePath)}/${encodeURIComponent(variantSegment)}`;
}

function trimTrailingSlash(path: string): string {
  return path.endsWith("/") ? path.slice(0, -1) : path;
}

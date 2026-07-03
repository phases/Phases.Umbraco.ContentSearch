import { UMB_EDIT_DOCUMENT_WORKSPACE_PATH_PATTERN } from "@umbraco-cms/backoffice/document";

export function getDocumentEditPath(key: string): string {
  return UMB_EDIT_DOCUMENT_WORKSPACE_PATH_PATTERN.generateAbsolute({
    unique: key,
  });
}

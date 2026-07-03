import type { SearchContentTypeOption } from "../models/search-builder.models.js";
import type { SearchPropertyMetadata } from "../models/metadata.models.js";
import {
  WILDCARD_CONTENT_TYPE_ALIAS,
  WILDCARD_CONTENT_TYPE_LABEL,
} from "../constants/search-preset.constants.js";

const WILDCARD_SYSTEM_PROPERTIES: readonly SearchPropertyMetadata[] = [
  { alias: "nodeName", name: "Node name", editorAlias: "Umbraco.TextBox", sourceCategory: "System", groupName: "System", isSelectable: true },
  { alias: "createDate", name: "Create date", editorAlias: "Umbraco.DateTime", sourceCategory: "System", groupName: "System", isSelectable: true },
  { alias: "updateDate", name: "Update date", editorAlias: "Umbraco.DateTime", sourceCategory: "System", groupName: "System", isSelectable: true },
  { alias: "publishStatus", name: "Publish status", editorAlias: "Umbraco.TrueFalse", sourceCategory: "System", groupName: "System", isSelectable: true },
];

export function isWildcardContentTypeAlias(alias: string): boolean {
  return alias.trim().toLowerCase() === WILDCARD_CONTENT_TYPE_ALIAS;
}

export function createWildcardContentTypeOption(): SearchContentTypeOption {
  return {
    alias: WILDCARD_CONTENT_TYPE_ALIAS,
    name: WILDCARD_CONTENT_TYPE_LABEL,
  };
}

export function getWildcardPropertyMetadata(): readonly SearchPropertyMetadata[] {
  return WILDCARD_SYSTEM_PROPERTIES;
}

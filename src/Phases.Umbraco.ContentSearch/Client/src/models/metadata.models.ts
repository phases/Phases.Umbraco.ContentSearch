import type { SearchContentTypeOption } from "../models/search-builder.models.js";

export type PropertySourceCategory =
  | "System"
  | "ContentType"
  | "Composition"
  | "BlockGrid"
  | "BlockList";

export interface ContentTypeListResponse {
  readonly contentTypes: readonly SearchContentTypeOption[];
}

export interface PropertyMetadataListResponse {
  readonly contentTypeAlias: string;
  readonly properties: readonly SearchPropertyMetadata[];
}

export interface SearchPropertyMetadata {
  readonly alias: string;
  readonly name: string;
  readonly editorAlias?: string | null;
  readonly dataTypeId?: number | null;
  readonly sourceCategory?: PropertySourceCategory;
  readonly sourceName?: string | null;
  readonly groupName?: string;
  readonly groupSortOrder?: number;
  readonly sortOrder?: number;
  readonly variesByCulture?: boolean;
  readonly isInvariant?: boolean;
  readonly isSelectable?: boolean;
  readonly isContainer?: boolean;
  readonly containerAlias?: string | null;
  readonly elementTypeAlias?: string | null;
  readonly elementTypeName?: string | null;
  readonly displayPath?: readonly string[];
  readonly availableCultures?: readonly string[];
}

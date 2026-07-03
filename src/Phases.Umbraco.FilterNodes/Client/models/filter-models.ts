/**
 * TypeScript models mirroring server-side filter DTOs.
 * Regenerate via `npm run generate-client` once filter endpoints are exposed in OpenAPI.
 */

export type FilterType = "All" | "Any";

/** Whether filters are scoped to a selected document type or the entire site. */
export type SearchScope = "ContentType" | "EntireSite";

/** How culture-variant properties are searched in Examine. */
export type SearchCultureMode = "AllCultures" | "CurrentCulture" | "SpecificCulture";

export type FilterOperator =
  | "Equals"
  | "NotEquals"
  | "Contains"
  | "StartsWith"
  | "EndsWith"
  | "GreaterThan"
  | "GreaterThanOrEqual"
  | "LessThan"
  | "LessThanOrEqual"
  | "Between"
  | "IsEmpty"
  | "IsNotEmpty";

/** Operator value used by editable UI rows before a real operator is chosen. */
export type EditableFilterOperator = FilterOperator | "";

export interface FilterCondition {
  readonly contentTypeAlias?: string;
  readonly propertyAlias?: string;
  readonly propertyValue?: string;
  readonly filterOperator?: FilterOperator;
  readonly fromDate?: string;
  readonly toDate?: string;
}

export interface PagedRequest {
  readonly page?: number;
  readonly pageSize?: number;
}

export type SortDirection = "Ascending" | "Descending";

export interface SortOptions {
  readonly field?: string;
  readonly direction?: SortDirection;
}

export interface FilterRequest {
  readonly paging?: PagedRequest;
  readonly filterType?: FilterType;
  readonly conditions?: readonly FilterCondition[];
  readonly sort?: SortOptions;
  readonly searchCultureMode?: SearchCultureMode;
  readonly culture?: string;
}

export interface PagedResponse<T> {
  readonly items: readonly T[];
  readonly page: number;
  readonly pageSize: number;
  readonly totalCount: number;
  readonly totalPages: number;
  readonly hasPreviousPage: boolean;
  readonly hasNextPage: boolean;
}

export interface NodeSearchResult {
  readonly key: string;
  readonly id: number;
  readonly name: string;
  readonly contentTypeAlias?: string;
  readonly parentKey?: string;
  readonly parentName?: string;
  readonly createDate?: string;
  readonly updateDate?: string;
  readonly url?: string;
  readonly matchedCulture?: string;
}

export interface ContentTypeListItem {
  readonly alias: string;
  readonly name: string;
}

export interface ContentTypeAliasesResponse {
  readonly contentTypes: readonly ContentTypeListItem[];
  readonly aliases?: readonly string[];
}

export type PropertyFilterType =
  | "Text"
  | "Number"
  | "Date"
  | "Dropdown"
  | "MultiSelect";

export type PropertyMetadataSourceCategory =
  | "System"
  | "ContentType"
  | "Composition"
  | "BlockGrid"
  | "BlockList";

export interface PropertyFilterOption {
  readonly label: string;
  readonly value: string;
}

export interface BlockDiscoveryDiagnostics {
  readonly configurationLoaded: boolean;
  readonly allowedBlocksCount: number;
  readonly resolvedElementTypesCount: number;
  readonly resolvedPropertiesCount: number;
}

export interface BlockExamineDiagnostics {
  readonly containerField: string;
  readonly containerIndexed: boolean;
  readonly elementFieldsDetected: number;
  readonly dedicatedPropertyFields: number;
  readonly searchStrategy: string;
  readonly explanation: string;
}

export interface FilterablePropertyMetadata {
  readonly alias: string;
  readonly name: string;
  readonly editorAlias?: string;
  readonly dataTypeId?: number;
  readonly filterType: PropertyFilterType;
  readonly options?: readonly PropertyFilterOption[];
  readonly groupName?: string;
  readonly groupSortOrder?: number;
  readonly sortOrder?: number;
  readonly sourceCategory?: PropertyMetadataSourceCategory;
  readonly sourceName?: string;
  readonly isFilterable?: boolean;
  readonly isContainer?: boolean;
  readonly containerAlias?: string;
  readonly containerName?: string;
  readonly containerEditorAlias?: string;
  readonly elementTypeAlias?: string;
  readonly elementTypeName?: string;
  readonly displayPath?: readonly string[];
  readonly indexedFieldAliases?: readonly string[];
  readonly variesByCulture?: boolean;
  readonly availableCultures?: readonly string[];
  readonly blockDiscoveryDiagnostics?: BlockDiscoveryDiagnostics;
  readonly blockExamineDiagnostics?: BlockExamineDiagnostics;
}

export interface LanguageListItem {
  readonly isoCode: string;
  readonly name: string;
}

export interface LanguageListResponse {
  readonly languages: readonly LanguageListItem[];
}

export interface PropertyAliasesResponse {
  readonly contentTypeAlias: string;
  readonly aliases: readonly string[];
  readonly properties: readonly FilterablePropertyMetadata[];
}

export interface BatchPropertyMetadataResponse {
  readonly items: readonly PropertyAliasesResponse[];
}

export interface ProblemDetails {
  readonly title?: string;
  readonly detail?: string;
  readonly status?: number;
  readonly instance?: string;
}

export interface ValidationProblemDetails extends ProblemDetails {
  readonly errors?: Readonly<Record<string, readonly string[]>>;
}

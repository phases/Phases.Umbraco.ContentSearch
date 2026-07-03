/** How multiple conditions are combined. */
export type SearchMatchMode = "all" | "any";

/** Supported comparison operators for the query builder. */
export type SearchConditionOperator =
  | "equals"
  | "notEquals"
  | "contains"
  | "notContains"
  | "containsAny"
  | "containsAll"
  | "startsWith"
  | "endsWith"
  | "greaterThan"
  | "greaterThanOrEqual"
  | "lessThan"
  | "lessThanOrEqual"
  | "before"
  | "after"
  | "between"
  | "today"
  | "yesterday"
  | "last7Days"
  | "last30Days"
  | "thisMonth"
  | "lastMonth"
  | "thisYear"
  | "isTrue"
  | "isFalse"
  | "hasMedia"
  | "hasNoMedia"
  | "hasValue"
  | "hasNoValue"
  | "isEmpty"
  | "isNotEmpty"
  | "";

export interface SearchContentTypeOption {
  readonly alias: string;
  readonly name: string;
  readonly icon?: string | null;
}

export interface SearchPropertyOption {
  readonly alias: string;
  readonly name: string;
}

/** A single editable search condition in the builder. */
export interface SearchCondition {
  readonly id: string;
  contentTypeAlias: string;
  propertyAlias: string;
  operator: SearchConditionOperator;
  value: string;
}

export function createEmptySearchCondition(): SearchCondition {
  return {
    id: crypto.randomUUID(),
    contentTypeAlias: "",
    propertyAlias: "",
    operator: "",
    value: "",
  };
}

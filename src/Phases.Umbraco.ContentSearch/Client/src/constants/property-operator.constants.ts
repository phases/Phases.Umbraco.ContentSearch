import type { SearchConditionOperator } from "../models/search-builder.models.js";
import type { PropertySearchType } from "../models/property-search-type.models.js";

export type SearchOperatorOption = {
  readonly value: SearchConditionOperator;
  readonly label: string;
};

const textOperators: readonly SearchOperatorOption[] = [
  { value: "equals", label: "equals" },
  { value: "notEquals", label: "does not equal" },
  { value: "contains", label: "contains" },
  { value: "notContains", label: "does not contain" },
  { value: "startsWith", label: "starts with" },
  { value: "endsWith", label: "ends with" },
  { value: "isEmpty", label: "is empty" },
  { value: "isNotEmpty", label: "is not empty" },
];

const numberOperators: readonly SearchOperatorOption[] = [
  { value: "equals", label: "equals" },
  { value: "notEquals", label: "does not equal" },
  { value: "greaterThan", label: "greater than" },
  { value: "greaterThanOrEqual", label: "greater than or equal" },
  { value: "lessThan", label: "less than" },
  { value: "lessThanOrEqual", label: "less than or equal" },
  { value: "between", label: "between" },
  { value: "isEmpty", label: "is empty" },
  { value: "isNotEmpty", label: "is not empty" },
];

const dateOperators: readonly SearchOperatorOption[] = [
  { value: "equals", label: "equals" },
  { value: "greaterThan", label: "greater than" },
  { value: "lessThan", label: "less than" },
  { value: "between", label: "between" },
  { value: "today", label: "today" },
  { value: "yesterday", label: "yesterday" },
  { value: "last7Days", label: "last 7 days" },
  { value: "last30Days", label: "last 30 days" },
  { value: "thisMonth", label: "this month" },
  { value: "lastMonth", label: "last month" },
  { value: "thisYear", label: "this year" },
  { value: "isEmpty", label: "is empty" },
  { value: "isNotEmpty", label: "is not empty" },
];

const booleanOperators: readonly SearchOperatorOption[] = [
  { value: "isTrue", label: "is true" },
  { value: "isFalse", label: "is false" },
  { value: "isEmpty", label: "is empty" },
];

const singleChoiceOperators: readonly SearchOperatorOption[] = [
  { value: "equals", label: "equals" },
  { value: "notEquals", label: "does not equal" },
  { value: "isEmpty", label: "is empty" },
  { value: "isNotEmpty", label: "is not empty" },
];

const multipleChoiceOperators: readonly SearchOperatorOption[] = [
  { value: "contains", label: "contains" },
  { value: "notContains", label: "does not contain" },
  { value: "containsAny", label: "contains any" },
  { value: "containsAll", label: "contains all" },
  { value: "isEmpty", label: "is empty" },
  { value: "isNotEmpty", label: "is not empty" },
];

const mediaOperators: readonly SearchOperatorOption[] = [
  { value: "hasMedia", label: "has media" },
  { value: "hasNoMedia", label: "has no media" },
];

const contentOperators: readonly SearchOperatorOption[] = [
  { value: "hasValue", label: "has value" },
  { value: "hasNoValue", label: "has no value" },
  { value: "equals", label: "equals" },
  { value: "notEquals", label: "does not equal" },
];

const blockContainerOperators: readonly SearchOperatorOption[] = [
  { value: "isEmpty", label: "is empty" },
  { value: "isNotEmpty", label: "is not empty" },
];

export const OPERATORS_BY_PROPERTY_SEARCH_TYPE: Readonly<
  Record<PropertySearchType, readonly SearchOperatorOption[]>
> = {
  text: textOperators,
  number: numberOperators,
  date: dateOperators,
  boolean: booleanOperators,
  singleChoice: singleChoiceOperators,
  multipleChoice: multipleChoiceOperators,
  media: mediaOperators,
  content: contentOperators,
  blockContainer: blockContainerOperators,
  json: textOperators,
};

export const VALUELESS_SEARCH_OPERATORS: ReadonlySet<SearchConditionOperator> =
  new Set([
    "isEmpty",
    "isNotEmpty",
    "isTrue",
    "isFalse",
    "today",
    "yesterday",
    "last7Days",
    "last30Days",
    "thisMonth",
    "lastMonth",
    "thisYear",
    "hasMedia",
    "hasNoMedia",
    "hasValue",
    "hasNoValue",
  ]);

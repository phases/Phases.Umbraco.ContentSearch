import type { EditableFilterCondition } from "../controllers/filter-nodes-workspace.models.js";
import {
  CONDITION_SUMMARY_PATH_SEPARATOR,
  CONTENT_TYPE_ALIAS_PROPERTY_ALIAS,
  CREATED_DATE_PROPERTY_ALIAS,
  NODE_NAME_PROPERTY_ALIAS,
  UPDATED_DATE_PROPERTY_ALIAS,
} from "../constants/filter-nodes.constants.js";
import type {
  FilterOperator,
  FilterType,
  FilterablePropertyMetadata,
  PropertyFilterType,
} from "../models/filter-models.js";
import type { FilterConditionContext } from "./active-filter.utils.js";
import {
  detectDateShortcut,
  type DateShortcutId,
} from "./date-shortcut.utils.js";
import {
  getPropertyFilterType,
  isEntireSiteSearchScope,
  isReservedContentTypeAlias,
  parseMultiSelectValue,
  resolvePropertyMetadata,
  resolveContentTypeDisplayName,
  shouldQuoteFilterValue,
  usesDateRangeFields,
} from "./filter-condition.utils.js";

export type FilterQuerySummaryKeyword = "WHERE" | "AND" | "OR";

export type FilterQuerySummaryPart =
  | {
      readonly kind: "keyword";
      readonly keyword: FilterQuerySummaryKeyword;
    }
  | {
      readonly kind: "condition";
      readonly text: string;
    };

export interface FilterQuerySummary {
  readonly parts: readonly FilterQuerySummaryPart[];
  readonly placeholder: string;
}

const DATE_SHORTCUT_SUMMARY_PHRASES: Readonly<
  Record<Exclude<DateShortcutId, "" | "custom">, string>
> = {
  today: "today",
  yesterday: "yesterday",
  last7Days: "within the last 7 days",
  last30Days: "within the last 30 days",
  thisMonth: "within this month",
  lastMonth: "within last month",
};

export function getFilterQuerySummary(
  conditions: readonly EditableFilterCondition[],
  filterType: FilterType,
  context: FilterConditionContext,
): FilterQuerySummary {
  if (conditions.length === 0) {
    return {
      parts: [],
      placeholder: "Add conditions above to preview your search.",
    };
  }

  const connector: "AND" | "OR" = filterType === "Any" ? "OR" : "AND";
  const parts: FilterQuerySummaryPart[] = [];

  conditions.forEach((condition, index) => {
    parts.push({
      kind: "keyword",
      keyword: index === 0 ? "WHERE" : connector,
    });
    parts.push({
      kind: "condition",
      text: formatConditionSummaryLine(condition, context),
    });
  });

  return {
    parts,
    placeholder: "Add conditions above to preview your search.",
  };
}

function formatConditionSummaryLine(
  condition: EditableFilterCondition,
  context: FilterConditionContext,
): string {
  const entireSite = isEntireSiteSearchScope(context.searchScope);
  const contentTypeAlias = condition.contentTypeAlias.trim();
  const propertyAlias = condition.propertyAlias.trim();

  if (!propertyAlias) {
    if (entireSite) {
      return "…";
    }

    const typeLabel = contentTypeAlias
      ? resolveContentTypeDisplayName(contentTypeAlias, context.contentTypes)
      : "…";

    return `${typeLabel}${CONDITION_SUMMARY_PATH_SEPARATOR}…`;
  }

  const propertyMetadata = resolvePropertyMetadata(
    context.propertyMetadataByContentType,
    contentTypeAlias,
    propertyAlias,
    context.searchScope,
    context.contentTypes,
  );

  const expression = formatSummaryExpression(
    condition,
    propertyMetadata,
    propertyAlias,
  );

  if (entireSite) {
    return expression;
  }

  const typeLabel =
    contentTypeAlias && !isReservedContentTypeAlias(contentTypeAlias)
      ? resolveContentTypeDisplayName(contentTypeAlias, context.contentTypes)
      : "…";

  return `${typeLabel}${CONDITION_SUMMARY_PATH_SEPARATOR}${expression}`;
}

function formatSummaryExpression(
  condition: EditableFilterCondition,
  propertyMetadata: FilterablePropertyMetadata | undefined,
  propertyAlias: string,
): string {
  const propertyName = getPropertyDisplayName(propertyMetadata, propertyAlias);
  const operator = condition.filterOperator;
  const filterType = getPropertyFilterType(propertyMetadata);
  const isSystemDate = usesDateRangeFields(propertyMetadata, propertyAlias);

  if (!operator) {
    return `${propertyName} …`;
  }

  if (operator === "IsEmpty" || operator === "IsNotEmpty") {
    return `${propertyName} ${formatSummaryOperatorPhrase(operator, filterType, isSystemDate)}`;
  }

  const dateSummary = formatDateSummaryExpression(
    condition,
    propertyName,
    operator,
    filterType,
    isSystemDate,
  );

  if (dateSummary) {
    return dateSummary;
  }

  const valueDisplay = formatSummaryValueDisplay(
    condition,
    operator,
    propertyMetadata,
    filterType,
  );

  if (!valueDisplay) {
    return `${propertyName} ${formatSummaryOperatorPhrase(operator, filterType, isSystemDate)} …`;
  }

  return `${propertyName} ${formatSummaryOperatorPhrase(operator, filterType, isSystemDate)} ${valueDisplay}`;
}

function formatDateSummaryExpression(
  condition: EditableFilterCondition,
  propertyName: string,
  operator: FilterOperator,
  filterType: PropertyFilterType,
  isSystemDate: boolean,
): string | undefined {
  if (filterType !== "Date" && !isSystemDate) {
    return undefined;
  }

  const mode = isSystemDate ? "system" : "custom";

  if (operator === "Between") {
    const shortcut = detectDateShortcut(
      condition.fromDate,
      condition.toDate,
      condition.propertyValue,
      operator,
      mode,
    );

    if (shortcut && shortcut !== "custom") {
      return `${propertyName} is ${DATE_SHORTCUT_SUMMARY_PHRASES[shortcut]}`;
    }

    const fromDate = condition.fromDate.trim();
    const toDate = condition.toDate.trim();

    if (fromDate && toDate) {
      return `${propertyName} is between ${fromDate} and ${toDate}`;
    }

    if (fromDate || toDate) {
      return `${propertyName} is between ${fromDate || "…"} and ${toDate || "…"}`;
    }

    return `${propertyName} is between …`;
  }

  if (isSystemDate) {
    const usesEndDate =
      operator === "LessThan" || operator === "LessThanOrEqual";
    const dateValue = usesEndDate
      ? condition.toDate.trim()
      : condition.fromDate.trim();

    if (!dateValue) {
      return `${propertyName} ${formatSummaryOperatorPhrase(operator, "Date", true)} …`;
    }

    return `${propertyName} ${formatSummaryOperatorPhrase(operator, "Date", true)} ${dateValue}`;
  }

  const dateValue = condition.propertyValue.trim();

  if (!dateValue) {
    return `${propertyName} ${formatSummaryOperatorPhrase(operator, "Date", false)} …`;
  }

  return `${propertyName} ${formatSummaryOperatorPhrase(operator, "Date", false)} ${dateValue}`;
}

function formatSummaryValueDisplay(
  condition: EditableFilterCondition,
  operator: FilterOperator,
  propertyMetadata: FilterablePropertyMetadata | undefined,
  filterType: PropertyFilterType,
): string {
  const propertyValue = condition.propertyValue.trim();

  if (!propertyValue) {
    return "";
  }

  if (filterType === "MultiSelect") {
    const labels = parseMultiSelectValue(propertyValue).map(
      (value) =>
        propertyMetadata?.options?.find((option) => option.value === value)
          ?.label ?? value,
    );

    return formatSummaryQuotedValue(labels.join(", "));
  }

  if (filterType === "Dropdown") {
    const label =
      propertyMetadata?.options?.find((option) => option.value === propertyValue)
        ?.label ?? propertyValue;

    return formatBooleanSummaryValue(label) ?? label;
  }

  if (shouldQuoteFilterValue(operator, filterType)) {
    return formatSummaryQuotedValue(propertyValue);
  }

  return formatBooleanSummaryValue(propertyValue) ?? propertyValue;
}

function formatSummaryOperatorPhrase(
  operator: FilterOperator,
  filterType: PropertyFilterType,
  isSystemDate: boolean,
): string {
  const isDate = filterType === "Date" || isSystemDate;

  switch (operator) {
    case "Contains":
      return "contains";
    case "StartsWith":
      return "starts with";
    case "EndsWith":
      return "ends with";
    case "Equals":
      return isDate ? "is on" : "equals";
    case "NotEquals":
      return isDate ? "is not on" : "does not equal";
    case "GreaterThan":
      return isDate ? "is after" : "is greater than";
    case "GreaterThanOrEqual":
      return isDate ? "is on or after" : "is at least";
    case "LessThan":
      return isDate ? "is before" : "is less than";
    case "LessThanOrEqual":
      return isDate ? "is on or before" : "is at most";
    case "Between":
      return "is between";
    case "IsEmpty":
      return "is empty";
    case "IsNotEmpty":
      return "is not empty";
    default:
      return operator;
  }
}


function getPropertyDisplayName(
  propertyMetadata: FilterablePropertyMetadata | undefined,
  propertyAlias: string,
): string {
  if (propertyMetadata?.name) {
    return propertyMetadata.name;
  }

  if (propertyAlias === CREATED_DATE_PROPERTY_ALIAS) {
    return "Create Date";
  }

  if (propertyAlias === UPDATED_DATE_PROPERTY_ALIAS) {
    return "Update Date";
  }

  if (propertyAlias === NODE_NAME_PROPERTY_ALIAS) {
    return "Node Name";
  }

  if (propertyAlias === CONTENT_TYPE_ALIAS_PROPERTY_ALIAS) {
    return "Content Type Alias";
  }

  return propertyAlias;
}

function formatSummaryQuotedValue(value: string): string {
  return `"${value}"`;
}

function formatBooleanSummaryValue(value: string): string | undefined {
  const normalized = value.trim().toLowerCase();

  if (normalized === "true" || normalized === "1") {
    return "True";
  }

  if (normalized === "false" || normalized === "0") {
    return "False";
  }

  return undefined;
}

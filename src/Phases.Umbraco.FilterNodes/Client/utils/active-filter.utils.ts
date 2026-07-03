import {
  createEmptyCondition,
  type EditableFilterCondition,
} from "../controllers/filter-nodes-workspace.models.js";
import type {
  FilterCondition,
  FilterOperator,
  FilterablePropertyMetadata,
  PropertyFilterType,
  SearchScope,
  ContentTypeListItem,
} from "../models/filter-models.js";
import {
  CONTENT_TYPE_ALIAS_PROPERTY_ALIAS,
  CREATED_DATE_PROPERTY_ALIAS,
  NODE_NAME_PROPERTY_ALIAS,
  UPDATED_DATE_PROPERTY_ALIAS,
} from "../constants/filter-nodes.constants.js";
import {
  isEntireSiteSearchScope,
  isEntireSiteSystemPropertyAlias,
  isReservedContentTypeAlias,
  parseMultiSelectValue,
  resolvePropertyMetadata,
  resolveContentTypeDisplayName,
  usesDateRangeFields,
  getPropertyFilterType,
} from "./filter-condition.utils.js";
import {
  detectDateShortcut,
  type DateShortcutId,
} from "./date-shortcut.utils.js";
import type { FilterType } from "../models/filter-models.js";
import { validateFilterConditions } from "./filter-validation.utils.js";

export type ActiveFilterBadgeKind = "contentType" | "expression";

export interface ActiveFilterBadge {
  readonly badgeId: string;
  readonly conditionId: string;
  readonly kind: ActiveFilterBadgeKind;
  readonly label: string;
}

export function createActiveFilterBadgeId(
  conditionId: string,
  kind: ActiveFilterBadgeKind,
): string {
  return `${conditionId}:${kind}`;
}

export interface FilterConditionContext {
  readonly propertyMetadataByContentType: Readonly<
    Record<string, readonly FilterablePropertyMetadata[]>
  >;
  readonly searchScope: SearchScope;
  readonly contentTypes: readonly ContentTypeListItem[];
}

function resolveConditionPropertyMetadata(
  condition: EditableFilterCondition,
  context: FilterConditionContext,
): FilterablePropertyMetadata | undefined {
  return resolvePropertyMetadata(
    context.propertyMetadataByContentType,
    condition.contentTypeAlias.trim(),
    condition.propertyAlias.trim(),
    context.searchScope,
    context.contentTypes,
  );
}

function buildFilterConditionPayload(
  propertyAlias: string,
  filterOperator: FilterOperator,
  contentTypeAlias: string | undefined,
  condition: EditableFilterCondition,
  propertyMetadata: FilterablePropertyMetadata | undefined,
): FilterCondition | undefined {
  if (filterOperator === "IsEmpty" || filterOperator === "IsNotEmpty") {
    return {
      ...(contentTypeAlias ? { contentTypeAlias } : {}),
      propertyAlias,
      filterOperator,
    };
  }

  if (usesDateRangeFields(propertyMetadata, propertyAlias)) {
    if (filterOperator === "Between") {
      const fromDate = condition.fromDate.trim();
      const toDate = condition.toDate.trim();

      if (!fromDate && !toDate) {
        return undefined;
      }
    } else if (
      filterOperator === "LessThan" ||
      filterOperator === "LessThanOrEqual"
    ) {
      if (!condition.toDate.trim()) {
        return undefined;
      }
    } else if (!condition.fromDate.trim()) {
      return undefined;
    }

    return {
      ...(contentTypeAlias ? { contentTypeAlias } : {}),
      propertyAlias,
      filterOperator,
      fromDate: condition.fromDate || undefined,
      toDate: condition.toDate || undefined,
    };
  }

  if (
    getPropertyFilterType(propertyMetadata) === "Date" &&
    filterOperator === "Between"
  ) {
    const fromDate = condition.fromDate.trim();
    const toDate = condition.toDate.trim();

    if (!fromDate || !toDate) {
      return undefined;
    }

    return {
      ...(contentTypeAlias ? { contentTypeAlias } : {}),
      propertyAlias,
      filterOperator,
      fromDate,
      toDate,
    };
  }

  const propertyValue = condition.propertyValue.trim();

  if (!propertyValue) {
    return undefined;
  }

  return {
    ...(contentTypeAlias ? { contentTypeAlias } : {}),
    propertyAlias,
    filterOperator,
    propertyValue,
  };
}

export function toFilterCondition(
  condition: EditableFilterCondition,
  context: FilterConditionContext,
): FilterCondition | undefined {
  const propertyAlias = condition.propertyAlias.trim();
  const filterOperator = condition.filterOperator;

  if (!propertyAlias) {
    if (isEntireSiteSearchScope(context.searchScope)) {
      return undefined;
    }

    const contentTypeAlias = condition.contentTypeAlias.trim();

    if (!contentTypeAlias || isReservedContentTypeAlias(contentTypeAlias)) {
      return undefined;
    }

    return { contentTypeAlias };
  }

  if (!filterOperator) {
    return undefined;
  }

  if (isEntireSiteSearchScope(context.searchScope)) {
    if (!isEntireSiteSystemPropertyAlias(propertyAlias)) {
      return undefined;
    }

    const propertyMetadata = resolveConditionPropertyMetadata(condition, context);

    return buildFilterConditionPayload(
      propertyAlias,
      filterOperator,
      undefined,
      condition,
      propertyMetadata,
    );
  }

  const contentTypeAlias = condition.contentTypeAlias.trim();

  if (!contentTypeAlias || isReservedContentTypeAlias(contentTypeAlias)) {
    return undefined;
  }

  const propertyMetadata = resolveConditionPropertyMetadata(condition, context);

  return buildFilterConditionPayload(
    propertyAlias,
    filterOperator,
    contentTypeAlias,
    condition,
    propertyMetadata,
  );
}

export function canSubmitFilterSearch(
  conditions: readonly EditableFilterCondition[],
  context: FilterConditionContext,
  filterType: FilterType = "All",
): boolean {
  return validateFilterConditions(conditions, context, filterType).isValid;
}

export function isApplicableCondition(
  condition: EditableFilterCondition,
  context: FilterConditionContext,
): boolean {
  return toFilterCondition(condition, context) !== undefined;
}

export function getActiveFilterBadges(
  conditions: readonly EditableFilterCondition[],
  context: FilterConditionContext,
): readonly ActiveFilterBadge[] {
  const badges: ActiveFilterBadge[] = [];
  const entireSite = isEntireSiteSearchScope(context.searchScope);

  for (const condition of conditions) {
    const contentTypeAlias = condition.contentTypeAlias.trim();
    const propertyAlias = condition.propertyAlias.trim();

    if (!entireSite && !propertyAlias && contentTypeAlias) {
      badges.push({
        badgeId: createActiveFilterBadgeId(condition.id, "contentType"),
        conditionId: condition.id,
        kind: "contentType",
        label: resolveContentTypeDisplayName(
          contentTypeAlias,
          context.contentTypes,
        ),
      });
      continue;
    }

    if (!propertyAlias) {
      continue;
    }

    const propertyMetadata = resolveConditionPropertyMetadata(condition, context);

    if (!hasDisplayableFilterValue(condition, propertyMetadata)) {
      continue;
    }

    const expression = formatChipExpression(condition, propertyMetadata);

    if (expression) {
      badges.push({
        badgeId: createActiveFilterBadgeId(condition.id, "expression"),
        conditionId: condition.id,
        kind: "expression",
        label: expression,
      });
    }
  }

  return badges;
}

export function applyActiveFilterBadgeRemoval(
  conditions: readonly EditableFilterCondition[],
  conditionId: string,
  _kind: ActiveFilterBadgeKind,
): readonly EditableFilterCondition[] {
  const nextConditions = conditions.filter(
    (condition) => condition.id !== conditionId,
  );

  return nextConditions.length > 0 ? nextConditions : [createEmptyCondition()];
}

export function hasApplicableSearchConditions(
  conditions: readonly EditableFilterCondition[],
  context: FilterConditionContext,
): boolean {
  return conditions.some(
    (condition) => toFilterCondition(condition, context) !== undefined,
  );
}

const DATE_SHORTCUT_CHIP_LABELS: Readonly<
  Record<Exclude<DateShortcutId, "" | "custom">, string>
> = {
  today: "Today",
  yesterday: "Yesterday",
  last7Days: "Last 7 Days",
  last30Days: "Last 30 Days",
  thisMonth: "This Month",
  lastMonth: "Last Month",
};

function formatChipExpression(
  condition: EditableFilterCondition,
  propertyMetadata: FilterablePropertyMetadata | undefined,
): string {
  const propertyAlias = condition.propertyAlias.trim();
  const propertyName = getPropertyDisplayName(propertyMetadata, propertyAlias);
  const filterType = getPropertyFilterType(propertyMetadata);
  const isSystemDate = usesDateRangeFields(propertyMetadata, propertyAlias);
  const operator = condition.filterOperator;

  if (!operator) {
    return "";
  }

  const shortcutLabel = formatChipDateShortcutLabel(
    condition,
    propertyAlias,
    propertyName,
    operator,
    isSystemDate,
    filterType,
  );

  if (shortcutLabel) {
    return shortcutLabel;
  }

  if (operator === "IsEmpty" || operator === "IsNotEmpty") {
    return `${propertyName} ${formatChipOperatorPhrase(operator, filterType, isSystemDate)}`;
  }

  if (isSystemDate) {
    return formatSystemDateExpression(condition, propertyName, operator);
  }

  if (filterType === "Date") {
    if (operator === "Between") {
      const fromDate = condition.fromDate.trim();
      const toDate = condition.toDate.trim();

      if (fromDate && toDate) {
        return `${propertyName} between ${fromDate} and ${toDate}`;
      }
    }

    return `${propertyName} ${formatChipOperatorPhrase(operator, filterType, false)} ${condition.propertyValue}`;
  }

  const valueDisplay = formatChipValueDisplay(
    condition.propertyValue,
    propertyMetadata,
  );

  return `${propertyName} ${formatChipOperatorPhrase(operator, filterType, isSystemDate)} ${valueDisplay}`;
}

function formatChipDateShortcutLabel(
  condition: EditableFilterCondition,
  propertyAlias: string,
  propertyName: string,
  operator: FilterOperator,
  isSystemDate: boolean,
  filterType: PropertyFilterType,
): string | undefined {
  if (operator !== "Between" || (filterType !== "Date" && !isSystemDate)) {
    return undefined;
  }

  const shortcut = detectDateShortcut(
    condition.fromDate,
    condition.toDate,
    condition.propertyValue,
    operator,
    isSystemDate ? "system" : "custom",
  );

  if (!shortcut || shortcut === "custom") {
    return undefined;
  }

  const shortcutLabel = DATE_SHORTCUT_CHIP_LABELS[shortcut];

  if (propertyAlias === UPDATED_DATE_PROPERTY_ALIAS) {
    return `Updated ${shortcutLabel}`;
  }

  if (propertyAlias === CREATED_DATE_PROPERTY_ALIAS) {
    return `Created ${shortcutLabel}`;
  }

  return `${propertyName} ${shortcutLabel}`;
}

function formatChipValueDisplay(
  propertyValue: string,
  propertyMetadata: FilterablePropertyMetadata | undefined,
): string {
  const filterType = getPropertyFilterType(propertyMetadata);

  if (filterType === "MultiSelect") {
    return parseMultiSelectValue(propertyValue)
      .map(
        (value) =>
          propertyMetadata?.options?.find((option) => option.value === value)
            ?.label ?? value,
      )
      .join(", ");
  }

  if (filterType === "Dropdown") {
    const label =
      propertyMetadata?.options?.find((option) => option.value === propertyValue)
        ?.label ?? propertyValue;

    return formatChipBooleanValue(label) ?? label;
  }

  return formatChipBooleanValue(propertyValue) ?? propertyValue;
}

function hasDisplayableFilterValue(
  condition: EditableFilterCondition,
  propertyMetadata: FilterablePropertyMetadata | undefined,
): boolean {
  const operator = condition.filterOperator;

  if (!operator) {
    return false;
  }

  if (operator === "IsEmpty" || operator === "IsNotEmpty") {
    return true;
  }

  if (usesDateRangeFields(propertyMetadata, condition.propertyAlias)) {
    if (operator === "Between") {
      return Boolean(condition.fromDate.trim() || condition.toDate.trim());
    }

    if (operator === "LessThan" || operator === "LessThanOrEqual") {
      return condition.toDate.trim() !== "";
    }

    return condition.fromDate.trim() !== "";
  }

  if (getPropertyFilterType(propertyMetadata) === "Date") {
    if (operator === "Between") {
      return Boolean(condition.fromDate.trim() && condition.toDate.trim());
    }

    return condition.propertyValue.trim() !== "";
  }

  return condition.propertyValue.trim() !== "";
}


function formatSystemDateExpression(
  condition: EditableFilterCondition,
  propertyName: string,
  operator: FilterOperator,
): string {
  if (operator === "Between") {
    const fromDate = condition.fromDate.trim();
    const toDate = condition.toDate.trim();

    if (fromDate && toDate) {
      return `${propertyName} between ${fromDate} and ${toDate}`;
    }

    if (fromDate) {
      return `${propertyName} on or after ${fromDate}`;
    }

    if (toDate) {
      return `${propertyName} on or before ${toDate}`;
    }

    return `${propertyName} between`;
  }

  const usesEndDate =
    operator === "LessThan" || operator === "LessThanOrEqual";
  const dateValue = usesEndDate
    ? condition.toDate.trim()
    : condition.fromDate.trim();

  return `${propertyName} ${formatChipOperatorPhrase(operator, "Date", true)} ${dateValue}`;
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

function formatChipOperatorPhrase(
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
      return isDate ? "on" : "=";
    case "NotEquals":
      return isDate ? "not on" : "≠";
    case "GreaterThan":
      return isDate ? "after" : ">";
    case "GreaterThanOrEqual":
      return isDate ? "on or after" : "≥";
    case "LessThan":
      return isDate ? "before" : "<";
    case "LessThanOrEqual":
      return isDate ? "on or before" : "≤";
    case "Between":
      return "between";
    case "IsEmpty":
      return "is empty";
    case "IsNotEmpty":
      return "is not empty";
    default:
      return operator;
  }
}

function formatChipBooleanValue(value: string): string | undefined {
  const normalized = value.trim().toLowerCase();

  if (normalized === "true" || normalized === "1") {
    return "True";
  }

  if (normalized === "false" || normalized === "0") {
    return "False";
  }

  return undefined;
}

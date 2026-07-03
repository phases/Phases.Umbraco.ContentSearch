import type {
  SearchCondition,
  SearchConditionOperator,
  SearchMatchMode,
} from "../models/search-builder.models.js";
import { createEmptySearchCondition } from "../models/search-builder.models.js";
import { SEARCH_BUILDER_UI_MAX_CONDITIONS, VALUELESS_OPERATORS } from "../constants/search-builder.constants.js";
import type { SearchPropertyMetadata } from "../models/metadata.models.js";
import { classifyPropertySearchType } from "./property-search-type.utils.js";

export function getConditionConnectorLabel(
  index: number,
  matchMode: SearchMatchMode,
): string {
  if (index === 0) {
    return "WHERE";
  }

  return matchMode === "all" ? "AND" : "OR";
}

export function cloneSearchCondition(condition: SearchCondition): SearchCondition {
  return {
    id: crypto.randomUUID(),
    contentTypeAlias: condition.contentTypeAlias,
    propertyAlias: condition.propertyAlias,
    operator: condition.operator,
    value: condition.value,
  };
}

export function normalizeConditionsForBuilder(
  conditions: readonly SearchCondition[],
  maxConditions = SEARCH_BUILDER_UI_MAX_CONDITIONS,
): SearchCondition[] {
  if (maxConditions <= 0) {
    return [];
  }

  if (conditions.length === 0) {
    return [createEmptySearchCondition()];
  }

  return conditions.slice(0, maxConditions).map((condition) => ({
    ...condition,
    id: condition.id || crypto.randomUUID(),
  }));
}

export function createDefaultBuilderConditions(): SearchCondition[] {
  return normalizeConditionsForBuilder([]);
}

export function isSearchConditionEmpty(condition: SearchCondition): boolean {
  return (
    !condition.contentTypeAlias.trim() &&
    !condition.propertyAlias.trim() &&
    !condition.operator &&
    !condition.value.trim()
  );
}

export function operatorRequiresValue(operator: SearchConditionOperator | string): boolean {
  return Boolean(operator) && !VALUELESS_OPERATORS.has(operator as SearchConditionOperator);
}

export function isTrueFalseProperty(
  property: SearchPropertyMetadata | undefined,
): boolean {
  return classifyPropertySearchType(property) === "boolean";
}

export function isDateProperty(
  property: SearchPropertyMetadata | undefined,
): boolean {
  return classifyPropertySearchType(property) === "date";
}

export function operatorRequiresRangeValue(
  operator: SearchConditionOperator | string,
): boolean {
  return operator === "between";
}

export function normalizeLegacyDateOperator(
  operator: SearchConditionOperator | string,
): SearchConditionOperator {
  if (operator === "before") {
    return "lessThan";
  }

  if (operator === "after") {
    return "greaterThan";
  }

  return operator as SearchConditionOperator;
}

export function reorderConditions(
  conditions: readonly SearchCondition[],
  fromIndex: number,
  toIndex: number,
): SearchCondition[] {
  if (
    fromIndex === toIndex ||
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= conditions.length ||
    toIndex >= conditions.length
  ) {
    return [...conditions];
  }

  const next = [...conditions];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

export function toSelectOptions(
  options: ReadonlyArray<{ value: string; label: string }>,
  selectedValue: string,
  placeholder: string,
) {
  return [
    { name: placeholder, value: "", selected: !selectedValue },
    ...options.map((option) => ({
      name: option.label,
      value: option.value,
      selected: option.value === selectedValue,
    })),
  ];
}

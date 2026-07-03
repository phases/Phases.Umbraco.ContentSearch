import type { SearchCondition } from "../models/search-builder.models.js";
import type { SearchPropertyMetadata } from "../models/metadata.models.js";
import { isDateRangeValueComplete } from "./search-condition-date-value.utils.js";
import {
  isDateProperty,
  operatorRequiresRangeValue,
  operatorRequiresValue,
} from "./search-condition.utils.js";

export type SearchConditionField =
  | "contentTypeAlias"
  | "propertyAlias"
  | "operator"
  | "value";

export type SearchConditionFieldErrors = Partial<
  Record<SearchConditionField, string>
>;

export interface SearchConditionValidationError {
  readonly conditionId: string;
  readonly field: SearchConditionField;
  readonly message: string;
}

export interface SearchValidationResult {
  readonly isValid: boolean;
  readonly errors: readonly SearchConditionValidationError[];
}

export function getFieldErrorsByConditionId(
  errors: readonly SearchConditionValidationError[],
): Record<string, SearchConditionFieldErrors> {
  const map: Record<string, SearchConditionFieldErrors> = {};

  for (const error of errors) {
    map[error.conditionId] ??= {};
    map[error.conditionId][error.field] = error.message;
  }

  return map;
}

export function validateSearchConditions(
  conditions: readonly SearchCondition[],
  properties: readonly SearchPropertyMetadata[] = [],
): SearchValidationResult {
  if (conditions.length === 0) {
    return { isValid: false, errors: [] };
  }

  const errors: SearchConditionValidationError[] = [];

  for (const condition of conditions) {
    if (!condition.contentTypeAlias) {
      errors.push({
        conditionId: condition.id,
        field: "contentTypeAlias",
        message: "Choose a content type",
      });
    }

    if (!condition.propertyAlias) {
      errors.push({
        conditionId: condition.id,
        field: "propertyAlias",
        message: "Choose a property",
      });
    }

    if (!condition.operator) {
      errors.push({
        conditionId: condition.id,
        field: "operator",
        message: "Choose an operator",
      });
    }

    if (operatorRequiresValue(condition.operator)) {
      const property = properties.find(
        (item) => item.alias === condition.propertyAlias,
      );
      const valueMessage = getValueValidationMessage(
        condition,
        property,
      );

      if (valueMessage) {
        errors.push({
          conditionId: condition.id,
          field: "value",
          message: valueMessage,
        });
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

function getValueValidationMessage(
  condition: SearchCondition,
  property: SearchPropertyMetadata | undefined,
): string | undefined {
  const value = condition.value.trim();

  if (
    operatorRequiresRangeValue(condition.operator) &&
    isDateProperty(property)
  ) {
    return isDateRangeValueComplete(value)
      ? undefined
      : "Choose a start and end date";
  }

  return value ? undefined : "Enter a value";
}

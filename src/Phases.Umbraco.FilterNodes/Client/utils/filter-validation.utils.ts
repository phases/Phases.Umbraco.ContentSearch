import type { EditableFilterCondition } from "../controllers/filter-nodes-workspace.models.js";
import type { FilterOperator, FilterType } from "../models/filter-models.js";
import type { FilterConditionContext } from "./active-filter.utils.js";
import {
  isEntireSiteSearchScope,
  isEntireSiteSystemPropertyAlias,
  isReservedContentTypeAlias,
  isBlockContainerProperty,
  isBlockGridContainerProperty,
  isPropertyFilterable,
  parseMultiSelectValue,
  resolvePropertyMetadata,
  usesDateRangeFields,
  getPropertyFilterType,
} from "./filter-condition.utils.js";

export type FilterConditionField =
  | "contentTypeAlias"
  | "propertyAlias"
  | "filterOperator"
  | "propertyValue"
  | "dateRange"
  | "fromDate"
  | "toDate";

export interface FilterConditionFieldError {
  readonly conditionId: string;
  readonly field: FilterConditionField;
  readonly message: string;
}

export interface FilterValidationResult {
  readonly isValid: boolean;
  readonly errors: readonly FilterConditionFieldError[];
  readonly firstError?: FilterConditionFieldError;
  readonly message?: string;
}

export type FilterConditionFieldErrors = Partial<
  Record<FilterConditionField, string>
>;

export function supportsAnyFilterMode(
  filterType: FilterType,
  conditions: readonly EditableFilterCondition[],
): boolean {
  if (filterType !== "Any" || conditions.length <= 1) {
    return true;
  }

  return !conditions.some(
    (condition) =>
      condition.filterOperator === "IsEmpty" ||
      condition.filterOperator === "IsNotEmpty",
  );
}

export function validateFilterConditions(
  conditions: readonly EditableFilterCondition[],
  context: FilterConditionContext,
  filterType: FilterType = "All",
): FilterValidationResult {
  if (conditions.length === 0) {
    return {
      isValid: false,
      errors: [],
    };
  }

  const errors: FilterConditionFieldError[] = [];

  for (const condition of conditions) {
    errors.push(...validateFilterCondition(condition, context));
  }

  if (!supportsAnyFilterMode(filterType, conditions)) {
    return {
      isValid: false,
      errors,
      message:
        "Any condition cannot be used with multiple Is Empty / Is Not Empty filters. Switch to All conditions instead.",
    };
  }

  return {
    isValid: errors.length === 0,
    errors,
    firstError: errors[0],
  };
}

export function getFieldErrorsByConditionId(
  errors: readonly FilterConditionFieldError[],
): Readonly<Record<string, FilterConditionFieldErrors>> {
  const grouped: Record<string, FilterConditionFieldErrors> = {};

  for (const error of errors) {
    grouped[error.conditionId] = {
      ...grouped[error.conditionId],
      [error.field]: error.message,
    };
  }

  return grouped;
}

function validateFilterCondition(
  condition: EditableFilterCondition,
  context: FilterConditionContext,
): FilterConditionFieldError[] {
  const errors: FilterConditionFieldError[] = [];
  const entireSite = isEntireSiteSearchScope(context.searchScope);
  const contentTypeAlias = condition.contentTypeAlias.trim();
  const propertyAlias = condition.propertyAlias.trim();
  const filterOperator = condition.filterOperator;

  if (!entireSite) {
    if (!contentTypeAlias || isReservedContentTypeAlias(contentTypeAlias)) {
      errors.push({
        conditionId: condition.id,
        field: "contentTypeAlias",
        message: "Select a content type.",
      });
    }
  }

  if (!propertyAlias) {
    errors.push({
      conditionId: condition.id,
      field: "propertyAlias",
      message: "Select a property.",
    });
    return errors;
  }

  if (entireSite && !isEntireSiteSystemPropertyAlias(propertyAlias)) {
    errors.push({
      conditionId: condition.id,
      field: "propertyAlias",
      message: "Select a valid system property.",
    });
    return errors;
  }

  if (!filterOperator) {
    errors.push({
      conditionId: condition.id,
      field: "filterOperator",
      message: "Select an operator.",
    });
    return errors;
  }

  const propertyMetadata = resolvePropertyMetadata(
    context.propertyMetadataByContentType,
    contentTypeAlias,
    propertyAlias,
    context.searchScope,
    context.contentTypes,
  );

  if (propertyMetadata && !isPropertyFilterable(propertyMetadata)) {
    errors.push({
      conditionId: condition.id,
      field: "propertyAlias",
      message:
        "This block property cannot be searched yet. Ask an administrator to enable block property search.",
    });
    return errors;
  }

  if (
    propertyMetadata &&
    isBlockContainerProperty(propertyMetadata) &&
    !isBlockGridContainerProperty(propertyMetadata) &&
    filterOperator !== "IsEmpty" &&
    filterOperator !== "IsNotEmpty"
  ) {
    errors.push({
      conditionId: condition.id,
      field: "filterOperator",
      message:
        "Block properties only support Is empty and Is not empty when checking whether blocks exist.",
    });
    return errors;
  }

  errors.push(
    ...validateFilterValue(
      condition,
      context,
      propertyAlias,
      filterOperator,
    ),
  );

  return errors;
}

function validateFilterValue(
  condition: EditableFilterCondition,
  context: FilterConditionContext,
  propertyAlias: string,
  filterOperator: FilterOperator,
): FilterConditionFieldError[] {
  if (filterOperator === "IsEmpty" || filterOperator === "IsNotEmpty") {
    return [];
  }

  const propertyMetadata = resolvePropertyMetadata(
    context.propertyMetadataByContentType,
    condition.contentTypeAlias.trim(),
    propertyAlias,
    context.searchScope,
    context.contentTypes,
  );

  if (usesDateRangeFields(propertyMetadata, propertyAlias)) {
    return validateSystemDateValue(condition, filterOperator);
  }

  if (
    getPropertyFilterType(propertyMetadata) === "Date" &&
    filterOperator === "Between"
  ) {
    return validateDateRangeValue(condition);
  }

  if (getPropertyFilterType(propertyMetadata) === "Date") {
    return validateSingleDatePropertyValue(condition);
  }

  if (getPropertyFilterType(propertyMetadata) === "MultiSelect") {
    return validateMultiSelectValue(condition);
  }

  return validateTextValue(condition);
}

function validateSystemDateValue(
  condition: EditableFilterCondition,
  filterOperator: FilterOperator,
): FilterConditionFieldError[] {
  if (filterOperator === "Between") {
    return validateDateRangeValue(condition);
  }

  if (
    filterOperator === "LessThan" ||
    filterOperator === "LessThanOrEqual"
  ) {
    if (!condition.toDate.trim()) {
      return [
        {
          conditionId: condition.id,
          field: "toDate",
          message: "Enter an end date.",
        },
      ];
    }

    return [];
  }

  if (!condition.fromDate.trim()) {
    return [
      {
        conditionId: condition.id,
        field: "fromDate",
        message: "Enter a start date.",
      },
    ];
  }

  return [];
}

function validateDateRangeValue(
  condition: EditableFilterCondition,
): FilterConditionFieldError[] {
  const fromDate = condition.fromDate.trim();
  const toDate = condition.toDate.trim();

  if (!fromDate && !toDate) {
    return [
      {
        conditionId: condition.id,
        field: "dateRange",
        message: "Select a date range.",
      },
    ];
  }

  const errors: FilterConditionFieldError[] = [];

  if (!fromDate) {
    errors.push({
      conditionId: condition.id,
      field: "fromDate",
      message: "Enter a start date.",
    });
  }

  if (!toDate) {
    errors.push({
      conditionId: condition.id,
      field: "toDate",
      message: "Enter an end date.",
    });
  }

  return errors;
}

function validateSingleDatePropertyValue(
  condition: EditableFilterCondition,
): FilterConditionFieldError[] {
  if (!condition.propertyValue.trim()) {
    return [
      {
        conditionId: condition.id,
        field: "propertyValue",
        message: "Enter a date.",
      },
    ];
  }

  return [];
}

function validateMultiSelectValue(
  condition: EditableFilterCondition,
): FilterConditionFieldError[] {
  if (parseMultiSelectValue(condition.propertyValue).length === 0) {
    return [
      {
        conditionId: condition.id,
        field: "propertyValue",
        message: "Select at least one value.",
      },
    ];
  }

  return [];
}

function validateTextValue(
  condition: EditableFilterCondition,
): FilterConditionFieldError[] {
  if (!condition.propertyValue.trim()) {
    return [
      {
        conditionId: condition.id,
        field: "propertyValue",
        message: "Enter a value.",
      },
    ];
  }

  return [];
}

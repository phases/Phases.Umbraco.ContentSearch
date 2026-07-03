import type { EditableFilterOperator } from "../../models/filter-models.js";

/**
 * Local value model for a single filter condition row.
 */
export interface FilterConditionRowValue {
  contentTypeAlias: string;
  propertyAlias: string;
  filterOperator: EditableFilterOperator;
  propertyValue: string;
  fromDate: string;
  toDate: string;
}

export const FILTER_CONDITION_CHANGE = "filter-condition-change";

export const FILTER_CONDITION_LOAD_PROPERTIES = "filter-condition-load-properties";

export const FILTER_CONDITION_REMOVE = "filter-condition-remove";

export type FilterConditionChangeEvent = CustomEvent<
  FilterConditionRowValue & { conditionId: string }
>;

export type FilterConditionLoadPropertiesEvent = CustomEvent<{
  conditionId: string;
  contentTypeAlias: string;
}>;

export type FilterConditionRemoveEvent = CustomEvent<{
  conditionId: string;
}>;

export function createDefaultFilterConditionRowValue(): FilterConditionRowValue {
  return {
    contentTypeAlias: "",
    propertyAlias: "",
    filterOperator: "",
    propertyValue: "",
    fromDate: "",
    toDate: "",
  };
}

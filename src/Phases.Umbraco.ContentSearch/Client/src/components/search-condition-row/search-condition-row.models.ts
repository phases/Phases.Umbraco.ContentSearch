import type { SearchCondition } from "../../models/search-builder.models.js";

export const SEARCH_CONDITION_CHANGE = "search-condition-change";
export const SEARCH_CONDITION_REMOVE = "search-condition-remove";
export const SEARCH_CONDITION_DUPLICATE = "search-condition-duplicate";
export const SEARCH_CONDITION_REORDER = "search-condition-reorder";

export type SearchConditionRowValue = Omit<SearchCondition, "id">;

export type SearchConditionChangeEvent = CustomEvent<
  SearchConditionRowValue & { conditionId: string }
>;

export type SearchConditionRemoveEvent = CustomEvent<{ conditionId: string }>;

export type SearchConditionDuplicateEvent = CustomEvent<{ conditionId: string }>;

export type SearchConditionReorderEvent = CustomEvent<{
  conditionId: string;
  direction: "up" | "down";
}>;

export function createDefaultSearchConditionRowValue(): SearchConditionRowValue {
  return {
    contentTypeAlias: "",
    propertyAlias: "",
    operator: "",
    value: "",
  };
}

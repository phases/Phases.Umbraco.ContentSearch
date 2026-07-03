import { VALUELESS_SEARCH_OPERATORS } from "./property-operator.constants.js";

export const MAX_SEARCH_CONDITIONS = 25;

/**
 * Active UI limit while the builder is simplified to one condition.
 * Raise to {@link MAX_SEARCH_CONDITIONS} when multi-condition UI is re-enabled.
 */
export const SEARCH_BUILDER_UI_MAX_CONDITIONS = 1;

export const SEARCH_BUILDER_SINGLE_CONDITION_MODE =
  SEARCH_BUILDER_UI_MAX_CONDITIONS === 1;

export const SEARCH_MATCH_MODE_OPTIONS: ReadonlyArray<{
  value: "all" | "any";
  label: string;
}> = [
  { value: "all", label: "Match all" },
  { value: "any", label: "Match any" },
];

export const VALUELESS_OPERATORS = VALUELESS_SEARCH_OPERATORS;

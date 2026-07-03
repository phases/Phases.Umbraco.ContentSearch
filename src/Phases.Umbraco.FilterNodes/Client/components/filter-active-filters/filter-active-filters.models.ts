import type { ActiveFilterBadgeKind } from "../../utils/active-filter.utils.js";

export const FILTER_ACTIVE_FILTERS_REMOVE = "filter-active-filters-remove";

export type FilterActiveFiltersRemoveEvent = CustomEvent<{
  conditionId: string;
  kind: ActiveFilterBadgeKind;
}>;

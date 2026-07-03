import type { EditableFilterCondition } from "../controllers/filter-nodes-workspace.models.js";
import { isEntireSiteSearchScope } from "./filter-condition.utils.js";
import type { SearchScope } from "../models/filter-models.js";

export function getBuilderHelperText(
  conditions: readonly EditableFilterCondition[],
  searchScope: SearchScope,
): string {
  const primary = conditions[0];

  if (!primary) {
    return "Add a condition to start building your search.";
  }

  if (!isEntireSiteSearchScope(searchScope) && !primary.contentTypeAlias.trim()) {
    return "Choose a content type for your first condition.";
  }

  if (!primary.propertyAlias.trim()) {
    return "Choose which field to search on.";
  }

  if (!primary.filterOperator) {
    return "Choose how to compare the field value.";
  }

  return "Complete the value, then click Search.";
}

export function conditionsMatch(
  left: readonly EditableFilterCondition[],
  right: readonly EditableFilterCondition[],
): boolean {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((condition, index) => {
    const other = right[index];

    return (
      condition.contentTypeAlias === other.contentTypeAlias &&
      condition.propertyAlias === other.propertyAlias &&
      condition.filterOperator === other.filterOperator &&
      condition.propertyValue === other.propertyValue &&
      condition.fromDate === other.fromDate &&
      condition.toDate === other.toDate
    );
  });
}

export function cloneConditions(
  conditions: readonly EditableFilterCondition[],
): readonly EditableFilterCondition[] {
  return conditions.map((condition) => ({ ...condition }));
}

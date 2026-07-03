import {
  OPERATORS_BY_PROPERTY_SEARCH_TYPE,
  type SearchOperatorOption,
} from "../constants/property-operator.constants.js";
import type { SearchPropertyMetadata } from "../models/metadata.models.js";
import { classifyPropertySearchType } from "./property-search-type.utils.js";

export function formatOperatorDisplayLabel(label: string): string {
  if (!label) {
    return label;
  }

  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function getOperatorOptionsForProperty(
  property: SearchPropertyMetadata | undefined,
): readonly SearchOperatorOption[] {
  const searchType = classifyPropertySearchType(property);
  return OPERATORS_BY_PROPERTY_SEARCH_TYPE[searchType].map((option) => ({
    ...option,
    label: formatOperatorDisplayLabel(option.label),
  }));
}

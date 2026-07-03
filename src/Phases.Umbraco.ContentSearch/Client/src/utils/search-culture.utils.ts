import type { SearchPropertyMetadata } from "../models/metadata.models.js";
import {
  PROPERTY_CULTURE_INVARIANT_LABEL,
  PROPERTY_CULTURE_VARIANT_LABEL,
} from "../constants/search-culture.constants.js";
import type { LanguageListItem, SearchCultureMode } from "../models/search-culture.models.js";
import {
  SEARCH_CULTURE_ALL_LABEL,
  SEARCH_CULTURE_CURRENT_LABEL,
  SEARCH_CULTURE_SPECIFIC_LABEL,
} from "../constants/search-culture.constants.js";

export function getPropertyCultureLabel(property: SearchPropertyMetadata): string {
  return property.variesByCulture
    ? PROPERTY_CULTURE_VARIANT_LABEL
    : PROPERTY_CULTURE_INVARIANT_LABEL;
}

export function formatCultureDisplayName(
  culture: string,
  languages: readonly LanguageListItem[],
): string {
  const normalizedCulture = culture.trim();

  if (!normalizedCulture) {
    return "—";
  }

  const language = languages.find(
    (item) => item.isoCode.localeCompare(normalizedCulture, undefined, { sensitivity: "accent" }) === 0,
  );

  return language?.name ?? normalizedCulture;
}

export function formatSearchCultureSummary(
  searchCultureMode: SearchCultureMode,
  culture: string,
  languages: readonly LanguageListItem[],
): string {
  switch (searchCultureMode) {
    case "AllCultures":
      return SEARCH_CULTURE_ALL_LABEL;
    case "CurrentCulture":
      return culture
        ? `${SEARCH_CULTURE_CURRENT_LABEL}: ${formatCultureDisplayName(culture, languages)}`
        : SEARCH_CULTURE_CURRENT_LABEL;
    case "SpecificCulture":
      return culture
        ? formatCultureDisplayName(culture, languages)
        : SEARCH_CULTURE_SPECIFIC_LABEL;
    default:
      return SEARCH_CULTURE_ALL_LABEL;
  }
}

export function shouldShowMatchedCultureColumn(
  searchCultureMode: SearchCultureMode,
  results: ReadonlyArray<{ matchedCulture?: string | null }>,
): boolean {
  return (
    searchCultureMode !== "AllCultures" ||
    results.some((result) => Boolean(result.matchedCulture?.trim()))
  );
}

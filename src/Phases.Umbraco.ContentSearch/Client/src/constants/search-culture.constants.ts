import type { SearchCultureMode } from "../models/search-culture.models.js";

export const SEARCH_CULTURE_LABEL = "Culture";

export const SEARCH_CULTURE_LANGUAGE_LABEL = "Language";

export const SEARCH_CULTURE_ALL_LABEL = "All cultures";

export const SEARCH_CULTURE_CURRENT_LABEL = "Current culture";

export const SEARCH_CULTURE_SPECIFIC_LABEL = "Specific culture";

export const PROPERTY_CULTURE_INVARIANT_LABEL = "Invariant";

export const PROPERTY_CULTURE_VARIANT_LABEL = "Variant";

export const RESULTS_MATCHED_CULTURE_COLUMN_LABEL = "Matched culture";

export const SEARCH_CULTURE_MODE_OPTIONS: ReadonlyArray<{
  value: SearchCultureMode;
  label: string;
}> = [
  { value: "AllCultures", label: SEARCH_CULTURE_ALL_LABEL },
  { value: "CurrentCulture", label: SEARCH_CULTURE_CURRENT_LABEL },
  { value: "SpecificCulture", label: SEARCH_CULTURE_SPECIFIC_LABEL },
];

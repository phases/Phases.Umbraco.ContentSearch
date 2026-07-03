/** How culture-variant properties are searched in Examine. */
export type SearchCultureMode =
  | "AllCultures"
  | "CurrentCulture"
  | "SpecificCulture";

export interface LanguageListItem {
  readonly isoCode: string;
  readonly name: string;
}

export interface LanguageListResponse {
  readonly languages: readonly LanguageListItem[];
}

export interface SearchCultureSelection {
  readonly searchCultureMode: SearchCultureMode;
  readonly culture: string;
}

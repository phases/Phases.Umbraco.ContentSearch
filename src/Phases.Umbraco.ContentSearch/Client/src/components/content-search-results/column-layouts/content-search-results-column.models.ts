export interface ContentSearchNameColumnValue {
  readonly name: string;
  readonly editPath: string;
  readonly highlightTerms?: readonly string[];
}

export interface ContentSearchContentTypeColumnValue {
  readonly name: string;
  readonly alias?: string;
}

export interface ContentSearchActionsColumnValue {
  readonly url?: string;
  readonly udi?: string;
  readonly key: string;
  readonly nodeId: number;
  /** When false, the open-website action is omitted (URL column is visible). */
  readonly showOpenWebsite?: boolean;
}

export interface ContentSearchMatchColumnValue {
  readonly matches: readonly ContentSearchMatchColumnItem[];
}

export interface ContentSearchMatchColumnItem {
  readonly propertyName: string;
  readonly operatorLabel?: string | null;
  readonly snippet?: string | null;
  readonly highlightTerms?: readonly string[];
}

export type { ContentSearchPathColumnValue } from "../../../utils/content-path.utils.js";
export type { ContentSearchDateColumnValue } from "../../../utils/content-date.utils.js";

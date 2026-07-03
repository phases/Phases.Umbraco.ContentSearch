import type { NameHighlightSegment } from "../../../utils/filter-results-highlight.utils.js";

export interface FilterResultsNameColumnValue {
  readonly name: string;
  readonly editPath: string;
  readonly nameSegments: readonly NameHighlightSegment[];
}
export interface FilterResultsActionsColumnValue {
  readonly editPath: string;
  readonly url?: string;
}

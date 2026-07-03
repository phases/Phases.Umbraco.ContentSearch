export interface ContentSearchResultRow {
  readonly id: number;
  readonly key: string;
  readonly name: string;
  readonly contentTypeAlias?: string | null;
  readonly path?: string | null;
  readonly pathDisplay?: string | null;
  readonly udi?: string | null;
  readonly createDate?: string | null;
  readonly updateDate?: string | null;
  readonly url?: string | null;
  readonly urlDisplay?: string | null;
  readonly matchedCulture?: string | null;
  readonly matchedFields?: readonly ContentSearchMatchInfo[];
}

export interface ContentSearchMatchInfo {
  readonly propertyAlias: string;
  readonly propertyName: string;
  readonly operatorLabel?: string | null;
  readonly snippet?: string | null;
  readonly highlightTerms?: readonly string[];
}

export interface ContentSearchResultsState {
  readonly hasSearched: boolean;
  readonly loading: boolean;
  readonly results: readonly ContentSearchResultRow[];
  readonly totalCount: number;
  readonly executionTimeMs?: number | null;
}

export function createInitialResultsState(): ContentSearchResultsState {
  return {
    hasSearched: false,
    loading: false,
    results: [],
    totalCount: 0,
    executionTimeMs: null,
  };
}

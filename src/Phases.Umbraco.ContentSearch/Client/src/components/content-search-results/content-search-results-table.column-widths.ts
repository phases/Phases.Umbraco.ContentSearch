import type { UmbTableColumn } from "@umbraco-cms/backoffice/components";
import {
  RESULTS_TABLE_COLUMN_WIDTHS_STORAGE_KEY,
  RESULTS_TABLE_DEFAULT_COLUMN_WIDTHS_PX,
  RESULTS_TABLE_MIN_RESIZABLE_COLUMN_WIDTH_PX,
  RESULTS_TABLE_NAME_MIN_WIDTH_PX,
  RESULTS_TABLE_RESIZABLE_COLUMNS,
  getResultsTableFixedColumnWidthPx,
  isResultsTableFixedWidthColumn,
} from "./content-search-results-table.constants.js";
import type { ContentSearchResultsGridColumn } from "./content-search-results.models.js";

export type ResultsTableColumnWidths = Readonly<Record<string, number>>;

export function loadPersistedColumnWidths(): ResultsTableColumnWidths {
  try {
    const raw = localStorage.getItem(RESULTS_TABLE_COLUMN_WIDTHS_STORAGE_KEY);
    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const widths: Record<string, number> = {};

    for (const [alias, value] of Object.entries(parsed)) {
      if (typeof value !== "number" || !Number.isFinite(value)) {
        continue;
      }

      if (!RESULTS_TABLE_RESIZABLE_COLUMNS.has(alias as ContentSearchResultsGridColumn)) {
        continue;
      }

      widths[alias] = clampColumnWidth(alias, value);
    }

    return widths;
  } catch {
    return {};
  }
}

export function savePersistedColumnWidths(widths: ResultsTableColumnWidths): void {
  const persisted: Record<string, number> = {};

  for (const alias of RESULTS_TABLE_RESIZABLE_COLUMNS) {
    const width = widths[alias];
    if (width !== undefined) {
      persisted[alias] = width;
    }
  }

  try {
    localStorage.setItem(RESULTS_TABLE_COLUMN_WIDTHS_STORAGE_KEY, JSON.stringify(persisted));
  } catch {
    // Ignore storage failures (private mode, quota, etc.).
  }
}

export function resolveColumnWidthPx(
  alias: string,
  persistedWidths: ResultsTableColumnWidths,
): number | undefined {
  const fixedWidth = getResultsTableFixedColumnWidthPx(alias);
  if (fixedWidth !== undefined) {
    return fixedWidth;
  }

  const persisted = persistedWidths[alias];
  if (persisted !== undefined) {
    return clampColumnWidth(alias, persisted);
  }

  const fallback =
    RESULTS_TABLE_DEFAULT_COLUMN_WIDTHS_PX[alias as ContentSearchResultsGridColumn];
  return fallback !== undefined ? fallback : RESULTS_TABLE_MIN_RESIZABLE_COLUMN_WIDTH_PX;
}

export function applyColumnWidths(
  columns: readonly UmbTableColumn[],
  persistedWidths: ResultsTableColumnWidths,
): UmbTableColumn[] {
  return columns.map((column) => {
    const widthPx = resolveColumnWidthPx(column.alias, persistedWidths);

    return {
      ...column,
      width: `${widthPx}px`,
    };
  });
}

export function getResultsTableMinWidthPx(
  columns: readonly UmbTableColumn[],
  persistedWidths: ResultsTableColumnWidths,
): number {
  let total = 0;

  for (const column of columns) {
    const widthPx = resolveColumnWidthPx(column.alias, persistedWidths);
    if (widthPx !== undefined) {
      total += widthPx;
    }
  }

  return Math.max(total, RESULTS_TABLE_NAME_MIN_WIDTH_PX);
}

export function clampColumnWidth(alias: string, width: number): number {
  if (isResultsTableFixedWidthColumn(alias)) {
    return getResultsTableFixedColumnWidthPx(alias)!;
  }

  return Math.max(RESULTS_TABLE_MIN_RESIZABLE_COLUMN_WIDTH_PX, Math.round(width));
}

import { css } from "@umbraco-cms/backoffice/external/lit";
import {
  RESULTS_TABLE_ROW_HEIGHT_PX,
} from "./content-search-results-table.constants.js";
import { contentSearchResultsRowTokens } from "./content-search-results-row.tokens.js";

export const contentSearchResultsTableStyles = [
  contentSearchResultsRowTokens,
  css`
    :host {
      display: block;
      width: 100%;
      --results-table-row-height: ${RESULTS_TABLE_ROW_HEIGHT_PX}px;
    }

    uui-table {
      table-layout: fixed;
      width: 100%;
      min-width: var(--cs-results-table-min-width, 56rem);
      border-collapse: separate;
      border-spacing: 0;
      box-shadow: none;
      border: none;
      --uui-table-cell-height: var(--results-table-row-height);
      font-size: var(--uui-type-small-size);
    }

    uui-table-head {
      position: sticky;
      top: 0;
      z-index: 2;
      background-color: var(--uui-color-surface, #fff);
    }

    uui-table-head-cell {
      position: relative;
      height: var(--results-table-row-height);
      max-height: var(--results-table-row-height);
      font-size: var(--uui-type-small-size);
      font-weight: 600;
      color: var(--uui-color-text-alt);
      letter-spacing: 0.01em;
      border-bottom: 1px solid var(--uui-color-border, #d8d7d9);
      background: color-mix(in srgb, var(--uui-color-surface) 94%, var(--uui-color-border));
      vertical-align: middle;
    }

    uui-table-row {
      cursor: default;
      --results-table-row-bg: transparent;
    }

    uui-table-row:focus-within {
      outline: calc(2px * var(--uui-show-focus-outline, 1)) solid var(--uui-color-focus);
      outline-offset: -2px;
      z-index: 1;
    }

    uui-table-row:hover,
    uui-table-row:focus-within {
      --results-table-row-bg: color-mix(
        in srgb,
        var(--uui-color-surface-emphasis) 44%,
        var(--uui-color-surface)
      );
      --cs-results-action-opacity: 1;
      --cs-results-name-decoration: underline;
    }

    uui-table-row:hover uui-table-cell:first-of-type,
    uui-table-row:focus-within uui-table-cell:first-of-type {
      box-shadow: inset 3px 0 0
        color-mix(in srgb, var(--uui-color-interactive) 72%, transparent);
    }

    uui-table-cell {
      vertical-align: middle;
      height: var(--results-table-row-height);
      max-height: var(--results-table-row-height);
      border-bottom: 1px solid color-mix(in srgb, var(--uui-color-border) 55%, transparent);
      --uui-table-cell-padding: var(--uui-size-space-1) var(--uui-size-space-3);
      background: var(--results-table-row-bg, transparent);
      transition: background-color var(--cs-results-transition),
        box-shadow var(--cs-results-transition);
    }

    uui-table-cell umb-icon {
      vertical-align: middle;
      color: var(--uui-color-text-alt);
    }

    .results-table__header-cell {
      display: flex;
      align-items: center;
      min-width: 0;
      width: 100%;
      height: 100%;
    }

    .results-table__header-cell--actions {
      justify-content: flex-end;
    }

    .results-table__header-label {
      flex: 1 1 auto;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      line-height: 1.2;
    }

    .results-table__header-label--actions {
      flex: 1 1 auto;
      text-align: right;
    }

    .results-table__sort-button {
      display: inline-flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--uui-size-space-1);
      width: 100%;
      min-height: 0;
      padding: 0;
      border: none;
      background: transparent;
      color: inherit;
      font: inherit;
      line-height: 1.2;
      cursor: pointer;
      text-align: inherit;
    }

    .results-table__sort-button > span {
      flex: 1 1 auto;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    uui-table-head-cell:focus-within,
    uui-table-head-cell:hover {
      --uui-symbol-sort-hover: 1;
    }

    .results-table__resize-handle {
      position: absolute;
      top: 0;
      right: 0;
      width: 0.65rem;
      height: 100%;
      cursor: col-resize;
      touch-action: none;
      z-index: 2;
    }

    .results-table__resize-handle:focus-visible {
      outline: calc(2px * var(--uui-show-focus-outline, 1)) solid var(--uui-color-focus);
      outline-offset: -2px;
    }

    .results-table__resize-handle::after {
      content: "";
      position: absolute;
      top: 20%;
      bottom: 20%;
      right: 1px;
      width: 1px;
      background: color-mix(in srgb, var(--uui-color-border) 80%, transparent);
      opacity: 0;
      transition: opacity 140ms ease;
    }

    uui-table-head-cell:hover .results-table__resize-handle::after,
    .results-table__resize-handle:focus-visible::after,
    :host([resizing]) .results-table__resize-handle::after {
      opacity: 1;
    }

    :host([resizing]) {
      cursor: col-resize;
      user-select: none;
    }

    .results-table__cell-inner {
      display: flex;
      align-items: center;
      min-width: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }

    .results-table__cell-inner--actions {
      justify-content: flex-end;
      overflow: visible;
    }

    uui-table-head-cell.results-table__head-cell--actions,
    uui-table-cell.results-table__cell--actions {
      position: sticky;
      right: 0;
      z-index: 1;
      background: var(--results-table-row-bg, var(--uui-color-surface));
      box-shadow: -6px 0 10px -8px color-mix(in srgb, var(--uui-color-border-contrast, #000) 24%, transparent);
      transition: background-color var(--cs-results-transition),
        box-shadow var(--cs-results-transition);
    }

    uui-table-row:hover uui-table-cell.results-table__cell--actions,
    uui-table-row:focus-within uui-table-cell.results-table__cell--actions {
      box-shadow: -8px 0 12px -8px color-mix(in srgb, var(--uui-color-border-contrast, #000) 28%, transparent);
    }

    uui-table-cell.results-table__cell--actions {
      overflow: visible;
      --uui-table-cell-padding: var(--uui-size-space-1) var(--uui-size-space-2);
    }

    uui-table-head-cell.results-table__head-cell--actions {
      z-index: 3;
      background: color-mix(in srgb, var(--uui-color-surface) 94%, var(--uui-color-border));
    }
  `,
];

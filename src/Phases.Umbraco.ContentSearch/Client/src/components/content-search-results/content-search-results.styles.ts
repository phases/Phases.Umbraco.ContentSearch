import { css } from "@umbraco-cms/backoffice/external/lit";
import {
  contentSearchSectionHeaderStyles,
  contentSearchUiTokens,
} from "../../styles/content-search-ui.styles.js";

export const contentSearchResultsStyles = [
  contentSearchUiTokens,
  contentSearchSectionHeaderStyles,
  css`
    :host {
      display: block;
      width: 100%;
    }

    .results-grid {
      display: flex;
      flex-direction: column;
      gap: var(--uui-size-space-3);
      width: 100%;
      position: relative;
    }

    .results-grid__focus-anchor {
      position: absolute;
      top: 0;
      left: 0;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip: rect(0 0 0 0);
      white-space: nowrap;
    }

    .results-grid__focus-anchor:focus {
      outline: none;
    }

    .results-grid__header-copy {
      display: flex;
      flex-direction: column;
      gap: var(--uui-size-space-1);
      min-width: 0;
    }

    .results-grid__header-actions {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: flex-end;
      gap: var(--uui-size-space-2);
      flex: 0 0 auto;
      margin-left: auto;
    }

    .results-grid__header-meta {
      flex: 0 0 auto;
    }

    .results-grid__export-caret {
      margin-left: var(--uui-size-space-1);
    }

    .results-grid__meta {
      display: inline-flex;
      align-items: center;
      gap: var(--uui-size-space-2);
      min-height: 1.5rem;
      padding: 0 var(--uui-size-space-2);
      border-radius: 999px;
      background: var(--cs-surface-muted);
      color: var(--uui-color-text-alt);
      font-size: var(--uui-type-small-size);
      font-weight: 600;
      line-height: 1.3;
      white-space: nowrap;
    }

    .results-grid__meta-loader {
      width: 0.875rem;
      height: 0.875rem;
    }

    .results-grid__meta--loading {
      opacity: 1;
    }

    .results-grid__empty {
      display: block;
      width: 100%;
    }

    .results-grid--initial-loading .results-grid__empty {
      min-height: 12rem;
    }

    .results-grid__content {
      position: relative;
      min-height: 8rem;
    }

    .results-grid__placeholder {
      min-height: 12rem;
    }

    .results-grid__overlay {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--uui-size-space-3);
      z-index: 4;
      border-radius: var(--cs-radius-lg);
    }

    .results-grid__overlay::before {
      content: "";
      position: absolute;
      inset: 0;
      background: color-mix(in srgb, var(--uui-color-surface) 78%, transparent);
      backdrop-filter: blur(1px);
      border-radius: inherit;
    }

    .results-grid__overlay uui-loader {
      position: relative;
      width: 2.25rem;
      height: 2.25rem;
    }

    .results-grid__overlay-label {
      position: relative;
      margin: 0;
      color: var(--uui-color-text);
      font-size: var(--uui-type-default-size);
      font-weight: 600;
      line-height: 1.3;
    }

    .results-grid__options {
      display: flex;
      flex-direction: column;
      gap: var(--uui-size-space-3);
      font-size: var(--uui-type-small-size);
      color: var(--uui-color-text-alt);
      line-height: 1.3;
    }

    .results-grid__options-line {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      gap: var(--uui-size-space-2);
      margin: 0;
    }

    .results-grid__options-label {
      color: var(--uui-color-text);
      font-weight: 600;
      min-width: 4.5rem;
    }

    .results-grid__options-checkboxes {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(11rem, 1fr));
      gap: var(--uui-size-space-2) var(--uui-size-space-4);
    }

    .results-grid__options-checkboxes uui-checkbox {
      font-size: var(--uui-type-small-size);
    }

    .results-grid__table-shell {
      display: flex;
      flex-direction: column;
      position: relative;
      border-radius: var(--cs-radius-lg);
      border: 1px solid var(--cs-border-subtle);
      background: var(--uui-color-surface);
      box-shadow: var(--cs-shadow-sm);
      overflow: hidden;
    }

    .results-grid__table-scroll {
      overflow-x: auto;
      overflow-y: auto;
      max-height: min(68vh, 44rem);
      -webkit-overflow-scrolling: touch;
    }

    .results-grid__table-scroll content-search-results-table {
      display: block;
      width: 100%;
      min-width: max(100%, var(--cs-results-table-min-width, 56rem));
    }

    .results-grid__table-shell--loading {
      opacity: 0.72;
      pointer-events: none;
    }

    .results-grid__loading {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--uui-size-space-2);
      background: color-mix(in srgb, var(--uui-color-surface) 84%, transparent);
      backdrop-filter: blur(1px);
      z-index: 3;
    }

    .results-grid__loading uui-loader {
      width: 2rem;
      height: 2rem;
    }

    .results-grid__loading-label {
      margin: 0;
      color: var(--uui-color-text);
      font-size: var(--uui-type-default-size);
      font-weight: 600;
      line-height: 1.3;
    }

    .results-grid__pagination {
      display: flex;
      flex-direction: column;
      gap: var(--uui-size-space-3);
      padding: var(--uui-size-space-3) var(--cs-space-section);
      border-top: 1px solid var(--cs-border-subtle);
      background: color-mix(in srgb, var(--uui-color-surface) 96%, var(--uui-color-border));
    }

    .results-grid__pagination--loading {
      opacity: 0.72;
      pointer-events: none;
    }

    .results-grid__pagination-summary {
      margin: 0;
      color: var(--uui-color-text-alt);
      font-size: var(--uui-type-small-size);
      line-height: 1.3;
    }

    .results-grid__pagination-controls {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: var(--cs-space-inline);
    }

    .results-grid__page-size-select {
      flex: 0 1 auto;
      min-width: 6.5rem;
      max-width: 8rem;
      --uui-select-height: 2rem;
      --uui-select-font-size: var(--uui-type-small-size);
    }

    .results-grid__page-jump {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-end;
      gap: var(--uui-size-space-2);
    }

    .results-grid__page-jump-input {
      width: 5.5rem;
      min-width: 5.5rem;
    }

    .results-grid__pagination-controls uui-pagination {
      margin-left: auto;
    }

    @media (max-width: 900px) {
      .results-grid__table-scroll {
        overflow-x: auto;
      }

      .results-grid__table-scroll content-search-results-table {
        min-width: 40rem;
      }

      .results-grid__options-checkboxes {
        grid-template-columns: 1fr;
      }

      .results-grid__pagination-controls {
        flex-direction: column;
        align-items: stretch;
      }

      .results-grid__pagination-controls uui-pagination {
        margin-left: 0;
        width: 100%;
      }

      .results-grid__page-size-select {
        max-width: none;
        width: 100%;
      }

      .results-grid__page-jump {
        display: none;
      }
    }
  `,
];

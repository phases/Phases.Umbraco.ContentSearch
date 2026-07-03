import { css } from "@umbraco-cms/backoffice/external/lit";
import {
  filterNodesSectionHeaderStyles,
  filterNodesUiTokens,
} from "../../styles/filter-nodes-ui.styles.js";

export const filterResultsGridStyles = [
  filterNodesUiTokens,
  filterNodesSectionHeaderStyles,
  css`
    :host {
      display: flex;
      flex-direction: column;
      gap: var(--fn-space-block);
      width: 100%;
    }

    .results-grid {
      display: flex;
      flex-direction: column;
      gap: var(--fn-space-block);
      position: relative;
    }

    .results-grid__table {
      position: relative;
      min-height: 8rem;
      overflow-x: auto;
      border-radius: var(--fn-radius);
      background: var(--fn-surface-muted);
    }

    .results-grid__table--loading {
      opacity: 0.55;
      pointer-events: none;
    }

    .results-grid__loading {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: color-mix(in srgb, var(--uui-color-surface) 70%, transparent);
      z-index: 1;
    }

    .results-grid__pagination {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: flex-end;
      gap: var(--fn-space-inline);
      padding-top: var(--uui-size-space-1);
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

    .results-grid__feedback {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: var(--fn-space-inline);
      padding: var(--fn-space-inline) var(--fn-space-block);
      border-radius: var(--fn-radius);
      background: var(--fn-surface-muted);
    }

    .results-grid__page-size {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--uui-size-space-2);
    }

    .results-grid__page-size-label {
      color: var(--uui-color-text-alt);
      font-size: var(--uui-type-small-size);
      white-space: nowrap;
    }

    .results-grid__summary {
      margin: 0;
      color: var(--uui-color-text-alt);
      font-size: var(--uui-type-small-size);
    }

    uui-pagination {
      display: block;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      gap: var(--uui-size-space-2);
      padding: var(--fn-space-block);
      color: var(--uui-color-text-alt);
      border-radius: var(--fn-radius);
      background: var(--fn-surface-muted);
    }

    .empty-state--initial {
      align-items: flex-start;
      text-align: left;
    }

    .empty-state__title {
      margin: 0;
      color: var(--uui-color-text);
      font-size: var(--uui-type-default-size);
      font-weight: 600;
      line-height: 1.3;
    }

    .empty-state__description {
      margin: var(--uui-size-space-1) 0 0;
      font-size: var(--uui-type-small-size);
      line-height: 1.45;
    }

    .empty-state--initial .empty-state__title,
    .empty-state--initial .empty-state__description {
      margin: 0;
    }

    .empty-state__examples-label {
      margin: var(--uui-size-space-2) 0 0;
      color: var(--uui-color-text);
      font-size: var(--uui-type-small-size);
      font-weight: 600;
      line-height: 1.3;
    }

    .empty-state__examples {
      margin: var(--uui-size-space-1) 0 0;
      padding-left: var(--uui-size-space-5);
      font-size: var(--uui-type-small-size);
      line-height: 1.5;
    }

    .empty-state__examples li + li {
      margin-top: var(--uui-size-space-1);
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--fn-space-inline);
      min-height: 7rem;
      padding: var(--fn-space-block);
      color: var(--uui-color-text-alt);
      border-radius: var(--fn-radius);
      background: var(--fn-surface-muted);
    }

    .loading-state__label {
      margin: 0;
      font-size: var(--uui-type-small-size);
    }

    @media (max-width: 720px) {
      .results-grid__feedback {
        flex-direction: column;
        align-items: flex-start;
      }

      .results-grid__page-size {
        width: 100%;
      }

      .results-grid__pagination {
        flex-direction: column;
        align-items: stretch;
      }

      .results-grid__page-jump {
        width: 100%;
      }

      .results-grid__page-jump-input {
        flex: 1 1 auto;
        width: auto;
      }
    }
  `,
];

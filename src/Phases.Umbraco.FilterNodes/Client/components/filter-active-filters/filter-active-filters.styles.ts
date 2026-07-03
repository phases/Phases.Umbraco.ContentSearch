import { css } from "@umbraco-cms/backoffice/external/lit";
import { filterNodesUiTokens } from "../../styles/filter-nodes-ui.styles.js";

export const filterActiveFiltersStyles = [
  filterNodesUiTokens,
  css`
    :host {
      display: block;
      width: 100%;
    }

    .active-filters {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--uui-size-space-2) var(--fn-space-inline);
      padding: var(--fn-space-inline) 0;
    }

    .active-filters__label {
      margin: 0;
      color: var(--uui-color-text-alt);
      font-size: var(--uui-type-small-size);
      font-weight: 600;
      white-space: nowrap;
    }

    .active-filters__chips {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--uui-size-space-2);
      flex: 1;
      min-width: 0;
    }

    .active-filters__chip {
      display: inline-flex;
      align-items: center;
      gap: var(--uui-size-space-1);
      max-width: 100%;
      font-weight: 600;
    }

    .active-filters__chip-label {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .active-filters__remove {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      width: 1.25rem;
      height: 1.25rem;
      padding: 0;
      border: none;
      border-radius: var(--fn-radius);
      background: transparent;
      color: inherit;
      cursor: pointer;
      font-size: 1rem;
      font-weight: 700;
      line-height: 1;
      opacity: 0.72;
      transition: opacity 150ms ease;
    }

    .active-filters__remove:hover {
      opacity: 1;
    }

    .active-filters__remove:focus-visible {
      outline: 2px solid var(--uui-color-focus);
      outline-offset: 1px;
    }

    .active-filters__remove:disabled {
      cursor: not-allowed;
      opacity: 0.4;
    }
  `,
];

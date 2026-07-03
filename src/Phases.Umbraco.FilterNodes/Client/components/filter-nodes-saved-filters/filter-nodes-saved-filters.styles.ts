import { css } from "@umbraco-cms/backoffice/external/lit";
import {
  filterNodesSectionHeaderStyles,
  filterNodesUiTokens,
} from "../../styles/filter-nodes-ui.styles.js";

export const filterNodesSavedFiltersStyles = [
  filterNodesUiTokens,
  filterNodesSectionHeaderStyles,
  css`
    :host {
      display: block;
      width: 100%;
    }

    .saved-filters {
      display: flex;
      flex-direction: column;
      gap: var(--fn-space-block);
    }

    .saved-filters__empty {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: var(--uui-size-space-2);
      padding: var(--fn-space-block);
      border-radius: var(--fn-radius);
      background: var(--fn-surface-muted);
    }

    .saved-filters__empty-title {
      margin: 0;
      color: var(--uui-color-text);
      font-size: var(--uui-type-default-size);
      font-weight: 600;
      line-height: 1.3;
    }

    .saved-filters__empty-text {
      margin: 0;
      color: var(--uui-color-text-alt);
      font-size: var(--uui-type-small-size);
      line-height: 1.5;
      max-width: 36rem;
    }

    .saved-filters__toolbar {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-end;
      gap: var(--fn-space-inline);
      padding: var(--fn-space-inline) var(--fn-space-block);
      border-radius: var(--fn-radius);
      background: var(--fn-surface-muted);
    }

    .saved-filters__primary {
      display: flex;
      flex-direction: column;
      gap: var(--uui-size-space-1);
      flex: 1 1 16rem;
      min-width: 14rem;
    }

    .saved-filters__select {
      width: 100%;
    }

    .saved-filters__usage {
      margin: 0;
      color: var(--uui-color-text-alt);
      font-size: var(--uui-type-small-size);
      line-height: 1.4;
    }

    .saved-filters__actions {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: flex-end;
      gap: var(--uui-size-space-2);
      margin-left: auto;
    }

    .saved-filters__save-form {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-end;
      gap: var(--fn-space-inline);
      padding: var(--fn-space-inline) var(--fn-space-block);
      border-radius: var(--fn-radius);
      background: var(--fn-surface-inset);
    }

    .saved-filters__save-form uui-input {
      flex: 1 1 16rem;
      min-width: 14rem;
    }

    .saved-filters__save-actions {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--uui-size-space-2);
    }

    uui-select,
    uui-input {
      width: 100%;
    }

    @media (max-width: 720px) {
      .saved-filters__toolbar {
        flex-direction: column;
        align-items: stretch;
      }

      .saved-filters__actions {
        width: 100%;
        margin-left: 0;
        justify-content: stretch;
      }

      .saved-filters__actions uui-button {
        flex: 1 1 auto;
      }

      .saved-filters__save-form {
        flex-direction: column;
        align-items: stretch;
      }

      .saved-filters__save-actions {
        width: 100%;
      }

      .saved-filters__save-actions uui-button {
        flex: 1 1 auto;
      }
    }
  `,
];

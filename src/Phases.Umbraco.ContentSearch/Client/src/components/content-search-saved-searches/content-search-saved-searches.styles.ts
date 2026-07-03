import { css } from "@umbraco-cms/backoffice/external/lit";

export const contentSearchSavedSearchesStyles = [
  css`
    :host {
      display: block;
      width: 100%;
    }

    .saved-searches {
      display: flex;
      flex-direction: column;
      gap: var(--cs-space-inline);
    }

    .saved-searches__header {
      width: 100%;
    }

    .saved-searches__toggle {
      margin-left: auto;
      color: var(--uui-color-text-alt);
    }

    .saved-searches__tabs {
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem;
    }

    .saved-searches__toolbar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: flex-end;
      gap: var(--cs-space-inline);
    }

    .saved-searches__table-wrap {
      overflow: auto;
      border: 1px solid var(--cs-border-subtle);
      border-radius: var(--cs-radius);
      max-height: 18rem;
    }

    .saved-searches__table {
      width: 100%;
      border-collapse: collapse;
      font-size: var(--uui-type-small-size);
    }

    .saved-searches__table thead th {
      position: sticky;
      top: 0;
      z-index: 1;
      background: var(--uui-color-surface);
      text-align: left;
      padding: 0.55rem 0.65rem;
      border-bottom: 1px solid var(--uui-color-border);
      white-space: nowrap;
      font-weight: 600;
    }

    .saved-searches__table tbody td {
      padding: 0.55rem 0.65rem;
      border-bottom: 1px solid var(--uui-color-border-standalone);
      vertical-align: middle;
    }

    .saved-searches__table tbody tr:hover td {
      background: var(--uui-color-surface-emphasis);
    }

    .saved-searches__row--selected td {
      background: color-mix(in srgb, var(--uui-color-selected) 14%, var(--uui-color-surface));
    }

    .saved-searches__row--selected:hover td {
      background: color-mix(in srgb, var(--uui-color-selected) 20%, var(--uui-color-surface));
    }

    .saved-searches__name {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      min-width: 8rem;
    }

    .saved-searches__name-text {
      font-weight: 600;
    }

    .saved-searches__description {
      color: var(--uui-color-text-alt);
      max-width: 12rem;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .saved-searches__actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.25rem;
      white-space: nowrap;
    }

    .saved-searches__empty {
      padding: 1rem;
      color: var(--uui-color-text-alt);
      text-align: center;
    }

    .saved-searches__save-form {
      display: grid;
      gap: 0.75rem;
      padding: 0.85rem;
      border: 1px solid var(--uui-color-border);
      border-radius: var(--uui-border-radius);
      background: var(--uui-color-surface-alt);
    }

    .saved-searches__save-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
    }

    .saved-searches__rename-form {
      display: grid;
      gap: 0.65rem;
      padding: 0.65rem 0;
    }
  `,
];

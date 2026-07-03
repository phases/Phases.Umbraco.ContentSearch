import { css } from "@umbraco-cms/backoffice/external/lit";

export const contentSearchBuilderStyles = [
  css`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }

    .search-builder {
      display: flex;
      flex-direction: column;
      min-height: 100%;
    }

    .search-builder__header {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: var(--cs-space-inline);
      padding: var(--cs-space-section) var(--cs-space-section) var(--cs-space-block);
    }

    .search-builder__title {
      margin: 0;
    }

    .search-builder__header-actions {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--uui-size-space-2);
      margin-left: auto;
    }

    .search-builder__culture-group {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--uui-size-space-2);
    }

    .search-builder__control-label {
      margin: 0;
      color: var(--uui-color-text-alt);
      font-size: var(--uui-type-small-size);
      font-weight: 600;
      white-space: nowrap;
    }

    .search-builder__culture-mode {
      min-width: 10rem;
    }

    .search-builder__culture-language {
      min-width: 12rem;
    }

    .search-builder__match {
      min-width: 9rem;
    }

    .search-builder--single .search-builder__form-panel {
      margin: 0 var(--cs-space-section) var(--cs-space-block);
      padding: var(--cs-space-section);
      border-radius: var(--cs-radius-lg);
      background: var(--cs-surface-inset);
      border: 1px solid var(--cs-border-subtle);
    }

    .search-builder__canvas {
      flex: 1 1 auto;
      display: flex;
      flex-direction: column;
      min-height: 14rem;
      margin: 0 var(--cs-space-section);
      border-radius: var(--cs-radius-lg);
      background: var(--cs-surface-inset);
      border: 1px solid var(--cs-border-subtle);
    }

    .search-builder__canvas-empty {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--cs-space-page) var(--cs-space-section);
    }

    .search-builder__add {
      min-width: 11rem;
    }

    .condition-list {
      display: flex;
      flex-direction: column;
      gap: var(--uui-size-space-1);
      padding: var(--cs-space-block) var(--cs-space-section);
    }

    .condition-list__item {
      animation: cs-condition-enter 180ms ease-out;
      border-radius: var(--cs-radius);
      transition:
        background-color 140ms ease,
        box-shadow 140ms ease;
    }

    .condition-list__item:hover {
      background: color-mix(in srgb, var(--uui-color-surface) 65%, transparent);
    }

    @keyframes cs-condition-enter {
      from {
        opacity: 0;
        transform: translateY(-6px);
      }

      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .search-builder__action-bar {
      position: sticky;
      bottom: 0;
      z-index: 2;
      display: flex;
      flex-direction: column;
      gap: 0;
      margin-top: var(--cs-space-block);
      background: var(--cs-sticky-surface);
      border-top: 1px solid var(--cs-border-subtle);
    }

    .search-builder--single .search-builder__action-bar {
      margin-top: 0;
    }

    .search-builder__tips {
      margin: 0;
      padding-left: var(--uui-size-space-5);
      font-size: var(--uui-type-small-size);
      color: var(--uui-color-text-alt);
      line-height: 1.5;
    }

    .search-builder__tips kbd {
      display: inline-block;
      padding: 0 var(--uui-size-space-1);
      border-radius: calc(var(--uui-border-radius) * 0.5);
      border: 1px solid var(--cs-border-subtle);
      background: var(--cs-surface-muted);
      font-size: 0.85em;
      font-family: inherit;
    }

    .search-builder__actions {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: flex-end;
      gap: var(--uui-size-space-2);
      padding: var(--cs-space-block) var(--cs-space-section);
    }

    @media (max-width: 900px) {
      .search-builder__header {
        flex-direction: column;
        align-items: stretch;
      }

      .search-builder__header-actions {
        width: 100%;
        margin-left: 0;
      }

      .search-builder__match {
        flex: 1 1 auto;
      }
    }

    @media (max-width: 560px) {
      .search-builder__header,
      .search-builder__canvas {
        margin-left: var(--cs-space-block);
        margin-right: var(--cs-space-block);
      }

      .search-builder__header {
        padding-left: 0;
        padding-right: 0;
      }

      .search-builder__action-bar {
        padding-left: var(--cs-space-block);
        padding-right: var(--cs-space-block);
      }

      .search-builder__actions {
        width: 100%;
      }

      .search-builder__actions uui-button {
        flex: 1 1 auto;
      }
    }
  `,
];

import { css } from "@umbraco-cms/backoffice/external/lit";
import {
  filterNodesSectionHeaderStyles,
  filterNodesUiTokens,
} from "../../styles/filter-nodes-ui.styles.js";

export const filterNodesFilterBuilderStyles = [
  filterNodesUiTokens,
  filterNodesSectionHeaderStyles,
  css`
    :host {
      display: block;
      width: 100%;
    }

    .filter-builder {
      display: flex;
      flex-direction: column;
      gap: var(--fn-space-block);
    }

    .filter-builder__draft-banner {
      margin: 0;
    }

    .filter-builder__toolbar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--fn-space-inline);
      padding: var(--fn-space-inline) var(--fn-space-block);
      border-radius: var(--fn-radius);
      background: var(--fn-surface-muted);
    }

    .filter-builder__toolbar-group {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--uui-size-space-2);
      min-width: 0;
    }

    .filter-builder__toolbar-divider {
      flex-shrink: 0;
      align-self: stretch;
      width: 1px;
      min-height: 1.75rem;
      background: color-mix(in srgb, var(--uui-color-border) 45%, transparent);
    }

    .filter-builder__toolbar-group--match,
    .filter-builder__toolbar-group--scope {
      flex: 0 1 auto;
    }

    .filter-builder__toolbar-select {
      width: 100%;
    }

    .filter-builder__toolbar-select--match {
      flex: 0 1 11rem;
      min-width: 9rem;
    }

    .filter-builder__toolbar-select--scope {
      flex: 0 1 14rem;
      min-width: 11rem;
    }

    .filter-builder__toolbar-group--properties {
      flex: 1 1 auto;
      min-width: 0;
    }

    .filter-builder__toolbar-checkbox {
      width: 100%;
    }

    .filter-builder__toolbar-summary {
      color: var(--uui-color-text-alt);
      font-size: var(--uui-type-small-size);
      line-height: 1.35;
    }

    .filter-builder__control-label {
      margin: 0;
      color: var(--uui-color-text-alt);
      font-size: var(--uui-type-small-size);
      font-weight: 600;
      white-space: nowrap;
    }

    .filter-builder__query {
      display: flex;
      flex-direction: column;
      gap: var(--uui-size-space-2);
      padding: var(--uui-size-space-2) var(--fn-space-inline);
      border-radius: var(--fn-radius);
      background: var(--fn-surface-muted);
    }

    .filter-builder__clause + .filter-builder__clause {
      padding-top: var(--uui-size-space-2);
      border-top: none;
      box-shadow: inset 0 1px 0 color-mix(in srgb, var(--uui-color-border) 35%, transparent);
    }

    .filter-builder__summary {
      display: flex;
      flex-direction: column;
      gap: var(--uui-size-space-2);
      padding: var(--fn-space-inline) var(--fn-space-block);
      border-radius: var(--fn-radius);
      background: var(--fn-summary-surface);
      box-shadow: inset 3px 0 0 var(--fn-summary-accent);
    }

    .filter-builder__summary-heading {
      margin: 0;
      color: var(--uui-color-text);
      font-size: var(--uui-type-small-size);
      font-weight: 700;
      letter-spacing: 0.04em;
      line-height: 1.2;
      text-transform: uppercase;
    }

    .filter-builder__summary-placeholder {
      margin: 0;
      color: var(--uui-color-text-alt);
      font-family: var(--uui-font-family-mono, ui-monospace, monospace);
      font-size: var(--uui-type-small-size);
      font-style: italic;
      line-height: 1.5;
    }

    .filter-builder__query-preview {
      display: flex;
      flex-direction: column;
      gap: var(--uui-size-space-1);
      padding: var(--fn-space-inline);
      border-radius: calc(var(--fn-radius) - 2px);
      background: color-mix(in srgb, var(--uui-color-surface) 82%, transparent);
      overflow-x: auto;
    }

    .filter-builder__query-keyword,
    .filter-builder__query-condition {
      margin: 0;
      font-family: var(--uui-font-family-mono, ui-monospace, monospace);
      font-size: var(--uui-type-small-size);
      line-height: 1.55;
      white-space: pre-wrap;
      word-break: break-word;
    }

    .filter-builder__query-keyword {
      color: var(--fn-summary-accent);
      font-weight: 700;
      letter-spacing: 0.08em;
    }

    .filter-builder__query-condition {
      color: var(--uui-color-text);
      padding-left: var(--uui-size-space-2);
    }

    .filter-builder__query-keyword + .filter-builder__query-condition {
      margin-top: calc(var(--uui-size-space-1) * -0.5);
    }

    .filter-builder__query-condition + .filter-builder__query-keyword {
      margin-top: var(--uui-size-space-2);
    }

    .filter-builder__add {
      display: flex;
      align-items: center;
    }

    .filter-builder__action-bar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: var(--fn-space-inline);
      padding-top: var(--fn-space-inline);
      margin-top: calc(var(--uui-size-space-1) * -1);
    }

    .filter-builder__action-status {
      display: flex;
      align-items: center;
      gap: var(--uui-size-space-2);
      flex: 1 1 12rem;
      min-width: 0;
    }

    .filter-builder__action-status-icon {
      flex-shrink: 0;
      font-size: 1rem;
      color: var(--uui-color-positive);
    }

    .filter-builder__ready {
      margin: 0;
      color: var(--uui-color-positive);
      font-size: var(--uui-type-small-size);
      line-height: 1.4;
    }

    .filter-builder__action-hint {
      margin: 0;
      color: var(--uui-color-text-alt);
      font-size: var(--uui-type-small-size);
      line-height: 1.4;
    }

    .filter-builder__actions {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: flex-end;
      gap: var(--uui-size-space-2);
      margin-left: auto;
    }

    @media (max-width: 720px) {
      .filter-builder__toolbar {
        flex-direction: column;
        align-items: stretch;
      }

      .filter-builder__toolbar-divider {
        display: none;
      }

      .filter-builder__toolbar-group {
        flex-direction: column;
        align-items: stretch;
      }

      .filter-builder__toolbar-select {
        width: 100%;
      }

      .filter-builder__action-bar {
        flex-direction: column;
        align-items: stretch;
      }

      .filter-builder__actions {
        width: 100%;
        justify-content: stretch;
      }

      .filter-builder__actions uui-button {
        flex: 1 1 auto;
      }
    }
  `,
];

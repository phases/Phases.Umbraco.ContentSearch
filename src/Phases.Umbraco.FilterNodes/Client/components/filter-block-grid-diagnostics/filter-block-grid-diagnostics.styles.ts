import { css } from "@umbraco-cms/backoffice/external/lit";
import { filterNodesUiTokens } from "../../styles/filter-nodes-ui.styles.js";

export const filterBlockGridDiagnosticsStyles = [
  filterNodesUiTokens,
  css`
    :host {
      display: block;
      width: 100%;
      min-width: 0;
    }

    .block-diagnostics {
      margin-top: var(--uui-size-space-2);
      margin-left: calc(3.25rem + var(--uui-size-space-3));
      padding: var(--uui-size-space-3);
      border-radius: var(--fn-radius);
      background: var(--fn-surface-inset);
      box-shadow: inset 0 0 0 1px
        color-mix(in srgb, var(--uui-color-border) 35%, transparent);
    }

    .block-diagnostics__title {
      margin: 0 0 var(--uui-size-space-3);
      color: var(--uui-color-text-alt);
      font-size: var(--uui-type-small-size);
      font-weight: 700;
      letter-spacing: 0.04em;
      line-height: 1.2;
      text-transform: uppercase;
    }

    .block-diagnostics__summary {
      display: grid;
      grid-template-columns: minmax(7.5rem, auto) minmax(0, 1fr);
      gap: var(--uui-size-space-2) var(--uui-size-space-4);
      margin: 0 0 var(--uui-size-space-2);
    }

    .block-diagnostics__term {
      margin: 0;
      color: var(--uui-color-text-alt);
      font-size: var(--uui-type-small-size);
      font-weight: 600;
      line-height: 1.35;
    }

    .block-diagnostics__value {
      margin: 0;
      color: var(--uui-color-text);
      font-size: var(--uui-type-small-size);
      font-weight: 600;
      line-height: 1.35;
      overflow-wrap: anywhere;
    }

    .block-diagnostics__editor-label {
      margin-left: var(--uui-size-space-1);
      color: var(--uui-color-text-alt);
      font-weight: 500;
    }

    .block-diagnostics__tip {
      margin: 0 0 var(--uui-size-space-3);
      color: var(--uui-color-text-alt);
      font-size: var(--uui-type-small-size);
      line-height: 1.4;
    }

    .block-diagnostics__guidance {
      display: flex;
      flex-direction: column;
      gap: var(--uui-size-space-2);
      margin: 0 0 var(--uui-size-space-3);
    }

    .block-diagnostics__guidance-intro,
    .block-diagnostics__guidance-lead,
    .block-diagnostics__guidance-outcome {
      margin: 0;
      color: var(--uui-color-text);
      font-size: var(--uui-type-small-size);
      line-height: 1.4;
    }

    .block-diagnostics__guidance-lead,
    .block-diagnostics__guidance-outcome {
      color: var(--uui-color-text-alt);
    }

    .block-diagnostics__operator-list {
      display: flex;
      flex-direction: column;
      gap: var(--uui-size-space-1);
      margin: 0;
      padding: 0 0 0 var(--uui-size-space-4);
      color: var(--uui-color-text);
      font-size: var(--uui-type-small-size);
      line-height: 1.35;
    }

    .block-diagnostics__example {
      display: flex;
      flex-direction: column;
      gap: var(--uui-size-space-1);
      padding: var(--uui-size-space-2) var(--uui-size-space-3);
      border-radius: var(--fn-radius);
      background: color-mix(in srgb, var(--uui-color-surface) 80%, transparent);
      box-shadow: inset 0 0 0 1px
        color-mix(in srgb, var(--uui-color-border) 35%, transparent);
    }

    .block-diagnostics__example-line {
      color: var(--uui-color-text);
      font-size: var(--uui-type-small-size);
      font-weight: 600;
      line-height: 1.35;
    }

    .block-diagnostics__example-line--value {
      font-family: var(--uui-font-family-mono, ui-monospace, monospace);
      font-weight: 500;
    }

    .block-diagnostics__sections {
      display: grid;
      gap: var(--uui-size-space-3);
    }

    .block-diagnostics__section-title {
      margin: 0 0 var(--uui-size-space-2);
      color: var(--uui-color-text);
      font-size: var(--uui-type-small-size);
      font-weight: 700;
      line-height: 1.2;
    }

    .block-diagnostics__section-title--examine {
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    .block-diagnostics__examine {
      margin-bottom: var(--uui-size-space-3);
      padding-top: var(--uui-size-space-2);
      border-top: 1px solid
        color-mix(in srgb, var(--uui-color-border) 35%, transparent);
    }

    .block-diagnostics__summary--examine {
      margin-bottom: var(--uui-size-space-2);
    }

    .block-diagnostics__value--mono {
      font-family: var(--uui-font-family-mono, ui-monospace, monospace);
      font-weight: 500;
    }

    .block-diagnostics__examine-explanation {
      display: flex;
      flex-direction: column;
      gap: var(--uui-size-space-1);
    }

    .block-diagnostics__examine-explanation-label {
      margin: 0;
      color: var(--uui-color-text-alt);
      font-size: var(--uui-type-small-size);
      font-weight: 600;
      line-height: 1.35;
    }

    .block-diagnostics__examine-explanation-text {
      margin: 0;
      color: var(--uui-color-text);
      font-size: var(--uui-type-small-size);
      line-height: 1.4;
    }

    .block-diagnostics__search-mode {
      margin-bottom: var(--uui-size-space-3);
      padding-top: var(--uui-size-space-2);
      border-top: 1px solid
        color-mix(in srgb, var(--uui-color-border) 35%, transparent);
    }

    .block-diagnostics__search-mode-label {
      margin: 0 0 var(--uui-size-space-1);
      color: var(--uui-color-text);
      font-size: var(--uui-type-small-size);
      font-weight: 600;
      line-height: 1.35;
    }

    .block-diagnostics__search-mode-description {
      margin: 0;
      color: var(--uui-color-text-alt);
      font-size: var(--uui-type-small-size);
      line-height: 1.4;
    }

    .block-diagnostics__list {
      display: flex;
      flex-direction: column;
      gap: var(--uui-size-space-1);
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .block-diagnostics__item {
      display: flex;
      align-items: flex-start;
      gap: var(--uui-size-space-2);
      color: var(--uui-color-text);
      font-size: var(--uui-type-small-size);
      line-height: 1.35;
      overflow-wrap: anywhere;
    }

    .block-diagnostics__marker {
      flex-shrink: 0;
      width: 1rem;
      font-weight: 700;
      line-height: 1.35;
      text-align: center;
    }

    .block-diagnostics__item--positive .block-diagnostics__marker {
      color: var(--uui-color-positive, #007e3a);
    }

    .block-diagnostics__item--negative .block-diagnostics__marker {
      color: var(--uui-color-text-alt);
    }

    .block-diagnostics__item--warning .block-diagnostics__marker {
      color: var(--uui-color-warning, #f5a524);
    }

    .block-diagnostics__empty {
      margin: 0;
      color: var(--uui-color-text-alt);
      font-size: var(--uui-type-small-size);
      font-style: italic;
      line-height: 1.35;
    }

    @media (max-width: 48rem) {
      .block-diagnostics {
        margin-left: 0;
      }

      .block-diagnostics__summary {
        grid-template-columns: 1fr;
        gap: var(--uui-size-space-1);
      }
    }
  `,
];

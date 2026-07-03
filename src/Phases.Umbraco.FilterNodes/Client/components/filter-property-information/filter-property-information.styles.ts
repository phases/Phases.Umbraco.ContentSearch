import { css } from "@umbraco-cms/backoffice/external/lit";
import { filterNodesUiTokens } from "../../styles/filter-nodes-ui.styles.js";

export const filterPropertyInformationStyles = [
  filterNodesUiTokens,
  css`
    :host {
      display: block;
      width: 100%;
      min-width: 0;
    }

    .property-information {
      margin-top: var(--uui-size-space-2);
      margin-left: calc(3.25rem + var(--uui-size-space-3));
      display: flex;
      flex-direction: column;
      gap: var(--uui-size-space-2);
    }

    .property-information__summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr));
      gap: var(--uui-size-space-2) var(--uui-size-space-3);
      padding: var(--uui-size-space-2) var(--uui-size-space-3);
      border-radius: var(--fn-radius);
      background: var(--fn-surface-inset);
      box-shadow: inset 0 0 0 1px
        color-mix(in srgb, var(--uui-color-border) 35%, transparent);
    }

    .property-information__summary-item {
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
      min-width: 0;
    }

    .property-information__summary-label {
      margin: 0;
      color: var(--uui-color-text-alt);
      font-size: var(--uui-type-small-size);
      font-weight: 600;
      line-height: 1.2;
    }

    .property-information__summary-value {
      margin: 0;
      color: var(--uui-color-text);
      font-size: var(--uui-type-small-size);
      line-height: 1.3;
      overflow-wrap: anywhere;
    }

    .property-information__summary-value--source {
      display: flex;
      align-items: center;
      gap: var(--uui-size-space-1);
    }

    .property-information__source-icon {
      flex-shrink: 0;
      color: var(--uui-color-text-alt);
    }

    .property-information__summary-value--positive {
      color: var(--uui-color-positive, #007e3a);
      font-weight: 600;
    }

    .property-information__summary-value--muted {
      color: var(--uui-color-text-alt);
      font-weight: 600;
    }

    .property-information__search-summary {
      padding: var(--uui-size-space-2) var(--uui-size-space-3);
      border-radius: var(--fn-radius);
      background: var(--fn-surface-inset);
      box-shadow: inset 0 0 0 1px
        color-mix(in srgb, var(--uui-color-border) 35%, transparent);
    }

    .property-information__search-summary-title {
      margin: 0 0 var(--uui-size-space-2);
      color: var(--uui-color-text-alt);
      font-size: var(--uui-type-small-size);
      font-weight: 700;
      letter-spacing: 0.04em;
      line-height: 1.2;
      text-transform: uppercase;
    }

    .property-information__search-summary-sections {
      display: grid;
      gap: var(--uui-size-space-2);
    }

    .property-information__section-toggle {
      display: inline-flex;
      align-items: center;
      gap: var(--uui-size-space-2);
      width: 100%;
      margin: 0;
      padding: var(--uui-size-space-1) var(--uui-size-space-2);
      border: 0;
      border-radius: var(--fn-radius);
      background: var(--fn-surface-inset);
      box-shadow: inset 0 0 0 1px
        color-mix(in srgb, var(--uui-color-border) 35%, transparent);
      color: var(--uui-color-text-alt);
      font-size: var(--uui-type-small-size);
      font-weight: 600;
      line-height: 1.2;
      text-align: left;
      cursor: pointer;
    }

    .property-information__section-toggle:hover {
      color: var(--uui-color-text);
    }

    .property-information__section-panel {
      padding: var(--uui-size-space-2) var(--uui-size-space-3);
      border-radius: var(--fn-radius);
      background: var(--fn-surface-inset);
      box-shadow: inset 0 0 0 1px
        color-mix(in srgb, var(--uui-color-border) 35%, transparent);
    }

    .property-information__list {
      display: grid;
      grid-template-columns: minmax(6.5rem, auto) minmax(0, 1fr);
      gap: var(--uui-size-space-1) var(--uui-size-space-3);
      margin: 0;
    }

    .property-information__term {
      margin: 0;
      color: var(--uui-color-text-alt);
      font-size: var(--uui-type-small-size);
      font-weight: 600;
      line-height: 1.3;
    }

    .property-information__value {
      margin: 0;
      color: var(--uui-color-text);
      font-size: var(--uui-type-small-size);
      line-height: 1.3;
      overflow-wrap: anywhere;
    }

    .property-information__value--mono {
      font-family: var(--uui-font-family-mono, ui-monospace, monospace);
      font-weight: 500;
    }

    .property-information__description {
      margin: var(--uui-size-space-1) 0 0;
      color: var(--uui-color-text-alt);
      font-size: var(--uui-type-small-size);
      font-weight: 400;
      line-height: 1.35;
    }

    .property-information__subsection-title {
      margin: var(--uui-size-space-2) 0 var(--uui-size-space-1);
      color: var(--uui-color-text);
      font-size: var(--uui-type-small-size);
      font-weight: 700;
      line-height: 1.2;
    }

    .property-information__subsection-title:first-child {
      margin-top: 0;
    }

    .property-information__subsection-title--examine {
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    .property-information__item-list {
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .property-information__item {
      display: flex;
      align-items: flex-start;
      gap: var(--uui-size-space-1);
      color: var(--uui-color-text);
      font-size: var(--uui-type-small-size);
      line-height: 1.3;
      overflow-wrap: anywhere;
    }

    .property-information__marker {
      flex-shrink: 0;
      width: 0.875rem;
      font-weight: 700;
      line-height: 1.3;
      text-align: center;
    }

    .property-information__item--positive .property-information__marker {
      color: var(--uui-color-positive, #007e3a);
    }

    .property-information__item--negative .property-information__marker,
    .property-information__item--warning .property-information__marker {
      color: var(--uui-color-text-alt);
    }

    .property-information__item--warning .property-information__marker {
      color: var(--uui-color-warning, #f5a524);
    }

    .property-information__empty {
      margin: 0;
      color: var(--uui-color-text-alt);
      font-size: var(--uui-type-small-size);
      font-style: italic;
      line-height: 1.3;
    }

    .property-information__tip,
    .property-information__guidance-intro,
    .property-information__guidance-lead,
    .property-information__guidance-outcome {
      margin: 0;
      color: var(--uui-color-text-alt);
      font-size: var(--uui-type-small-size);
      line-height: 1.35;
    }

    .property-information__guidance {
      display: flex;
      flex-direction: column;
      gap: var(--uui-size-space-1);
      margin-top: var(--uui-size-space-2);
    }

    .property-information__operator-list {
      display: flex;
      flex-wrap: wrap;
      gap: var(--uui-size-space-1);
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .property-information__operator-list li {
      padding: 0.125rem var(--uui-size-space-2);
      border-radius: var(--fn-radius);
      background: color-mix(in srgb, var(--uui-color-surface) 80%, transparent);
      color: var(--uui-color-text);
      font-size: var(--uui-type-small-size);
      line-height: 1.3;
    }

    .property-information__example {
      display: flex;
      flex-wrap: wrap;
      gap: var(--uui-size-space-1);
      padding: var(--uui-size-space-1) var(--uui-size-space-2);
      border-radius: var(--fn-radius);
      background: color-mix(in srgb, var(--uui-color-surface) 80%, transparent);
    }

    .property-information__example-line {
      color: var(--uui-color-text);
      font-size: var(--uui-type-small-size);
      font-weight: 600;
      line-height: 1.3;
    }

    .property-information__example-line--value {
      font-family: var(--uui-font-family-mono, ui-monospace, monospace);
      font-weight: 500;
    }

    .property-information__editor-label {
      margin-left: var(--uui-size-space-1);
      color: var(--uui-color-text-alt);
      font-weight: 500;
    }

    @media (max-width: 48rem) {
      .property-information {
        margin-left: 0;
      }

      .property-information__summary {
        grid-template-columns: 1fr 1fr;
      }

      .property-information__list {
        grid-template-columns: 1fr;
      }
    }
  `,
];

import { css } from "@umbraco-cms/backoffice/external/lit";
import { filterNodesUiTokens } from "../../styles/filter-nodes-ui.styles.js";

export const filterPropertyDetailsStyles = [
  filterNodesUiTokens,
  css`
    :host {
      display: block;
      width: 100%;
      min-width: 0;
    }

    .property-details {
      margin-top: var(--uui-size-space-2);
      margin-left: calc(3.25rem + var(--uui-size-space-3));
      padding: var(--uui-size-space-3);
      border-radius: var(--fn-radius);
      background: var(--fn-surface-inset);
      box-shadow: inset 0 0 0 1px
        color-mix(in srgb, var(--uui-color-border) 35%, transparent);
    }

    .property-details__title {
      margin: 0 0 var(--uui-size-space-2);
      color: var(--uui-color-text-alt);
      font-size: var(--uui-type-small-size);
      font-weight: 700;
      letter-spacing: 0.04em;
      line-height: 1.2;
      text-transform: uppercase;
    }

    .property-details__list {
      display: grid;
      grid-template-columns: minmax(6.5rem, auto) minmax(0, 1fr);
      gap: var(--uui-size-space-2) var(--uui-size-space-4);
      margin: 0;
    }

    .property-details__term {
      margin: 0;
      color: var(--uui-color-text-alt);
      font-size: var(--uui-type-small-size);
      font-weight: 600;
      line-height: 1.35;
    }

    .property-details__value {
      margin: 0;
      color: var(--uui-color-text);
      font-size: var(--uui-type-small-size);
      line-height: 1.35;
      overflow-wrap: anywhere;
    }

    .property-details__value--mono {
      font-family: var(--uui-font-family-mono, ui-monospace, monospace);
    }

    .property-details__value--positive {
      color: var(--uui-color-positive, #007e3a);
      font-weight: 600;
    }

    .property-details__value--muted {
      color: var(--uui-color-text-alt);
      font-weight: 600;
    }

    .property-details__value--mode {
      font-weight: 600;
    }

    .property-details__value--source {
      display: flex;
      align-items: center;
      gap: var(--uui-size-space-2);
    }

    .property-details__source-icon {
      flex-shrink: 0;
      color: var(--uui-color-text-alt);
    }

    .property-details__description {
      margin: var(--uui-size-space-1) 0 0;
      color: var(--uui-color-text-alt);
      font-size: var(--uui-type-small-size);
      font-weight: 400;
      line-height: 1.4;
    }

    .property-details__technical {
      margin-top: var(--uui-size-space-3);
      padding-top: var(--uui-size-space-2);
      border-top: 1px solid
        color-mix(in srgb, var(--uui-color-border) 35%, transparent);
    }

    .property-details__technical-toggle {
      display: inline-flex;
      align-items: center;
      gap: var(--uui-size-space-2);
      margin: 0;
      padding: 0;
      border: 0;
      background: transparent;
      color: var(--uui-color-text-alt);
      font-size: var(--uui-type-small-size);
      font-weight: 600;
      line-height: 1.2;
      cursor: pointer;
    }

    .property-details__technical-toggle:hover {
      color: var(--uui-color-text);
    }

    .property-details__technical-list {
      display: grid;
      grid-template-columns: minmax(6.5rem, auto) minmax(0, 1fr);
      gap: var(--uui-size-space-2) var(--uui-size-space-4);
      margin: var(--uui-size-space-2) 0 0;
    }

    @media (max-width: 48rem) {
      .property-details {
        margin-left: 0;
      }

      .property-details__list {
        grid-template-columns: 1fr;
        gap: var(--uui-size-space-1);
      }
    }
  `,
];

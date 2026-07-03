import { css } from "@umbraco-cms/backoffice/external/lit";
import { filterNodesUiTokens } from "../../styles/filter-nodes-ui.styles.js";

const primaryControlVars = css`
  --uui-select-height: 2.125rem;
  --uui-select-font-size: var(--uui-type-default-size);
  --uui-select-padding-y: var(--uui-size-space-1);
  --uui-select-padding-x: var(--uui-size-space-2);
  --uui-select-border-color: transparent;
  --uui-select-border-color-hover: transparent;
  --uui-select-background-color: var(--uui-color-surface);
  --uui-input-height: 2.125rem;
  --uui-input-border-color: transparent;
  --uui-input-background-color: var(--uui-color-surface);
`;

const secondaryControlVars = css`
  --uui-select-height: 2.125rem;
  --uui-select-font-size: var(--uui-type-small-size);
  --uui-select-padding-y: var(--uui-size-space-1);
  --uui-select-padding-x: var(--uui-size-space-2);
  --uui-select-border-color: transparent;
  --uui-select-border-color-hover: transparent;
  --uui-select-background-color: transparent;
`;

const valueControlVars = css`
  --uui-select-height: 2.125rem;
  --uui-select-font-size: var(--uui-type-default-size);
  --uui-select-padding-y: var(--uui-size-space-1);
  --uui-select-padding-x: var(--uui-size-space-2);
  --uui-select-border-color: transparent;
  --uui-select-border-color-hover: transparent;
  --uui-select-background-color: var(--uui-color-surface);
  --uui-input-height: 2.125rem;
  --uui-input-border-color: transparent;
  --uui-input-background-color: var(--uui-color-surface);
`;

export const filterConditionRowStyles = [
  filterNodesUiTokens,
  css`
  :host {
    display: block;
    width: 100%;
  }

  .condition-row {
    width: 100%;
    padding: var(--uui-size-space-1) 0;
    box-sizing: border-box;
  }

  .condition-row__sentence {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: var(--uui-size-space-3);
    width: 100%;
    min-width: 0;
  }

  .condition-row__keyword {
    flex-shrink: 0;
    align-self: center;
    width: 3.25rem;
    font-family: var(--uui-font-family-mono, ui-monospace, monospace);
    font-size: var(--uui-type-small-size);
    font-weight: 700;
    letter-spacing: 0.08em;
    line-height: 1;
    text-transform: uppercase;
    user-select: none;
  }

  .condition-row__keyword--where {
    color: var(--uui-color-selected);
    font-size: var(--uui-type-default-size);
    letter-spacing: 0.1em;
  }

  .condition-row__keyword--join {
    color: var(--uui-color-text-alt);
  }

  .condition-row__fields {
    display: grid;
    grid-template-columns:
      minmax(6.5rem, 1.05fr)
      minmax(6rem, 1.05fr)
      minmax(5.5rem, 0.75fr)
      minmax(7rem, 1.15fr);
    align-items: start;
    gap: var(--uui-size-space-2) var(--uui-size-space-3);
    min-width: 0;
  }

  .condition-row__fields--entire-site {
    grid-template-columns:
      minmax(6.5rem, 1.15fr)
      minmax(5.5rem, 0.75fr)
      minmax(7rem, 1.2fr);
  }

  .condition-row__token {
    display: flex;
    flex-direction: column;
    gap: var(--uui-size-space-1);
    min-width: 0;
  }

  .condition-row__token--content-type,
  .condition-row__token--property {
    min-width: 0;
  }

  .condition-row__token--content-type .condition-row__control,
  .condition-row__token--property .condition-row__control,
  .condition-row__token--content-type filter-content-type-combobox,
  .condition-row__token--property filter-property-combobox {
    ${primaryControlVars}
    width: 100%;
    font-weight: 600;
    color: var(--uui-color-text);
  }

  .condition-row__token--content-type.condition-row__token--empty
    .condition-row__control,
  .condition-row__token--content-type.condition-row__token--empty
    filter-content-type-combobox,
  .condition-row__token--property.condition-row__token--empty
    .condition-row__control,
  .condition-row__token--property.condition-row__token--empty
    filter-property-combobox {
    color: var(--uui-color-text-alt);
    font-style: italic;
    font-weight: 500;
  }

  .condition-row__token--operator .condition-row__control {
    ${secondaryControlVars}
    width: 100%;
    font-weight: 500;
    color: var(--uui-color-text-alt);
  }

  .condition-row__token--operator.condition-row__token--filled
    .condition-row__control {
    color: var(--uui-color-text);
    font-weight: 500;
  }

  .condition-row__token--value .condition-row__control {
    ${valueControlVars}
    width: 100%;
    font-weight: 600;
    color: var(--uui-color-text);
  }

  .condition-row__token--ghost {
    min-width: 0;
  }

  .condition-row__ghost {
    display: flex;
    align-items: center;
    min-height: 2.125rem;
    padding: 0 var(--uui-size-space-1);
    color: var(--uui-color-text-alt);
    font-size: var(--uui-type-small-size);
    font-style: italic;
    font-weight: 500;
    line-height: 1.2;
    opacity: 0.65;
  }

  .condition-row__token--operator .condition-row__ghost {
    font-size: var(--uui-type-small-size);
  }

  .condition-row__token--value .condition-row__ghost {
    font-size: var(--uui-type-default-size);
  }

  .condition-row__control {
    width: 100%;
  }

  .condition-row__value {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--uui-size-space-1);
    width: 100%;
    min-width: 0;
  }

  .condition-row__value--literal .condition-row__control {
    flex: 1 1 5rem;
    min-width: 4rem;
    width: auto;
  }

  .condition-row__quote {
    flex-shrink: 0;
    color: var(--uui-color-text-alt);
    font-size: var(--uui-type-default-size);
    font-weight: 500;
    line-height: 1;
    user-select: none;
  }

  .condition-row__date-value {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--uui-size-space-2);
    width: 100%;
    min-width: 0;
  }

  .condition-row__date-range-select {
    display: flex;
    flex-direction: column;
    gap: var(--uui-size-space-1);
    flex: 1 1 10rem;
    min-width: 8rem;
  }

  .condition-row__date-range {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    gap: var(--uui-size-space-2);
    width: 100%;
  }

  .condition-row__date-field {
    display: flex;
    flex-direction: column;
    gap: var(--uui-size-space-1);
    flex: 1 1 8rem;
    min-width: 7rem;
  }

  .condition-row__field-error {
    margin: 0;
    color: var(--uui-color-danger);
    font-size: var(--uui-type-small-size);
    line-height: 1.3;
    width: 100%;
  }

  .condition-row__multi-select--error {
    box-shadow: inset 0 0 0 1px var(--uui-color-danger);
  }

  .condition-row__multi-select {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--uui-size-space-2);
    width: 100%;
    min-height: 2.125rem;
    padding: var(--uui-size-space-1) var(--uui-size-space-2);
    border-radius: var(--fn-radius);
    background: var(--fn-surface-muted);
  }

  .condition-row__multi-select-option {
    display: flex;
    align-items: center;
    gap: var(--uui-size-space-2);
    color: var(--uui-color-text);
    font-size: var(--uui-type-small-size);
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
  }

  .condition-row__remove {
    flex-shrink: 0;
    align-self: center;
    opacity: 0.55;
    transition: opacity 150ms ease;
  }

  .condition-row:hover .condition-row__remove,
  .condition-row:focus-within .condition-row__remove {
    opacity: 0.75;
  }

  .condition-row__remove:hover,
  .condition-row__remove:focus-within {
    opacity: 1;
  }

  .condition-row__remove uui-button {
    --uui-button-height: 1.75rem;
    color: var(--uui-color-text-alt);
  }

  .condition-row__value uui-input [slot="append"] {
    display: flex;
    align-items: center;
  }

  .condition-row__value uui-input [slot="append"] uui-button {
    color: var(--uui-color-text-alt);
  }

  uui-select,
  uui-input,
  uui-combobox {
    min-width: 0;
  }

  @media (max-width: 960px) {
    .condition-row__fields,
    .condition-row__fields--entire-site {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .condition-row__token--value {
      grid-column: 1 / -1;
    }
  }

  @media (max-width: 640px) {
    .condition-row__sentence {
      grid-template-columns: 1fr auto;
      align-items: start;
      gap: var(--uui-size-space-2);
    }

    .condition-row__keyword {
      grid-column: 1 / -1;
      width: auto;
    }

    .condition-row__fields,
    .condition-row__fields--entire-site {
      grid-column: 1;
      grid-template-columns: 1fr;
    }

    .condition-row__token--value {
      grid-column: auto;
    }

    .condition-row__remove {
      grid-column: 2;
      grid-row: 2;
      align-self: start;
    }

    .condition-row__date-range {
      flex-direction: column;
    }
  }
`,
];

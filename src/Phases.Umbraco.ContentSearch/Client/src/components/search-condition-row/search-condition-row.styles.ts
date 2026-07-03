import { css } from "@umbraco-cms/backoffice/external/lit";
import { contentSearchUiTokens } from "../../styles/content-search-ui.styles.js";

const controlVars = css`
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

export const searchConditionRowStyles = [
  contentSearchUiTokens,
  controlVars,
  css`
    :host {
      display: block;
      width: 100%;
    }

    .condition-row {
      width: 100%;
      padding: var(--uui-size-space-2) 0;
      box-sizing: border-box;
      transition: opacity 160ms ease, transform 160ms ease;
    }

    :host([dragging]) .condition-row {
      opacity: 0.42;
    }

    :host([drop-target]) .condition-row {
      transform: translateY(2px);
    }

    .condition-row__sentence {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr) auto;
      align-items: start;
      gap: var(--uui-size-space-3);
      width: 100%;
      min-width: 0;
    }

    .condition-row__keyword {
      flex-shrink: 0;
      align-self: center;
      width: 3.25rem;
      padding-top: 0.45rem;
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
        minmax(6.5rem, 1fr)
        minmax(6.5rem, 1fr)
        minmax(5.5rem, 0.8fr)
        minmax(7rem, 1.1fr);
      align-items: start;
      gap: var(--uui-size-space-2) var(--uui-size-space-3);
      min-width: 0;
    }

    .condition-row__token {
      display: flex;
      flex-direction: column;
      gap: var(--uui-size-space-1);
      min-width: 0;
    }

    .condition-row__control,
    .condition-row__token uui-select,
    .condition-row__token uui-input,
    .condition-row__token umb-input-date {
      width: 100%;
      min-width: 0;
    }

    .condition-row__token--date-range {
      grid-column: 1 / -1;
    }

    .condition-row__date-range {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
      align-items: start;
      gap: var(--uui-size-space-2);
      width: 100%;
      min-width: 0;
    }

    .condition-row__date-range-separator {
      align-self: center;
      color: var(--uui-color-text-alt);
      font-size: var(--uui-type-small-size);
      line-height: 1;
      padding-top: 0.45rem;
    }

    .condition-row__ghost {
      display: flex;
      align-items: center;
      min-height: 2.125rem;
      padding: 0 var(--uui-size-space-2);
      border-radius: var(--cs-radius);
      background: color-mix(in srgb, var(--uui-color-surface-alt) 35%, transparent);
      color: var(--uui-color-text-alt);
      font-size: var(--uui-type-small-size);
    }

    .condition-row__field-error {
      margin: 0;
      color: var(--uui-color-danger);
      font-size: var(--uui-type-small-size);
      line-height: 1.35;
    }

    .condition-row__actions {
      display: flex;
      align-items: center;
      gap: var(--uui-size-space-1);
      padding-top: 0.1rem;
      opacity: 0.55;
      transition: opacity 140ms ease;
    }

    .condition-row:hover .condition-row__actions,
    .condition-row:focus-within .condition-row__actions {
      opacity: 1;
    }

    .condition-row__drag {
      cursor: grab;
      color: var(--uui-color-text-alt);
    }

    .condition-row__drag:active {
      cursor: grabbing;
    }

    .condition-row--single {
      padding: 0;
    }

    .condition-row__form {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      align-items: start;
      gap: var(--uui-size-space-3);
      width: 100%;
      min-width: 0;
    }

    :host([single-mode]) .condition-row__ghost {
      background: color-mix(in srgb, var(--uui-color-surface) 88%, var(--uui-color-surface-alt));
      border: 1px dashed color-mix(in srgb, var(--uui-color-border) 70%, transparent);
    }

    @media (max-width: 900px) {
      .condition-row__sentence {
        grid-template-columns: 1fr;
        gap: var(--uui-size-space-2);
      }

      .condition-row__keyword {
        width: auto;
        padding-top: 0;
      }

      .condition-row__fields {
        grid-template-columns: 1fr;
      }

      .condition-row__actions {
        justify-content: flex-end;
        opacity: 1;
        padding-top: 0;
      }
    }

    @media (max-width: 640px) {
      .condition-row__form {
        grid-template-columns: 1fr;
      }
    }
  `,
];

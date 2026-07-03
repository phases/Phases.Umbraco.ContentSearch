import { css } from "@umbraco-cms/backoffice/external/lit";

export const searchContentTypePickerStyles = css`
  :host {
    display: block;
    width: 100%;
    min-width: 0;
  }

  .content-type-picker {
    position: relative;
    width: 100%;
    min-width: 0;
  }

  .content-type-picker__status {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  uui-combobox {
    width: 100%;
    min-width: 0;
  }

  .content-type-option {
    display: flex;
    align-items: center;
    gap: var(--uui-size-space-2);
    min-width: 0;
    content-visibility: auto;
    contain-intrinsic-size: auto 2rem;
  }

  .content-type-option__name {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .content-type-option__alias {
    color: var(--uui-color-text-alt);
    font-family: var(--uui-font-family-mono, ui-monospace, monospace);
    font-size: var(--uui-type-small-size);
  }

  .content-type-option__empty {
    color: var(--uui-color-text-alt);
    font-size: var(--uui-type-small-size);
    font-style: italic;
  }
`;

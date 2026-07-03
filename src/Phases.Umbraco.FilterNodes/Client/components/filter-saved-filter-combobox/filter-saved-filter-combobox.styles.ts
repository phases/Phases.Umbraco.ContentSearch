import { css } from "@umbraco-cms/backoffice/external/lit";

export const filterSavedFilterComboboxStyles = css`
  :host {
    display: block;
    width: 100%;
    min-width: 0;
  }

  .saved-filter-combobox {
    position: relative;
    width: 100%;
    min-width: 0;
  }

  .saved-filter-combobox__status {
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

  .saved-filter-option {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    min-width: 0;
  }

  .saved-filter-option__name {
    color: var(--uui-color-text);
    font-size: var(--uui-type-default-size);
    line-height: 1.2;
  }

  .saved-filter-option__meta {
    color: var(--uui-color-text-alt);
    font-size: var(--uui-type-small-size);
    line-height: 1.2;
  }

  .saved-filter-option__empty {
    color: var(--uui-color-text-alt);
    font-size: var(--uui-type-small-size);
    font-style: italic;
    line-height: 1.2;
  }
`;

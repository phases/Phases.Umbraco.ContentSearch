import { css } from "@umbraco-cms/backoffice/external/lit";

export const filterNodesEmptyStateStyles = css`
  :host {
    display: block;
    width: 100%;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--uui-size-space-3);
    min-height: 12rem;
    padding: var(--uui-size-layout-1);
    text-align: center;
    color: var(--uui-color-text-alt);
  }

  .empty-state__icon {
    font-size: 2rem;
    color: var(--uui-color-border-emphasis);
  }

  .empty-state__title {
    margin: 0;
    color: var(--uui-color-text);
    font-size: var(--uui-type-h5-size);
    font-weight: 600;
  }

  .empty-state__description {
    margin: 0;
    max-width: 28rem;
    font-size: var(--uui-type-default-size);
    line-height: 1.5;
  }
`;

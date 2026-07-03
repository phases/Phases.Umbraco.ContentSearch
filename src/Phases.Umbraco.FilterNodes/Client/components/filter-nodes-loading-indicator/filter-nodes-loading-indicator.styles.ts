import { css } from "@umbraco-cms/backoffice/external/lit";

export const filterNodesLoadingIndicatorStyles = css`
  :host {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 12rem;
    width: 100%;
  }

  .loading-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--uui-size-space-4);
    color: var(--uui-color-text-alt);
  }

  .loading-label {
    margin: 0;
    font-size: var(--uui-type-default-size);
  }
`;

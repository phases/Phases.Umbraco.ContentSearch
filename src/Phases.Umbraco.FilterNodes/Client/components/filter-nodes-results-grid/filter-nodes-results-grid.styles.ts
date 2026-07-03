import { css } from "@umbraco-cms/backoffice/external/lit";

export const filterNodesResultsGridStyles = css`
  :host {
    display: block;
    width: 100%;
  }

  .results-grid {
    display: flex;
    flex-direction: column;
    gap: var(--uui-size-space-3);
  }

  .results-grid__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--uui-size-space-4);
  }

  .results-grid__title {
    margin: 0;
    font-size: var(--uui-type-h5-size);
    font-weight: 600;
  }

  umb-table {
    width: 100%;
  }
`;

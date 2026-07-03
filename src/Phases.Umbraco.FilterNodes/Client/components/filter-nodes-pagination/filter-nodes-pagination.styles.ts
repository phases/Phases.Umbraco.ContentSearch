import { css } from "@umbraco-cms/backoffice/external/lit";

export const filterNodesPaginationStyles = css`
  :host {
    display: block;
    width: 100%;
  }

  .pagination {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: var(--uui-size-space-4);
    padding-top: var(--uui-size-layout-1);
  }

  .pagination__summary {
    margin: 0;
    color: var(--uui-color-text-alt);
    font-size: var(--uui-type-small-size);
  }

  uui-pagination {
    display: block;
  }
`;

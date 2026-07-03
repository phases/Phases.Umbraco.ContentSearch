import { css } from "@umbraco-cms/backoffice/external/lit";

/** Row interaction tokens — set on the table host and inherited by column layouts. */
export const contentSearchResultsRowTokens = css`
  :host {
    --cs-results-icon-size: var(--uui-size-6, 18px);
    --cs-results-action-button-height: var(--uui-size-11, 2rem);
    --cs-results-line-height: 1.3;
    --cs-results-transition: 180ms cubic-bezier(0.4, 0, 0.2, 1);
    --cs-results-action-opacity: 0.76;
    --cs-results-name-decoration: none;
  }
`;

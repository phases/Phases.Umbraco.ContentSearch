import { css } from "@umbraco-cms/backoffice/external/lit";
import { contentSearchUiTokens } from "../../styles/content-search-ui.styles.js";

export const contentSearchEmptyStateStyles = [
  contentSearchUiTokens,
  css`
    :host {
      display: block;
      width: 100%;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--uui-size-space-2);
      padding: var(--cs-space-section);
      text-align: center;
      border-radius: var(--cs-radius);
      background: var(--cs-surface-inset);
      border: 1px solid var(--cs-border-subtle);
    }

    .empty-state--compact {
      flex-direction: row;
      align-items: flex-start;
      justify-content: flex-start;
      gap: var(--uui-size-space-3);
      padding: var(--uui-size-space-3) var(--cs-space-block);
      text-align: left;
      background: var(--cs-surface-inset);
      border: 1px solid var(--cs-border-subtle);
    }

    .empty-state__copy {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: var(--uui-size-space-2);
      min-width: 0;
    }

    .empty-state--loading {
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--uui-size-space-3);
      min-height: 10rem;
      padding: var(--cs-space-section);
      text-align: center;
    }

    .empty-state--loading .empty-state__copy {
      align-items: center;
    }

    .empty-state--loading .empty-state__loader {
      width: 2rem;
      height: 2rem;
    }

    .empty-state--loading .empty-state__title {
      color: var(--uui-color-text);
      font-size: var(--uui-type-default-size);
      font-weight: 600;
    }

    .empty-state__icon,
    .empty-state__loader {
      flex: 0 0 auto;
      color: var(--uui-color-text-alt);
    }

    .empty-state__icon {
      font-size: var(--uui-size-6, 18px);
      opacity: 0.85;
    }

    .empty-state__loader {
      width: 1.125rem;
      height: 1.125rem;
    }

    .empty-state--compact .empty-state__icon {
      margin-top: 0.1rem;
    }

    .empty-state__title {
      margin: 0;
      color: var(--uui-color-text-alt);
      font-size: var(--uui-type-small-size);
      font-weight: 500;
      line-height: 1.4;
    }

    .empty-state__description {
      margin: 0;
      max-width: 24rem;
      color: var(--uui-color-text-alt);
      font-size: var(--uui-type-small-size);
      line-height: 1.45;
    }

    .empty-state__action {
      margin-top: var(--uui-size-space-1);
    }
  `,
];

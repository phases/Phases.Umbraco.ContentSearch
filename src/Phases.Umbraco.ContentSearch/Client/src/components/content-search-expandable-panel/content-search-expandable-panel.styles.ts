import { css } from "@umbraco-cms/backoffice/external/lit";
import { contentSearchUiTokens } from "../../styles/content-search-ui.styles.js";

export const contentSearchExpandablePanelStyles = [
  contentSearchUiTokens,
  css`
    :host {
      display: block;
      width: 100%;
    }

    .expandable--embedded {
      border-top: 1px solid var(--cs-border-subtle);
    }

    .expandable__trigger {
      width: 100%;
      justify-content: flex-start;
      gap: var(--uui-size-space-2);
      padding: var(--uui-size-space-2) var(--cs-space-section);
      color: var(--uui-color-text-alt);
      font-size: var(--uui-type-small-size);
      font-weight: 600;
      line-height: 1.3;
    }

    .expandable__trigger--right {
      justify-content: flex-end;
      flex-direction: row-reverse;
    }

    .expandable__trigger uui-icon {
      font-size: var(--uui-size-5, 14px);
    }

    .expandable__body {
      padding: 0 var(--cs-space-section) var(--uui-size-space-3);
    }

    .expandable__body[hidden] {
      display: none;
    }

    .expandable__body ::slotted(*) {
      margin: 0;
    }
  `,
];

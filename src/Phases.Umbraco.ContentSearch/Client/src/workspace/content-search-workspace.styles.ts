import { css } from "@umbraco-cms/backoffice/external/lit";
import {
  contentSearchCardStyles,
  contentSearchUiTokens,
} from "../styles/content-search-ui.styles.js";

export const contentSearchWorkspaceStyles = [
  contentSearchUiTokens,
  contentSearchCardStyles,
  css`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }

    umb-body-layout {
      height: 100%;
    }

    .workspace {
      display: flex;
      flex-direction: column;
      min-height: 100%;
      padding: var(--cs-space-page);
      box-sizing: border-box;
      position: relative;
    }

    .workspace--busy .workspace__layout {
      pointer-events: none;
      user-select: none;
    }

    .workspace__busy-overlay {
      position: fixed;
      inset: 0;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--uui-size-space-4);
    }

    .workspace__busy-overlay::before {
      content: "";
      position: absolute;
      inset: 0;
      background: color-mix(in srgb, var(--uui-color-surface-emphasis, #1b264f) 28%, transparent);
      backdrop-filter: blur(2px);
    }

    .workspace__busy-overlay uui-loader {
      position: relative;
      width: 2.5rem;
      height: 2.5rem;
    }

    .workspace__busy-overlay-label {
      position: relative;
      margin: 0;
      color: var(--uui-color-text);
      font-size: var(--uui-type-default-size);
      font-weight: 600;
      line-height: 1.3;
    }

    .workspace__layout {
      display: flex;
      flex-direction: column;
      gap: var(--cs-space-section);
      width: 100%;
      max-width: 80rem;
      margin: 0 auto;
      flex: 1;
      min-height: 0;
    }

    .workspace__saved,
    .workspace__presets {
      flex: 0 0 auto;
    }

    .workspace__builder {
      flex: 1 1 auto;
      min-height: 22rem;
    }

    .workspace__results {
      flex: 0 1 auto;
      min-height: 0;
    }

    @media (max-width: 900px) {
      .workspace {
        padding: var(--cs-space-block);
      }

      .workspace__layout {
        gap: var(--cs-space-block);
      }

      .workspace__builder {
        min-height: 18rem;
      }
    }
  `,
];

import { css } from "@umbraco-cms/backoffice/external/lit";
import {
  contentSearchSectionHeaderStyles,
  contentSearchUiTokens,
} from "../../styles/content-search-ui.styles.js";

export const contentSearchQuickPresetsStyles = [
  contentSearchUiTokens,
  contentSearchSectionHeaderStyles,
  css`
    .quick-presets {
      display: flex;
      flex-direction: column;
      gap: var(--cs-space-block);
    }

    .quick-presets__toggle {
      margin-left: auto;
    }

    .quick-presets__meta {
      display: none;
    }

    .quick-presets__grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
      gap: var(--cs-space-inline);
    }

    .quick-presets__card {
      display: flex;
      flex-direction: column;
      gap: var(--cs-space-inline);
      padding: var(--cs-space-block);
      border: 1px solid var(--cs-border-subtle);
      border-radius: var(--cs-radius);
      background: var(--cs-surface);
      min-height: 8.5rem;
    }

    .quick-presets__card-title {
      margin: 0;
      font-size: var(--cs-type-title);
      font-weight: 600;
      line-height: 1.3;
    }

    .quick-presets__card-description {
      margin: 0;
      flex: 1;
      color: var(--uui-color-text-alt);
      font-size: var(--cs-type-label);
      line-height: 1.45;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .quick-presets__card-actions {
      display: flex;
      flex-wrap: wrap;
      gap: var(--uui-size-space-2, 0.5rem);
    }

    .quick-presets__empty {
      margin: 0;
      padding: var(--cs-space-block);
      color: var(--uui-color-text-alt);
      font-size: var(--cs-type-label);
      text-align: center;
      border: 1px dashed var(--cs-border-subtle);
      border-radius: var(--cs-radius);
    }

    @media (max-width: 560px) {
      .quick-presets__grid {
        grid-template-columns: 1fr;
      }
    }
  `,
];

import { css } from "@umbraco-cms/backoffice/external/lit";
import { filterNodesUiTokens } from "../../styles/filter-nodes-ui.styles.js";

export const filterNodesWorkspaceViewStyles = [
  filterNodesUiTokens,
  css`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }

    umb-body-layout {
      height: 100%;
    }

    .workspace-view {
      display: flex;
      flex-direction: column;
      gap: var(--fn-space-block);
      max-width: 80rem;
      margin: 0 auto;
      padding: var(--fn-space-block) var(--fn-space-section);
      box-sizing: border-box;
    }

    .workspace-view__card {
      --uui-box-default-padding: var(--fn-space-section);

      display: flex;
      flex-direction: column;
      gap: var(--fn-space-inline);
    }

    .workspace-view__card--results {
      flex: 1;
      min-height: 0;
    }

    .workspace-view__error {
      display: block;
    }

    @media (max-width: 720px) {
      .workspace-view {
        padding: var(--fn-space-inline);
        gap: var(--fn-space-inline);
      }

      .workspace-view__card {
        --uui-box-default-padding: var(--fn-space-block);
      }
    }
  `,
];

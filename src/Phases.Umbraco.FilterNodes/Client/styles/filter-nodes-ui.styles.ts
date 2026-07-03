import { css } from "@umbraco-cms/backoffice/external/lit";

/** Shared design tokens and section patterns for FilterNodes UI. */
export const filterNodesUiTokens = css`
  :host {
    --fn-space-section: var(--uui-size-space-5);
    --fn-space-block: var(--uui-size-space-4);
    --fn-space-inline: var(--uui-size-space-3);
    --fn-radius: var(--uui-border-radius);
    --fn-surface-muted: color-mix(
      in srgb,
      var(--uui-color-surface-alt) 72%,
      var(--uui-color-surface)
    );
    --fn-surface-inset: color-mix(
      in srgb,
      var(--uui-color-surface-alt) 55%,
      var(--uui-color-surface)
    );
    --fn-summary-surface: color-mix(
      in srgb,
      var(--uui-color-selected) 7%,
      var(--uui-color-surface)
    );
    --fn-summary-accent: var(--uui-color-selected);
  }
`;

export const filterNodesSectionHeaderStyles = css`
  .fn-section-header {
    display: flex;
    flex-direction: column;
    gap: var(--uui-size-space-1);
  }

  .fn-section-header__title {
    margin: 0;
    font-size: var(--uui-type-h6-size, 1rem);
    font-weight: 700;
    line-height: 1.25;
    letter-spacing: -0.01em;
  }

  .fn-section-header__description {
    margin: 0;
    color: var(--uui-color-text-alt);
    font-size: var(--uui-type-small-size);
    line-height: 1.45;
    max-width: 42rem;
  }

  .fn-section-header__meta {
    color: var(--uui-color-text-alt);
    font-weight: 600;
  }
`;

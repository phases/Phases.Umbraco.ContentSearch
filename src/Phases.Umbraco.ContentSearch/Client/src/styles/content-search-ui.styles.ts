import { css } from "@umbraco-cms/backoffice/external/lit";

/** Premium design tokens for Content Search. */
export const contentSearchUiTokens = css`
  :host {
    --cs-space-page: var(--uui-size-space-6, 2rem);
    --cs-space-section: var(--uui-size-space-5);
    --cs-space-block: var(--uui-size-space-4);
    --cs-space-inline: var(--uui-size-space-3);
    --cs-radius: var(--uui-border-radius);
    --cs-radius-lg: calc(var(--uui-border-radius) * 1.35);
    --cs-breakpoint-compact: 900px;
    --cs-surface: var(--uui-color-surface);
    --cs-surface-raised: color-mix(
      in srgb,
      var(--uui-color-surface) 94%,
      var(--uui-color-surface-alt)
    );
    --cs-surface-muted: color-mix(
      in srgb,
      var(--uui-color-surface-alt) 42%,
      var(--uui-color-surface)
    );
    --cs-surface-inset: color-mix(
      in srgb,
      var(--uui-color-surface-alt) 28%,
      var(--uui-color-surface)
    );
    --cs-border-subtle: color-mix(in srgb, var(--uui-color-border) 55%, transparent);
    --cs-shadow-sm: 0 1px 2px color-mix(in srgb, var(--uui-color-text) 5%, transparent);
    --cs-shadow-md: 0 6px 24px color-mix(in srgb, var(--uui-color-text) 7%, transparent);
    --cs-shadow-focus: 0 12px 48px color-mix(in srgb, var(--uui-color-text) 9%, transparent);
    --cs-sticky-surface: color-mix(
      in srgb,
      var(--uui-color-surface) 92%,
      transparent
    );
    --cs-type-label: var(--uui-type-small-size);
    --cs-type-title: var(--uui-type-h6-size, 1rem);
    --cs-type-hero: var(--uui-type-h4-size, 1.5rem);
  }
`;

export const contentSearchCardStyles = css`
  .cs-card {
    display: flex;
    flex-direction: column;
    gap: var(--cs-space-block);
    padding: var(--cs-space-section);
    border-radius: var(--cs-radius-lg);
    background: var(--cs-surface-raised);
    border: 1px solid var(--cs-border-subtle);
    box-shadow: var(--cs-shadow-sm);
    box-sizing: border-box;
  }

  .cs-card--subtle {
    padding: var(--cs-space-block) var(--cs-space-section);
    background: var(--cs-surface);
    box-shadow: none;
  }

  .cs-card--focus {
    padding: 0;
    overflow: visible;
    background: var(--cs-surface);
    border-color: color-mix(in srgb, var(--uui-color-border) 75%, transparent);
    box-shadow: var(--cs-shadow-focus);
  }

  .cs-card--flat {
    padding: var(--cs-space-block) var(--cs-space-section);
    background: transparent;
    border: none;
    box-shadow: none;
  }
`;

export const contentSearchSectionHeaderStyles = css`
  .cs-section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--uui-size-space-3);
    min-height: 1.75rem;
  }

  .cs-section-header__leading {
    display: flex;
    align-items: center;
    gap: var(--uui-size-space-2);
    min-width: 0;
  }

  .cs-section-header__title {
    margin: 0;
    font-size: var(--cs-type-title);
    font-weight: 600;
    line-height: 1.2;
    letter-spacing: -0.01em;
  }

  .cs-section-header__badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 1.5rem;
    padding: 0 var(--uui-size-space-2);
    border-radius: 999px;
    background: var(--cs-surface-muted);
    color: var(--uui-color-text-alt);
    font-size: var(--uui-type-small-size);
    font-weight: 600;
    line-height: 1.6;
  }

  .cs-section-header__toggle {
    flex: 0 0 auto;
    margin-left: auto;
  }
`;

export const contentSearchEmptyStateStyles = css`
  .cs-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--uui-size-space-2);
    padding: var(--cs-space-section);
    color: var(--uui-color-text-alt);
    text-align: center;
  }

  .cs-empty__icon {
    font-size: 1.5rem;
    opacity: 0.55;
  }

  .cs-empty__label {
    margin: 0;
    font-size: var(--uui-type-small-size);
    line-height: 1.45;
  }
`;

export const contentSearchSrOnlyStyles = css`
  .cs-sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
`;

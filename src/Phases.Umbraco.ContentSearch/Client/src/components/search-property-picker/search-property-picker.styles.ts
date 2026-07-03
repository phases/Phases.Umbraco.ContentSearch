import { css } from "@umbraco-cms/backoffice/external/lit";

export const searchPropertyPickerStyles = css`
  :host {
    display: block;
    width: 100%;
    min-width: 0;
  }

  .property-picker {
    position: relative;
    width: 100%;
    min-width: 0;
  }

  .property-picker__status {
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

  uui-combobox {
    width: 100%;
    min-width: 0;
  }

  .property-picker__list {
    max-height: inherit;
  }

  .property-group {
    display: flex;
    flex-direction: column;
    min-width: 0;
    content-visibility: auto;
    contain-intrinsic-size: auto 2.5rem;
  }

  .property-group + .property-group {
    box-shadow: inset 0 1px 0 color-mix(in srgb, var(--uui-color-border) 35%, transparent);
  }

  .property-group__header,
  .property-container__header,
  .property-element-type__header,
  .property-composition__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--uui-size-space-2);
    width: 100%;
    margin: 0;
    border: 0;
    background: transparent;
    color: var(--uui-color-text);
    text-align: left;
    cursor: pointer;
  }

  .property-group__header {
    padding: var(--uui-size-space-2) var(--uui-size-space-3);
    font-size: var(--uui-type-small-size);
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .property-group__header:hover,
  .property-container__header:hover,
  .property-element-type__header:hover {
    background: color-mix(in srgb, var(--uui-color-surface-alt) 55%, transparent);
  }

  .property-group__title,
  .property-container__title,
  .property-element-type__title {
    display: flex;
    align-items: center;
    gap: var(--uui-size-space-2);
    min-width: 0;
  }

  .property-group__name,
  .property-container__name,
  .property-element-type__name {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .property-group__count,
  .property-container__count,
  .property-element-type__count {
    flex-shrink: 0;
    color: var(--uui-color-text-alt);
    font-size: var(--uui-type-small-size);
    font-weight: 600;
  }

  .property-composition {
    display: flex;
    flex-direction: column;
    min-width: 0;
    margin: 0 var(--uui-size-space-2);
    padding-left: var(--uui-size-space-3);
    border-left: 2px solid color-mix(in srgb, var(--uui-color-border) 30%, transparent);
  }

  .property-composition__header {
    padding: var(--uui-size-space-2);
    font-size: var(--uui-type-small-size);
    font-weight: 600;
  }

  .property-composition__properties {
    padding-left: var(--uui-size-space-4);
  }

  .property-container {
    display: flex;
    flex-direction: column;
    min-width: 0;
    margin: var(--uui-size-space-1) var(--uui-size-space-2);
    border-radius: var(--uui-border-radius, 3px);
    background: color-mix(in srgb, var(--uui-color-surface-alt) 20%, transparent);
    content-visibility: auto;
    contain-intrinsic-size: auto 2.75rem;
  }

  .property-container__header {
    padding: var(--uui-size-space-2) var(--uui-size-space-3);
    font-size: var(--uui-type-default-size);
    font-weight: 700;
  }

  .property-container__icon,
  .property-source-icon,
  .property-element-type__icon {
    flex-shrink: 0;
    color: var(--uui-color-text-alt);
  }

  .property-block-grid-tree {
    display: flex;
    flex-direction: column;
    gap: var(--uui-size-space-2);
    padding: var(--uui-size-space-2) var(--uui-size-space-3) var(--uui-size-space-3);
  }

  .property-block-grid-tree__element-type-name {
    color: var(--uui-color-text);
    font-size: var(--uui-type-small-size);
    font-weight: 600;
  }

  .property-block-grid-tree__properties {
    display: flex;
    flex-direction: column;
    gap: var(--uui-size-space-1);
    padding-left: var(--uui-size-space-2);
  }

  .property-block-grid-tree__property-line {
    display: flex;
    align-items: baseline;
    gap: var(--uui-size-space-2);
    min-width: 0;
  }

  .property-block-grid-tree__glyph {
    flex-shrink: 0;
    width: 1.25rem;
    color: var(--uui-color-text-alt);
    font-family: var(--uui-font-family-mono, ui-monospace, monospace);
    font-size: var(--uui-type-small-size);
    text-align: center;
  }

  .property-block-grid-tree__property-name {
    min-width: 0;
    font-size: var(--uui-type-small-size);
  }

  .property-block-grid-tree__property-alias {
    padding-left: calc(1.25rem + var(--uui-size-space-2));
    color: var(--uui-color-text-alt);
    font-family: var(--uui-font-family-mono, ui-monospace, monospace);
    font-size: var(--uui-type-small-size);
  }

  .property-element-type {
    display: flex;
    flex-direction: column;
    margin: 0 var(--uui-size-space-2) var(--uui-size-space-1);
    padding-left: var(--uui-size-space-4);
    border-left: 2px solid color-mix(in srgb, var(--uui-color-border) 35%, transparent);
  }

  .property-element-type__header {
    padding: var(--uui-size-space-2);
    font-size: var(--uui-type-small-size);
    font-weight: 600;
  }

  .property-element-type__properties {
    padding-left: var(--uui-size-space-5);
  }

  .property-option {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    min-width: 0;
    content-visibility: auto;
    contain-intrinsic-size: auto 2.25rem;
  }

  .property-option__header {
    display: flex;
    align-items: center;
    gap: var(--uui-size-space-2);
    min-width: 0;
  }

  .property-option__name {
    min-width: 0;
    color: var(--uui-color-text);
    font-size: var(--uui-type-default-size);
    line-height: 1.2;
  }

  .property-option__culture {
    flex-shrink: 0;
    padding: 0.1rem 0.4rem;
    border-radius: var(--uui-border-radius, 3px);
    background: color-mix(in srgb, var(--uui-color-border) 35%, transparent);
    color: var(--uui-color-text-alt);
    font-size: var(--uui-type-small-size);
    font-weight: 600;
    line-height: 1.2;
    text-transform: uppercase;
    letter-spacing: 0.02em;
  }

  .property-option__context {
    padding-left: calc(var(--uui-icon-size, 1rem) + var(--uui-size-space-2));
    color: var(--uui-color-text-alt);
    font-size: var(--uui-type-small-size);
  }

  .property-option__alias {
    color: var(--uui-color-text-alt);
    font-family: var(--uui-font-family-mono, ui-monospace, monospace);
    font-size: var(--uui-type-small-size);
  }

  .property-option__empty {
    color: var(--uui-color-text-alt);
    font-size: var(--uui-type-small-size);
    font-style: italic;
  }
`;

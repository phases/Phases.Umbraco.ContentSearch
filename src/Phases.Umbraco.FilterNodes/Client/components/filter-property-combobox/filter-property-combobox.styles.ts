import { css } from "@umbraco-cms/backoffice/external/lit";

export const filterPropertyComboboxStyles = css`
  :host {
    display: block;
    width: 100%;
    min-width: 0;
  }

  .property-combobox {
    position: relative;
    width: 100%;
    min-width: 0;
  }

  .property-combobox__status {
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

  .property-group__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--uui-size-space-2);
    width: 100%;
    margin: 0;
    padding: var(--uui-size-space-2) var(--uui-size-space-3);
    border: 0;
    background: transparent;
    color: var(--uui-color-text);
    font-size: var(--uui-type-small-size);
    font-weight: 700;
    letter-spacing: 0.04em;
    line-height: 1.2;
    text-align: left;
    text-transform: uppercase;
    cursor: pointer;
  }

  .property-group__header:hover {
    background: color-mix(in srgb, var(--uui-color-surface-alt) 65%, transparent);
  }

  .property-group__title {
    display: flex;
    align-items: center;
    gap: var(--uui-size-space-2);
    min-width: 0;
  }

  .property-group__name {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .property-group__count {
    flex-shrink: 0;
    color: var(--uui-color-text-alt);
    font-size: var(--uui-type-small-size);
    font-weight: 600;
  }

  .property-group__header uui-symbol-expand {
    flex-shrink: 0;
    color: var(--uui-color-text-alt);
  }

  .property-container {
    display: flex;
    flex-direction: column;
    min-width: 0;
    margin-top: var(--uui-size-space-1);
    border-radius: var(--uui-border-radius, 3px);
    background: color-mix(in srgb, var(--uui-color-surface-alt) 20%, transparent);
    box-shadow: inset 0 1px 0 color-mix(in srgb, var(--uui-color-border) 20%, transparent);
    content-visibility: auto;
    contain-intrinsic-size: auto 2.75rem;
  }

  .property-container__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--uui-size-space-2);
    width: 100%;
    margin: 0;
    padding: var(--uui-size-space-2) var(--uui-size-space-3);
    border: 0;
    background: transparent;
    color: var(--uui-color-text);
    font-size: var(--uui-type-default-size);
    font-weight: 700;
    line-height: 1.2;
    text-align: left;
    cursor: pointer;
  }

  .property-container__header:hover {
    background: color-mix(in srgb, var(--uui-color-surface-alt) 55%, transparent);
  }

  .property-container__title {
    display: flex;
    align-items: center;
    gap: var(--uui-size-space-2);
    min-width: 0;
  }

  .property-container__icon {
    flex-shrink: 0;
    color: var(--uui-color-text-alt);
  }

  .property-container__name {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .property-container__count {
    flex-shrink: 0;
    color: var(--uui-color-text-alt);
    font-size: var(--uui-type-small-size);
    font-weight: 600;
  }

  .property-container__header uui-symbol-expand {
    flex-shrink: 0;
    color: var(--uui-color-text-alt);
  }

  .property-container__container-option {
    margin: 0 var(--uui-size-space-2) var(--uui-size-space-1);
    padding-left: var(--uui-size-space-5);
    border-left: 2px solid color-mix(in srgb, var(--uui-color-border) 45%, transparent);
  }

  .property-element-type {
    display: flex;
    flex-direction: column;
    min-width: 0;
    margin: 0 var(--uui-size-space-2) var(--uui-size-space-1);
    padding-left: var(--uui-size-space-4);
    border-left: 2px solid color-mix(in srgb, var(--uui-color-border) 35%, transparent);
  }

  .property-element-type__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--uui-size-space-2);
    width: 100%;
    margin: 0;
    padding: var(--uui-size-space-2) var(--uui-size-space-2);
    border: 0;
    background: transparent;
    color: var(--uui-color-text);
    font-size: var(--uui-type-small-size);
    font-weight: 600;
    line-height: 1.2;
    text-align: left;
    cursor: pointer;
  }

  .property-element-type__header:hover {
    background: color-mix(in srgb, var(--uui-color-surface-alt) 45%, transparent);
    border-radius: var(--uui-border-radius, 3px);
  }

  .property-element-type__title {
    display: flex;
    align-items: center;
    gap: var(--uui-size-space-2);
    min-width: 0;
  }

  .property-element-type__icon {
    flex-shrink: 0;
    color: var(--uui-color-text-alt);
  }

  .property-element-type__name {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .property-element-type__count {
    flex-shrink: 0;
    color: var(--uui-color-text-alt);
    font-size: var(--uui-type-small-size);
    font-weight: 500;
  }

  .property-element-type__header uui-symbol-expand {
    flex-shrink: 0;
    color: var(--uui-color-text-alt);
  }

  .property-element-type__properties {
    display: flex;
    flex-direction: column;
    min-width: 0;
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

  .property-combobox__list {
    max-height: inherit;
  }

  .property-option__header {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--uui-size-space-2);
    min-width: 0;
  }

  .property-option__label {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--uui-size-space-2);
    min-width: 0;
  }

  .property-source-icon {
    flex-shrink: 0;
    color: var(--uui-color-text-alt);
  }

  .property-source-icon--nested {
    --uui-icon-size: var(--uui-type-small-size);
  }

  .property-option__name {
    min-width: 0;
    color: var(--uui-color-text);
    font-size: var(--uui-type-default-size);
    line-height: 1.2;
  }

  .property-option__index-badge {
    --uui-badge-position: relative;
    --uui-badge-inset: auto;
    flex-shrink: 0;
  }

  .property-option__alias {
    color: var(--uui-color-text-alt);
    font-family: var(--uui-font-family-mono, ui-monospace, monospace);
    font-size: var(--uui-type-small-size);
    line-height: 1.2;
  }

  .property-option--container .property-option__name {
    font-weight: 600;
  }

  .property-option__breadcrumb-prefix {
    color: var(--uui-color-text-alt);
    font-weight: 400;
  }

  .property-option__breadcrumb {
    display: inline;
    min-width: 0;
  }

  .property-combobox__hint {
    margin: var(--uui-size-space-1) 0 0;
    color: var(--uui-color-text-alt);
    font-size: var(--uui-type-small-size);
    line-height: 1.35;
  }

  .property-option--nested .property-option__name {
    font-size: var(--uui-type-small-size);
    font-weight: 400;
  }

  .property-option--nested .property-option__alias {
    padding-left: var(--uui-size-space-1);
  }

  .property-option--search-result .property-option__name {
    font-weight: 500;
  }

  .property-option__context {
    padding-left: calc(var(--uui-icon-size, 1rem) + var(--uui-size-space-2));
    color: var(--uui-color-text-alt);
    font-size: var(--uui-type-small-size);
    line-height: 1.2;
  }

  .property-option--disabled .property-option__name {
    color: var(--uui-color-text-alt);
  }

  .property-option--tooltip {
    position: relative;
    outline: none;
  }

  .property-option--tooltip:focus-visible {
    border-radius: var(--uui-border-radius, 3px);
    outline: 2px solid var(--uui-color-focus);
    outline-offset: 2px;
  }

  .property-option__tooltip {
    position: absolute;
    left: 0;
    bottom: calc(100% + var(--uui-size-space-1, 3px));
    z-index: 10000;
    display: none;
    width: max-content;
    max-width: min(22rem, 70vw);
    padding: var(--uui-size-space-2) var(--uui-size-space-3);
    border-radius: var(--uui-border-radius, 3px);
    background: var(--uui-color-surface);
    color: var(--uui-color-text);
    box-shadow: var(--uui-shadow-depth-3);
    font-size: var(--uui-type-small-size);
    line-height: 1.4;
    pointer-events: none;
  }

  .property-option__tooltip-guidance {
    display: block;
    margin-top: var(--uui-size-space-2);
    color: var(--uui-color-text-alt);
  }

  .property-option--tooltip:hover .property-option__tooltip,
  .property-option--tooltip:focus-visible .property-option__tooltip,
  .property-option--tooltip:focus-within .property-option__tooltip {
    display: block;
  }

  .property-option__empty {
    color: var(--uui-color-text-alt);
    font-size: var(--uui-type-small-size);
    font-style: italic;
    line-height: 1.2;
  }

  .property-block-grid-tree {
    display: flex;
    flex-direction: column;
    gap: var(--uui-size-space-2);
    min-width: 0;
    padding: var(--uui-size-space-2) var(--uui-size-space-3) var(--uui-size-space-3);
  }

  .property-block-grid-tree__element-type {
    display: flex;
    flex-direction: column;
    gap: var(--uui-size-space-1);
    min-width: 0;
  }

  .property-block-grid-tree__element-type-name {
    color: var(--uui-color-text);
    font-size: var(--uui-type-small-size);
    font-weight: 600;
    line-height: 1.3;
  }

  .property-block-grid-tree__properties {
    display: flex;
    flex-direction: column;
    gap: var(--uui-size-space-1);
    min-width: 0;
    padding-left: var(--uui-size-space-2);
  }

  .property-block-grid-tree__property {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    min-width: 0;
  }

  .property-block-grid-tree__property-line {
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
    gap: var(--uui-size-space-2);
    min-width: 0;
  }

  .property-block-grid-tree__glyph {
    flex-shrink: 0;
    width: 1.25rem;
    color: var(--uui-color-text-alt);
    font-family: var(--uui-font-family-mono, ui-monospace, monospace);
    font-size: var(--uui-type-small-size);
    line-height: 1.2;
    text-align: center;
  }

  .property-block-grid-tree__glyph--continuation {
    color: color-mix(in srgb, var(--uui-color-text-alt) 70%, transparent);
  }

  .property-block-grid-tree__property-name {
    min-width: 0;
    color: var(--uui-color-text);
    font-size: var(--uui-type-small-size);
    line-height: 1.2;
  }

  .property-block-grid-tree__property-alias {
    padding-left: calc(1.25rem + var(--uui-size-space-2));
    color: var(--uui-color-text-alt);
    font-family: var(--uui-font-family-mono, ui-monospace, monospace);
    font-size: var(--uui-type-small-size);
    line-height: 1.2;
  }

  .property-block-grid-tree__property--info {
    position: relative;
    padding: var(--uui-size-space-1) 0;
    color: var(--uui-color-text-alt);
    cursor: default;
    user-select: none;
  }

  .property-block-grid-tree__property--info .property-block-grid-tree__property-name {
    color: var(--uui-color-text-alt);
  }

  .property-block-grid-tree__property--info:hover .property-option__tooltip,
  .property-block-grid-tree__property--info:focus-within .property-option__tooltip {
    display: block;
  }

  .property-block-grid-tree__index-badge {
    color: var(--uui-color-warning, #f0ad4e);
    font-size: var(--uui-type-small-size);
    line-height: 1.2;
  }

  .property-block-grid-tree__selectable-option {
    min-width: 0;
  }

  .property-block-grid-tree__property--selectable .property-block-grid-tree__property-name {
    font-weight: 500;
  }

  .property-block-grid-tree__container-search {
    display: flex;
    flex-direction: column;
    gap: var(--uui-size-space-1);
    min-width: 0;
    margin-top: var(--uui-size-space-2);
    padding-top: var(--uui-size-space-2);
    border-top: 1px solid color-mix(in srgb, var(--uui-color-border) 35%, transparent);
  }

  .property-block-grid-tree__container-search-label {
    margin: 0;
    color: var(--uui-color-text);
    font-size: var(--uui-type-small-size);
    font-weight: 600;
    line-height: 1.3;
  }

  .property-block-grid-tree__container-search-item {
    display: flex;
    align-items: center;
    gap: var(--uui-size-space-2);
    min-width: 0;
  }

  .property-block-grid-tree__marker {
    flex-shrink: 0;
    width: 1.25rem;
    font-size: var(--uui-type-small-size);
    line-height: 1.2;
    text-align: center;
  }

  .property-block-grid-tree__marker--positive {
    color: var(--uui-color-positive, #2bc37c);
    font-weight: 700;
  }
`;

import { html, css, customElement, property } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement } from "@umbraco-cms/backoffice/lit-element";
import type { ContentSearchContentTypeColumnValue } from "./content-search-results-column.models.js";

@customElement("content-search-content-type-column")
export class ContentSearchContentTypeColumnElement extends UmbLitElement {
  @property({ attribute: false })
  value?: ContentSearchContentTypeColumnValue;

  override render() {
    const name = this.value?.name?.trim();

    if (!name || name === "—") {
      return html`—`;
    }

    const alias = this.value?.alias?.trim();
    const tooltip = alias && alias !== name ? `${name} (${alias})` : name;

    return html`
      <uui-tag
        class="content-type-tag"
        look="secondary"
        color="default"
        label=${tooltip}
        title=${tooltip}
      >
        <span class="content-type-tag__text">${name}</span>
      </uui-tag>
    `;
  }

  static override readonly styles = [
    css`
      :host {
        display: flex;
        align-items: center;
        min-width: 0;
        max-width: 100%;
        height: 100%;
        overflow: hidden;
      }

      .content-type-tag {
        display: inline-flex;
        align-items: center;
        max-width: 100%;
        min-width: 0;
        vertical-align: middle;
        font-weight: 500;
        --uui-tag-font-size: var(--uui-type-small-size);
        --uui-tag-padding: 1px var(--uui-size-space-2);
        --uui-tag-border-radius: var(--uui-size-3, 9px);
      }

      .content-type-tag__text {
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        line-height: 1.3;
        font-weight: 500;
        color: var(--uui-color-text-alt);
      }
    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    "content-search-content-type-column": ContentSearchContentTypeColumnElement;
  }
}

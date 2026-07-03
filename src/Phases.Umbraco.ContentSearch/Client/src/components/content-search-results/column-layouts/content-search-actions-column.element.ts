import {
  html,
  css,
  customElement,
  property,
  nothing,
} from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement } from "@umbraco-cms/backoffice/lit-element";
import { UMB_NOTIFICATION_CONTEXT } from "@umbraco-cms/backoffice/notification";
import { isResolvableContentUrl } from "../../../utils/content-url.utils.js";
import type { ContentSearchActionsColumnValue } from "./content-search-results-column.models.js";
import {
  CONTENT_SEARCH_ACTIONS_COPY_GUID_LABEL,
  CONTENT_SEARCH_ACTIONS_COPY_NODE_ID_LABEL,
  CONTENT_SEARCH_ACTIONS_COPY_UDI_LABEL,
  CONTENT_SEARCH_ACTIONS_COPY_URL_TOOLTIP,
  CONTENT_SEARCH_ACTIONS_MORE_TOOLTIP,
  CONTENT_SEARCH_ACTIONS_OPEN_WEBSITE_TOOLTIP,
} from "./content-search-actions-column.tooltips.js";
import { contentSearchResultsRowTokens } from "../content-search-results-row.tokens.js";

const NEW_TAB_LINK_REL = "noopener noreferrer";

interface ActionMenuItem {
  readonly label: string;
  readonly copyLabel?: string;
  readonly value?: string;
  readonly href?: string;
}

@customElement("content-search-actions-column")
export class ContentSearchActionsColumnElement extends UmbLitElement {
  @property({ attribute: false })
  value?: ContentSearchActionsColumnValue;

  readonly #popoverId = `cs-actions-popover-${crypto.randomUUID()}`;

  override render() {
    if (!this.value) {
      return nothing;
    }

    const menuItems = this.#getMenuItems();

    if (menuItems.length === 0) {
      return nothing;
    }

    return html`
      <uui-button
        class="actions-menu__trigger"
        popovertarget=${this.#popoverId}
        compact
        look="secondary"
        label=${CONTENT_SEARCH_ACTIONS_MORE_TOOLTIP}
        title=${CONTENT_SEARCH_ACTIONS_MORE_TOOLTIP}
        @click=${this.#stopPropagation}
      >
        <uui-symbol-more class="actions-menu__symbol"></uui-symbol-more>
      </uui-button>
      <uui-popover-container
        class="actions-menu__popover"
        id=${this.#popoverId}
        placement="bottom-end"
        margin="6"
      >
        <umb-popover-layout class="actions-menu__layout">
          ${menuItems.map((item) => this.#renderMenuItem(item))}
        </umb-popover-layout>
      </uui-popover-container>
    `;
  }

  #renderMenuItem(item: ActionMenuItem) {
    if (item.href) {
      return html`
        <uui-menu-item
          label=${item.label}
          href=${item.href}
          target="_blank"
          rel=${NEW_TAB_LINK_REL}
          @click=${this.#stopPropagation}
        ></uui-menu-item>
      `;
    }

    return html`
      <uui-menu-item
        label=${item.label}
        @click=${this.#stopPropagation}
        @click-label=${(event: Event) => {
          this.#stopPropagation(event);
          if (item.value && item.copyLabel) {
            void this.#copyText(item.value, item.copyLabel);
          }
        }}
      ></uui-menu-item>
    `;
  }

  #getMenuItems(): ActionMenuItem[] {
    if (!this.value) {
      return [];
    }

    const { url, udi, key, nodeId, showOpenWebsite = false } = this.value;
    const resolvedUrl = this.#getResolvableUrl(url);
    const items: ActionMenuItem[] = [];

    if (showOpenWebsite && resolvedUrl) {
      items.push({
        label: CONTENT_SEARCH_ACTIONS_OPEN_WEBSITE_TOOLTIP,
        href: resolvedUrl,
      });
    }

    if (resolvedUrl) {
      items.push({
        label: CONTENT_SEARCH_ACTIONS_COPY_URL_TOOLTIP,
        copyLabel: "URL",
        value: resolvedUrl,
      });
    }

    const trimmedUdi = udi?.trim();
    if (trimmedUdi) {
      items.push({
        label: CONTENT_SEARCH_ACTIONS_COPY_UDI_LABEL,
        copyLabel: "UDI",
        value: trimmedUdi,
      });
    }

    const trimmedKey = key?.trim();
    if (trimmedKey) {
      items.push({
        label: CONTENT_SEARCH_ACTIONS_COPY_GUID_LABEL,
        copyLabel: "GUID",
        value: trimmedKey,
      });
    }

    if (nodeId !== undefined && nodeId > 0) {
      items.push({
        label: CONTENT_SEARCH_ACTIONS_COPY_NODE_ID_LABEL,
        copyLabel: "Node ID",
        value: String(nodeId),
      });
    }

    return items;
  }

  #getResolvableUrl(url?: string): string | undefined {
    if (!isResolvableContentUrl(url)) {
      return undefined;
    }

    return url!.trim();
  }

  #stopPropagation(event: Event): void {
    event.stopPropagation();
  }

  async #copyText(text: string, label: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
      const notificationContext = await this.getContext(UMB_NOTIFICATION_CONTEXT);
      notificationContext?.peek("positive", {
        data: {
          headline: "Copied",
          message: `${label} copied to clipboard.`,
        },
      });
    } catch {
      const notificationContext = await this.getContext(UMB_NOTIFICATION_CONTEXT);
      notificationContext?.peek("danger", {
        data: {
          headline: "Copy failed",
          message: `Unable to copy the ${label.toLowerCase()} to the clipboard.`,
        },
      });
    }
  }

  static override readonly styles = [
    contentSearchResultsRowTokens,
    css`
      :host {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        width: 100%;
        min-width: 0;
        height: 100%;
        overflow: visible;
        --uui-menu-item-flat-structure: 1;
      }

      .actions-menu__trigger {
        cursor: pointer;
        opacity: var(--cs-results-action-opacity, 0.76);
        transition: opacity var(--cs-results-transition);
        --uui-button-height: var(--cs-results-action-button-height, var(--uui-size-11, 2rem));
      }

      .actions-menu__trigger:hover,
      .actions-menu__trigger:focus-visible {
        opacity: 1;
      }

      .actions-menu__symbol {
        font-size: var(--cs-results-icon-size);
        width: var(--cs-results-icon-size);
        height: var(--cs-results-icon-size);
      }

      .actions-menu__popover {
        min-width: 11rem;
      }

      .actions-menu__layout {
        overflow: visible;
      }
    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    "content-search-actions-column": ContentSearchActionsColumnElement;
  }
}

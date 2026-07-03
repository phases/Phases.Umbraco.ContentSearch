import {
  html,
  css,
  customElement,
  property,
  nothing,
} from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement } from "@umbraco-cms/backoffice/lit-element";
import { UMB_NOTIFICATION_CONTEXT } from "@umbraco-cms/backoffice/notification";
import {
  FILTER_RESULTS_COPY_URL_TOOLTIP,
  FILTER_RESULTS_EDIT_NODE_TOOLTIP,
  FILTER_RESULTS_OPEN_URL_TOOLTIP,
} from "../filter-results-grid.tooltips.js";
import type { FilterResultsActionsColumnValue } from "./filter-results-grid-column.models.js";

@customElement("filter-results-actions-column")
export class FilterResultsActionsColumnElement extends UmbLitElement {
  @property({ attribute: false })
  value?: FilterResultsActionsColumnValue;

  override render() {
    if (!this.value) {
      return nothing;
    }

    const { editPath, url } = this.value;

    return html`
      <uui-button-group>
        <uui-button
          compact
          look="secondary"
          href=${editPath}
          target="_blank"
          rel="noopener noreferrer"
          label=${FILTER_RESULTS_EDIT_NODE_TOOLTIP}
          title=${FILTER_RESULTS_EDIT_NODE_TOOLTIP}
        >
          <uui-icon name="icon-edit"></uui-icon>
        </uui-button>
        ${url
          ? html`
              <uui-button
                compact
                look="secondary"
                href=${url}
                target="_blank"
                rel="noopener noreferrer"
                label=${FILTER_RESULTS_OPEN_URL_TOOLTIP}
                title=${FILTER_RESULTS_OPEN_URL_TOOLTIP}
              >
                <uui-icon name="icon-globe"></uui-icon>
              </uui-button>
              <uui-button
                compact
                look="secondary"
                label=${FILTER_RESULTS_COPY_URL_TOOLTIP}
                title=${FILTER_RESULTS_COPY_URL_TOOLTIP}
                @click=${() => this.#copyUrl(url)}
              >
                <uui-icon name="icon-clipboard-copy"></uui-icon>
              </uui-button>
            `
          : nothing}
      </uui-button-group>
    `;
  }

  async #copyUrl(url: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(url);
      const notificationContext = await this.getContext(UMB_NOTIFICATION_CONTEXT);
      notificationContext?.peek("positive", {
        data: {
          headline: "Copied",
          message: "URL copied to clipboard.",
        },
      });
    } catch {
      const notificationContext = await this.getContext(UMB_NOTIFICATION_CONTEXT);
      notificationContext?.peek("danger", {
        data: {
          headline: "Copy failed",
          message: "Unable to copy the URL to the clipboard.",
        },
      });
    }
  }

  static override readonly styles = [
    css`
      :host {
        display: block;
      }

      uui-button-group {
        display: inline-flex;
        flex-wrap: nowrap;
      }
    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    "filter-results-actions-column": FilterResultsActionsColumnElement;
  }
}

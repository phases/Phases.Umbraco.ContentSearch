import {
  html,
  customElement,
  property,
  state,
  nothing,
} from "@umbraco-cms/backoffice/external/lit";
import { UmbTextStyles } from "@umbraco-cms/backoffice/style";
import { UmbLitElement } from "@umbraco-cms/backoffice/lit-element";
import { umbConfirmModal } from "@umbraco-cms/backoffice/modal";
import { SAVED_SEARCHES_TITLE } from "../../constants/content-search.constants.js";
import {
  SAVED_SEARCH_MAX_DESCRIPTION_LENGTH,
  SAVED_SEARCH_MAX_NAME_LENGTH,
} from "../../constants/saved-search.constants.js";
import type { SavedSearchSummary } from "../../models/saved-search.models.js";
import {
  CONTENT_SEARCH_SAVED_SEARCH_DELETE,
  CONTENT_SEARCH_SAVED_SEARCH_LOAD,
  CONTENT_SEARCH_SAVED_SEARCH_RENAME,
  CONTENT_SEARCH_SAVED_SEARCH_SAVE,
} from "../../models/saved-search.models.js";
import {
  contentSearchEmptyStateStyles,
  contentSearchSectionHeaderStyles,
  contentSearchUiTokens,
} from "../../styles/content-search-ui.styles.js";
import { contentSearchSavedSearchesStyles } from "./content-search-saved-searches.styles.js";

@customElement("content-search-saved-searches")
export class ContentSearchSavedSearchesElement extends UmbLitElement {
  @property({ type: Array })
  items: readonly SavedSearchSummary[] = [];

  @property({ type: Boolean })
  loading = false;

  @property({ type: Boolean })
  saving = false;

  @property({ type: Boolean })
  saveDisabled = false;

  @property({ type: String })
  selectedSavedSearchId = "";

  @state()
  private _expanded = false;

  @state()
  private _showSaveForm = false;

  @state()
  private _saveName = "";

  @state()
  private _saveDescription = "";

  @state()
  private _renamingId = "";

  @state()
  private _renameName = "";

  @state()
  private _renameDescription = "";

  override render() {
    const count = this.items.length;

    return html`
      <div class="saved-searches">
        ${this.#renderHeader(count)}
        ${this._expanded
          ? html`
              <div class="saved-searches__toolbar">
                <uui-button
                  look="primary"
                  label="Save current search"
                  ?disabled=${this.saveDisabled || this.saving}
                  @click=${this.#onToggleSaveForm}
                >
                  <uui-icon name="icon-save"></uui-icon>
                  Save
                </uui-button>
              </div>

              ${this._showSaveForm ? this.#renderSaveForm() : nothing}
              ${this.#renderTable(this.items)}
            `
          : nothing}
      </div>
    `;
  }

  #renderHeader(count: number) {
    return html`
      <div class="cs-section-header saved-searches__header">
        <div class="cs-section-header__leading">
          <h2 class="cs-section-header__title">${SAVED_SEARCHES_TITLE}</h2>
          <span class="cs-section-header__badge">${this.loading ? "…" : count}</span>
        </div>
        <uui-button
          class="cs-section-header__toggle"
          look="reset"
          compact
          label=${this._expanded ? "Collapse saved searches" : "Expand saved searches"}
          aria-expanded=${this._expanded ? "true" : "false"}
          @click=${() => {
            this._expanded = !this._expanded;
          }}
        >
          <uui-icon
            name=${this._expanded ? "icon-navigation-up" : "icon-navigation-down"}
          ></uui-icon>
        </uui-button>
      </div>
    `;
  }

  #renderTable(items: readonly SavedSearchSummary[]) {
    if (this.loading) {
      return html`
        <div class="saved-searches__empty" role="region" aria-label="Saved searches">
          <uui-loader></uui-loader>
        </div>
      `;
    }

    if (items.length === 0) {
      return html`
        <div class="saved-searches__empty cs-empty" role="region" aria-label="Saved searches">
          <p class="cs-empty__label">No saved searches yet. Run a search and click Save.</p>
        </div>
      `;
    }

    return html`
      <div class="saved-searches__table-wrap" role="region" aria-label="Saved searches">
        <table class="saved-searches__table">
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Description</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${items.map((item) => this.#renderRow(item))}
          </tbody>
        </table>
      </div>
    `;
  }

  #renderRow(item: SavedSearchSummary) {
    const isRenaming = this._renamingId === item.id;
    const isSelected = this.selectedSavedSearchId === item.id;

    return html`
      <tr class=${isSelected ? "saved-searches__row--selected" : ""}>
        <td>
          ${isRenaming
            ? this.#renderRenameForm(item)
            : html`
                <div class="saved-searches__name">
                  <span class="saved-searches__name-text">${item.name}</span>
                </div>
              `}
        </td>
        <td>
          <span class="saved-searches__description" title=${item.description ?? ""}>
            ${item.description ?? "—"}
          </span>
        </td>
        <td>
          ${isRenaming
            ? nothing
            : html`
                <div class="saved-searches__actions">
                  <uui-button
                    look="secondary"
                    compact
                    label="Load search"
                    @click=${() => this.#onLoad(item.id)}
                  >
                    Load
                  </uui-button>
                  <uui-button
                    look="outline"
                    compact
                    label="Edit"
                    @click=${() => this.#startRename(item)}
                  >
                    Edit
                  </uui-button>
                  <uui-button
                    look="outline"
                    compact
                    label="Delete"
                    @click=${() => this.#onDelete(item)}
                  >
                    Delete
                  </uui-button>
                </div>
              `}
        </td>
      </tr>
    `;
  }

  #renderSaveForm() {
    return html`
      <div class="saved-searches__save-form">
        <uui-input
          label="Name"
          placeholder="e.g. Published articles"
          maxlength=${SAVED_SEARCH_MAX_NAME_LENGTH}
          .value=${this._saveName}
          ?disabled=${this.saving}
          @input=${(event: Event) => {
            this._saveName = (event.target as HTMLInputElement).value;
          }}
        ></uui-input>
        <uui-textarea
          label="Description"
          placeholder="Optional notes about this search"
          maxlength=${SAVED_SEARCH_MAX_DESCRIPTION_LENGTH}
          .value=${this._saveDescription}
          ?disabled=${this.saving}
          @input=${(event: Event) => {
            this._saveDescription = (event.target as HTMLTextAreaElement).value;
          }}
        ></uui-textarea>
        <div class="saved-searches__save-actions">
          <uui-button look="secondary" label="Cancel" ?disabled=${this.saving} @click=${this.#onCancelSave}>
            Cancel
          </uui-button>
          <uui-button
            look="primary"
            label="Save search"
            ?disabled=${this.saving || !this._saveName.trim()}
            @click=${this.#onSave}
          >
            ${this.saving ? "Saving…" : "Save search"}
          </uui-button>
        </div>
      </div>
    `;
  }

  #renderRenameForm(item: SavedSearchSummary) {
    return html`
      <div class="saved-searches__rename-form">
        <uui-input
          label="Name"
          .value=${this._renameName}
          maxlength=${SAVED_SEARCH_MAX_NAME_LENGTH}
          @input=${(event: Event) => {
            this._renameName = (event.target as HTMLInputElement).value;
          }}
        ></uui-input>
        <uui-textarea
          label="Description"
          .value=${this._renameDescription}
          maxlength=${SAVED_SEARCH_MAX_DESCRIPTION_LENGTH}
          @input=${(event: Event) => {
            this._renameDescription = (event.target as HTMLTextAreaElement).value;
          }}
        ></uui-textarea>
        <div class="saved-searches__save-actions">
          <uui-button look="secondary" label="Cancel" @click=${this.#cancelRename}>Cancel</uui-button>
          <uui-button
            look="primary"
            label="Save"
            ?disabled=${!this._renameName.trim()}
            @click=${() => this.#onRename(item.id)}
          >
            Save
          </uui-button>
        </div>
      </div>
    `;
  }

  #onToggleSaveForm(): void {
    this._showSaveForm = !this._showSaveForm;

    if (!this._showSaveForm) {
      this.#resetSaveForm();
    }
  }

  #onCancelSave(): void {
    this._showSaveForm = false;
    this.#resetSaveForm();
  }

  #resetSaveForm(): void {
    this._saveName = "";
    this._saveDescription = "";
  }

  #onSave(): void {
    const name = this._saveName.trim();

    if (!name) {
      return;
    }

    this.dispatchEvent(
      new CustomEvent(CONTENT_SEARCH_SAVED_SEARCH_SAVE, {
        detail: {
          name,
          description: this._saveDescription.trim() || undefined,
        },
        bubbles: true,
        composed: true,
      }),
    );
  }

  resetSaveForm(): void {
    this._showSaveForm = false;
    this.#resetSaveForm();
  }

  #onLoad(savedSearchId: string): void {
    this.dispatchEvent(
      new CustomEvent(CONTENT_SEARCH_SAVED_SEARCH_LOAD, {
        detail: { savedSearchId },
        bubbles: true,
        composed: true,
      }),
    );
  }

  #startRename(item: SavedSearchSummary): void {
    this._renamingId = item.id;
    this._renameName = item.name;
    this._renameDescription = item.description ?? "";
  }

  #cancelRename(): void {
    this._renamingId = "";
    this._renameName = "";
    this._renameDescription = "";
  }

  #onRename(savedSearchId: string): void {
    const name = this._renameName.trim();

    if (!name) {
      return;
    }

    this.dispatchEvent(
      new CustomEvent(CONTENT_SEARCH_SAVED_SEARCH_RENAME, {
        detail: {
          savedSearchId,
          name,
          description: this._renameDescription.trim() || undefined,
        },
        bubbles: true,
        composed: true,
      }),
    );

    this.#cancelRename();
  }

  async #onDelete(item: SavedSearchSummary): Promise<void> {
    const confirmed = await umbConfirmModal(this, {
      headline: "Delete saved search",
      content: `Delete "${item.name}"? This cannot be undone.`,
      color: "warning",
      confirmLabel: "Delete",
    }).catch(() => false);

    if (confirmed === false) {
      return;
    }

    this.dispatchEvent(
      new CustomEvent(CONTENT_SEARCH_SAVED_SEARCH_DELETE, {
        detail: { savedSearchId: item.id },
        bubbles: true,
        composed: true,
      }),
    );
  }

  static override readonly styles = [
    UmbTextStyles,
    contentSearchUiTokens,
    contentSearchSectionHeaderStyles,
    contentSearchEmptyStateStyles,
    ...contentSearchSavedSearchesStyles,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    "content-search-saved-searches": ContentSearchSavedSearchesElement;
  }
}

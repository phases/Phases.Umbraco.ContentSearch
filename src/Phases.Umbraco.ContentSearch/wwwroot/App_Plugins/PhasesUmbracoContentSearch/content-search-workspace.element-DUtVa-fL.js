import { css as C, property as l, state as d, customElement as U, nothing as g, html as o, repeat as D, query as $r, keyed as bl, ifDefined as ai } from "@umbraco-cms/backoffice/external/lit";
import { UmbTextStyles as Fe } from "@umbraco-cms/backoffice/style";
import { UmbLitElement as B } from "@umbraco-cms/backoffice/lit-element";
import { UMB_AUTH_CONTEXT as Sl } from "@umbraco-cms/backoffice/auth";
import { UMB_NOTIFICATION_CONTEXT as Ms } from "@umbraco-cms/backoffice/notification";
import { c as Cl, C as wl } from "./bundle.manifests-Dgigv-UM.js";
import { umbHttpClient as Ct } from "@umbraco-cms/backoffice/http-client";
import { umbConfirmModal as xl } from "@umbraco-cms/backoffice/modal";
import { UMB_VARIANT_CONTEXT as $l, UmbVariantId as El } from "@umbraco-cms/backoffice/variant";
import { debounce as Er } from "@umbraco-cms/backoffice/utils";
import { UMB_EDIT_DOCUMENT_WORKSPACE_PATH_PATTERN as Tl } from "@umbraco-cms/backoffice/document";
const Pl = Cl(
  wl.workspaceTitle
), Al = "Saved", kl = "Search", Ml = "Results", Tr = 20, Pr = [10, 20, 50, 100];
function ni() {
  return {
    id: crypto.randomUUID(),
    contentTypeAlias: "",
    propertyAlias: "",
    operator: "",
    value: ""
  };
}
function Ar(e) {
  return e.filter(
    (t) => !!t.contentTypeAlias.trim() && !!t.propertyAlias.trim() && !!t.operator
  ).map((t) => ({
    contentTypeAlias: t.contentTypeAlias.trim(),
    propertyAlias: t.propertyAlias.trim(),
    operator: t.operator,
    value: t.value.trim() || void 0
  }));
}
function Rl(e, t, s, i) {
  return {
    name: e.trim(),
    description: t?.trim() || void 0,
    isShared: s,
    matchMode: i.matchMode,
    searchCultureMode: i.searchCultureMode,
    culture: i.searchCultureMode === "SpecificCulture" && i.culture.trim() || void 0,
    conditions: Ar(i.conditions),
    pageSize: i.pageSize,
    sortColumn: i.sortColumn,
    sortDescending: i.sortDescending
  };
}
function kr(e) {
  return e.length === 0 ? [ni()] : e.map((t) => ({
    id: crypto.randomUUID(),
    contentTypeAlias: t.contentTypeAlias ?? "",
    propertyAlias: t.propertyAlias ?? "",
    operator: t.operator ?? "",
    value: t.value ?? ""
  }));
}
function Nl(e) {
  const t = /* @__PURE__ */ new Set();
  for (const s of e.conditions) {
    const i = s.contentTypeAlias?.trim();
    i && t.add(i);
  }
  return [...t];
}
function Ol(e) {
  const t = e.toLowerCase();
  return t === "shared" ? "shared" : t === "recent" ? "recent" : "personal";
}
function Mr(e) {
  return {
    ...e,
    scope: Ol(e.scope)
  };
}
function Ll(e) {
  return {
    ...Mr(e),
    matchMode: Rr(e.matchMode),
    searchCultureMode: Nr(e.searchCultureMode),
    culture: e.culture,
    conditions: e.conditions,
    pageSize: e.pageSize,
    sortColumn: e.sortColumn,
    sortDescending: e.sortDescending,
    linkedSavedSearchId: e.linkedSavedSearchId
  };
}
function Dl(e) {
  const t = (s) => s.map(Mr);
  return {
    items: t(e.items ?? []),
    recent: t(e.recent ?? []),
    pinned: t(e.pinned ?? []),
    personal: t(e.personal ?? []),
    shared: t(e.shared ?? [])
  };
}
function Rr(e) {
  if (typeof e == "number")
    return e === 1 ? "any" : "all";
  const t = String(e).trim().toLowerCase();
  return t === "any" || t === "1" ? "any" : "all";
}
function Nr(e) {
  switch (typeof e == "number" ? e === 1 ? "CurrentCulture" : e === 2 ? "SpecificCulture" : "AllCultures" : String(e).trim()) {
    case "CurrentCulture":
    case "currentculture":
    case "1":
      return "CurrentCulture";
    case "SpecificCulture":
    case "specificculture":
    case "2":
      return "SpecificCulture";
    default:
      return "AllCultures";
  }
}
function Or(e) {
  return {
    matchMode: e.matchMode === "any" ? "Any" : "All",
    searchCultureMode: e.searchCultureMode,
    culture: e.culture || null,
    pageIndex: e.pageIndex ?? 0,
    pageSize: e.pageSize ?? 20,
    sortColumn: e.sortColumn ?? "name",
    sortDescending: e.sortDescending ?? !1,
    conditions: Ar(e.conditions)
  };
}
function zl(e) {
  return {
    id: e.id,
    key: e.key,
    name: e.name,
    contentTypeAlias: e.contentTypeAlias,
    path: e.path,
    pathDisplay: e.pathDisplay,
    udi: e.udi,
    createDate: e.createDate,
    updateDate: e.updateDate,
    url: e.url,
    urlDisplay: e.urlDisplay,
    matchedCulture: e.matchedCulture,
    matchedFields: e.matchedFields?.map((t) => ({
      propertyAlias: t.propertyAlias,
      propertyName: t.propertyName,
      operatorLabel: t.operatorLabel,
      snippet: t.snippet,
      highlightTerms: t.highlightTerms
    }))
  };
}
const Il = "nodeName", Ul = /* @__PURE__ */ new Set([
  "contains",
  "equals",
  "startsWith",
  "endsWith"
]);
function Bl(e) {
  const t = /* @__PURE__ */ new Set();
  for (const s of e) {
    if (s.propertyAlias !== Il || !Ul.has(s.operator))
      continue;
    const i = s.value?.trim();
    i && t.add(i);
  }
  return [...t];
}
function Lr(e, t) {
  if (!e || t.length === 0)
    return [{ text: e, highlight: !1 }];
  const s = [
    ...new Set(t.map((y) => y.trim()).filter(Boolean))
  ].sort((y, N) => N.length - y.length);
  if (s.length === 0)
    return [{ text: e, highlight: !1 }];
  const i = e.toLowerCase(), r = [];
  for (const y of s) {
    const N = y.toLowerCase();
    let W = 0;
    for (; W < i.length; ) {
      const I = i.indexOf(N, W);
      if (I === -1)
        break;
      r.push({ start: I, end: I + y.length }), W = I + y.length;
    }
  }
  if (r.length === 0)
    return [{ text: e, highlight: !1 }];
  r.sort((y, N) => y.start - N.start || y.end - N.end);
  const a = [];
  for (const y of r) {
    const N = a[a.length - 1];
    if (!N || y.start > N.end) {
      a.push({ ...y });
      continue;
    }
    N.end = Math.max(N.end, y.end);
  }
  const n = [];
  let _ = 0;
  for (const y of a)
    y.start > _ && n.push({ text: e.slice(_, y.start), highlight: !1 }), n.push({ text: e.slice(y.start, y.end), highlight: !0 }), _ = y.end;
  return _ < e.length && n.push({ text: e.slice(_), highlight: !1 }), n;
}
function Tt() {
  return {
    hasSearched: !1,
    loading: !1,
    results: [],
    totalCount: 0,
    executionTimeMs: null
  };
}
const Rs = "content-search-results-sort-change", Ns = "content-search-results-page-change", Os = "content-search-results-page-size-change", er = "content-search-clear-search", Yt = "content-search-clear-results", Ie = {
  column: "name",
  descending: !1
}, Ls = "content-search-saved-search-load", Ds = "content-search-saved-search-save", zs = "content-search-saved-search-delete", Is = "content-search-saved-search-rename", tr = "content-search-apply-definition", Us = "content-search-preset-run", Dr = "/umbraco/phasesumbracocontentsearch/api/v1", H = {
  search: "search",
  export: "export",
  languages: "metadata/languages",
  contentTypes: "metadata/content-types",
  properties: (e) => `metadata/content-types/${encodeURIComponent(e)}/properties`,
  savedSearches: "savedsearches",
  savedSearch: (e) => `savedsearches/${e}`,
  savedSearchDuplicate: (e) => `savedsearches/${e}/duplicate`,
  savedSearchPin: (e) => `savedsearches/${e}/pin`,
  savedSearchFavourite: (e) => `savedsearches/${e}/favourite`,
  savedSearchUse: (e) => `savedsearches/${e}/use`,
  savedSearchRecent: "savedsearches/recent",
  searchPresets: "search-presets",
  searchPreset: (e) => `search-presets/${encodeURIComponent(e)}`
};
class we extends Error {
  constructor(t, s, i) {
    super(t), this.name = "ContentSearchApiError", this.status = s, this.title = i?.title, this.detail = i?.detail, this.instance = i?.instance, i?.cause !== void 0 && (this.cause = i.cause);
  }
  static fromProblem(t, s) {
    const i = s.status;
    return typeof t == "string" ? new we(
      t || s.statusText || "The Content Search API request failed.",
      i
    ) : t ? new we(
      t.detail ?? t.title ?? s.statusText,
      i,
      {
        title: t.title,
        detail: t.detail,
        instance: t.instance
      }
    ) : new we(
      s.statusText || "The Content Search API request failed.",
      i
    );
  }
}
const wt = [
  {
    scheme: "bearer",
    type: "http"
  }
];
class Wl {
  get(t, s) {
    return this.#e("GET", t, void 0, s);
  }
  post(t, s, i) {
    return this.#e("POST", t, s, i);
  }
  put(t, s, i) {
    return this.#e("PUT", t, s, i);
  }
  delete(t, s) {
    return this.#e("DELETE", t, void 0, s);
  }
  async #e(t, s, i, r) {
    const a = Hl(s), n = await (t === "GET" ? Ct.get({
      url: a,
      security: wt,
      signal: r
    }) : t === "POST" ? Ct.post({
      url: a,
      security: wt,
      signal: r,
      body: i
    }) : t === "PUT" ? Ct.put({
      url: a,
      security: wt,
      signal: r,
      body: i
    }) : Ct.delete({
      url: a,
      security: wt,
      signal: r
    }));
    return this.#t(n);
  }
  async #t(t) {
    const { data: s, error: i, response: r } = t;
    if (i || !r.ok)
      throw we.fromProblem(
        i,
        r
      );
    return s;
  }
}
function cs() {
  return new Wl();
}
function Hl(e) {
  const t = e.replace(/^\/+/, "");
  return `${Dr.replace(/\/+$/, "")}/${t}`;
}
class Gl {
  #e;
  constructor(t) {
    this.#e = t;
  }
  search(t, s) {
    return this.#e.post(
      H.search,
      t,
      s
    );
  }
}
function Fl(e) {
  return new Gl(cs());
}
class Vl {
  #e;
  constructor(t) {
    this.#e = t;
  }
  getSavedSearches(t) {
    return this.#e.get(
      H.savedSearches,
      t
    );
  }
  getSavedSearch(t, s) {
    return this.#e.get(
      H.savedSearch(t),
      s
    );
  }
  saveSavedSearch(t, s) {
    return this.#e.post(
      H.savedSearches,
      t,
      s
    );
  }
  updateSavedSearch(t, s, i) {
    return this.#e.put(
      H.savedSearch(t),
      s,
      i
    );
  }
  duplicateSavedSearch(t, s) {
    return this.#e.post(
      H.savedSearchDuplicate(t),
      {},
      s
    );
  }
  deleteSavedSearch(t, s) {
    return this.#e.delete(
      H.savedSearch(t),
      s
    );
  }
  togglePin(t, s) {
    return this.#e.post(
      H.savedSearchPin(t),
      {},
      s
    );
  }
  toggleFavourite(t, s) {
    return this.#e.post(
      H.savedSearchFavourite(t),
      {},
      s
    );
  }
  recordUsage(t, s) {
    return this.#e.post(
      H.savedSearchUse(t),
      {},
      s
    );
  }
  recordRecent(t, s) {
    return this.#e.post(
      H.savedSearchRecent,
      t,
      s
    );
  }
}
function ql(e) {
  return new Vl(cs());
}
class Kl {
  #e;
  constructor(t) {
    this.#e = t;
  }
  getPresets(t) {
    return this.#e.get(
      H.searchPresets,
      t
    );
  }
  getPreset(t, s) {
    return this.#e.get(
      H.searchPreset(t),
      s
    );
  }
}
function Yl(e) {
  return new Kl(cs());
}
function jl(e, t) {
  const s = URL.createObjectURL(e), i = document.createElement("a");
  i.href = s, i.download = t, i.rel = "noopener", i.style.display = "none", document.body.appendChild(i), i.dispatchEvent(
    new MouseEvent("click", { bubbles: !1, cancelable: !0, view: window })
  ), window.setTimeout(() => {
    i.remove(), URL.revokeObjectURL(s);
  }, 0);
}
function Xl(e, t) {
  if (!e)
    return t;
  const s = /filename\*=UTF-8''([^;]+)/i.exec(e);
  if (s?.[1])
    try {
      return decodeURIComponent(s[1].trim());
    } catch {
    }
  const i = /filename="?([^";]+)"?/i.exec(e);
  return i?.[1] ? i[1].trim() : t;
}
const Jl = {
  Csv: "content-search-results.csv",
  Excel: "content-search-results.xlsx"
};
class Zl {
  async export(t, s, i) {
    const r = await s.token(), a = this.#e(s.base), n = await fetch(a, {
      method: "POST",
      credentials: s.credentials ?? "same-origin",
      signal: i,
      headers: {
        "Content-Type": "application/json",
        ...r ? { Authorization: `Bearer ${r}` } : {}
      },
      body: JSON.stringify(t)
    });
    if (!n.ok)
      throw await this.#t(n);
    const _ = await n.blob(), y = Xl(
      n.headers.get("content-disposition"),
      Jl[t.format]
    );
    return { blob: _, fileName: y };
  }
  #e(t) {
    const s = (t ?? "").replace(/\/+$/, ""), i = Dr.replace(/\/+$/, "");
    return `${s}${i}/${H.export}`;
  }
  async #t(t) {
    let s;
    try {
      s = await t.json();
    } catch {
      s = void 0;
    }
    return we.fromProblem(s, t);
  }
}
function Ql() {
  return new Zl();
}
const Bs = "content-search-export", ec = /* @__PURE__ */ new Set([
  "name",
  "contentType",
  "culture",
  "path",
  "createDate",
  "updateDate",
  "url",
  "actions"
]);
function tc(e) {
  return {
    ...e,
    matchMode: Rr(e.matchMode),
    searchCultureMode: Nr(e.searchCultureMode),
    sortColumn: ac(e.sortColumn),
    conditions: (e.conditions ?? []).map((t) => ({
      ...t,
      operator: oc(t.operator)
    }))
  };
}
function sc(e) {
  return (e.presets ?? []).map(tc);
}
function ic(e) {
  return kr(e.conditions);
}
function rc(e) {
  const t = /* @__PURE__ */ new Set();
  for (const s of e.conditions) {
    const i = s.contentTypeAlias?.trim();
    i && t.add(i);
  }
  return [...t];
}
function ac(e) {
  if (!e)
    return;
  const t = e.trim();
  return ec.has(t) ? t : void 0;
}
const nc = {
  equals: "equals",
  notequals: "notEquals",
  contains: "contains",
  notcontains: "notContains",
  startswith: "startsWith",
  endswith: "endsWith",
  greaterthan: "greaterThan",
  lessthan: "lessThan",
  before: "lessThan",
  after: "greaterThan",
  between: "between",
  isempty: "isEmpty",
  isnotempty: "isNotEmpty"
};
function oc(e) {
  if (!e)
    return "";
  const t = e.trim().toLowerCase();
  return nc[t] ?? e;
}
const zr = 100, Ir = 500, ce = C`
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
`, lc = C`
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
`, Ve = C`
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
`, Ur = C`
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
`, Br = C`
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
`, cc = [
  C`
    :host {
      display: block;
      width: 100%;
    }

    .saved-searches {
      display: flex;
      flex-direction: column;
      gap: var(--cs-space-inline);
    }

    .saved-searches__header {
      width: 100%;
    }

    .saved-searches__toggle {
      margin-left: auto;
      color: var(--uui-color-text-alt);
    }

    .saved-searches__tabs {
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem;
    }

    .saved-searches__toolbar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: flex-end;
      gap: var(--cs-space-inline);
    }

    .saved-searches__table-wrap {
      overflow: auto;
      border: 1px solid var(--cs-border-subtle);
      border-radius: var(--cs-radius);
      max-height: 18rem;
    }

    .saved-searches__table {
      width: 100%;
      border-collapse: collapse;
      font-size: var(--uui-type-small-size);
    }

    .saved-searches__table thead th {
      position: sticky;
      top: 0;
      z-index: 1;
      background: var(--uui-color-surface);
      text-align: left;
      padding: 0.55rem 0.65rem;
      border-bottom: 1px solid var(--uui-color-border);
      white-space: nowrap;
      font-weight: 600;
    }

    .saved-searches__table tbody td {
      padding: 0.55rem 0.65rem;
      border-bottom: 1px solid var(--uui-color-border-standalone);
      vertical-align: middle;
    }

    .saved-searches__table tbody tr:hover td {
      background: var(--uui-color-surface-emphasis);
    }

    .saved-searches__row--selected td {
      background: color-mix(in srgb, var(--uui-color-selected) 14%, var(--uui-color-surface));
    }

    .saved-searches__row--selected:hover td {
      background: color-mix(in srgb, var(--uui-color-selected) 20%, var(--uui-color-surface));
    }

    .saved-searches__name {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      min-width: 8rem;
    }

    .saved-searches__name-text {
      font-weight: 600;
    }

    .saved-searches__description {
      color: var(--uui-color-text-alt);
      max-width: 12rem;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .saved-searches__actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.25rem;
      white-space: nowrap;
    }

    .saved-searches__empty {
      padding: 1rem;
      color: var(--uui-color-text-alt);
      text-align: center;
    }

    .saved-searches__save-form {
      display: grid;
      gap: 0.75rem;
      padding: 0.85rem;
      border: 1px solid var(--uui-color-border);
      border-radius: var(--uui-border-radius);
      background: var(--uui-color-surface-alt);
    }

    .saved-searches__save-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
    }

    .saved-searches__rename-form {
      display: grid;
      gap: 0.65rem;
      padding: 0.65rem 0;
    }
  `
];
var uc = Object.defineProperty, hc = Object.getOwnPropertyDescriptor, Wr = (e) => {
  throw TypeError(e);
}, Q = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? hc(t, s) : t, a = e.length - 1, n; a >= 0; a--)
    (n = e[a]) && (r = (i ? n(t, s, r) : n(r)) || r);
  return i && r && uc(t, s, r), r;
}, dc = (e, t, s) => t.has(e) || Wr("Cannot " + s), pc = (e, t, s) => t.has(e) ? Wr("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, s), F = (e, t, s) => (dc(e, t, "access private method"), s), L, Hr, Gr, Fr, Vr, qr, Kr, Yr, us, jr, Xr, Jr, oi, Zr, Qr;
let K = class extends B {
  constructor() {
    super(...arguments), pc(this, L), this.items = [], this.loading = !1, this.saving = !1, this.saveDisabled = !1, this.selectedSavedSearchId = "", this._expanded = !1, this._showSaveForm = !1, this._saveName = "", this._saveDescription = "", this._renamingId = "", this._renameName = "", this._renameDescription = "";
  }
  render() {
    const e = this.items.length;
    return o`
      <div class="saved-searches">
        ${F(this, L, Hr).call(this, e)}
        ${this._expanded ? o`
              <div class="saved-searches__toolbar">
                <uui-button
                  look="primary"
                  label="Save current search"
                  ?disabled=${this.saveDisabled || this.saving}
                  @click=${F(this, L, Kr)}
                >
                  <uui-icon name="icon-save"></uui-icon>
                  Save
                </uui-button>
              </div>

              ${this._showSaveForm ? F(this, L, Vr).call(this) : g}
              ${F(this, L, Gr).call(this, this.items)}
            ` : g}
      </div>
    `;
  }
  resetSaveForm() {
    this._showSaveForm = !1, F(this, L, us).call(this);
  }
};
L = /* @__PURE__ */ new WeakSet();
Hr = function(e) {
  return o`
      <div class="cs-section-header saved-searches__header">
        <div class="cs-section-header__leading">
          <h2 class="cs-section-header__title">${Al}</h2>
          <span class="cs-section-header__badge">${this.loading ? "…" : e}</span>
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
};
Gr = function(e) {
  return this.loading ? o`
        <div class="saved-searches__empty" role="region" aria-label="Saved searches">
          <uui-loader></uui-loader>
        </div>
      ` : e.length === 0 ? o`
        <div class="saved-searches__empty cs-empty" role="region" aria-label="Saved searches">
          <p class="cs-empty__label">No saved searches yet. Run a search and click Save.</p>
        </div>
      ` : o`
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
            ${e.map((t) => F(this, L, Fr).call(this, t))}
          </tbody>
        </table>
      </div>
    `;
};
Fr = function(e) {
  const t = this._renamingId === e.id, s = this.selectedSavedSearchId === e.id;
  return o`
      <tr class=${s ? "saved-searches__row--selected" : ""}>
        <td>
          ${t ? F(this, L, qr).call(this, e) : o`
                <div class="saved-searches__name">
                  <span class="saved-searches__name-text">${e.name}</span>
                </div>
              `}
        </td>
        <td>
          <span class="saved-searches__description" title=${e.description ?? ""}>
            ${e.description ?? "—"}
          </span>
        </td>
        <td>
          ${t ? g : o`
                <div class="saved-searches__actions">
                  <uui-button
                    look="secondary"
                    compact
                    label="Load search"
                    @click=${() => F(this, L, Xr).call(this, e.id)}
                  >
                    Load
                  </uui-button>
                  <uui-button
                    look="outline"
                    compact
                    label="Edit"
                    @click=${() => F(this, L, Jr).call(this, e)}
                  >
                    Edit
                  </uui-button>
                  <uui-button
                    look="outline"
                    compact
                    label="Delete"
                    @click=${() => F(this, L, Qr).call(this, e)}
                  >
                    Delete
                  </uui-button>
                </div>
              `}
        </td>
      </tr>
    `;
};
Vr = function() {
  return o`
      <div class="saved-searches__save-form">
        <uui-input
          label="Name"
          placeholder="e.g. Published articles"
          maxlength=${zr}
          .value=${this._saveName}
          ?disabled=${this.saving}
          @input=${(e) => {
    this._saveName = e.target.value;
  }}
        ></uui-input>
        <uui-textarea
          label="Description"
          placeholder="Optional notes about this search"
          maxlength=${Ir}
          .value=${this._saveDescription}
          ?disabled=${this.saving}
          @input=${(e) => {
    this._saveDescription = e.target.value;
  }}
        ></uui-textarea>
        <div class="saved-searches__save-actions">
          <uui-button look="secondary" label="Cancel" ?disabled=${this.saving} @click=${F(this, L, Yr)}>
            Cancel
          </uui-button>
          <uui-button
            look="primary"
            label="Save search"
            ?disabled=${this.saving || !this._saveName.trim()}
            @click=${F(this, L, jr)}
          >
            ${this.saving ? "Saving…" : "Save search"}
          </uui-button>
        </div>
      </div>
    `;
};
qr = function(e) {
  return o`
      <div class="saved-searches__rename-form">
        <uui-input
          label="Name"
          .value=${this._renameName}
          maxlength=${zr}
          @input=${(t) => {
    this._renameName = t.target.value;
  }}
        ></uui-input>
        <uui-textarea
          label="Description"
          .value=${this._renameDescription}
          maxlength=${Ir}
          @input=${(t) => {
    this._renameDescription = t.target.value;
  }}
        ></uui-textarea>
        <div class="saved-searches__save-actions">
          <uui-button look="secondary" label="Cancel" @click=${F(this, L, oi)}>Cancel</uui-button>
          <uui-button
            look="primary"
            label="Save"
            ?disabled=${!this._renameName.trim()}
            @click=${() => F(this, L, Zr).call(this, e.id)}
          >
            Save
          </uui-button>
        </div>
      </div>
    `;
};
Kr = function() {
  this._showSaveForm = !this._showSaveForm, this._showSaveForm || F(this, L, us).call(this);
};
Yr = function() {
  this._showSaveForm = !1, F(this, L, us).call(this);
};
us = function() {
  this._saveName = "", this._saveDescription = "";
};
jr = function() {
  const e = this._saveName.trim();
  e && this.dispatchEvent(
    new CustomEvent(Ds, {
      detail: {
        name: e,
        description: this._saveDescription.trim() || void 0
      },
      bubbles: !0,
      composed: !0
    })
  );
};
Xr = function(e) {
  this.dispatchEvent(
    new CustomEvent(Ls, {
      detail: { savedSearchId: e },
      bubbles: !0,
      composed: !0
    })
  );
};
Jr = function(e) {
  this._renamingId = e.id, this._renameName = e.name, this._renameDescription = e.description ?? "";
};
oi = function() {
  this._renamingId = "", this._renameName = "", this._renameDescription = "";
};
Zr = function(e) {
  const t = this._renameName.trim();
  t && (this.dispatchEvent(
    new CustomEvent(Is, {
      detail: {
        savedSearchId: e,
        name: t,
        description: this._renameDescription.trim() || void 0
      },
      bubbles: !0,
      composed: !0
    })
  ), F(this, L, oi).call(this));
};
Qr = async function(e) {
  await xl(this, {
    headline: "Delete saved search",
    content: `Delete "${e.name}"? This cannot be undone.`,
    color: "warning",
    confirmLabel: "Delete"
  }).catch(() => !1) !== !1 && this.dispatchEvent(
    new CustomEvent(zs, {
      detail: { savedSearchId: e.id },
      bubbles: !0,
      composed: !0
    })
  );
};
K.styles = [
  Fe,
  ce,
  Ve,
  Ur,
  ...cc
];
Q([
  l({ type: Array })
], K.prototype, "items", 2);
Q([
  l({ type: Boolean })
], K.prototype, "loading", 2);
Q([
  l({ type: Boolean })
], K.prototype, "saving", 2);
Q([
  l({ type: Boolean })
], K.prototype, "saveDisabled", 2);
Q([
  l({ type: String })
], K.prototype, "selectedSavedSearchId", 2);
Q([
  d()
], K.prototype, "_expanded", 2);
Q([
  d()
], K.prototype, "_showSaveForm", 2);
Q([
  d()
], K.prototype, "_saveName", 2);
Q([
  d()
], K.prototype, "_saveDescription", 2);
Q([
  d()
], K.prototype, "_renamingId", 2);
Q([
  d()
], K.prototype, "_renameName", 2);
Q([
  d()
], K.prototype, "_renameDescription", 2);
K = Q([
  U("content-search-saved-searches")
], K);
const _c = "Quick presets", ea = "__all__", mc = "All content types", fc = [
  ce,
  Ve,
  C`
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
  `
];
var gc = Object.defineProperty, vc = Object.getOwnPropertyDescriptor, ta = (e) => {
  throw TypeError(e);
}, hs = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? vc(t, s) : t, a = e.length - 1, n; a >= 0; a--)
    (n = e[a]) && (r = (i ? n(t, s, r) : n(r)) || r);
  return i && r && gc(t, s, r), r;
}, yc = (e, t, s) => t.has(e) || ta("Cannot " + s), bc = (e, t, s) => t.has(e) ? ta("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, s), at = (e, t, s) => (yc(e, t, "access private method"), s), xe, sa, ia, ra, aa, na;
let Ue = class extends B {
  constructor() {
    super(...arguments), bc(this, xe), this.presets = [], this.loading = !1, this._expanded = !1;
  }
  render() {
    return o`
      <div class="quick-presets">
        ${at(this, xe, sa).call(this)}
        ${this._expanded ? at(this, xe, ia).call(this) : g}
      </div>
    `;
  }
};
xe = /* @__PURE__ */ new WeakSet();
sa = function() {
  const e = this.loading ? "…" : this.presets.length;
  return o`
      <div class="cs-section-header quick-presets__header">
        <div class="cs-section-header__leading">
          <h2 class="cs-section-header__title">${_c}</h2>
          <span class="cs-section-header__badge">${e}</span>
        </div>
        <uui-button
          class="cs-section-header__toggle"
          look="reset"
          compact
          label=${this._expanded ? "Collapse quick presets" : "Expand quick presets"}
          aria-expanded=${this._expanded ? "true" : "false"}
          @click=${at(this, xe, aa)}
        >
          <uui-icon name=${this._expanded ? "icon-navigation-up" : "icon-navigation-down"}></uui-icon>
        </uui-button>
      </div>
    `;
};
ia = function() {
  return this.loading ? o`
        <div class="cs-empty">
          <uui-loader></uui-loader>
        </div>
      ` : this.presets.length === 0 ? o`
        <div class="cs-empty">
          <p class="cs-empty__label">No presets available.</p>
        </div>
      ` : o`
      <div class="quick-presets__grid" role="list">
        ${this.presets.map((e) => at(this, xe, ra).call(this, e))}
      </div>
    `;
};
ra = function(e) {
  return o`
      <article class="quick-presets__card" role="listitem">
        <h3 class="quick-presets__card-title">${e.name}</h3>
        <p class="quick-presets__card-description" title=${e.description}>
          ${e.description}
        </p>
        <div class="quick-presets__card-actions">
          <uui-button
            look="primary"
            compact
            label="Run preset"
            @click=${() => at(this, xe, na).call(this, e.id)}
          >
            Run
          </uui-button>
        </div>
      </article>
    `;
};
aa = function() {
  this._expanded = !this._expanded;
};
na = function(e) {
  this.dispatchEvent(
    new CustomEvent(Us, {
      detail: { presetId: e },
      bubbles: !0,
      composed: !0
    })
  );
};
Ue.styles = [
  Fe,
  ce,
  Ve,
  Ur,
  ...fc
];
hs([
  l({ type: Array })
], Ue.prototype, "presets", 2);
hs([
  l({ type: Boolean })
], Ue.prototype, "loading", 2);
hs([
  d()
], Ue.prototype, "_expanded", 2);
Ue = hs([
  U("content-search-quick-presets")
], Ue);
const sr = [
  { value: "equals", label: "equals" },
  { value: "notEquals", label: "does not equal" },
  { value: "contains", label: "contains" },
  { value: "notContains", label: "does not contain" },
  { value: "startsWith", label: "starts with" },
  { value: "endsWith", label: "ends with" },
  { value: "isEmpty", label: "is empty" },
  { value: "isNotEmpty", label: "is not empty" }
], Sc = [
  { value: "equals", label: "equals" },
  { value: "notEquals", label: "does not equal" },
  { value: "greaterThan", label: "greater than" },
  { value: "greaterThanOrEqual", label: "greater than or equal" },
  { value: "lessThan", label: "less than" },
  { value: "lessThanOrEqual", label: "less than or equal" },
  { value: "between", label: "between" },
  { value: "isEmpty", label: "is empty" },
  { value: "isNotEmpty", label: "is not empty" }
], Cc = [
  { value: "equals", label: "equals" },
  { value: "greaterThan", label: "greater than" },
  { value: "lessThan", label: "less than" },
  { value: "between", label: "between" },
  { value: "today", label: "today" },
  { value: "yesterday", label: "yesterday" },
  { value: "last7Days", label: "last 7 days" },
  { value: "last30Days", label: "last 30 days" },
  { value: "thisMonth", label: "this month" },
  { value: "lastMonth", label: "last month" },
  { value: "thisYear", label: "this year" },
  { value: "isEmpty", label: "is empty" },
  { value: "isNotEmpty", label: "is not empty" }
], wc = [
  { value: "isTrue", label: "is true" },
  { value: "isFalse", label: "is false" },
  { value: "isEmpty", label: "is empty" }
], xc = [
  { value: "equals", label: "equals" },
  { value: "notEquals", label: "does not equal" },
  { value: "isEmpty", label: "is empty" },
  { value: "isNotEmpty", label: "is not empty" }
], $c = [
  { value: "contains", label: "contains" },
  { value: "notContains", label: "does not contain" },
  { value: "containsAny", label: "contains any" },
  { value: "containsAll", label: "contains all" },
  { value: "isEmpty", label: "is empty" },
  { value: "isNotEmpty", label: "is not empty" }
], Ec = [
  { value: "hasMedia", label: "has media" },
  { value: "hasNoMedia", label: "has no media" }
], Tc = [
  { value: "hasValue", label: "has value" },
  { value: "hasNoValue", label: "has no value" },
  { value: "equals", label: "equals" },
  { value: "notEquals", label: "does not equal" }
], Pc = [
  { value: "isEmpty", label: "is empty" },
  { value: "isNotEmpty", label: "is not empty" }
], Ac = {
  text: sr,
  number: Sc,
  date: Cc,
  boolean: wc,
  singleChoice: xc,
  multipleChoice: $c,
  media: Ec,
  content: Tc,
  blockContainer: Pc,
  json: sr
}, kc = /* @__PURE__ */ new Set([
  "isEmpty",
  "isNotEmpty",
  "isTrue",
  "isFalse",
  "today",
  "yesterday",
  "last7Days",
  "last30Days",
  "thisMonth",
  "lastMonth",
  "thisYear",
  "hasMedia",
  "hasNoMedia",
  "hasValue",
  "hasNoValue"
]), Mc = 1, Rc = kc, ir = "Culture", Nc = "Language", Ws = "All cultures", Hs = "Current culture", oa = "Specific culture", Oc = "Invariant", Lc = "Variant", Dc = [
  { value: "AllCultures", label: Ws },
  { value: "CurrentCulture", label: Hs },
  { value: "SpecificCulture", label: oa }
];
class zc {
  #e;
  #t;
  #s;
  #i = /* @__PURE__ */ new Map();
  constructor(t) {
    this.#e = t;
  }
  /**
   * Loads document types once and caches the in-flight request.
   */
  getContentTypes(t) {
    return this.#t || (this.#t = this.#r(t)), this.#t;
  }
  /**
   * Loads enabled Umbraco languages once and caches the in-flight request.
   */
  getLanguages(t) {
    return this.#s || (this.#s = this.#a(t)), this.#s;
  }
  /**
   * Lazily loads full property metadata for a document type, including tree containers.
   */
  getPropertyMetadata(t, s) {
    const i = t?.trim();
    if (!i)
      return Promise.resolve([]);
    const r = this.#i.get(i);
    if (r)
      return r;
    const a = this.#n(i, s);
    return this.#i.set(i, a), a;
  }
  /**
   * Clears cached metadata. Useful after schema changes without a full reload.
   */
  clearCache() {
    this.#t = void 0, this.#s = void 0, this.#i.clear();
  }
  async #r(t) {
    return (await this.#e.get(
      H.contentTypes,
      t
    )).contentTypes ?? [];
  }
  async #a(t) {
    return (await this.#e.get(
      H.languages,
      t
    )).languages ?? [];
  }
  async #n(t, s) {
    try {
      return (await this.#e.get(
        H.properties(t),
        s
      )).properties ?? [];
    } catch (i) {
      throw this.#i.delete(t), i instanceof we, i;
    }
  }
}
function la(e) {
  return new zc(cs());
}
const Ic = /* @__PURE__ */ new Set([
  "createdate",
  "updatedate",
  "releasedate"
]), Uc = /* @__PURE__ */ new Set([
  "Umbraco.DateTime",
  "Umbraco.DateOnly",
  "Umbraco.DateTimeUnspecified",
  "Umbraco.DateTimeWithTimeZone"
]), Bc = /* @__PURE__ */ new Set([
  "Umbraco.Integer",
  "Umbraco.Decimal",
  "Umbraco.Numeric",
  "Umbraco.Slider"
]), Wc = /* @__PURE__ */ new Set([
  "Umbraco.TextBox",
  "Umbraco.TextArea",
  "Umbraco.TinyMCE",
  "Umbraco.Label",
  "Umbraco.EmailAddress",
  "Umbraco.Textstring"
]), Hc = /* @__PURE__ */ new Set([
  "Umbraco.MediaPicker",
  "Umbraco.MediaPicker3",
  "Umbraco.ImageCropper"
]), Gc = /* @__PURE__ */ new Set(["Umbraco.MultiUrlPicker"]), Fc = /* @__PURE__ */ new Set([
  "Umbraco.ContentPicker",
  "Umbraco.MultiNodeTreePicker"
]), Vc = /* @__PURE__ */ new Set([
  "Umbraco.DropDown.Flexible",
  "Umbraco.RadioButtonList"
]), qc = /* @__PURE__ */ new Set([
  "Umbraco.CheckBoxList",
  "Umbraco.Tags"
]), Kc = /* @__PURE__ */ new Set([
  "Umbraco.JSON",
  "Umbraco.NestedContent"
]);
function ie(e, t) {
  if (!e)
    return !1;
  for (const s of t)
    if (e.localeCompare(s, void 0, { sensitivity: "accent" }) === 0)
      return !0;
  return !1;
}
function ue(e, t) {
  return e?.toLowerCase().includes(t.toLowerCase()) === !0;
}
function ca(e) {
  if (!e)
    return "text";
  if (e.isContainer)
    return "blockContainer";
  const t = e.alias.trim().toLowerCase();
  if (Ic.has(t))
    return "date";
  if (t === "templateid")
    return "number";
  const s = e.editorAlias ?? void 0;
  return ie(s, /* @__PURE__ */ new Set(["Umbraco.TrueFalse"])) ? "boolean" : ie(s, Uc) ? "date" : ie(s, Bc) ? "number" : ie(s, Gc) ? "blockContainer" : ie(s, Hc) ? "media" : ie(s, Fc) ? "content" : ie(s, Vc) ? "singleChoice" : ie(s, qc) ? "multipleChoice" : ie(s, Kc) ? "json" : ue(s, "MediaPicker") || ue(s, "ImageCropper") ? "media" : ue(s, "ContentPicker") || ue(s, "MultiNodeTreePicker") ? "content" : ue(s, "Date") && !ue(s, "Update") ? "date" : ue(s, "Numeric") || ue(s, "Integer") || ue(s, "Decimal") ? "number" : (ie(s, Wc) || e.containerAlias, "text");
}
function li(e, t = Mc) {
  return t <= 0 ? [] : e.length === 0 ? [ni()] : e.slice(0, t).map((s) => ({
    ...s,
    id: s.id || crypto.randomUUID()
  }));
}
function rr() {
  return li([]);
}
function Yc(e) {
  return !e.contentTypeAlias.trim() && !e.propertyAlias.trim() && !e.operator && !e.value.trim();
}
function mt(e) {
  return !!e && !Rc.has(e);
}
function ua(e) {
  return ca(e) === "date";
}
function ha(e) {
  return e === "between";
}
function jc(e) {
  return e === "before" ? "lessThan" : e === "after" ? "greaterThan" : e;
}
function ci(e, t, s) {
  return [
    { name: s, value: "", selected: !t },
    ...e.map((i) => ({
      name: i.label,
      value: i.value,
      selected: i.value === t
    }))
  ];
}
const Xc = ["..", "|", ","];
function da(e) {
  const t = e.trim();
  if (!t)
    return { from: "", to: "" };
  for (const s of Xc) {
    if (!t.includes(s))
      continue;
    const [i = "", r = ""] = t.split(s).map((a) => a.trim());
    return { from: i, to: r };
  }
  return { from: t, to: "" };
}
function ar(e, t) {
  const s = e.trim(), i = t.trim();
  return !s && !i ? "" : i ? `${s}..${i}` : s;
}
function Jc(e) {
  const { from: t, to: s } = da(e);
  return !!(t && s);
}
function Zc(e) {
  const t = {};
  for (const s of e)
    t[s.conditionId] ??= {}, t[s.conditionId][s.field] = s.message;
  return t;
}
function pa(e, t = []) {
  if (e.length === 0)
    return { isValid: !1, errors: [] };
  const s = [];
  for (const i of e)
    if (i.contentTypeAlias || s.push({
      conditionId: i.id,
      field: "contentTypeAlias",
      message: "Choose a content type"
    }), i.propertyAlias || s.push({
      conditionId: i.id,
      field: "propertyAlias",
      message: "Choose a property"
    }), i.operator || s.push({
      conditionId: i.id,
      field: "operator",
      message: "Choose an operator"
    }), mt(i.operator)) {
      const r = t.find(
        (n) => n.alias === i.propertyAlias
      ), a = Qc(
        i,
        r
      );
      a && s.push({
        conditionId: i.id,
        field: "value",
        message: a
      });
    }
  return {
    isValid: s.length === 0,
    errors: s
  };
}
function Qc(e, t) {
  const s = e.value.trim();
  return ha(e.operator) && ua(t) ? Jc(s) ? void 0 : "Choose a start and end date" : s ? void 0 : "Enter a value";
}
const eu = "publishStatus", tu = [
  { value: "1", label: "Published" },
  { value: "0", label: "Unpublished" }
];
function su(e) {
  return e.trim().toLowerCase() === eu;
}
function iu(e) {
  return e && e.charAt(0).toUpperCase() + e.slice(1);
}
function ru(e) {
  const t = ca(e);
  return Ac[t].map((s) => ({
    ...s,
    label: iu(s.label)
  }));
}
const _a = 300, au = 20, nu = 50, Be = 200, ge = 40, ou = "Search properties...", lu = "Search content types...", ma = "System", fa = "Content Type", ui = "Composition", ds = "Block Grid", ps = "Block List", hi = "General", ga = "icon-layout", va = "icon-thumbnail-list", cu = "icon-settings", nr = "icon-document", uu = "icon-puzzle-piece", hu = "icon-blueprint", ya = " > ", du = " › ", pu = {
  [ma]: "SYSTEM",
  [fa]: "CONTENT",
  [ui]: "COMPOSITIONS",
  [ds]: "BLOCK GRID",
  [ps]: "BLOCK LIST"
};
function ba(e) {
  return pu[e] ?? e.toUpperCase();
}
function di(e) {
  return e.groupName?.trim() || hi;
}
function J(e) {
  return e.name?.trim() || e.alias;
}
function Sa(e) {
  return !!(e.containerAlias && !e.isContainer);
}
function _s(e) {
  const t = e.displayPath;
  if (t && t.length > 0)
    return t[t.length - 1] ?? J(e);
  const s = e.alias.split("__");
  return s.length >= 3 ? s[s.length - 1] ?? J(e) : J(e);
}
function jt(e) {
  const t = e.displayPath;
  return t && t.length > 0 ? t[t.length - 1] ?? J(e) : _s(e);
}
function ms(e) {
  if (Sa(e)) {
    const t = jt(e), s = e.elementTypeName?.trim();
    if (s)
      return `${s}${ya}${t}`;
  }
  return jt(e);
}
function Ca(e) {
  if (Sa(e)) {
    const s = e.containerAlias ? e.displayPath?.[0]?.trim() : void 0;
    if (s)
      return s;
  }
  if (e.sourceCategory === "Composition") {
    const s = e.sourceName?.trim();
    if (s)
      return s;
  }
  const t = di(e);
  if (t !== hi)
    return ba(t);
}
function _u(e) {
  const t = Ca(e);
  if (!t)
    return !1;
  const s = ms(e);
  return s.localeCompare(t, void 0, { sensitivity: "accent" }) !== 0 && !s.toLowerCase().includes(t.toLowerCase());
}
function mu(e) {
  return e.isSelectable !== !1 && !e.isContainer;
}
function wa(e) {
  return e.containerName;
}
function xa(e) {
  return e.containerEditorLabel === ps ? va : ga;
}
function fu(e) {
  return e === ds;
}
function We(e) {
  return e.elementTypes.reduce(
    (t, s) => t + s.properties.length,
    0
  );
}
function pi(e) {
  return [...e].sort(
    (t, s) => (t.sortOrder ?? Number.MAX_SAFE_INTEGER) - (s.sortOrder ?? Number.MAX_SAFE_INTEGER) || J(t).localeCompare(J(s), void 0, {
      sensitivity: "base"
    })
  );
}
function or(e) {
  const t = e.editorAlias ?? "";
  if (t.includes("BlockGrid"))
    return ds;
  if (t.includes("BlockList"))
    return ps;
}
function gu(e) {
  if (e.elementTypeAlias)
    return e.elementTypeAlias;
  const t = e.alias.split("__");
  return t.length >= 3 ? t[1] ?? "_unknown" : "_unknown";
}
function vu(e, t) {
  return e.elementTypeName ?? e.sourceName ?? t;
}
function yu(e, t) {
  const s = gu(t), i = `${e.containerKey}::${s}`, r = vu(t, s), a = e.elementTypes.get(i), n = t.sortOrder ?? Number.MAX_SAFE_INTEGER;
  e.elementTypes.set(i, {
    elementTypeKey: i,
    elementTypeAlias: s,
    elementTypeName: r,
    sortOrder: Math.min(a?.sortOrder ?? n, n),
    properties: [...a?.properties ?? [], t]
  });
}
function bu(e) {
  return {
    containerKey: e.containerKey,
    containerName: e.containerName,
    containerEditorLabel: e.containerEditorLabel,
    containerProperty: e.containerProperty,
    elementTypes: [...e.elementTypes.values()].sort(
      (t, s) => t.sortOrder - s.sortOrder || t.elementTypeName.localeCompare(s.elementTypeName, void 0, {
        sensitivity: "base"
      })
    ).map((t) => ({
      elementTypeKey: t.elementTypeKey,
      elementTypeAlias: t.elementTypeAlias,
      elementTypeName: t.elementTypeName,
      properties: pi(t.properties)
    }))
  };
}
function Su(e) {
  const t = /* @__PURE__ */ new Map();
  for (const s of e) {
    const i = s.sourceName?.trim() || "General", r = t.get(i) ?? [];
    r.push(s), t.set(i, r);
  }
  return [...t.entries()].sort(
    ([s], [i]) => s.localeCompare(i, void 0, { sensitivity: "base" })
  ).map(([s, i]) => ({
    name: s,
    properties: pi(i)
  }));
}
function Cu(e) {
  const t = /* @__PURE__ */ new Map();
  for (const s of e) {
    const i = di(s), r = s.groupSortOrder ?? Number.MAX_SAFE_INTEGER - 100, a = t.get(i) ?? {
      sortOrder: r,
      direct: [],
      containers: /* @__PURE__ */ new Map()
    };
    if (a.sortOrder = Math.min(a.sortOrder, r), s.isContainer) {
      const n = s.containerAlias ?? s.alias, _ = a.containers.get(n);
      a.containers.set(n, {
        containerKey: n,
        containerName: s.displayPath?.[0]?.trim() ?? J(s),
        containerEditorLabel: or(s),
        containerProperty: s,
        elementTypes: _?.elementTypes ?? /* @__PURE__ */ new Map()
      }), t.set(i, a);
      continue;
    }
    if (s.containerAlias) {
      const n = s.containerAlias, _ = a.containers.get(n), y = s.displayPath?.[0]?.trim() ?? _?.containerName ?? n, N = {
        containerKey: n,
        containerName: y,
        containerEditorLabel: _?.containerEditorLabel ?? or(s),
        containerProperty: _?.containerProperty,
        elementTypes: _?.elementTypes ?? /* @__PURE__ */ new Map()
      };
      yu(N, s), a.containers.set(n, N), t.set(i, a);
      continue;
    }
    a.direct.push(s), t.set(i, a);
  }
  return [...t.entries()].sort(
    (s, i) => s[1].sortOrder - i[1].sortOrder || s[0].localeCompare(i[0], void 0, { sensitivity: "base" })
  ).map(([s, i]) => {
    const r = pi(i.direct), a = s === ui;
    return {
      name: s,
      displayName: ba(s),
      sortOrder: i.sortOrder,
      properties: a ? [] : r,
      compositionSections: a ? Su(r) : [],
      containers: [...i.containers.values()].sort(
        (n, _) => n.containerName.localeCompare(_.containerName, void 0, {
          sensitivity: "base"
        })
      ).map((n) => bu(n))
    };
  });
}
function wu(e) {
  return e.reduce((t, s) => {
    const i = s.compositionSections.reduce(
      (n, _) => n + _.properties.length,
      0
    ), r = s.containers.filter(
      (n) => n.containerProperty
    ).length, a = s.containers.reduce(
      (n, _) => n + We(_),
      0
    );
    return t + s.properties.length + i + r + a;
  }, 0);
}
function xu(e) {
  const t = e.displayPath ?? [], s = jt(e);
  return t.length >= 3 ? {
    prefix: t.slice(1, -1).join(du),
    leaf: s
  } : e.elementTypeName ? {
    prefix: e.elementTypeName,
    leaf: s
  } : { leaf: s };
}
function ft(e, t, s, i, r) {
  return s ? i ? `Showing ${t} of ${e} ${r}. Refine your search to see more.` : `${e} ${r}. Type to narrow the list.` : "";
}
function $u(e, t = nu) {
  const s = wu(e);
  if (s <= t)
    return {
      groups: e,
      truncated: !1,
      totalPropertyCount: s
    };
  const i = [];
  let r = t;
  for (const a of e) {
    if (r <= 0)
      break;
    const n = Eu(a, r);
    r -= $a(n), i.push(n);
  }
  return {
    groups: i,
    truncated: !0,
    totalPropertyCount: s
  };
}
function $a(e) {
  const t = e.compositionSections.reduce(
    (i, r) => i + r.properties.length,
    0
  ), s = e.containers.reduce(
    (i, r) => i + We(r),
    0
  );
  return e.properties.length + t + s;
}
function Eu(e, t) {
  if ($a(e) <= t)
    return e;
  let s = t;
  const i = e.properties.slice(0, s);
  s -= i.length;
  const r = [];
  for (const n of e.compositionSections) {
    if (s <= 0)
      break;
    const _ = n.properties.slice(0, s);
    _.length !== 0 && (s -= _.length, r.push({
      ...n,
      properties: _
    }));
  }
  const a = [];
  for (const n of e.containers) {
    if (s <= 0)
      break;
    const _ = Tu(n, s);
    s -= We(_), We(_) > 0 && a.push(_);
  }
  return {
    ...e,
    properties: i,
    compositionSections: r,
    containers: a
  };
}
function Tu(e, t) {
  let s = t;
  const i = [];
  for (const r of e.elementTypes) {
    if (s <= 0)
      break;
    const a = r.properties.slice(0, s);
    a.length !== 0 && (s -= a.length, i.push({
      ...r,
      properties: a
    }));
  }
  return {
    ...e,
    containerProperty: void 0,
    elementTypes: i
  };
}
function fs(e, t, s) {
  const i = e.length, r = Math.min(t, i, s), a = i > s;
  return {
    items: e.slice(0, r),
    visibleCount: r,
    totalCount: i,
    hasMore: r < i && r < s,
    truncated: a
  };
}
function Ea(e, t, s, i) {
  return Math.min(e + s, t, i);
}
function Ta(e, t, s, i = 48) {
  return e + t >= s - i;
}
const Pu = C`
  :host {
    display: block;
    width: 100%;
    min-width: 0;
  }

  .content-type-picker {
    position: relative;
    width: 100%;
    min-width: 0;
  }

  .content-type-picker__status {
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

  .content-type-option {
    display: flex;
    align-items: center;
    gap: var(--uui-size-space-2);
    min-width: 0;
    content-visibility: auto;
    contain-intrinsic-size: auto 2rem;
  }

  .content-type-option__name {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .content-type-option__alias {
    color: var(--uui-color-text-alt);
    font-family: var(--uui-font-family-mono, ui-monospace, monospace);
    font-size: var(--uui-type-small-size);
  }

  .content-type-option__empty {
    color: var(--uui-color-text-alt);
    font-size: var(--uui-type-small-size);
    font-style: italic;
  }
`;
var Au = Object.defineProperty, ku = Object.getOwnPropertyDescriptor, Pa = (e) => {
  throw TypeError(e);
}, se = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? ku(t, s) : t, a = e.length - 1, n; a >= 0; a--)
    (n = e[a]) && (r = (i ? n(t, s, r) : n(r)) || r);
  return i && r && Au(t, s, r), r;
}, _i = (e, t, s) => t.has(e) || Pa("Cannot " + s), Me = (e, t, s) => (_i(e, t, "read from private field"), s ? s.call(e) : t.get(e)), Je = (e, t, s) => t.has(e) ? Pa("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, s), Pt = (e, t, s, i) => (_i(e, t, "write to private field"), t.set(e, s), s), Se = (e, t, s) => (_i(e, t, "access private method"), s), gs, Re, vs, Xt, he, Aa, ka, Gs, Ma, Ra, Na;
const Mu = "search-content-type-change";
let X = class extends B {
  constructor() {
    super(...arguments), Je(this, he), this.value = "", this.contentTypes = [], this.label = "Content type", this.placeholder = lu, this.disabled = !1, this.error = !1, this.loading = !1, this.ariaDescribedBy = "", this._visibleItems = [], this._searchStatusMessage = "", this._isSearching = !1, Je(this, gs, []), Je(this, Re, ge), Je(this, vs, 0), Je(this, Xt, Er((e) => {
      Se(this, he, Gs).call(this, e);
    }, _a));
  }
  updated(e) {
    e.has("contentTypes") && Se(this, he, Gs).call(this, "");
  }
  disconnectedCallback() {
    Me(this, Xt).cancel(), super.disconnectedCallback();
  }
  render() {
    const e = this.loading ? "Loading…" : this.placeholder;
    return o`
      <div class="content-type-picker">
        <uui-combobox
          class="condition-row__control"
          label=${this.label}
          .value=${this.value}
          placeholder=${e}
          aria-describedby=${this.ariaDescribedBy || g}
          ?disabled=${this.disabled || this.loading}
          ?error=${this.error}
          @search=${Se(this, he, ka)}
          @change=${Se(this, he, Na)}
        >
          <uui-combobox-list @scroll=${Se(this, he, Ra)}>
            ${this._visibleItems.length > 0 ? D(
      this._visibleItems,
      (t) => t.alias,
      (t) => Se(this, he, Aa).call(this, t)
    ) : o`
                  <uui-combobox-list-option disabled value="">
                    <span class="content-type-option__empty">
                      ${this._isSearching ? "No matching content types." : "No content types available."}
                    </span>
                  </uui-combobox-list-option>
                `}
          </uui-combobox-list>
        </uui-combobox>
        <span class="content-type-picker__status" aria-live="polite">
          ${this._searchStatusMessage}
        </span>
      </div>
    `;
  }
};
gs = /* @__PURE__ */ new WeakMap();
Re = /* @__PURE__ */ new WeakMap();
vs = /* @__PURE__ */ new WeakMap();
Xt = /* @__PURE__ */ new WeakMap();
he = /* @__PURE__ */ new WeakSet();
Aa = function(e) {
  const t = e.name.localeCompare(e.alias, void 0, {
    sensitivity: "accent"
  }) !== 0;
  return o`
      <uui-combobox-list-option .value=${e.alias} .displayValue=${e.name}>
        <span class="content-type-option">
          <uui-icon
            class="content-type-option__icon"
            name=${e.icon?.trim() || "icon-document"}
          ></uui-icon>
          <span class="content-type-option__name">${e.name}</span>
          ${t ? o`<span class="content-type-option__alias">${e.alias}</span>` : g}
        </span>
      </uui-combobox-list-option>
    `;
};
ka = function(e) {
  const t = e.currentTarget.search ?? "";
  Me(this, Xt).call(this, t);
};
Gs = function(e) {
  const t = e.trim().toLowerCase();
  this._isSearching = !!t;
  const s = t ? this.contentTypes.filter(
    (r) => r.name.toLowerCase().includes(t) || r.alias.toLowerCase().includes(t)
  ) : [...this.contentTypes];
  Pt(this, gs, s);
  const i = fs(
    s,
    ge,
    Be
  );
  Pt(this, vs, i.totalCount), Pt(this, Re, i.visibleCount), this._visibleItems = i.items, this._searchStatusMessage = i.totalCount === 0 ? this._isSearching ? "No matching content types." : "" : ft(
    i.totalCount,
    i.visibleCount,
    i.truncated || i.hasMore,
    this._isSearching,
    "content types"
  );
};
Ma = function() {
  const e = Ea(
    Me(this, Re),
    Me(this, vs),
    ge,
    Be
  );
  if (e === Me(this, Re))
    return;
  const t = fs(
    Me(this, gs),
    e,
    Be
  );
  Pt(this, Re, t.visibleCount), this._visibleItems = t.items, this._searchStatusMessage = ft(
    t.totalCount,
    t.visibleCount,
    t.truncated || t.hasMore,
    this._isSearching,
    "content types"
  );
};
Ra = function(e) {
  const t = e.currentTarget;
  Ta(
    t.scrollTop,
    t.clientHeight,
    t.scrollHeight
  ) && Se(this, he, Ma).call(this);
};
Na = function(e) {
  const t = String(
    e.currentTarget.value ?? ""
  );
  this.dispatchEvent(
    new CustomEvent(Mu, {
      detail: { value: t },
      bubbles: !0,
      composed: !0
    })
  );
};
X.styles = Pu;
se([
  l({ type: String })
], X.prototype, "value", 2);
se([
  l({ type: Array })
], X.prototype, "contentTypes", 2);
se([
  l({ type: String })
], X.prototype, "label", 2);
se([
  l({ type: String })
], X.prototype, "placeholder", 2);
se([
  l({ type: Boolean })
], X.prototype, "disabled", 2);
se([
  l({ type: Boolean })
], X.prototype, "error", 2);
se([
  l({ type: Boolean })
], X.prototype, "loading", 2);
se([
  l({ type: String, attribute: "aria-describedby" })
], X.prototype, "ariaDescribedBy", 2);
se([
  d()
], X.prototype, "_visibleItems", 2);
se([
  d()
], X.prototype, "_searchStatusMessage", 2);
se([
  d()
], X.prototype, "_isSearching", 2);
X = se([
  U("search-content-type-picker")
], X);
const Oa = {
  system: cu,
  contentType: nr,
  composition: uu,
  blockGrid: ga,
  blockList: va,
  general: nr
};
function lr(e) {
  return e?.localeCompare("Umbraco.BlockList", void 0, {
    sensitivity: "accent"
  }) === 0;
}
function La(e) {
  switch (e) {
    case ma:
      return "system";
    case ui:
      return "composition";
    case ds:
      return "blockGrid";
    case ps:
      return "blockList";
    case fa:
      return "contentType";
    default:
      return "general";
  }
}
function Ru(e) {
  if (e.isContainer)
    return lr(e.editorAlias ?? void 0) ? "blockList" : "blockGrid";
  if (e.containerAlias)
    return e.sourceCategory === "BlockList" || lr(e.editorAlias ?? void 0) ? "blockList" : "blockGrid";
  switch (e.sourceCategory) {
    case "System":
      return "system";
    case "Composition":
      return "composition";
    case "ContentType":
      return "contentType";
    case "BlockGrid":
      return "blockGrid";
    case "BlockList":
      return "blockList";
    default:
      return La(
        e.groupName?.trim() || hi
      );
  }
}
function Da(e) {
  return Oa[Ru(e)];
}
function Nu(e) {
  return Oa[La(e)];
}
const cr = /* @__PURE__ */ new WeakMap();
function mi(e) {
  const t = cr.get(e);
  if (t)
    return t;
  const s = Ou(e);
  return cr.set(e, s), s;
}
function Ou(e) {
  const t = Cu(e), s = /* @__PURE__ */ new Map(), i = /* @__PURE__ */ new Map();
  for (const a of t)
    for (const n of a.containers)
      s.set(n.containerKey, n.elementTypes), i.set(
        n.containerKey,
        n.elementTypes.reduce(
          (_, y) => _ + y.properties.length,
          0
        )
      );
  const r = e.filter((a) => a.isSelectable !== !1 && !a.isContainer).map((a) => ({
    property: a,
    searchText: Du(a),
    sortLabel: ms(a)
  }));
  return {
    properties: e,
    grouped: t,
    searchIndex: r,
    search(a) {
      const n = a.trim().toLowerCase();
      return n ? r.filter((_) => _.searchText.includes(n)).sort(
        (_, y) => _.sortLabel.localeCompare(y.sortLabel, void 0, {
          sensitivity: "base"
        })
      ).map((_) => _.property) : [];
    },
    getBrowseGroups(a) {
      return t.map((n) => ({
        ...n,
        containers: n.containers.map(
          (_) => Lu(_, a, s)
        )
      }));
    },
    getContainerElementTypes(a) {
      return s.get(a) ?? [];
    },
    getContainerNestedPropertyCount(a) {
      return i.get(a) ?? 0;
    },
    createCollapseState(a, n) {
      return zu(
        t,
        s,
        a,
        n
      );
    }
  };
}
function Lu(e, t, s) {
  return t.has(e.containerKey) ? {
    ...e,
    elementTypes: s.get(e.containerKey) ?? e.elementTypes
  } : {
    ...e,
    elementTypes: []
  };
}
function Du(e) {
  return [
    J(e),
    _s(e),
    jt(e),
    ms(e),
    e.alias,
    di(e),
    e.sourceName,
    ...e.displayPath ?? [],
    (e.displayPath ?? []).join(ya)
  ].map((s) => s?.trim().toLowerCase()).filter(Boolean).join(" ");
}
function zu(e, t, s, i) {
  if (e.length === 0)
    return {
      collapsedGroups: /* @__PURE__ */ new Set(),
      collapsedContainers: /* @__PURE__ */ new Set(),
      collapsedElementTypes: /* @__PURE__ */ new Set(),
      hydratedContainers: /* @__PURE__ */ new Set()
    };
  if (e.reduce(
    (W, I) => W + I.properties.length + I.compositionSections.reduce(
      (ee, Xe) => ee + Xe.properties.length,
      0
    ) + I.containers.reduce(
      (ee, Xe) => ee + (t.get(Xe.containerKey)?.reduce(
        (St, Qi) => St + Qi.properties.length,
        0
      ) ?? 0),
      0
    ),
    0
  ) <= i) {
    const W = /* @__PURE__ */ new Set();
    if (s)
      for (const I of e)
        for (const ee of I.containers)
          Fs(ee, t, s) && W.add(ee.containerKey);
    return {
      collapsedGroups: /* @__PURE__ */ new Set(),
      collapsedContainers: /* @__PURE__ */ new Set(),
      collapsedElementTypes: /* @__PURE__ */ new Set(),
      hydratedContainers: W
    };
  }
  const a = /* @__PURE__ */ new Set(), n = /* @__PURE__ */ new Set(), _ = /* @__PURE__ */ new Set(), y = /* @__PURE__ */ new Set();
  let N;
  for (const W of e)
    if (Iu(W, t, s)) {
      N = W.name;
      break;
    }
  for (const W of e) {
    W.name !== N && a.add(W.name);
    for (const I of W.containers) {
      Fs(
        I,
        t,
        s
      ) ? y.add(I.containerKey) : n.add(I.containerKey);
      const Xe = t.get(I.containerKey) ?? I.elementTypes;
      for (const St of Xe)
        St.properties.some(
          (yl) => yl.alias === s
        ) || _.add(St.elementTypeKey);
    }
  }
  return {
    collapsedGroups: a,
    collapsedContainers: n,
    collapsedElementTypes: _,
    hydratedContainers: y
  };
}
function Iu(e, t, s) {
  return s ? e.properties.some((i) => i.alias === s) || e.compositionSections.some(
    (i) => i.properties.some((r) => r.alias === s)
  ) ? !0 : e.containers.some(
    (i) => Fs(i, t, s)
  ) : !1;
}
function Fs(e, t, s) {
  return s ? (t.get(e.containerKey) ?? e.elementTypes).some(
    (r) => r.properties.some((a) => a.alias === s)
  ) : !1;
}
function za(e) {
  return e.variesByCulture ? Lc : Oc;
}
function Vs(e, t) {
  const s = e.trim();
  return s ? t.find(
    (r) => r.isoCode.localeCompare(s, void 0, { sensitivity: "accent" }) === 0
  )?.name ?? s : "—";
}
function Uu(e, t, s) {
  switch (e) {
    case "AllCultures":
      return Ws;
    case "CurrentCulture":
      return t ? `${Hs}: ${Vs(t, s)}` : Hs;
    case "SpecificCulture":
      return t ? Vs(t, s) : oa;
    default:
      return Ws;
  }
}
function Bu(e, t) {
  return e !== "AllCultures" || t.some((s) => !!s.matchedCulture?.trim());
}
const Wu = C`
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
var Hu = Object.defineProperty, Gu = Object.getOwnPropertyDescriptor, Ia = (e) => {
  throw TypeError(e);
}, A = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Gu(t, s) : t, a = e.length - 1, n; a >= 0; a--)
    (n = e[a]) && (r = (i ? n(t, s, r) : n(r)) || r);
  return i && r && Hu(t, s, r), r;
}, fi = (e, t, s) => t.has(e) || Ia("Cannot " + s), le = (e, t, s) => (fi(e, t, "read from private field"), s ? s.call(e) : t.get(e)), xt = (e, t, s) => t.has(e) ? Ia("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, s), tt = (e, t, s, i) => (fi(e, t, "write to private field"), t.set(e, s), s), m = (e, t, s) => (fi(e, t, "access private method"), s), te, nt, Jt, p, Ua, Ba, Wa, Ha, Ga, Fa, Va, qa, Ka, ys, Ya, ja, qs, gi, Xa, Ja, qe, Za, Ks, Ys, ot, js, bs, vi, Qa, yi, Ss, Cs;
const Fu = "search-property-change";
let $ = class extends B {
  constructor() {
    super(...arguments), xt(this, p), this.value = "", this.properties = [], this.label = "Property", this.placeholder = ou, this.disabled = !1, this.error = !1, this.loading = !1, this.ariaDescribedBy = "", this._filteredGroups = [], this._flatSearchResults = [], this._searchMatchCount = 0, this._searchVisibleCount = ge, this._hydratedContainers = /* @__PURE__ */ new Set(), this._collapsedGroups = /* @__PURE__ */ new Set(), this._collapsedContainers = /* @__PURE__ */ new Set(), this._collapsedElementTypes = /* @__PURE__ */ new Set(), this._collapsedCompositions = /* @__PURE__ */ new Set(), this._isSearching = !1, this._searchStatusMessage = "", xt(this, te), xt(this, nt, []), xt(this, Jt, Er((e) => {
      m(this, p, qs).call(this, e);
    }, _a));
  }
  updated(e) {
    if (e.has("properties") || e.has("value")) {
      tt(this, te, mi(this.properties)), this._isSearching = !1, this._flatSearchResults = [], this._searchMatchCount = 0, this._searchVisibleCount = ge;
      const t = le(this, te).createCollapseState(
        this.value,
        au
      );
      this._collapsedGroups = new Set(t.collapsedGroups), this._collapsedContainers = new Set(t.collapsedContainers), this._collapsedElementTypes = new Set(t.collapsedElementTypes), this._hydratedContainers = new Set(t.hydratedContainers), m(this, p, qs).call(this, "");
    }
  }
  disconnectedCallback() {
    le(this, Jt).cancel(), super.disconnectedCallback();
  }
  async focus() {
    await this.updateComplete, await this._combobox?.focus?.();
  }
  render() {
    const e = this.loading ? "Loading…" : this.placeholder, t = m(this, p, Ua).call(this), s = this._isSearching ? this._flatSearchResults.length > 0 : this._filteredGroups.some((i) => m(this, p, yi).call(this, i));
    return o`
      <div class="property-picker">
        <uui-combobox
          id="property-picker-combobox"
          class="condition-row__control"
          label=${this.label}
          .value=${this.value}
          .displayValue=${t}
          placeholder=${e}
          aria-describedby=${this.ariaDescribedBy || g}
          ?disabled=${this.disabled || this.loading}
          ?error=${this.error}
          @search=${m(this, p, ja)}
          @change=${m(this, p, Za)}
        >
          <uui-combobox-list
            id="property-picker-list"
            class="property-picker__list"
            role="tree"
            @scroll=${m(this, p, Ja)}
          >
            ${this._isSearching ? D(
      this._flatSearchResults,
      (i) => i.alias,
      (i) => m(this, p, Ka).call(this, i)
    ) : D(
      this._filteredGroups,
      (i) => i.name,
      (i) => m(this, p, Ba).call(this, i)
    )}
            ${s ? g : o`
                  <uui-combobox-list-option disabled value="">
                    <span class="property-option__empty">
                      ${this._isSearching ? "No matching properties." : "No properties available."}
                    </span>
                  </uui-combobox-list-option>
                `}
          </uui-combobox-list>
        </uui-combobox>
        <span class="property-picker__status" aria-live="polite">
          ${this._searchStatusMessage}
        </span>
      </div>
    `;
  }
};
te = /* @__PURE__ */ new WeakMap();
nt = /* @__PURE__ */ new WeakMap();
Jt = /* @__PURE__ */ new WeakMap();
p = /* @__PURE__ */ new WeakSet();
Ua = function() {
  if (!this.value)
    return "";
  const e = this.properties.find((t) => t.alias === this.value);
  return e ? J(e) : this.value;
};
Ba = function(e) {
  if (!m(this, p, yi).call(this, e))
    return g;
  const t = this._collapsedGroups.has(e.name);
  return o`
      <div class="property-group" role="group" aria-label=${e.displayName}>
        <button
          type="button"
          class="property-group__header"
          aria-expanded=${!t}
          @click=${(s) => m(this, p, Ks).call(this, s, e.name)}
          @keydown=${(s) => m(this, p, qe).call(this, s, () => m(this, p, Ks).call(this, s, e.name))}
        >
          <span class="property-group__title">
            <uui-icon
              class="property-source-icon"
              name=${Nu(e.name)}
            ></uui-icon>
            <span class="property-group__name">${e.displayName}</span>
          </span>
          <span class="property-group__count">(${m(this, p, Ss).call(this, e)})</span>
          <uui-symbol-expand .open=${!t}></uui-symbol-expand>
        </button>
        ${t ? g : o`
              ${D(
    e.properties,
    (s) => s.alias,
    (s) => m(this, p, ys).call(this, s)
  )}
              ${D(
    e.compositionSections,
    (s) => s.name,
    (s) => m(this, p, Wa).call(this, s)
  )}
              ${D(
    e.containers,
    (s) => s.containerKey,
    (s) => m(this, p, Ha).call(this, e, s)
  )}
            `}
      </div>
    `;
};
Wa = function(e) {
  const t = this._collapsedCompositions.has(e.name);
  return o`
      <div class="property-composition" role="group" aria-label=${e.name}>
        <button
          type="button"
          class="property-composition__header"
          aria-expanded=${!t}
          @click=${(s) => m(this, p, Ys).call(this, s, e.name)}
          @keydown=${(s) => m(this, p, qe).call(this, s, () => m(this, p, Ys).call(this, s, e.name))}
        >
          <span class="property-composition__name">${e.name}</span>
          <span class="property-composition__count"
            >(${e.properties.length})</span
          >
          <uui-symbol-expand .open=${!t}></uui-symbol-expand>
        </button>
        ${t ? g : o`
              <div class="property-composition__properties">
                ${D(
    e.properties,
    (s) => s.alias,
    (s) => m(this, p, ys).call(this, s)
  )}
              </div>
            `}
      </div>
    `;
};
Ha = function(e, t) {
  if (fu(e.name))
    return m(this, p, Ga).call(this, t);
  const s = this._collapsedContainers.has(t.containerKey), i = wa(t);
  return o`
      <div class="property-container" role="group" aria-label=${i}>
        <button
          type="button"
          class="property-container__header"
          aria-expanded=${!s}
          @click=${(r) => m(this, p, ot).call(this, r, t.containerKey)}
          @keydown=${(r) => m(this, p, qe).call(this, r, () => m(this, p, ot).call(this, r, t.containerKey))}
        >
          <span class="property-container__title">
            <uui-icon
              class="property-container__icon"
              name=${xa(t)}
            ></uui-icon>
            <span class="property-container__name">${i}</span>
          </span>
          <span class="property-container__count"
            >(${m(this, p, Cs).call(this, t)})</span
          >
          <uui-symbol-expand .open=${!s}></uui-symbol-expand>
        </button>
        ${s ? g : o`
              ${D(
    m(this, p, vi).call(this, t),
    (r) => r.elementTypeKey,
    (r) => m(this, p, qa).call(this, r)
  )}
            `}
      </div>
    `;
};
Ga = function(e) {
  const t = this._collapsedContainers.has(e.containerKey), s = wa(e), i = m(this, p, vi).call(this, e);
  return o`
      <div
        class="property-container property-container--block-grid"
        role="group"
        aria-label=${s}
      >
        <button
          type="button"
          class="property-container__header"
          aria-expanded=${!t}
          @click=${(r) => m(this, p, ot).call(this, r, e.containerKey)}
          @keydown=${(r) => m(this, p, qe).call(this, r, () => m(this, p, ot).call(this, r, e.containerKey))}
        >
          <span class="property-container__title">
            <uui-icon
              class="property-container__icon"
              name=${xa(e)}
            ></uui-icon>
            <span class="property-container__name">${s}</span>
          </span>
          <span class="property-container__count"
            >(${m(this, p, Cs).call(this, e)})</span
          >
          <uui-symbol-expand .open=${!t}></uui-symbol-expand>
        </button>
        ${t ? g : o`
              <div class="property-block-grid-tree" role="group">
                ${D(
    i,
    (r) => r.elementTypeKey,
    (r) => m(this, p, Fa).call(this, r)
  )}
              </div>
            `}
      </div>
    `;
};
Fa = function(e) {
  return o`
      <div
        class="property-block-grid-tree__element-type"
        role="group"
        aria-label=${e.elementTypeName}
      >
        <div class="property-block-grid-tree__element-type-name">
          ${e.elementTypeName}
        </div>
        <div class="property-block-grid-tree__properties" role="group">
          ${D(
    e.properties,
    (t) => t.alias,
    (t, s) => m(this, p, Va).call(this, t, s, e.properties.length)
  )}
        </div>
      </div>
    `;
};
Va = function(e, t, s) {
  const r = t === s - 1 ? "└" : "├", a = J(e), n = _s(e);
  return o`
      <uui-combobox-list-option
        class="property-block-grid-tree__selectable-option"
        .value=${e.alias}
        .displayValue=${a}
        role="treeitem"
      >
        <span class="property-block-grid-tree__property property-block-grid-tree__property--selectable">
          <span class="property-block-grid-tree__property-line">
            <span class="property-block-grid-tree__glyph" aria-hidden="true"
              >${r}</span
            >
            <span class="property-block-grid-tree__property-name"
              >${n}</span
            >
          </span>
          ${g}
        </span>
      </uui-combobox-list-option>
    `;
};
qa = function(e) {
  const t = this._collapsedElementTypes.has(e.elementTypeKey);
  return o`
      <div
        class="property-element-type"
        role="group"
        aria-label=${e.elementTypeName}
      >
        <button
          type="button"
          class="property-element-type__header"
          aria-expanded=${!t}
          @click=${(s) => m(this, p, js).call(this, s, e.elementTypeKey)}
          @keydown=${(s) => m(this, p, qe).call(this, s, () => m(this, p, js).call(this, s, e.elementTypeKey))}
        >
          <span class="property-element-type__title">
            <uui-icon
              class="property-element-type__icon"
              name=${hu}
            ></uui-icon>
            <span class="property-element-type__name"
              >${e.elementTypeName}</span
            >
          </span>
          <span class="property-element-type__count"
            >(${e.properties.length})</span
          >
          <uui-symbol-expand .open=${!t}></uui-symbol-expand>
        </button>
        ${t ? g : o`
              <div class="property-element-type__properties">
                ${D(
    e.properties,
    (s) => s.alias,
    (s) => m(this, p, ys).call(this, s, { nestedInBlock: !0 })
  )}
              </div>
            `}
      </div>
    `;
};
Ka = function(e) {
  const t = ms(e), s = J(e), i = _u(e), r = i ? Ca(e) : void 0;
  return o`
      <uui-combobox-list-option
        .value=${e.alias}
        .displayValue=${s}
        role="treeitem"
      >
        <span class="property-option property-option--search-result">
          <span class="property-option__header">
            <uui-icon
              class="property-source-icon"
              name=${Da(e)}
            ></uui-icon>
            <span class="property-option__name">${t}</span>
            <span class="property-option__culture">${za(e)}</span>
          </span>
          ${i && r ? o`<span class="property-option__context">${r}</span>` : g}
          ${g}
        </span>
      </uui-combobox-list-option>
    `;
};
ys = function(e, t = {}) {
  const { nestedInBlock: s = !1 } = t, i = J(e);
  return o`
      <uui-combobox-list-option
        .value=${e.alias}
        .displayValue=${i}
        role="treeitem"
      >
        <span class="property-option ${s ? "property-option--nested" : ""}">
          <span class="property-option__header">
            <uui-icon
              class="property-source-icon"
              name=${Da(e)}
            ></uui-icon>
            <span class="property-option__name">
              ${s ? m(this, p, Ya).call(this, e) : J(e)}
            </span>
            <span class="property-option__culture">${za(e)}</span>
          </span>
          ${g}
        </span>
      </uui-combobox-list-option>
    `;
};
Ya = function(e) {
  const t = xu(e);
  return t.prefix ? o`${t.prefix} › ${t.leaf}` : _s(e);
};
ja = function(e) {
  const t = e.currentTarget.search ?? "";
  le(this, Jt).call(this, t);
};
qs = function(e) {
  if (le(this, te) ?? tt(this, te, mi(this.properties)), this._isSearching = !!e.trim(), this._isSearching) {
    const t = le(this, te).search(e);
    tt(this, nt, t);
    const s = fs(
      t,
      ge,
      Be
    );
    this._searchMatchCount = s.totalCount, this._searchVisibleCount = s.visibleCount, this._flatSearchResults = s.items, this._filteredGroups = [], this._searchStatusMessage = s.totalCount === 0 ? "No matching properties." : ft(
      s.totalCount,
      s.visibleCount,
      s.truncated || s.hasMore,
      !0,
      "properties"
    );
    return;
  }
  this._flatSearchResults = [], this._searchMatchCount = 0, this._searchVisibleCount = ge, tt(this, nt, []), m(this, p, gi).call(this);
};
gi = function() {
  le(this, te) ?? tt(this, te, mi(this.properties));
  const e = le(this, te).getBrowseGroups(this._hydratedContainers), t = $u(e);
  this._filteredGroups = t.groups;
  const s = t.groups.reduce(
    (i, r) => i + m(this, p, Ss).call(this, r),
    0
  );
  this._searchStatusMessage = t.totalPropertyCount === 0 ? "" : ft(
    t.totalPropertyCount,
    s,
    t.truncated,
    !1,
    "properties"
  );
};
Xa = function() {
  if (!this._isSearching)
    return;
  const e = Ea(
    this._searchVisibleCount,
    this._searchMatchCount,
    ge,
    Be
  );
  if (e === this._searchVisibleCount)
    return;
  const t = fs(
    le(this, nt),
    e,
    Be
  );
  this._searchVisibleCount = t.visibleCount, this._flatSearchResults = t.items, this._searchStatusMessage = ft(
    t.totalCount,
    t.visibleCount,
    t.truncated || t.hasMore,
    !0,
    "properties"
  );
};
Ja = function(e) {
  if (!this._isSearching)
    return;
  const t = e.currentTarget;
  Ta(
    t.scrollTop,
    t.clientHeight,
    t.scrollHeight
  ) && m(this, p, Xa).call(this);
};
qe = function(e, t) {
  e.key !== "Enter" && e.key !== " " || (e.preventDefault(), e.stopPropagation(), t());
};
Za = function(e) {
  const t = String(
    e.currentTarget.value ?? ""
  ), s = this.properties.find((i) => i.alias === t);
  s && !mu(s) || this.dispatchEvent(
    new CustomEvent(Fu, {
      detail: { value: t },
      bubbles: !0,
      composed: !0
    })
  );
};
Ks = function(e, t) {
  e.preventDefault(), e.stopPropagation(), m(this, p, bs).call(this, this._collapsedGroups, t, (s) => {
    this._collapsedGroups = s;
  });
};
Ys = function(e, t) {
  e.preventDefault(), e.stopPropagation(), m(this, p, bs).call(this, this._collapsedCompositions, t, (s) => {
    this._collapsedCompositions = s;
  });
};
ot = function(e, t) {
  e.preventDefault(), e.stopPropagation();
  const s = new Set(this._collapsedContainers);
  s.has(t) ? (s.delete(t), m(this, p, Qa).call(this, t)) : s.add(t), this._collapsedContainers = s;
};
js = function(e, t) {
  e.preventDefault(), e.stopPropagation(), m(this, p, bs).call(this, this._collapsedElementTypes, t, (s) => {
    this._collapsedElementTypes = s;
  });
};
bs = function(e, t, s) {
  const i = new Set(e);
  i.has(t) ? i.delete(t) : i.add(t), s(i);
};
vi = function(e) {
  return this._hydratedContainers.has(e.containerKey) ? le(this, te)?.getContainerElementTypes(e.containerKey) ?? e.elementTypes : e.elementTypes;
};
Qa = function(e) {
  if (this._hydratedContainers.has(e))
    return;
  const t = new Set(this._hydratedContainers);
  t.add(e), this._hydratedContainers = t, this._isSearching || m(this, p, gi).call(this);
};
yi = function(e) {
  return m(this, p, Ss).call(this, e) > 0;
};
Ss = function(e) {
  const t = e.compositionSections.reduce(
    (i, r) => i + r.properties.length,
    0
  ), s = e.containers.reduce(
    (i, r) => i + m(this, p, Cs).call(this, r),
    0
  );
  return e.properties.length + t + s;
};
Cs = function(e) {
  return this._hydratedContainers.has(e.containerKey) ? We(e) : le(this, te)?.getContainerNestedPropertyCount(
    e.containerKey
  ) ?? We(e);
};
$.styles = Wu;
A([
  l({ type: String })
], $.prototype, "value", 2);
A([
  l({ type: Array })
], $.prototype, "properties", 2);
A([
  l({ type: String })
], $.prototype, "label", 2);
A([
  l({ type: String })
], $.prototype, "placeholder", 2);
A([
  l({ type: Boolean })
], $.prototype, "disabled", 2);
A([
  l({ type: Boolean })
], $.prototype, "error", 2);
A([
  l({ type: Boolean })
], $.prototype, "loading", 2);
A([
  l({ type: String, attribute: "aria-describedby" })
], $.prototype, "ariaDescribedBy", 2);
A([
  d()
], $.prototype, "_filteredGroups", 2);
A([
  d()
], $.prototype, "_flatSearchResults", 2);
A([
  d()
], $.prototype, "_searchMatchCount", 2);
A([
  d()
], $.prototype, "_searchVisibleCount", 2);
A([
  d()
], $.prototype, "_hydratedContainers", 2);
A([
  d()
], $.prototype, "_collapsedGroups", 2);
A([
  d()
], $.prototype, "_collapsedContainers", 2);
A([
  d()
], $.prototype, "_collapsedElementTypes", 2);
A([
  d()
], $.prototype, "_collapsedCompositions", 2);
A([
  d()
], $.prototype, "_isSearching", 2);
A([
  d()
], $.prototype, "_searchStatusMessage", 2);
A([
  $r("#property-picker-combobox")
], $.prototype, "_combobox", 2);
$ = A([
  U("search-property-picker")
], $);
const Vu = "search-condition-change", qu = "search-condition-remove", Ku = "search-condition-duplicate", Yu = "search-condition-reorder", ju = C`
  --uui-select-height: 2.125rem;
  --uui-select-font-size: var(--uui-type-default-size);
  --uui-select-padding-y: var(--uui-size-space-1);
  --uui-select-padding-x: var(--uui-size-space-2);
  --uui-select-border-color: transparent;
  --uui-select-border-color-hover: transparent;
  --uui-select-background-color: var(--uui-color-surface);
  --uui-input-height: 2.125rem;
  --uui-input-border-color: transparent;
  --uui-input-background-color: var(--uui-color-surface);
`, Xu = [
  ce,
  ju,
  C`
    :host {
      display: block;
      width: 100%;
    }

    .condition-row {
      width: 100%;
      padding: var(--uui-size-space-2) 0;
      box-sizing: border-box;
      transition: opacity 160ms ease, transform 160ms ease;
    }

    :host([dragging]) .condition-row {
      opacity: 0.42;
    }

    :host([drop-target]) .condition-row {
      transform: translateY(2px);
    }

    .condition-row__sentence {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr) auto;
      align-items: start;
      gap: var(--uui-size-space-3);
      width: 100%;
      min-width: 0;
    }

    .condition-row__keyword {
      flex-shrink: 0;
      align-self: center;
      width: 3.25rem;
      padding-top: 0.45rem;
      font-family: var(--uui-font-family-mono, ui-monospace, monospace);
      font-size: var(--uui-type-small-size);
      font-weight: 700;
      letter-spacing: 0.08em;
      line-height: 1;
      text-transform: uppercase;
      user-select: none;
    }

    .condition-row__keyword--where {
      color: var(--uui-color-selected);
      font-size: var(--uui-type-default-size);
      letter-spacing: 0.1em;
    }

    .condition-row__keyword--join {
      color: var(--uui-color-text-alt);
    }

    .condition-row__fields {
      display: grid;
      grid-template-columns:
        minmax(6.5rem, 1fr)
        minmax(6.5rem, 1fr)
        minmax(5.5rem, 0.8fr)
        minmax(7rem, 1.1fr);
      align-items: start;
      gap: var(--uui-size-space-2) var(--uui-size-space-3);
      min-width: 0;
    }

    .condition-row__token {
      display: flex;
      flex-direction: column;
      gap: var(--uui-size-space-1);
      min-width: 0;
    }

    .condition-row__control,
    .condition-row__token uui-select,
    .condition-row__token uui-input,
    .condition-row__token umb-input-date {
      width: 100%;
      min-width: 0;
    }

    .condition-row__token--date-range {
      grid-column: 1 / -1;
    }

    .condition-row__date-range {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
      align-items: start;
      gap: var(--uui-size-space-2);
      width: 100%;
      min-width: 0;
    }

    .condition-row__date-range-separator {
      align-self: center;
      color: var(--uui-color-text-alt);
      font-size: var(--uui-type-small-size);
      line-height: 1;
      padding-top: 0.45rem;
    }

    .condition-row__ghost {
      display: flex;
      align-items: center;
      min-height: 2.125rem;
      padding: 0 var(--uui-size-space-2);
      border-radius: var(--cs-radius);
      background: color-mix(in srgb, var(--uui-color-surface-alt) 35%, transparent);
      color: var(--uui-color-text-alt);
      font-size: var(--uui-type-small-size);
    }

    .condition-row__field-error {
      margin: 0;
      color: var(--uui-color-danger);
      font-size: var(--uui-type-small-size);
      line-height: 1.35;
    }

    .condition-row__actions {
      display: flex;
      align-items: center;
      gap: var(--uui-size-space-1);
      padding-top: 0.1rem;
      opacity: 0.55;
      transition: opacity 140ms ease;
    }

    .condition-row:hover .condition-row__actions,
    .condition-row:focus-within .condition-row__actions {
      opacity: 1;
    }

    .condition-row__drag {
      cursor: grab;
      color: var(--uui-color-text-alt);
    }

    .condition-row__drag:active {
      cursor: grabbing;
    }

    .condition-row--single {
      padding: 0;
    }

    .condition-row__form {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      align-items: start;
      gap: var(--uui-size-space-3);
      width: 100%;
      min-width: 0;
    }

    :host([single-mode]) .condition-row__ghost {
      background: color-mix(in srgb, var(--uui-color-surface) 88%, var(--uui-color-surface-alt));
      border: 1px dashed color-mix(in srgb, var(--uui-color-border) 70%, transparent);
    }

    @media (max-width: 900px) {
      .condition-row__sentence {
        grid-template-columns: 1fr;
        gap: var(--uui-size-space-2);
      }

      .condition-row__keyword {
        width: auto;
        padding-top: 0;
      }

      .condition-row__fields {
        grid-template-columns: 1fr;
      }

      .condition-row__actions {
        justify-content: flex-end;
        opacity: 1;
        padding-top: 0;
      }
    }

    @media (max-width: 640px) {
      .condition-row__form {
        grid-template-columns: 1fr;
      }
    }
  `
];
var Ju = Object.defineProperty, Zu = Object.getOwnPropertyDescriptor, en = (e) => {
  throw TypeError(e);
}, M = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Zu(t, s) : t, a = e.length - 1, n; a >= 0; a--)
    (n = e[a]) && (r = (i ? n(t, s, r) : n(r)) || r);
  return i && r && Ju(t, s, r), r;
}, bi = (e, t, s) => t.has(e) || en("Cannot " + s), Qu = (e, t, s) => (bi(e, t, "read from private field"), t.get(e)), ur = (e, t, s) => t.has(e) ? en("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, s), eh = (e, t, s, i) => (bi(e, t, "write to private field"), t.set(e, s), s), u = (e, t, s) => (bi(e, t, "access private method"), s), Zt, c, tn, sn, rn, Si, Ci, de, ws, wi, xi, $i, an, nn, on, ln, Xs, cn, un, Ei, hn, dn, pn, _n, mn, _e, Ti, $e, Z;
let E = class extends B {
  constructor() {
    super(...arguments), ur(this, c), this.conditionId = "", this.connectorLabel = "WHERE", this.contentTypes = [], this.properties = [], this.contentTypesLoading = !1, this.propertiesLoading = !1, this.disabled = !1, this.removeDisabled = !1, this.duplicateDisabled = !1, this.singleMode = !1, this.showValidation = !1, this.fieldErrors = {}, this.dragging = !1, this.dropTarget = !1, this._contentTypeAlias = "", this._propertyAlias = "", this._operator = "", this._value = "", ur(this, Zt);
  }
  connectedCallback() {
    super.connectedCallback(), u(this, c, Xs).call(this);
  }
  willUpdate(e) {
    super.willUpdate(e), (e.has("conditionId") || e.has("seed")) && u(this, c, Xs).call(this);
  }
  render() {
    return this.singleMode ? u(this, c, tn).call(this) : u(this, c, sn).call(this);
  }
};
Zt = /* @__PURE__ */ new WeakMap();
c = /* @__PURE__ */ new WeakSet();
tn = function() {
  const e = mt(this._operator);
  return o`
      <div class="condition-row condition-row--single" data-condition-id=${this.conditionId}>
        <div
          class="condition-row__form"
          role="group"
          aria-label="Search condition"
        >
          ${u(this, c, Si).call(this)}
          ${this._contentTypeAlias ? u(this, c, Ci).call(this) : u(this, c, de).call(this, "Property")}
          ${this._propertyAlias ? u(this, c, ws).call(this, "operator", "Operator", this._operator, ci(
    u(this, c, xi).call(this),
    this._operator,
    "Operator"
  ), (t) => u(this, c, Ei).call(this, u(this, c, Ti).call(this, t))) : u(this, c, de).call(this, "Operator")}
          ${this._propertyAlias && this._operator ? e ? u(this, c, wi).call(this) : u(this, c, de).call(this, "—") : u(this, c, de).call(this, "Value")}
        </div>
      </div>
    `;
};
sn = function() {
  const e = mt(this._operator);
  return o`
      <div class="condition-row" data-condition-id=${this.conditionId}>
        <div class="condition-row__sentence" role="group" aria-label=${`Search condition: ${this.connectorLabel}`}>
          <span
            class="condition-row__keyword ${u(this, c, rn).call(this)}"
            aria-hidden="true"
          >
            ${this.connectorLabel}
          </span>

          <div class="condition-row__fields">
            ${u(this, c, Si).call(this)}
            ${this._contentTypeAlias ? u(this, c, Ci).call(this) : u(this, c, de).call(this, "Property")}
            ${this._propertyAlias ? u(this, c, ws).call(this, "operator", "Operator", this._operator, ci(
    u(this, c, xi).call(this),
    this._operator,
    "Operator"
  ), (t) => u(this, c, Ei).call(this, u(this, c, Ti).call(this, t))) : u(this, c, de).call(this, "Operator")}
            ${this._propertyAlias && this._operator ? e ? u(this, c, wi).call(this) : u(this, c, de).call(this, "—") : u(this, c, de).call(this, "Value")}
          </div>

          <div class="condition-row__actions">
            <uui-button
              class="condition-row__drag"
              look="reset"
              compact
              label="Drag to reorder"
              ?disabled=${this.disabled}
              draggable=${!this.disabled}
              @dragstart=${u(this, c, pn)}
              @dragend=${u(this, c, _n)}
              @keydown=${u(this, c, mn)}
            >
              <uui-icon name="icon-navigation"></uui-icon>
            </uui-button>
            <uui-button
              look="reset"
              compact
              label="Duplicate condition"
              ?disabled=${this.disabled || this.duplicateDisabled}
              @click=${u(this, c, dn)}
            >
              <uui-icon name="icon-copy"></uui-icon>
            </uui-button>
            <uui-button
              look="reset"
              compact
              label="Remove condition"
              ?disabled=${this.disabled || this.removeDisabled}
              @click=${u(this, c, hn)}
            >
              <uui-icon name="icon-wrong"></uui-icon>
            </uui-button>
          </div>
        </div>
      </div>
    `;
};
rn = function() {
  return this.connectorLabel === "WHERE" ? "condition-row__keyword--where" : "condition-row__keyword--join";
};
Si = function() {
  const e = u(this, c, $e).call(this, "contentTypeAlias");
  return o`
      <div class="condition-row__token">
        <search-content-type-picker
          class="condition-row__control"
          label="Content type"
          .value=${this._contentTypeAlias}
          .contentTypes=${this.contentTypes}
          .loading=${this.contentTypesLoading}
          ?disabled=${this.disabled}
          ?error=${!!e}
          aria-describedby=${e ? u(this, c, Z).call(this, "contentTypeAlias") : g}
          @search-content-type-change=${u(this, c, cn)}
        ></search-content-type-picker>
        ${e ? o`<p id=${u(this, c, Z).call(this, "contentTypeAlias")} class="condition-row__field-error">
              ${e}
            </p>` : g}
      </div>
    `;
};
Ci = function() {
  const e = u(this, c, $e).call(this, "propertyAlias");
  return o`
      <div class="condition-row__token">
        <search-property-picker
          class="condition-row__control"
          label="Property"
          .value=${this._propertyAlias}
          .properties=${this.properties}
          .loading=${this.propertiesLoading}
          ?disabled=${this.disabled}
          ?error=${!!e}
          aria-describedby=${e ? u(this, c, Z).call(this, "propertyAlias") : g}
          @search-property-change=${u(this, c, un)}
        ></search-property-picker>
        ${e ? o`<p id=${u(this, c, Z).call(this, "propertyAlias")} class="condition-row__field-error">
              ${e}
            </p>` : g}
      </div>
    `;
};
de = function(e) {
  return o`
      <div class="condition-row__token">
        <span class="condition-row__ghost">${e}</span>
      </div>
    `;
};
ws = function(e, t, s, i, r, a = this.disabled) {
  const n = u(this, c, $e).call(this, e);
  return o`
      <div class="condition-row__token">
        <uui-select
          class="condition-row__control"
          label=${t}
          .value=${s}
          .options=${i}
          ?disabled=${a}
          ?error=${!!n}
          aria-describedby=${n ? u(this, c, Z).call(this, e) : g}
          @change=${r}
        ></uui-select>
        ${n ? o`<p id=${u(this, c, Z).call(this, e)} class="condition-row__field-error">
              ${n}
            </p>` : g}
      </div>
    `;
};
wi = function() {
  const e = u(this, c, $i).call(this);
  return su(this._propertyAlias) && mt(this._operator) ? u(this, c, an).call(this) : ua(e) ? ha(this._operator) ? u(this, c, ln).call(this) : u(this, c, on).call(this) : u(this, c, nn).call(this);
};
xi = function() {
  return ru(u(this, c, $i).call(this)).map(
    (e) => ({
      value: e.value,
      label: e.label
    })
  );
};
$i = function() {
  return this.properties.find((e) => e.alias === this._propertyAlias);
};
an = function() {
  return u(this, c, ws).call(this, "value", "Publish status", this._value, ci(tu, this._value, "Select status"), (e) => {
    this._value = e.target.value, u(this, c, _e).call(this);
  });
};
nn = function() {
  const e = u(this, c, $e).call(this, "value");
  return o`
      <div class="condition-row__token">
        <uui-input
          class="condition-row__control"
          label="Value"
          placeholder="Value"
          .value=${this._value}
          ?disabled=${this.disabled}
          ?required=${!0}
          ?error=${!!e}
          aria-describedby=${e ? u(this, c, Z).call(this, "value") : g}
          @input=${(t) => {
    this._value = t.target.value, u(this, c, _e).call(this);
  }}
        ></uui-input>
        ${e ? o`<p id=${u(this, c, Z).call(this, "value")} class="condition-row__field-error">
              ${e}
            </p>` : g}
      </div>
    `;
};
on = function() {
  const e = u(this, c, $e).call(this, "value");
  return o`
      <div class="condition-row__token">
        <umb-input-date
          class="condition-row__control"
          type="date"
          label="Date"
          .value=${this._value}
          ?disabled=${this.disabled}
          ?required=${!0}
          ?error=${!!e}
          aria-describedby=${e ? u(this, c, Z).call(this, "value") : g}
          @change=${(t) => {
    this._value = String(t.target.value ?? ""), u(this, c, _e).call(this);
  }}
        ></umb-input-date>
        ${e ? o`<p id=${u(this, c, Z).call(this, "value")} class="condition-row__field-error">
              ${e}
            </p>` : g}
      </div>
    `;
};
ln = function() {
  const e = u(this, c, $e).call(this, "value"), { from: t, to: s } = da(this._value);
  return o`
      <div class="condition-row__token condition-row__token--date-range">
        <div class="condition-row__date-range">
          <umb-input-date
            class="condition-row__control"
            type="date"
            label="From"
            .value=${t}
            ?disabled=${this.disabled}
            ?required=${!0}
            ?error=${!!e}
            @change=${(i) => {
    this._value = ar(
      String(i.target.value ?? ""),
      s
    ), u(this, c, _e).call(this);
  }}
          ></umb-input-date>
          <span class="condition-row__date-range-separator" aria-hidden="true">–</span>
          <umb-input-date
            class="condition-row__control"
            type="date"
            label="To"
            .value=${s}
            .min=${t || g}
            ?disabled=${this.disabled}
            ?required=${!0}
            ?error=${!!e}
            aria-describedby=${e ? u(this, c, Z).call(this, "value") : g}
            @change=${(i) => {
    this._value = ar(
      t,
      String(i.target.value ?? "")
    ), u(this, c, _e).call(this);
  }}
          ></umb-input-date>
        </div>
        ${e ? o`<p id=${u(this, c, Z).call(this, "value")} class="condition-row__field-error">
              ${e}
            </p>` : g}
      </div>
    `;
};
Xs = function() {
  const e = this.seed, t = e ? `${this.conditionId}:${e.contentTypeAlias}:${e.propertyAlias}:${e.operator}:${e.value}` : this.conditionId;
  Qu(this, Zt) !== t && (eh(this, Zt, t), this._contentTypeAlias = e?.contentTypeAlias ?? "", this._propertyAlias = e?.propertyAlias ?? "", this._operator = jc(e?.operator ?? ""), this._value = e?.value ?? "");
};
cn = function(e) {
  const t = e.detail.value;
  t !== this._contentTypeAlias && (this._contentTypeAlias = t, this._propertyAlias = "", this._operator = "", this._value = "", u(this, c, _e).call(this));
};
un = function(e) {
  const t = e.detail.value;
  t !== this._propertyAlias && (this._propertyAlias = t, this._operator = "", this._value = "", u(this, c, _e).call(this));
};
Ei = function(e) {
  e !== this._operator && (this._operator = e, mt(e) || (this._value = ""), u(this, c, _e).call(this));
};
hn = function() {
  this.dispatchEvent(
    new CustomEvent(qu, {
      detail: { conditionId: this.conditionId },
      bubbles: !0,
      composed: !0
    })
  );
};
dn = function() {
  this.dispatchEvent(
    new CustomEvent(Ku, {
      detail: { conditionId: this.conditionId },
      bubbles: !0,
      composed: !0
    })
  );
};
pn = function(e) {
  e.dataTransfer && (e.dataTransfer.effectAllowed = "move", e.dataTransfer.setData("text/plain", this.conditionId), this.dispatchEvent(
    new CustomEvent("search-condition-drag-start", {
      detail: { conditionId: this.conditionId },
      bubbles: !0,
      composed: !0
    })
  ));
};
_n = function() {
  this.dispatchEvent(
    new CustomEvent("search-condition-drag-end", {
      bubbles: !0,
      composed: !0
    })
  );
};
mn = function(e) {
  e.key !== "ArrowUp" && e.key !== "ArrowDown" || (e.preventDefault(), this.dispatchEvent(
    new CustomEvent(Yu, {
      detail: {
        conditionId: this.conditionId,
        direction: e.key === "ArrowUp" ? "up" : "down"
      },
      bubbles: !0,
      composed: !0
    })
  ));
};
_e = function() {
  this.dispatchEvent(
    new CustomEvent(Vu, {
      detail: {
        conditionId: this.conditionId,
        contentTypeAlias: this._contentTypeAlias,
        propertyAlias: this._propertyAlias,
        operator: this._operator,
        value: this._value
      },
      bubbles: !0,
      composed: !0
    })
  );
};
Ti = function(e) {
  return String(e.target.value ?? "");
};
$e = function(e) {
  return this.showValidation ? this.fieldErrors[e] : void 0;
};
Z = function(e) {
  return `${this.conditionId}-${e}-error`;
};
E.styles = Xu;
M([
  l({ type: String, attribute: "data-condition-id" })
], E.prototype, "conditionId", 2);
M([
  l({ type: String })
], E.prototype, "connectorLabel", 2);
M([
  l({ type: Array })
], E.prototype, "contentTypes", 2);
M([
  l({ type: Array })
], E.prototype, "properties", 2);
M([
  l({ type: Boolean })
], E.prototype, "contentTypesLoading", 2);
M([
  l({ type: Boolean })
], E.prototype, "propertiesLoading", 2);
M([
  l({ type: Boolean })
], E.prototype, "disabled", 2);
M([
  l({ type: Boolean })
], E.prototype, "removeDisabled", 2);
M([
  l({ type: Boolean })
], E.prototype, "duplicateDisabled", 2);
M([
  l({ type: Boolean, reflect: !0, attribute: "single-mode" })
], E.prototype, "singleMode", 2);
M([
  l({ type: Boolean })
], E.prototype, "showValidation", 2);
M([
  l({ type: Object, attribute: !1 })
], E.prototype, "fieldErrors", 2);
M([
  l({ type: Object, attribute: !1 })
], E.prototype, "seed", 2);
M([
  l({ type: Boolean, reflect: !0 })
], E.prototype, "dragging", 2);
M([
  l({ type: Boolean, reflect: !0, attribute: "drop-target" })
], E.prototype, "dropTarget", 2);
M([
  d()
], E.prototype, "_contentTypeAlias", 2);
M([
  d()
], E.prototype, "_propertyAlias", 2);
M([
  d()
], E.prototype, "_operator", 2);
M([
  d()
], E.prototype, "_value", 2);
E = M([
  U("search-condition-row")
], E);
const th = [
  C`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }

    .search-builder {
      display: flex;
      flex-direction: column;
      min-height: 100%;
    }

    .search-builder__header {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: var(--cs-space-inline);
      padding: var(--cs-space-section) var(--cs-space-section) var(--cs-space-block);
    }

    .search-builder__title {
      margin: 0;
    }

    .search-builder__header-actions {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--uui-size-space-2);
      margin-left: auto;
    }

    .search-builder__culture-group {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--uui-size-space-2);
    }

    .search-builder__control-label {
      margin: 0;
      color: var(--uui-color-text-alt);
      font-size: var(--uui-type-small-size);
      font-weight: 600;
      white-space: nowrap;
    }

    .search-builder__culture-mode {
      min-width: 10rem;
    }

    .search-builder__culture-language {
      min-width: 12rem;
    }

    .search-builder__match {
      min-width: 9rem;
    }

    .search-builder--single .search-builder__form-panel {
      margin: 0 var(--cs-space-section) var(--cs-space-block);
      padding: var(--cs-space-section);
      border-radius: var(--cs-radius-lg);
      background: var(--cs-surface-inset);
      border: 1px solid var(--cs-border-subtle);
    }

    .search-builder__canvas {
      flex: 1 1 auto;
      display: flex;
      flex-direction: column;
      min-height: 14rem;
      margin: 0 var(--cs-space-section);
      border-radius: var(--cs-radius-lg);
      background: var(--cs-surface-inset);
      border: 1px solid var(--cs-border-subtle);
    }

    .search-builder__canvas-empty {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--cs-space-page) var(--cs-space-section);
    }

    .search-builder__add {
      min-width: 11rem;
    }

    .condition-list {
      display: flex;
      flex-direction: column;
      gap: var(--uui-size-space-1);
      padding: var(--cs-space-block) var(--cs-space-section);
    }

    .condition-list__item {
      animation: cs-condition-enter 180ms ease-out;
      border-radius: var(--cs-radius);
      transition:
        background-color 140ms ease,
        box-shadow 140ms ease;
    }

    .condition-list__item:hover {
      background: color-mix(in srgb, var(--uui-color-surface) 65%, transparent);
    }

    @keyframes cs-condition-enter {
      from {
        opacity: 0;
        transform: translateY(-6px);
      }

      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .search-builder__action-bar {
      position: sticky;
      bottom: 0;
      z-index: 2;
      display: flex;
      flex-direction: column;
      gap: 0;
      margin-top: var(--cs-space-block);
      background: var(--cs-sticky-surface);
      border-top: 1px solid var(--cs-border-subtle);
    }

    .search-builder--single .search-builder__action-bar {
      margin-top: 0;
    }

    .search-builder__tips {
      margin: 0;
      padding-left: var(--uui-size-space-5);
      font-size: var(--uui-type-small-size);
      color: var(--uui-color-text-alt);
      line-height: 1.5;
    }

    .search-builder__tips kbd {
      display: inline-block;
      padding: 0 var(--uui-size-space-1);
      border-radius: calc(var(--uui-border-radius) * 0.5);
      border: 1px solid var(--cs-border-subtle);
      background: var(--cs-surface-muted);
      font-size: 0.85em;
      font-family: inherit;
    }

    .search-builder__actions {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: flex-end;
      gap: var(--uui-size-space-2);
      padding: var(--cs-space-block) var(--cs-space-section);
    }

    @media (max-width: 900px) {
      .search-builder__header {
        flex-direction: column;
        align-items: stretch;
      }

      .search-builder__header-actions {
        width: 100%;
        margin-left: 0;
      }

      .search-builder__match {
        flex: 1 1 auto;
      }
    }

    @media (max-width: 560px) {
      .search-builder__header,
      .search-builder__canvas {
        margin-left: var(--cs-space-block);
        margin-right: var(--cs-space-block);
      }

      .search-builder__header {
        padding-left: 0;
        padding-right: 0;
      }

      .search-builder__action-bar {
        padding-left: var(--cs-space-block);
        padding-right: var(--cs-space-block);
      }

      .search-builder__actions {
        width: 100%;
      }

      .search-builder__actions uui-button {
        flex: 1 1 auto;
      }
    }
  `
], sh = [
  { alias: "nodeName", name: "Node name", editorAlias: "Umbraco.TextBox", sourceCategory: "System", groupName: "System", isSelectable: !0 },
  { alias: "createDate", name: "Create date", editorAlias: "Umbraco.DateTime", sourceCategory: "System", groupName: "System", isSelectable: !0 },
  { alias: "updateDate", name: "Update date", editorAlias: "Umbraco.DateTime", sourceCategory: "System", groupName: "System", isSelectable: !0 },
  { alias: "publishStatus", name: "Publish status", editorAlias: "Umbraco.TrueFalse", sourceCategory: "System", groupName: "System", isSelectable: !0 }
];
function ih(e) {
  return e.trim().toLowerCase() === ea;
}
function rh() {
  return {
    alias: ea,
    name: mc
  };
}
function ah() {
  return sh;
}
const nh = [
  ce,
  C`
    :host {
      display: block;
      width: 100%;
    }

    .expandable--embedded {
      border-top: 1px solid var(--cs-border-subtle);
    }

    .expandable__trigger {
      width: 100%;
      justify-content: flex-start;
      gap: var(--uui-size-space-2);
      padding: var(--uui-size-space-2) var(--cs-space-section);
      color: var(--uui-color-text-alt);
      font-size: var(--uui-type-small-size);
      font-weight: 600;
      line-height: 1.3;
    }

    .expandable__trigger--right {
      justify-content: flex-end;
      flex-direction: row-reverse;
    }

    .expandable__trigger uui-icon {
      font-size: var(--uui-size-5, 14px);
    }

    .expandable__body {
      padding: 0 var(--cs-space-section) var(--uui-size-space-3);
    }

    .expandable__body[hidden] {
      display: none;
    }

    .expandable__body ::slotted(*) {
      margin: 0;
    }
  `
];
var oh = Object.defineProperty, lh = Object.getOwnPropertyDescriptor, fn = (e) => {
  throw TypeError(e);
}, Ke = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? lh(t, s) : t, a = e.length - 1, n; a >= 0; a--)
    (n = e[a]) && (r = (i ? n(t, s, r) : n(r)) || r);
  return i && r && oh(t, s, r), r;
}, gn = (e, t, s) => t.has(e) || fn("Cannot " + s), hr = (e, t, s) => (gn(e, t, "read from private field"), s ? s.call(e) : t.get(e)), dr = (e, t, s) => t.has(e) ? fn("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, s), ch = (e, t, s) => (gn(e, t, "access private method"), s), At, Js, vn;
let ve = class extends B {
  constructor() {
    super(...arguments), dr(this, Js), this.label = "Details", this.defaultExpanded = !1, this.embedded = !1, this.triggerAlign = "left", this._expanded = !1, dr(this, At, `cs-panel-${crypto.randomUUID()}`);
  }
  connectedCallback() {
    super.connectedCallback(), this._expanded = this.defaultExpanded;
  }
  render() {
    return o`
      <div class="expandable ${this._expanded ? "expandable--open" : ""} ${this.embedded ? "expandable--embedded" : ""}">
        <uui-button
          class="expandable__trigger expandable__trigger--${this.triggerAlign}"
          look="reset"
          compact
          label=${this.label}
          aria-expanded=${this._expanded ? "true" : "false"}
          aria-controls=${hr(this, At)}
          @click=${ch(this, Js, vn)}
        >
          <uui-icon
            name=${this._expanded ? "icon-navigation-up" : "icon-navigation-right"}
          ></uui-icon>
          ${this.label}
        </uui-button>
        <div class="expandable__body" id=${hr(this, At)} ?hidden=${!this._expanded}>
          <slot></slot>
        </div>
      </div>
    `;
  }
};
At = /* @__PURE__ */ new WeakMap();
Js = /* @__PURE__ */ new WeakSet();
vn = function() {
  this._expanded = !this._expanded;
};
ve.styles = [nh];
Ke([
  l({ type: String })
], ve.prototype, "label", 2);
Ke([
  l({ type: Boolean })
], ve.prototype, "defaultExpanded", 2);
Ke([
  l({ type: Boolean, reflect: !0 })
], ve.prototype, "embedded", 2);
Ke([
  l({ type: String, reflect: !0 })
], ve.prototype, "triggerAlign", 2);
Ke([
  d()
], ve.prototype, "_expanded", 2);
ve = Ke([
  U("content-search-expandable-panel")
], ve);
var uh = Object.defineProperty, hh = Object.getOwnPropertyDescriptor, yn = (e) => {
  throw TypeError(e);
}, Y = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? hh(t, s) : t, a = e.length - 1, n; a >= 0; a--)
    (n = e[a]) && (r = (i ? n(t, s, r) : n(r)) || r);
  return i && r && uh(t, s, r), r;
}, Pi = (e, t, s) => t.has(e) || yn("Cannot " + s), j = (e, t, s) => (Pi(e, t, "read from private field"), t.get(e)), be = (e, t, s) => t.has(e) ? yn("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, s), Ai = (e, t, s, i) => (Pi(e, t, "write to private field"), t.set(e, s), s), P = (e, t, s) => (Pi(e, t, "access private method"), s), gt, Ne, Oe, Qt, kt, Mt, x, bn, Sn, es, Cn, wn, xn, ki, $n, En, Tn, xs, Mi, Pn, Ri;
let V = class extends B {
  constructor() {
    super(...arguments), be(this, x), this.searching = !1, this._conditions = rr(), this._matchMode = "all", this._showValidation = !1, this._draggingId = null, this._dropTargetId = null, this._contentTypes = [], this._propertyMetadataByContentType = {}, this._loadingContentTypes = !1, this._loadingPropertiesFor = [], this._searchCultureMode = "AllCultures", this._culture = "", this._languages = [], this._loadingLanguages = !1, be(this, gt, la()), be(this, Ne), be(this, Oe), be(this, Qt), be(this, kt, (e) => {
      e.key !== "Enter" || !(e.ctrlKey || e.metaKey) || this.contains(document.activeElement) && (e.preventDefault(), P(this, x, Ri).call(this));
    }), be(this, Mt, (e) => {
      this.applySearchDefinition(
        e.detail
      );
    });
  }
  connectedCallback() {
    super.connectedCallback(), P(this, x, es).call(this), window.addEventListener("keydown", j(this, kt)), this.addEventListener(tr, j(this, Mt)), P(this, x, Tn).call(this), P(this, x, $n).call(this), this.consumeContext($l, (e) => {
      e && (Ai(this, Qt, e), this.observe(e.appCulture, (t) => {
        P(this, x, ki).call(this, t);
      }));
    });
  }
  disconnectedCallback() {
    super.disconnectedCallback(), window.removeEventListener("keydown", j(this, kt)), this.removeEventListener(tr, j(this, Mt)), j(this, Ne)?.abort(), j(this, Oe)?.abort();
  }
  async applySearchDefinition(e) {
    this._matchMode = "all", this._conditions = li(e.conditions), this._searchCultureMode = e.searchCultureMode, this._culture = e.culture, this._showValidation = !1, P(this, x, es).call(this), await P(this, x, Cn).call(this), await this.updateComplete;
  }
  resetBuilder() {
    this._conditions = rr(), this._matchMode = "all", this._searchCultureMode = "AllCultures", this._culture = "", this._showValidation = !1, this._draggingId = null, this._dropTargetId = null;
  }
  async ensurePropertiesForContentTypes(e) {
    await Promise.all(
      e.map((t) => P(this, x, xs).call(this, t))
    );
  }
  render() {
    return P(this, x, bn).call(this);
  }
};
gt = /* @__PURE__ */ new WeakMap();
Ne = /* @__PURE__ */ new WeakMap();
Oe = /* @__PURE__ */ new WeakMap();
Qt = /* @__PURE__ */ new WeakMap();
kt = /* @__PURE__ */ new WeakMap();
Mt = /* @__PURE__ */ new WeakMap();
x = /* @__PURE__ */ new WeakSet();
bn = function() {
  const e = this._conditions[0], t = Zc(
    pa(
      this._conditions,
      P(this, x, Mi).call(this)
    ).errors
  ), s = e ? !Yc(e) : !1;
  return o`
      <div class="search-builder search-builder--single">
        <header class="search-builder__header cs-section-header">
          <h2 class="cs-section-header__title search-builder__title">${kl}</h2>
          <div class="search-builder__header-actions">
            ${P(this, x, Sn).call(this)}
          </div>
        </header>

        <div class="search-builder__form-panel" role="region" aria-label="Search condition">
          ${e ? o`
                <search-condition-row
                  single-mode
                  data-condition-id=${e.id}
                  .conditionId=${e.id}
                  .seed=${e}
                  .contentTypes=${this._contentTypes}
                  .properties=${this._propertyMetadataByContentType[e.contentTypeAlias] ?? []}
                  .contentTypesLoading=${this._loadingContentTypes}
                  .propertiesLoading=${this._loadingPropertiesFor.includes(
    e.contentTypeAlias
  )}
                  .showValidation=${this._showValidation}
                  .fieldErrors=${t[e.id] ?? {}}
                  @search-condition-change=${P(this, x, En)}
                ></search-condition-row>
              ` : g}
        </div>

        <div class="search-builder__action-bar" role="toolbar" aria-label="Search actions">
          <content-search-expandable-panel label="Shortcuts">
            <ul class="search-builder__tips">
              <li>Use <kbd>Ctrl</kbd>+<kbd>Enter</kbd> to run a search.</li>
            </ul>
          </content-search-expandable-panel>
          <div class="search-builder__actions">
            <uui-button
              look="secondary"
              label="Clear"
              ?disabled=${!s}
              @click=${P(this, x, Pn)}
            >
              Clear
            </uui-button>
            <uui-button look="primary" label="Search" ?disabled=${this.searching} ?loading=${this.searching} @click=${P(this, x, Ri)}>
              <uui-icon name="icon-search"></uui-icon>
              Search
            </uui-button>
          </div>
        </div>
      </div>
    `;
};
Sn = function() {
  return o`
      <div class="search-builder__culture-group">
        <span class="search-builder__control-label">${ir}</span>
        <uui-select
          class="search-builder__culture-mode"
          label=${ir}
          .value=${this._searchCultureMode}
          .options=${Dc.map((e) => ({
    name: e.label,
    value: e.value,
    selected: e.value === this._searchCultureMode
  }))}
          @change=${P(this, x, wn)}
        ></uui-select>
        ${this._searchCultureMode === "SpecificCulture" ? o`
              <uui-select
                class="search-builder__culture-language"
                label=${Nc}
                .value=${this._culture}
                .options=${this._languages.map((e) => ({
    name: e.name,
    value: e.isoCode,
    selected: e.isoCode === this._culture
  }))}
                ?disabled=${this._loadingLanguages || this._languages.length === 0}
                @change=${P(this, x, xn)}
              ></uui-select>
            ` : g}
      </div>
    `;
};
es = function() {
  this._conditions = li(this._conditions);
};
Cn = async function() {
  const e = [
    ...new Set(
      this._conditions.map((t) => t.contentTypeAlias.trim()).filter(Boolean)
    )
  ];
  await Promise.all(e.map((t) => P(this, x, xs).call(this, t)));
};
wn = function(e) {
  const t = String(e.target.value ?? "");
  if (t !== "AllCultures" && t !== "CurrentCulture" && t !== "SpecificCulture" || t === this._searchCultureMode)
    return;
  const s = t === "SpecificCulture" ? this._culture || this._languages[0]?.isoCode || "" : t === "CurrentCulture" ? this._culture : "";
  this._searchCultureMode = t, this._culture = s, t === "CurrentCulture" && j(this, Qt)?.getAppCulture().then((i) => {
    P(this, x, ki).call(this, i);
  });
};
xn = function(e) {
  const t = String(e.target.value ?? "");
  !t || t === this._culture || (this._culture = t);
};
ki = function(e) {
  const t = e?.trim() ?? "";
  this._searchCultureMode !== "CurrentCulture" || t === this._culture || (this._culture = t);
};
$n = async function() {
  this._loadingLanguages = !0, j(this, Oe)?.abort(), Ai(this, Oe, new AbortController());
  try {
    this._languages = await j(this, gt).getLanguages(
      j(this, Oe).signal
    ), this._searchCultureMode === "SpecificCulture" && !this._culture && this._languages.length > 0 && (this._culture = this._languages[0]?.isoCode ?? "");
  } catch {
    this._languages = [];
  } finally {
    this._loadingLanguages = !1;
  }
};
En = function(e) {
  const { conditionId: t, contentTypeAlias: s, propertyAlias: i, operator: r, value: a } = e.detail, _ = this._conditions.find(
    (y) => y.id === t
  )?.contentTypeAlias !== s && !!s;
  this._conditions = this._conditions.map(
    (y) => y.id === t ? { ...y, contentTypeAlias: s, propertyAlias: i, operator: r, value: a } : y
  ), _ && P(this, x, xs).call(this, s);
};
Tn = async function() {
  this._loadingContentTypes = !0, j(this, Ne)?.abort(), Ai(this, Ne, new AbortController());
  try {
    const e = await j(this, gt).getContentTypes(
      j(this, Ne).signal
    );
    this._contentTypes = [rh(), ...e];
  } catch {
    this._contentTypes = [];
  } finally {
    this._loadingContentTypes = !1;
  }
};
xs = async function(e) {
  const t = e.trim();
  if (!(!t || this._propertyMetadataByContentType[t])) {
    if (ih(t)) {
      this._propertyMetadataByContentType = {
        ...this._propertyMetadataByContentType,
        [t]: ah()
      };
      return;
    }
    if (!this._loadingPropertiesFor.includes(t)) {
      this._loadingPropertiesFor = [...this._loadingPropertiesFor, t];
      try {
        const s = await j(this, gt).getPropertyMetadata(t);
        this._propertyMetadataByContentType = {
          ...this._propertyMetadataByContentType,
          [t]: s
        };
      } catch {
        this._propertyMetadataByContentType = {
          ...this._propertyMetadataByContentType,
          [t]: []
        };
      } finally {
        this._loadingPropertiesFor = this._loadingPropertiesFor.filter(
          (s) => s !== t
        );
      }
    }
  }
};
Mi = function() {
  const e = [];
  for (const t of this._conditions) {
    const s = t.contentTypeAlias.trim();
    s && e.push(
      ...this._propertyMetadataByContentType[s] ?? []
    );
  }
  return e;
};
Pn = function() {
  this._conditions = [ni()], this._showValidation = !1;
};
Ri = function() {
  P(this, x, es).call(this);
  const e = pa(
    this._conditions,
    P(this, x, Mi).call(this)
  );
  this._showValidation = !0, e.isValid && this.dispatchEvent(
    new CustomEvent("content-search-submit", {
      detail: {
        matchMode: this._matchMode,
        conditions: this._conditions,
        searchCultureMode: this._searchCultureMode,
        culture: this._culture,
        languages: this._languages
      },
      bubbles: !0,
      composed: !0
    })
  );
};
V.styles = [
  Fe,
  ce,
  Ve,
  Br,
  ...th
];
Y([
  l({ type: Boolean, reflect: !0 })
], V.prototype, "searching", 2);
Y([
  d()
], V.prototype, "_conditions", 2);
Y([
  d()
], V.prototype, "_matchMode", 2);
Y([
  d()
], V.prototype, "_showValidation", 2);
Y([
  d()
], V.prototype, "_draggingId", 2);
Y([
  d()
], V.prototype, "_dropTargetId", 2);
Y([
  d()
], V.prototype, "_contentTypes", 2);
Y([
  d()
], V.prototype, "_propertyMetadataByContentType", 2);
Y([
  d()
], V.prototype, "_loadingContentTypes", 2);
Y([
  d()
], V.prototype, "_loadingPropertiesFor", 2);
Y([
  d()
], V.prototype, "_searchCultureMode", 2);
Y([
  d()
], V.prototype, "_culture", 2);
Y([
  d()
], V.prototype, "_languages", 2);
Y([
  d()
], V.prototype, "_loadingLanguages", 2);
V = Y([
  U("content-search-builder")
], V);
const An = 44, dh = 88, kn = 160, ph = 36, Zs = "var(--uui-size-space-1)", Mn = "var(--uui-size-space-3)", Rn = 80, Nn = "phases.content-search.results.column-widths.v5", st = {
  contentType: 120,
  createDate: 108,
  updateDate: 104
}, _h = {
  name: kn,
  match: 220,
  contentType: st.contentType,
  culture: 96,
  path: 280,
  createDate: st.createDate,
  updateDate: st.updateDate,
  url: 160,
  actions: dh
}, Ni = /* @__PURE__ */ new Set([
  "name",
  "match",
  "path",
  "culture",
  "url",
  "actions"
]);
function On(e) {
  return e in st;
}
function Ln(e) {
  if (On(e))
    return st[e];
}
function mh() {
  try {
    const e = localStorage.getItem(Nn);
    if (!e)
      return {};
    const t = JSON.parse(e), s = {};
    for (const [i, r] of Object.entries(t))
      typeof r != "number" || !Number.isFinite(r) || Ni.has(i) && (s[i] = lt(i, r));
    return s;
  } catch {
    return {};
  }
}
function Dn(e) {
  const t = {};
  for (const s of Ni) {
    const i = e[s];
    i !== void 0 && (t[s] = i);
  }
  try {
    localStorage.setItem(Nn, JSON.stringify(t));
  } catch {
  }
}
function Ye(e, t) {
  const s = Ln(e);
  if (s !== void 0)
    return s;
  const i = t[e];
  if (i !== void 0)
    return lt(e, i);
  const r = _h[e];
  return r !== void 0 ? r : Rn;
}
function fh(e, t) {
  return e.map((s) => {
    const i = Ye(s.alias, t);
    return {
      ...s,
      width: `${i}px`
    };
  });
}
function gh(e, t) {
  let s = 0;
  for (const i of e) {
    const r = Ye(i.alias, t);
    r !== void 0 && (s += r);
  }
  return Math.max(s, kn);
}
function lt(e, t) {
  return On(e) ? Ln(e) : Math.max(Rn, Math.round(t));
}
const vt = C`
  :host {
    --cs-results-icon-size: var(--uui-size-6, 18px);
    --cs-results-action-button-height: var(--uui-size-11, 2rem);
    --cs-results-line-height: 1.3;
    --cs-results-transition: 180ms cubic-bezier(0.4, 0, 0.2, 1);
    --cs-results-action-opacity: 0.76;
    --cs-results-name-decoration: none;
  }
`, vh = [
  vt,
  C`
    :host {
      display: block;
      width: 100%;
      --results-table-row-height: ${ph}px;
    }

    uui-table {
      table-layout: fixed;
      width: 100%;
      min-width: var(--cs-results-table-min-width, 56rem);
      border-collapse: separate;
      border-spacing: 0;
      box-shadow: none;
      border: none;
      --uui-table-cell-height: var(--results-table-row-height);
      font-size: var(--uui-type-small-size);
    }

    uui-table-head {
      position: sticky;
      top: 0;
      z-index: 2;
      background-color: var(--uui-color-surface, #fff);
    }

    uui-table-head-cell {
      position: relative;
      height: var(--results-table-row-height);
      max-height: var(--results-table-row-height);
      font-size: var(--uui-type-small-size);
      font-weight: 600;
      color: var(--uui-color-text-alt);
      letter-spacing: 0.01em;
      border-bottom: 1px solid var(--uui-color-border, #d8d7d9);
      background: color-mix(in srgb, var(--uui-color-surface) 94%, var(--uui-color-border));
      vertical-align: middle;
    }

    uui-table-row {
      cursor: default;
      --results-table-row-bg: transparent;
    }

    uui-table-row:focus-within {
      outline: calc(2px * var(--uui-show-focus-outline, 1)) solid var(--uui-color-focus);
      outline-offset: -2px;
      z-index: 1;
    }

    uui-table-row:hover,
    uui-table-row:focus-within {
      --results-table-row-bg: color-mix(
        in srgb,
        var(--uui-color-surface-emphasis) 44%,
        var(--uui-color-surface)
      );
      --cs-results-action-opacity: 1;
      --cs-results-name-decoration: underline;
    }

    uui-table-row:hover uui-table-cell:first-of-type,
    uui-table-row:focus-within uui-table-cell:first-of-type {
      box-shadow: inset 3px 0 0
        color-mix(in srgb, var(--uui-color-interactive) 72%, transparent);
    }

    uui-table-cell {
      vertical-align: middle;
      height: var(--results-table-row-height);
      max-height: var(--results-table-row-height);
      border-bottom: 1px solid color-mix(in srgb, var(--uui-color-border) 55%, transparent);
      --uui-table-cell-padding: var(--uui-size-space-1) var(--uui-size-space-3);
      background: var(--results-table-row-bg, transparent);
      transition: background-color var(--cs-results-transition),
        box-shadow var(--cs-results-transition);
    }

    uui-table-cell umb-icon {
      vertical-align: middle;
      color: var(--uui-color-text-alt);
    }

    .results-table__header-cell {
      display: flex;
      align-items: center;
      min-width: 0;
      width: 100%;
      height: 100%;
    }

    .results-table__header-cell--actions {
      justify-content: flex-end;
    }

    .results-table__header-label {
      flex: 1 1 auto;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      line-height: 1.2;
    }

    .results-table__header-label--actions {
      flex: 1 1 auto;
      text-align: right;
    }

    .results-table__sort-button {
      display: inline-flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--uui-size-space-1);
      width: 100%;
      min-height: 0;
      padding: 0;
      border: none;
      background: transparent;
      color: inherit;
      font: inherit;
      line-height: 1.2;
      cursor: pointer;
      text-align: inherit;
    }

    .results-table__sort-button > span {
      flex: 1 1 auto;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    uui-table-head-cell:focus-within,
    uui-table-head-cell:hover {
      --uui-symbol-sort-hover: 1;
    }

    .results-table__resize-handle {
      position: absolute;
      top: 0;
      right: 0;
      width: 0.65rem;
      height: 100%;
      cursor: col-resize;
      touch-action: none;
      z-index: 2;
    }

    .results-table__resize-handle:focus-visible {
      outline: calc(2px * var(--uui-show-focus-outline, 1)) solid var(--uui-color-focus);
      outline-offset: -2px;
    }

    .results-table__resize-handle::after {
      content: "";
      position: absolute;
      top: 20%;
      bottom: 20%;
      right: 1px;
      width: 1px;
      background: color-mix(in srgb, var(--uui-color-border) 80%, transparent);
      opacity: 0;
      transition: opacity 140ms ease;
    }

    uui-table-head-cell:hover .results-table__resize-handle::after,
    .results-table__resize-handle:focus-visible::after,
    :host([resizing]) .results-table__resize-handle::after {
      opacity: 1;
    }

    :host([resizing]) {
      cursor: col-resize;
      user-select: none;
    }

    .results-table__cell-inner {
      display: flex;
      align-items: center;
      min-width: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }

    .results-table__cell-inner--actions {
      justify-content: flex-end;
      overflow: visible;
    }

    uui-table-head-cell.results-table__head-cell--actions,
    uui-table-cell.results-table__cell--actions {
      position: sticky;
      right: 0;
      z-index: 1;
      background: var(--results-table-row-bg, var(--uui-color-surface));
      box-shadow: -6px 0 10px -8px color-mix(in srgb, var(--uui-color-border-contrast, #000) 24%, transparent);
      transition: background-color var(--cs-results-transition),
        box-shadow var(--cs-results-transition);
    }

    uui-table-row:hover uui-table-cell.results-table__cell--actions,
    uui-table-row:focus-within uui-table-cell.results-table__cell--actions {
      box-shadow: -8px 0 12px -8px color-mix(in srgb, var(--uui-color-border-contrast, #000) 28%, transparent);
    }

    uui-table-cell.results-table__cell--actions {
      overflow: visible;
      --uui-table-cell-padding: var(--uui-size-space-1) var(--uui-size-space-2);
    }

    uui-table-head-cell.results-table__head-cell--actions {
      z-index: 3;
      background: color-mix(in srgb, var(--uui-color-surface) 94%, var(--uui-color-border));
    }
  `
];
var yh = Object.defineProperty, bh = Object.getOwnPropertyDescriptor, zn = (e) => {
  throw TypeError(e);
}, Ee = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? bh(t, s) : t, a = e.length - 1, n; a >= 0; a--)
    (n = e[a]) && (r = (i ? n(t, s, r) : n(r)) || r);
  return i && r && yh(t, s, r), r;
}, Oi = (e, t, s) => t.has(e) || zn("Cannot " + s), re = (e, t, s) => (Oi(e, t, "read from private field"), t.get(e)), $t = (e, t, s) => t.has(e) ? zn("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, s), In = (e, t, s, i) => (Oi(e, t, "write to private field"), t.set(e, s), s), G = (e, t, s) => (Oi(e, t, "access private method"), s), ae, $s, Es, O, Un, Bn, Wn, Hn, Gn, Fn, Vn, qn, Kn, Yn, jn, Xn, Jn, Zn, Qn, Li;
let me = class extends B {
  constructor() {
    super(...arguments), $t(this, O), this.columns = [], this.items = [], this.config = {
      allowSelection: !1,
      hideIcon: !1
    }, this.orderingColumn = "", this.orderingDesc = !1, this._columnWidthsPx = mh(), $t(this, ae), $t(this, $s, (e) => G(this, O, Zn).call(this, e)), $t(this, Es, () => G(this, O, Qn).call(this));
  }
  disconnectedCallback() {
    G(this, O, Li).call(this), super.disconnectedCallback();
  }
  render() {
    const e = fh(this.columns, this._columnWidthsPx), t = G(this, O, Un).call(this), s = gh(e, this._columnWidthsPx);
    return bl(
      t,
      o`
        <uui-table
          class="uui-text results-table"
          style=${`--cs-results-table-min-width: ${s}px; min-width: ${s}px`}
        >
          ${this.config.hideIcon ? g : o`
                <uui-table-column
                  style="width: ${An}px"
                ></uui-table-column>
              `}
          ${D(
        e,
        (i) => i.alias,
        (i) => o`
              <uui-table-column
                style=${ai(G(this, O, Bn).call(this, i))}
              ></uui-table-column>
            `
      )}
          <uui-table-head>
            ${G(this, O, Hn).call(this)}
            ${D(
        e,
        (i) => i.alias,
        (i) => G(this, O, Gn).call(this, i)
      )}
          </uui-table-head>
          ${D(
        this.items,
        (i) => i.id,
        (i) => G(this, O, Fn).call(this, i, e)
      )}
        </uui-table>
      `
    );
  }
};
ae = /* @__PURE__ */ new WeakMap();
$s = /* @__PURE__ */ new WeakMap();
Es = /* @__PURE__ */ new WeakMap();
O = /* @__PURE__ */ new WeakSet();
Un = function() {
  return this.columns.map((e) => e.alias).join("|");
};
Bn = function(e) {
  const t = Ye(e.alias, this._columnWidthsPx);
  return t === void 0 ? void 0 : `width: ${t}px`;
};
Wn = function(e) {
  const t = Ye(e.alias, this._columnWidthsPx), s = t === void 0 ? "auto" : `${t}px`, i = e.alias === "actions";
  return [
    `--uui-table-cell-padding: ${i ? Zs : `${Zs} ${Mn}`}`,
    `text-align:${e.align ?? "left"}`,
    `width: ${s}`,
    i ? "overflow: visible" : ""
  ].filter(Boolean).join("; ");
};
Hn = function() {
  if (!this.config.hideIcon)
    return o`
      <uui-table-head-cell style="--uui-table-cell-padding: 0; text-align: center;">
      </uui-table-head-cell>
    `;
};
Gn = function(e) {
  const t = Ni.has(
    e.alias
  ), s = e.alias === "actions";
  return o`
      <uui-table-head-cell
        class=${s ? "results-table__head-cell--actions" : ""}
        style="--uui-table-cell-padding: ${Zs} ${Mn}"
        aria-sort=${ai(G(this, O, jn).call(this, e))}
      >
        <div
          class="results-table__header-cell ${s ? "results-table__header-cell--actions" : ""}"
        >
          ${e.allowSorting ? o`
                <button
                  class="results-table__sort-button"
                  type="button"
                  aria-label=${`Sort by ${e.name}`}
                  @click=${() => G(this, O, Yn).call(this, e)}
                >
                  <span>${e.name}</span>
                  <uui-symbol-sort
                    ?active=${this.orderingColumn === e.alias}
                    ?descending=${this.orderingDesc}
                  ></uui-symbol-sort>
                </button>
              ` : o`<span
                class="results-table__header-label ${s ? "results-table__header-label--actions" : ""}"
                >${e.name}</span
              >`}
          ${t ? o`
                <div
                  class="results-table__resize-handle"
                  role="separator"
                  aria-orientation="vertical"
                  aria-label=${`Resize ${e.name} column`}
                  tabindex="0"
                  @mousedown=${(i) => G(this, O, Xn).call(this, e.alias, i)}
                  @keydown=${(i) => G(this, O, Jn).call(this, e.alias, i)}
                ></div>
              ` : void 0}
        </div>
      </uui-table-head-cell>
    `;
};
Fn = function(e, t) {
  return o`
      <uui-table-row data-sortable-id=${e.id}>
        ${G(this, O, Vn).call(this, e)}
        ${D(
    t,
    (s) => s.alias,
    (s) => G(this, O, qn).call(this, s, e)
  )}
      </uui-table-row>
    `;
};
Vn = function(e) {
  if (!this.config.hideIcon)
    return o`
      <uui-table-cell style="text-align: center; width: ${An}px">
        <umb-icon name="${ai(e.icon ?? void 0)}"></umb-icon>
      </uui-table-cell>
    `;
};
qn = function(e, t) {
  const s = t.data.find((n) => n.columnAlias === e.alias)?.value, r = !!!e.elementName && !!e.clipText, a = e.alias === "actions";
  return o`
      <uui-table-cell
        class=${a ? "results-table__cell--actions" : ""}
        style=${G(this, O, Wn).call(this, e)}
        ?clip-text=${r}
      >
        <div
          class="results-table__cell-inner ${a ? "results-table__cell-inner--actions" : ""}"
        >
          ${G(this, O, Kn).call(this, e, t, s)}
        </div>
      </uui-table-cell>
    `;
};
Kn = function(e, t, s) {
  if (e.elementName) {
    const i = document.createElement(
      e.elementName
    );
    return i.column = e, i.item = t, i.value = s, i;
  }
  return s;
};
Yn = function(e) {
  this.orderingDesc = this.orderingColumn === e.alias ? !this.orderingDesc : !1, this.orderingColumn = e.alias, this.dispatchEvent(new Event("ordered", { bubbles: !0, composed: !0 }));
};
jn = function(e) {
  if (e.allowSorting)
    return this.orderingColumn !== e.alias ? "none" : this.orderingDesc ? "descending" : "ascending";
};
Xn = function(e, t) {
  if (t.button !== 0)
    return;
  t.preventDefault(), t.stopPropagation();
  const s = Ye(e, this._columnWidthsPx);
  s !== void 0 && (In(this, ae, {
    alias: e,
    startX: t.clientX,
    startWidth: s
  }), this.setAttribute("resizing", ""), window.addEventListener("mousemove", re(this, $s)), window.addEventListener("mouseup", re(this, Es)));
};
Jn = function(e, t) {
  const s = t.shiftKey ? 24 : 12;
  let i = Ye(e, this._columnWidthsPx);
  if (i !== void 0) {
    if (t.key === "ArrowLeft")
      t.preventDefault(), i = lt(e, i - s);
    else if (t.key === "ArrowRight")
      t.preventDefault(), i = lt(e, i + s);
    else
      return;
    this._columnWidthsPx = {
      ...this._columnWidthsPx,
      [e]: i
    }, Dn(this._columnWidthsPx);
  }
};
Zn = function(e) {
  if (!re(this, ae))
    return;
  const t = e.clientX - re(this, ae).startX, s = lt(
    re(this, ae).alias,
    re(this, ae).startWidth + t
  );
  this._columnWidthsPx = {
    ...this._columnWidthsPx,
    [re(this, ae).alias]: s
  };
};
Qn = function() {
  re(this, ae) && (Dn(this._columnWidthsPx), In(this, ae, void 0), this.removeAttribute("resizing"), G(this, O, Li).call(this));
};
Li = function() {
  window.removeEventListener("mousemove", re(this, $s)), window.removeEventListener("mouseup", re(this, Es));
};
me.styles = [
  Fe,
  vh,
  C`
      :host {
        display: block;
        width: 100%;
      }
    `
];
Ee([
  l({ type: Array, attribute: !1 })
], me.prototype, "columns", 2);
Ee([
  l({ type: Array, attribute: !1 })
], me.prototype, "items", 2);
Ee([
  l({ type: Object, attribute: !1 })
], me.prototype, "config", 2);
Ee([
  l({ type: String, attribute: !1 })
], me.prototype, "orderingColumn", 2);
Ee([
  l({ type: Boolean, attribute: !1 })
], me.prototype, "orderingDesc", 2);
Ee([
  d()
], me.prototype, "_columnWidthsPx", 2);
me = Ee([
  U("content-search-results-table")
], me);
const Sh = "icon-document";
function eo(e) {
  const t = /* @__PURE__ */ new Map();
  for (const s of e)
    t.set(s.alias.toLowerCase(), s);
  return t;
}
function to(e, t) {
  const s = t?.trim().toLowerCase();
  if (s)
    return e.get(s);
}
function Ch(e, t) {
  return to(e, t)?.icon?.trim() || Sh;
}
function wh(e, t) {
  const s = to(e, t);
  return s?.name?.trim() ? s.name.trim() : t?.trim() || "—";
}
function xh(e) {
  return e === "name" || e === "contentType" || e === "path" || e === "createDate" || e === "updateDate" || e === "url";
}
function $h(e, t) {
  return e <= 0 || t <= 0 ? 0 : Math.ceil(e / t);
}
function so(e, t) {
  return t <= 0 || !Number.isFinite(e) || e < 1 ? 1 : Math.min(e, t);
}
function Eh(e, t, s) {
  const i = $h(e, t);
  return typeof s == "number" && s > 0 ? Math.max(s, i) : i;
}
function Th(e) {
  const t = Math.max(0, Math.round(e));
  if (t < 1e3)
    return `${t} ms`;
  const s = t / 1e3;
  return `${s >= 10 ? s.toFixed(0) : Number(s.toFixed(1)).toString()} s`;
}
function Ph(e, t) {
  return `${e === 1 ? "1 result" : `${e} results`} • ${Th(t)}`;
}
const it = " > ", pr = " > ...", Ah = 6.5, kh = 12;
function Mh(e) {
  return e.split(it).map((t) => t.trim()).filter((t) => t.length > 0);
}
function Rh(e) {
  return e <= 0 ? 40 : Math.max(
    kh,
    Math.floor(e / Ah)
  );
}
function Nh(e, t) {
  if (e.length === 0)
    return { displaySegments: [], showEllipsis: !1 };
  if (e.join(it).length <= t)
    return { displaySegments: e, showEllipsis: !1 };
  if (e.length === 1)
    return {
      displaySegments: [_r(e[0], t)],
      showEllipsis: !1
    };
  const i = pr.length;
  let r = 1;
  for (; r < e.length && !((e.slice(0, r).join(it) + pr).length > t); )
    r++;
  r = Math.max(1, r - 1);
  const a = e.slice(0, r), n = r < e.length;
  if (n && a.join(it).length + i > t) {
    const _ = Math.max(1, t - i);
    return {
      displaySegments: [_r(a[0] ?? e[0], _)],
      showEllipsis: !0
    };
  }
  return { displaySegments: a, showEllipsis: n };
}
function Qs(e, t) {
  const s = Oh(e, t);
  return s ? {
    display: s,
    tooltip: s,
    segments: Mh(s),
    isMuted: !1
  } : {
    display: "—",
    tooltip: "—",
    segments: [],
    isMuted: !0
  };
}
function Oh(e, t) {
  const s = e?.trim();
  if (s)
    return s;
  const i = t?.trim();
  if (!i)
    return;
  const r = i.split(",").map((a) => a.trim()).filter((a) => a.length > 0 && !Lh(a));
  if (r.length !== 0)
    return r.join(it);
}
function Lh(e) {
  return /^\d+$/.test(e);
}
function _r(e, t) {
  return e.length <= t ? e : t <= 1 ? "…" : `${e.slice(0, t - 1)}…`;
}
function mr(e, t) {
  return e.getFullYear() === t.getFullYear() && e.getMonth() === t.getMonth() && e.getDate() === t.getDate();
}
function fr(e) {
  return new Date(e.getFullYear(), e.getMonth(), e.getDate());
}
function Dh(e) {
  return e.toLocaleDateString(void 0, {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}
function zh(e) {
  return e.toLocaleString(void 0, {
    dateStyle: "full",
    timeStyle: "short"
  });
}
function ei(e) {
  const t = e?.trim();
  if (!t)
    return {
      display: "—",
      tooltip: "—",
      isMuted: !0
    };
  const s = new Date(t);
  if (Number.isNaN(s.getTime()))
    return {
      display: t,
      tooltip: t,
      isMuted: !1
    };
  const i = /* @__PURE__ */ new Date(), r = zh(s);
  if (mr(s, i))
    return {
      display: "Today",
      tooltip: r,
      isMuted: !1
    };
  const a = new Date(i);
  if (a.setDate(i.getDate() - 1), mr(s, a))
    return {
      display: "Yesterday",
      tooltip: r,
      isMuted: !1
    };
  const n = Math.round(
    (fr(i).getTime() - fr(s).getTime()) / 864e5
  );
  return n > 1 && n < 7 ? {
    display: `${n} days ago`,
    tooltip: r,
    isMuted: !1
  } : {
    display: Dh(s),
    tooltip: r,
    isMuted: !1
  };
}
const Di = "Not published", ye = "—", zi = "Multiple";
function io(e) {
  const t = Ii(e);
  return t ? t !== Di && t !== ye && t !== zi && (t.startsWith("http://") || t.startsWith("https://") || t.startsWith("/")) : !1;
}
function Ih(e) {
  const t = e.trim();
  if (!t || t.startsWith("/"))
    return t || ye;
  try {
    const s = new URL(t);
    return `${s.pathname}${s.search}${s.hash}` || "/";
  } catch {
    return t;
  }
}
function Rt(e, t) {
  const s = Ii(e), i = s && io(s) ? s : void 0;
  return i ? {
    display: Uh(t) ?? Ih(i),
    href: i,
    tooltip: i,
    isMuted: !1
  } : {
    display: ye,
    href: void 0,
    tooltip: Bh(t, s),
    isMuted: !0
  };
}
function Ii(e) {
  const t = e?.trim();
  if (!(!t || Ui(t)))
    return t;
}
function Uh(e) {
  const t = e?.trim();
  if (!(!t || Ui(t) || t === ye || t === Di || t === zi))
    return t;
}
function Bh(e, t) {
  const s = e?.trim();
  if (s && !Ui(s) && s !== ye)
    return s;
  const i = Ii(t);
  return i === Di || i === zi ? i : ye;
}
function Ui(e) {
  const t = e.trim().toLowerCase();
  return t === "null" || t === "undefined";
}
function Wh(e) {
  const t = typeof e == "string" ? e : e.key, s = typeof e == "string" ? void 0 : e.cultureCode?.trim(), i = Tl.generateAbsolute({
    unique: t
  });
  if (!s)
    return i;
  const r = El.Create({
    culture: s,
    segment: null
  }).toString();
  return `${Hh(i)}/${encodeURIComponent(r)}`;
}
function Hh(e) {
  return e.endsWith("/") ? e.slice(0, -1) : e;
}
const Gh = {
  allowSelection: !1,
  hideIcon: !0
}, Fh = [
  {
    name: "Name",
    alias: "name",
    elementName: "content-search-name-column",
    allowSorting: !0,
    clipText: !0
  },
  {
    name: "Match",
    alias: "match",
    elementName: "content-search-match-column",
    allowSorting: !1,
    clipText: !0
  },
  {
    name: "Content type",
    alias: "contentType",
    elementName: "content-search-content-type-column",
    allowSorting: !0,
    clipText: !0
  },
  {
    name: "Culture",
    alias: "culture",
    allowSorting: !1,
    clipText: !0
  },
  {
    name: "Path",
    alias: "path",
    elementName: "content-search-path-column",
    allowSorting: !0,
    clipText: !0
  },
  {
    name: "Created",
    alias: "createDate",
    elementName: "content-search-date-column",
    allowSorting: !0,
    clipText: !0
  },
  {
    name: "Updated",
    alias: "updateDate",
    elementName: "content-search-date-column",
    allowSorting: !0,
    clipText: !0
  },
  {
    name: "URL",
    alias: "url",
    elementName: "content-search-url-column",
    allowSorting: !0,
    clipText: !0
  },
  {
    name: "Actions",
    alias: "actions",
    elementName: "content-search-actions-column",
    allowSorting: !1,
    align: "right"
  }
], Vh = {
  path: "showPath",
  url: "showUrl",
  createDate: "showCreateDate",
  updateDate: "showUpdateDate"
};
function qh(e, t = !0) {
  let s = Fh.filter((i) => {
    const r = Vh[i.alias];
    return r ? e[r] : !0;
  });
  return t || (s = s.filter((i) => i.alias !== "culture")), s;
}
function Kh(e) {
  return e === "name" || e === "match" || e === "contentType" || e === "culture" || e === "path" || e === "createDate" || e === "updateDate" || e === "url" || e === "actions";
}
function Yh(e, t = []) {
  const s = t.map((i) => i.trim().toLowerCase()).join("");
  return `${e.map((i) => `${i.key}:${i.matchedCulture ?? ""}:${i.updateDate ?? ""}`).join("|")}|${s}`;
}
function ro(e, t) {
  return e.map((s) => Xh(s, t));
}
function jh(e, t) {
  const s = t?.trim();
  return s ? `${e}::${s}` : e;
}
function Xh(e, t) {
  const { languages: s, contentTypeLookup: i, highlightTerms: r = [], showUrlColumn: a = !0 } = t, n = e.contentTypeAlias?.trim() || void 0, _ = Wh({
    key: e.key,
    cultureCode: e.matchedCulture
  }), y = {
    name: e.name,
    editPath: _,
    highlightTerms: r
  }, N = {
    name: wh(i, n),
    alias: n
  }, W = {
    url: e.url?.trim() || void 0,
    udi: e.udi?.trim() || void 0,
    key: e.key,
    nodeId: e.id,
    showOpenWebsite: !a
  }, I = {
    matches: (e.matchedFields ?? []).map((ee) => ({
      propertyName: ee.propertyName,
      operatorLabel: ee.operatorLabel,
      snippet: ee.snippet,
      highlightTerms: ee.highlightTerms
    }))
  };
  return {
    id: jh(e.key, e.matchedCulture),
    entityType: "document",
    icon: Ch(i, n),
    data: [
      { columnAlias: "name", value: y },
      { columnAlias: "match", value: I },
      {
        columnAlias: "contentType",
        value: N
      },
      {
        columnAlias: "culture",
        value: e.matchedCulture?.trim() ? Vs(e.matchedCulture, s) : "—"
      },
      {
        columnAlias: "path",
        value: Qs(e.pathDisplay, e.path)
      },
      {
        columnAlias: "createDate",
        value: ei(e.createDate)
      },
      {
        columnAlias: "updateDate",
        value: ei(e.updateDate)
      },
      {
        columnAlias: "url",
        value: Rt(e.url, e.urlDisplay)
      },
      { columnAlias: "actions", value: W }
    ]
  };
}
const Jh = [
  ce,
  Ve,
  C`
    :host {
      display: block;
      width: 100%;
    }

    .results-grid {
      display: flex;
      flex-direction: column;
      gap: var(--uui-size-space-3);
      width: 100%;
      position: relative;
    }

    .results-grid__focus-anchor {
      position: absolute;
      top: 0;
      left: 0;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip: rect(0 0 0 0);
      white-space: nowrap;
    }

    .results-grid__focus-anchor:focus {
      outline: none;
    }

    .results-grid__header-copy {
      display: flex;
      flex-direction: column;
      gap: var(--uui-size-space-1);
      min-width: 0;
    }

    .results-grid__header-actions {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: flex-end;
      gap: var(--uui-size-space-2);
      flex: 0 0 auto;
      margin-left: auto;
    }

    .results-grid__header-meta {
      flex: 0 0 auto;
    }

    .results-grid__export-caret {
      margin-left: var(--uui-size-space-1);
    }

    .results-grid__meta {
      display: inline-flex;
      align-items: center;
      gap: var(--uui-size-space-2);
      min-height: 1.5rem;
      padding: 0 var(--uui-size-space-2);
      border-radius: 999px;
      background: var(--cs-surface-muted);
      color: var(--uui-color-text-alt);
      font-size: var(--uui-type-small-size);
      font-weight: 600;
      line-height: 1.3;
      white-space: nowrap;
    }

    .results-grid__meta-loader {
      width: 0.875rem;
      height: 0.875rem;
    }

    .results-grid__meta--loading {
      opacity: 1;
    }

    .results-grid__empty {
      display: block;
      width: 100%;
    }

    .results-grid--initial-loading .results-grid__empty {
      min-height: 12rem;
    }

    .results-grid__content {
      position: relative;
      min-height: 8rem;
    }

    .results-grid__placeholder {
      min-height: 12rem;
    }

    .results-grid__overlay {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--uui-size-space-3);
      z-index: 4;
      border-radius: var(--cs-radius-lg);
    }

    .results-grid__overlay::before {
      content: "";
      position: absolute;
      inset: 0;
      background: color-mix(in srgb, var(--uui-color-surface) 78%, transparent);
      backdrop-filter: blur(1px);
      border-radius: inherit;
    }

    .results-grid__overlay uui-loader {
      position: relative;
      width: 2.25rem;
      height: 2.25rem;
    }

    .results-grid__overlay-label {
      position: relative;
      margin: 0;
      color: var(--uui-color-text);
      font-size: var(--uui-type-default-size);
      font-weight: 600;
      line-height: 1.3;
    }

    .results-grid__options {
      display: flex;
      flex-direction: column;
      gap: var(--uui-size-space-3);
      font-size: var(--uui-type-small-size);
      color: var(--uui-color-text-alt);
      line-height: 1.3;
    }

    .results-grid__options-line {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      gap: var(--uui-size-space-2);
      margin: 0;
    }

    .results-grid__options-label {
      color: var(--uui-color-text);
      font-weight: 600;
      min-width: 4.5rem;
    }

    .results-grid__options-checkboxes {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(11rem, 1fr));
      gap: var(--uui-size-space-2) var(--uui-size-space-4);
    }

    .results-grid__options-checkboxes uui-checkbox {
      font-size: var(--uui-type-small-size);
    }

    .results-grid__table-shell {
      display: flex;
      flex-direction: column;
      position: relative;
      border-radius: var(--cs-radius-lg);
      border: 1px solid var(--cs-border-subtle);
      background: var(--uui-color-surface);
      box-shadow: var(--cs-shadow-sm);
      overflow: hidden;
    }

    .results-grid__table-scroll {
      overflow-x: auto;
      overflow-y: auto;
      max-height: min(68vh, 44rem);
      -webkit-overflow-scrolling: touch;
    }

    .results-grid__table-scroll content-search-results-table {
      display: block;
      width: 100%;
      min-width: max(100%, var(--cs-results-table-min-width, 56rem));
    }

    .results-grid__table-shell--loading {
      opacity: 0.72;
      pointer-events: none;
    }

    .results-grid__loading {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--uui-size-space-2);
      background: color-mix(in srgb, var(--uui-color-surface) 84%, transparent);
      backdrop-filter: blur(1px);
      z-index: 3;
    }

    .results-grid__loading uui-loader {
      width: 2rem;
      height: 2rem;
    }

    .results-grid__loading-label {
      margin: 0;
      color: var(--uui-color-text);
      font-size: var(--uui-type-default-size);
      font-weight: 600;
      line-height: 1.3;
    }

    .results-grid__pagination {
      display: flex;
      flex-direction: column;
      gap: var(--uui-size-space-3);
      padding: var(--uui-size-space-3) var(--cs-space-section);
      border-top: 1px solid var(--cs-border-subtle);
      background: color-mix(in srgb, var(--uui-color-surface) 96%, var(--uui-color-border));
    }

    .results-grid__pagination--loading {
      opacity: 0.72;
      pointer-events: none;
    }

    .results-grid__pagination-summary {
      margin: 0;
      color: var(--uui-color-text-alt);
      font-size: var(--uui-type-small-size);
      line-height: 1.3;
    }

    .results-grid__pagination-controls {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: var(--cs-space-inline);
    }

    .results-grid__page-size-select {
      flex: 0 1 auto;
      min-width: 6.5rem;
      max-width: 8rem;
      --uui-select-height: 2rem;
      --uui-select-font-size: var(--uui-type-small-size);
    }

    .results-grid__page-jump {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-end;
      gap: var(--uui-size-space-2);
    }

    .results-grid__page-jump-input {
      width: 5.5rem;
      min-width: 5.5rem;
    }

    .results-grid__pagination-controls uui-pagination {
      margin-left: auto;
    }

    @media (max-width: 900px) {
      .results-grid__table-scroll {
        overflow-x: auto;
      }

      .results-grid__table-scroll content-search-results-table {
        min-width: 40rem;
      }

      .results-grid__options-checkboxes {
        grid-template-columns: 1fr;
      }

      .results-grid__pagination-controls {
        flex-direction: column;
        align-items: stretch;
      }

      .results-grid__pagination-controls uui-pagination {
        margin-left: 0;
        width: 100%;
      }

      .results-grid__page-size-select {
        max-width: none;
        width: 100%;
      }

      .results-grid__page-jump {
        display: none;
      }
    }
  `
], ao = "phases.content-search.results.display-preferences.v1", Pe = {
  showPath: !0,
  showUrl: !0,
  showCreateDate: !0,
  showUpdateDate: !0
};
function gr() {
  try {
    const e = localStorage.getItem(ao);
    if (!e)
      return Pe;
    const t = JSON.parse(e);
    return {
      showPath: typeof t.showPath == "boolean" ? t.showPath : Pe.showPath,
      showUrl: typeof t.showUrl == "boolean" ? t.showUrl : Pe.showUrl,
      showCreateDate: typeof t.showCreateDate == "boolean" ? t.showCreateDate : Pe.showCreateDate,
      showUpdateDate: typeof t.showUpdateDate == "boolean" ? t.showUpdateDate : Pe.showUpdateDate
    };
  } catch {
    return Pe;
  }
}
function Zh(e) {
  try {
    localStorage.setItem(
      ao,
      JSON.stringify(e)
    );
  } catch {
  }
}
const Qh = [
  ce,
  C`
    :host {
      display: block;
      width: 100%;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--uui-size-space-2);
      padding: var(--cs-space-section);
      text-align: center;
      border-radius: var(--cs-radius);
      background: var(--cs-surface-inset);
      border: 1px solid var(--cs-border-subtle);
    }

    .empty-state--compact {
      flex-direction: row;
      align-items: flex-start;
      justify-content: flex-start;
      gap: var(--uui-size-space-3);
      padding: var(--uui-size-space-3) var(--cs-space-block);
      text-align: left;
      background: var(--cs-surface-inset);
      border: 1px solid var(--cs-border-subtle);
    }

    .empty-state__copy {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: var(--uui-size-space-2);
      min-width: 0;
    }

    .empty-state--loading {
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--uui-size-space-3);
      min-height: 10rem;
      padding: var(--cs-space-section);
      text-align: center;
    }

    .empty-state--loading .empty-state__copy {
      align-items: center;
    }

    .empty-state--loading .empty-state__loader {
      width: 2rem;
      height: 2rem;
    }

    .empty-state--loading .empty-state__title {
      color: var(--uui-color-text);
      font-size: var(--uui-type-default-size);
      font-weight: 600;
    }

    .empty-state__icon,
    .empty-state__loader {
      flex: 0 0 auto;
      color: var(--uui-color-text-alt);
    }

    .empty-state__icon {
      font-size: var(--uui-size-6, 18px);
      opacity: 0.85;
    }

    .empty-state__loader {
      width: 1.125rem;
      height: 1.125rem;
    }

    .empty-state--compact .empty-state__icon {
      margin-top: 0.1rem;
    }

    .empty-state__title {
      margin: 0;
      color: var(--uui-color-text-alt);
      font-size: var(--uui-type-small-size);
      font-weight: 500;
      line-height: 1.4;
    }

    .empty-state__description {
      margin: 0;
      max-width: 24rem;
      color: var(--uui-color-text-alt);
      font-size: var(--uui-type-small-size);
      line-height: 1.45;
    }

    .empty-state__action {
      margin-top: var(--uui-size-space-1);
    }
  `
];
var ed = Object.defineProperty, td = Object.getOwnPropertyDescriptor, no = (e) => {
  throw TypeError(e);
}, Ts = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? td(t, s) : t, a = e.length - 1, n; a >= 0; a--)
    (n = e[a]) && (r = (i ? n(t, s, r) : n(r)) || r);
  return i && r && ed(t, s, r), r;
}, sd = (e, t, s) => t.has(e) || no("Cannot " + s), id = (e, t, s) => t.has(e) ? no("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, s), vr = (e, t, s) => (sd(e, t, "access private method"), s), Nt, oo, lo;
let He = class extends B {
  constructor() {
    super(...arguments), id(this, Nt), this.variant = "initial", this.compact = !1, this.showClearButton = !1;
  }
  render() {
    const e = vr(this, Nt, lo).call(this);
    return o`
      <div
        class="empty-state ${this.compact && this.variant !== "loading" ? "empty-state--compact" : ""} ${this.variant === "loading" ? "empty-state--loading" : ""}"
        role=${this.variant === "loading" ? "status" : g}
        aria-live=${this.variant === "loading" ? "polite" : g}
        aria-busy=${this.variant === "loading" ? "true" : g}
      >
        ${this.variant === "loading" ? o`<uui-loader class="empty-state__loader"></uui-loader>` : o`<uui-icon class="empty-state__icon" name=${e.icon}></uui-icon>`}
        <div class="empty-state__copy">
          <p class="empty-state__title">${e.title}</p>
          ${!this.compact && e.description ? o`<p class="empty-state__description">${e.description}</p>` : this.variant === "loading" && e.description ? o`<p class="empty-state__description">${e.description}</p>` : null}
          ${this.showClearButton ? o`
                <uui-button
                  class="empty-state__action"
                  look="secondary"
                  label="Clear results"
                  @click=${vr(this, Nt, oo)}
                >
                  Clear results
                </uui-button>
              ` : null}
        </div>
      </div>
    `;
  }
};
Nt = /* @__PURE__ */ new WeakSet();
oo = function() {
  this.dispatchEvent(
    new CustomEvent(Yt, {
      bubbles: !0,
      composed: !0
    })
  );
};
lo = function() {
  return this.variant === "loading" ? {
    icon: "icon-search",
    title: "Searching content…",
    description: "Please wait while results are loaded."
  } : this.variant === "no-results" ? {
    icon: "icon-search",
    title: "No content matched your search."
  } : this.variant === "saved-searches" ? {
    icon: "icon-bookmark",
    title: "Nothing saved yet"
  } : {
    icon: "icon-search",
    title: "Build a search using the condition builder."
  };
};
He.styles = [Qh];
Ts([
  l({ type: String })
], He.prototype, "variant", 2);
Ts([
  l({ type: Boolean })
], He.prototype, "compact", 2);
Ts([
  l({ type: Boolean })
], He.prototype, "showClearButton", 2);
He = Ts([
  U("content-search-empty-state")
], He);
var rd = Object.defineProperty, ad = Object.getOwnPropertyDescriptor, co = (e) => {
  throw TypeError(e);
}, Bi = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? ad(t, s) : t, a = e.length - 1, n; a >= 0; a--)
    (n = e[a]) && (r = (i ? n(t, s, r) : n(r)) || r);
  return i && r && rd(t, s, r), r;
}, nd = (e, t, s) => t.has(e) || co("Cannot " + s), od = (e, t, s) => t.has(e) ? co("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, s), ld = (e, t, s) => (nd(e, t, "access private method"), s), ti, uo;
let ct = class extends B {
  constructor() {
    super(...arguments), od(this, ti);
  }
  render() {
    const e = this.value?.name?.trim();
    if (!e)
      return o`—`;
    const t = ld(this, ti, uo).call(this, e), s = this.value?.editPath?.trim(), i = this.item?.icon?.trim() || void 0, r = `Open in Umbraco: ${e}`, a = s ? o`
          <a
            class="name-link"
            href=${s}
            target="_blank"
            rel="noopener noreferrer"
            title=${r}
            aria-label=${r}
          >
            <span class="name-text">${t}</span>
          </a>
        ` : o`<span class="name-text" title=${e}>${t}</span>`;
    return o`
      <div class="name-cell">
        ${i ? o`<umb-icon class="name-icon" name=${i} aria-hidden="true"></umb-icon>` : g}
        ${a}
      </div>
    `;
  }
};
ti = /* @__PURE__ */ new WeakSet();
uo = function(e) {
  const t = Lr(e, this.value?.highlightTerms ?? []);
  return t.length === 1 && !t[0]?.highlight ? t[0]?.text ?? e : D(
    t,
    (s, i) => i,
    (s) => s.highlight ? o`<mark class="name-highlight">${s.text}</mark>` : s.text
  );
};
ct.styles = [
  vt,
  C`
      :host {
        display: flex;
        align-items: center;
        min-width: 0;
        max-width: 100%;
        height: 100%;
        overflow: hidden;
      }

      .name-cell {
        display: inline-flex;
        align-items: center;
        gap: var(--uui-size-space-2);
        min-width: 0;
        max-width: 100%;
        line-height: var(--cs-results-line-height, 1.3);
      }

      .name-icon {
        flex: 0 0 auto;
        width: var(--cs-results-icon-size);
        height: var(--cs-results-icon-size);
        color: var(--uui-color-text-alt);
        font-size: var(--cs-results-icon-size);
        transition: color var(--cs-results-transition);
      }

      .name-link {
        display: inline-flex;
        align-items: center;
        min-width: 0;
        flex: 1 1 auto;
        color: var(--uui-color-interactive);
        text-decoration: none;
        cursor: pointer;
        border-radius: var(--uui-border-radius, 3px);
        transition: color var(--cs-results-transition);
      }

      .name-link .name-text {
        text-decoration: var(--cs-results-name-decoration, none);
        text-underline-offset: 2px;
        text-decoration-thickness: 1px;
        transition: text-decoration-color var(--cs-results-transition),
          color var(--cs-results-transition);
      }

      .name-link:hover .name-text,
      .name-link:focus-visible .name-text {
        text-decoration: underline;
        color: color-mix(in srgb, var(--uui-color-interactive) 88%, var(--uui-color-text));
      }

      .name-link:focus-visible {
        outline: 2px solid var(--uui-color-focus);
        outline-offset: 1px;
      }

      .name-text {
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-weight: 600;
        line-height: var(--cs-results-line-height, 1.3);
      }

      .name-highlight {
        padding: 0;
        border-radius: var(--uui-border-radius, 2px);
        background: color-mix(in srgb, var(--uui-color-selected) 28%, transparent);
        color: inherit;
        font-weight: 600;
      }
    `
];
Bi([
  l({ attribute: !1 })
], ct.prototype, "value", 2);
Bi([
  l({ attribute: !1 })
], ct.prototype, "item", 2);
ct = Bi([
  U("content-search-name-column")
], ct);
var cd = Object.defineProperty, ud = Object.getOwnPropertyDescriptor, ho = (e) => {
  throw TypeError(e);
}, po = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? ud(t, s) : t, a = e.length - 1, n; a >= 0; a--)
    (n = e[a]) && (r = (i ? n(t, s, r) : n(r)) || r);
  return i && r && cd(t, s, r), r;
}, hd = (e, t, s) => t.has(e) || ho("Cannot " + s), dd = (e, t, s) => t.has(e) ? ho("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, s), _o = (e, t, s) => (hd(e, t, "access private method"), s), ts, mo, fo;
let ss = class extends B {
  constructor() {
    super(...arguments), dd(this, ts);
  }
  render() {
    const e = this.value?.matches ?? [];
    return e.length === 0 ? o`—` : o`
      <div class="match-cell">
        ${D(
      e,
      (t, s) => `${t.propertyName}:${s}`,
      (t) => _o(this, ts, mo).call(this, t)
    )}
      </div>
    `;
  }
};
ts = /* @__PURE__ */ new WeakSet();
mo = function(e) {
  const t = e.propertyName?.trim();
  return t ? e.snippet?.trim() ? o`
        <div class="match-row">
          <span class="match-property">${t}</span>
          <span class="match-separator" aria-hidden="true">·</span>
          <span class="match-snippet">${_o(this, ts, fo).call(this, e.snippet, e.highlightTerms ?? [])}</span>
        </div>
      ` : e.operatorLabel?.trim() ? o`
        <div class="match-row">
          <span class="match-property">${t}</span>
          <span class="match-separator" aria-hidden="true">·</span>
          <span class="match-operator">${e.operatorLabel}</span>
        </div>
      ` : o`
      <div class="match-row">
        <span class="match-property">${t}</span>
        <span class="match-separator" aria-hidden="true">·</span>
        <span class="match-operator">—</span>
      </div>
    ` : g;
};
fo = function(e, t) {
  const s = Lr(e, t);
  return s.length === 1 && !s[0]?.highlight ? s[0]?.text ?? e : D(
    s,
    (i, r) => r,
    (i) => i.highlight ? o`<mark class="match-highlight">${i.text}</mark>` : i.text
  );
};
ss.styles = [
  vt,
  C`
      :host {
        display: block;
        min-width: 0;
        max-width: 100%;
        overflow: hidden;
      }

      .match-cell {
        display: flex;
        flex-direction: column;
        gap: var(--uui-size-space-1);
        min-width: 0;
        line-height: var(--cs-results-line-height, 1.3);
      }

      .match-row {
        display: flex;
        align-items: baseline;
        gap: var(--uui-size-space-1);
        min-width: 0;
        overflow: hidden;
      }

      .match-property {
        flex: 0 0 auto;
        font-weight: 600;
        color: var(--uui-color-text-alt);
      }

      .match-separator {
        flex: 0 0 auto;
        color: var(--uui-color-text-alt);
      }

      .match-snippet,
      .match-operator {
        flex: 1 1 auto;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .match-operator {
        color: var(--uui-color-text-alt);
      }

      .match-highlight {
        padding: 0;
        border-radius: var(--uui-border-radius, 2px);
        background: color-mix(in srgb, var(--uui-color-selected) 28%, transparent);
        color: inherit;
        font-weight: 600;
      }
    `
];
po([
  l({ attribute: !1 })
], ss.prototype, "value", 2);
ss = po([
  U("content-search-match-column")
], ss);
var pd = Object.defineProperty, _d = Object.getOwnPropertyDescriptor, go = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? _d(t, s) : t, a = e.length - 1, n; a >= 0; a--)
    (n = e[a]) && (r = (i ? n(t, s, r) : n(r)) || r);
  return i && r && pd(t, s, r), r;
};
let is = class extends B {
  render() {
    const e = this.value?.name?.trim();
    if (!e || e === "—")
      return o`—`;
    const t = this.value?.alias?.trim(), s = t && t !== e ? `${e} (${t})` : e;
    return o`
      <uui-tag
        class="content-type-tag"
        look="secondary"
        color="default"
        label=${s}
        title=${s}
      >
        <span class="content-type-tag__text">${e}</span>
      </uui-tag>
    `;
  }
};
is.styles = [
  C`
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
    `
];
go([
  l({ attribute: !1 })
], is.prototype, "value", 2);
is = go([
  U("content-search-content-type-column")
], is);
var md = Object.defineProperty, fd = Object.getOwnPropertyDescriptor, vo = (e) => {
  throw TypeError(e);
}, yo = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? fd(t, s) : t, a = e.length - 1, n; a >= 0; a--)
    (n = e[a]) && (r = (i ? n(t, s, r) : n(r)) || r);
  return i && r && md(t, s, r), r;
}, gd = (e, t, s) => t.has(e) || vo("Cannot " + s), vd = (e, t, s) => t.has(e) ? vo("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, s), yd = (e, t, s) => (gd(e, t, "access private method"), s), si, bo;
const bd = "noopener noreferrer";
let rs = class extends B {
  constructor() {
    super(...arguments), vd(this, si);
  }
  render() {
    const e = yd(this, si, bo).call(this, this.value);
    if (e.isMuted || !e.href) {
      const s = e.tooltip === ye ? "URL not available" : `URL not available: ${e.tooltip}`;
      return o`
        <span
          class="url-empty"
          title=${e.tooltip}
          aria-label=${s}
        >
          ${ye}
        </span>
      `;
    }
    const t = `Open frontend URL: ${e.display}`;
    return o`
      <a
        class="url-link"
        href=${e.href}
        target="_blank"
        rel=${bd}
        title=${e.tooltip}
        aria-label=${t}
      >
        <span class="url-text">${e.display}</span>
      </a>
    `;
  }
};
si = /* @__PURE__ */ new WeakSet();
bo = function(e) {
  return e ? typeof e == "string" ? Rt(e) : Rt(e.href, e.display) : Rt();
};
rs.styles = [
  vt,
  C`
      :host {
        display: flex;
        align-items: center;
        min-width: 0;
        max-width: 100%;
        width: 100%;
        height: 100%;
        overflow: hidden;
      }

      .url-link {
        display: inline-flex;
        align-items: center;
        min-width: 0;
        max-width: 100%;
        color: var(--uui-color-interactive);
        text-decoration: none;
        cursor: pointer;
        border-radius: var(--uui-border-radius, 3px);
        transition: color var(--cs-results-transition);
      }

      .url-text {
        display: block;
        min-width: 0;
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-weight: 500;
        line-height: 1.2;
        text-underline-offset: 2px;
        transition: text-decoration-color var(--cs-results-transition),
          color var(--cs-results-transition);
      }

      .url-link:hover .url-text,
      .url-link:focus-visible .url-text {
        text-decoration: underline;
        color: color-mix(in srgb, var(--uui-color-interactive) 88%, var(--uui-color-text));
      }

      .url-link:focus-visible {
        outline: 2px solid var(--uui-color-focus);
        outline-offset: 1px;
      }

      .url-empty {
        display: block;
        color: var(--uui-color-text-alt);
        line-height: 1.2;
        cursor: default;
      }
    `
];
yo([
  l({ attribute: !1 })
], rs.prototype, "value", 2);
rs = yo([
  U("content-search-url-column")
], rs);
const Sd = "Open website", Cd = "Copy URL", yr = "More", wd = "Copy UDI", xd = "Copy GUID", $d = "Copy Node ID";
var Ed = Object.defineProperty, Td = Object.getOwnPropertyDescriptor, So = (e) => {
  throw TypeError(e);
}, Co = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Td(t, s) : t, a = e.length - 1, n; a >= 0; a--)
    (n = e[a]) && (r = (i ? n(t, s, r) : n(r)) || r);
  return i && r && Ed(t, s, r), r;
}, wo = (e, t, s) => t.has(e) || So("Cannot " + s), br = (e, t, s) => (wo(e, t, "read from private field"), s ? s.call(e) : t.get(e)), Sr = (e, t, s) => t.has(e) ? So("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, s), fe = (e, t, s) => (wo(e, t, "access private method"), s), Ot, ne, xo, $o, Eo, rt, To;
const Pd = "noopener noreferrer";
let as = class extends B {
  constructor() {
    super(...arguments), Sr(this, ne), Sr(this, Ot, `cs-actions-popover-${crypto.randomUUID()}`);
  }
  render() {
    if (!this.value)
      return g;
    const e = fe(this, ne, $o).call(this);
    return e.length === 0 ? g : o`
      <uui-button
        class="actions-menu__trigger"
        popovertarget=${br(this, Ot)}
        compact
        look="secondary"
        label=${yr}
        title=${yr}
        @click=${fe(this, ne, rt)}
      >
        <uui-symbol-more class="actions-menu__symbol"></uui-symbol-more>
      </uui-button>
      <uui-popover-container
        class="actions-menu__popover"
        id=${br(this, Ot)}
        placement="bottom-end"
        margin="6"
      >
        <umb-popover-layout class="actions-menu__layout">
          ${e.map((t) => fe(this, ne, xo).call(this, t))}
        </umb-popover-layout>
      </uui-popover-container>
    `;
  }
};
Ot = /* @__PURE__ */ new WeakMap();
ne = /* @__PURE__ */ new WeakSet();
xo = function(e) {
  return e.href ? o`
        <uui-menu-item
          label=${e.label}
          href=${e.href}
          target="_blank"
          rel=${Pd}
          @click=${fe(this, ne, rt)}
        ></uui-menu-item>
      ` : o`
      <uui-menu-item
        label=${e.label}
        @click=${fe(this, ne, rt)}
        @click-label=${(t) => {
    fe(this, ne, rt).call(this, t), e.value && e.copyLabel && fe(this, ne, To).call(this, e.value, e.copyLabel);
  }}
      ></uui-menu-item>
    `;
};
$o = function() {
  if (!this.value)
    return [];
  const { url: e, udi: t, key: s, nodeId: i, showOpenWebsite: r = !1 } = this.value, a = fe(this, ne, Eo).call(this, e), n = [];
  r && a && n.push({
    label: Sd,
    href: a
  }), a && n.push({
    label: Cd,
    copyLabel: "URL",
    value: a
  });
  const _ = t?.trim();
  _ && n.push({
    label: wd,
    copyLabel: "UDI",
    value: _
  });
  const y = s?.trim();
  return y && n.push({
    label: xd,
    copyLabel: "GUID",
    value: y
  }), i !== void 0 && i > 0 && n.push({
    label: $d,
    copyLabel: "Node ID",
    value: String(i)
  }), n;
};
Eo = function(e) {
  if (io(e))
    return e.trim();
};
rt = function(e) {
  e.stopPropagation();
};
To = async function(e, t) {
  try {
    await navigator.clipboard.writeText(e), (await this.getContext(Ms))?.peek("positive", {
      data: {
        headline: "Copied",
        message: `${t} copied to clipboard.`
      }
    });
  } catch {
    (await this.getContext(Ms))?.peek("danger", {
      data: {
        headline: "Copy failed",
        message: `Unable to copy the ${t.toLowerCase()} to the clipboard.`
      }
    });
  }
};
as.styles = [
  vt,
  C`
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
    `
];
Co([
  l({ attribute: !1 })
], as.prototype, "value", 2);
as = Co([
  U("content-search-actions-column")
], as);
var Ad = Object.defineProperty, kd = Object.getOwnPropertyDescriptor, Po = (e) => {
  throw TypeError(e);
}, Ps = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? kd(t, s) : t, a = e.length - 1, n; a >= 0; a--)
    (n = e[a]) && (r = (i ? n(t, s, r) : n(r)) || r);
  return i && r && Ad(t, s, r), r;
}, Wi = (e, t, s) => t.has(e) || Po("Cannot " + s), Cr = (e, t, s) => (Wi(e, t, "read from private field"), t.get(e)), wr = (e, t, s) => t.has(e) ? Po("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, s), xr = (e, t, s, i) => (Wi(e, t, "write to private field"), t.set(e, s), s), Et = (e, t, s) => (Wi(e, t, "access private method"), s), Ae, ke, Ao, Lt;
let Ge = class extends B {
  constructor() {
    super(...arguments), wr(this, ke), this._containerWidthPx = 0, wr(this, Ae);
  }
  connectedCallback() {
    super.connectedCallback(), xr(this, Ae, new ResizeObserver(() => Et(this, ke, Lt).call(this)));
  }
  disconnectedCallback() {
    Cr(this, Ae)?.disconnect(), xr(this, Ae, void 0), super.disconnectedCallback();
  }
  firstUpdated() {
    this._breadcrumbElement && Cr(this, Ae)?.observe(this._breadcrumbElement), Et(this, ke, Lt).call(this);
  }
  updated(e) {
    super.updated(e), e.has("value") && Et(this, ke, Lt).call(this);
  }
  render() {
    const e = Et(this, ke, Ao).call(this, this.value);
    if (e.isMuted)
      return o`<span class="path-text path-text--muted" aria-label="Path unavailable">—</span>`;
    const t = Rh(this._containerWidthPx), { displaySegments: s, showEllipsis: i } = Nh(
      e.segments,
      t
    );
    return o`
      <span
        class="path-breadcrumb"
        title=${e.tooltip}
        aria-label=${e.display}
      >
        ${D(
      s,
      (r, a) => `${a}:${r}`,
      (r, a) => o`
            ${a > 0 ? o`<span class="path-separator" aria-hidden="true"> > </span>` : g}
            <span class="path-segment">${r}</span>
          `
    )}
        ${i ? o`
              <span class="path-separator" aria-hidden="true"> > </span>
              <span class="path-ellipsis" aria-hidden="true">...</span>
            ` : g}
      </span>
    `;
  }
};
Ae = /* @__PURE__ */ new WeakMap();
ke = /* @__PURE__ */ new WeakSet();
Ao = function(e) {
  return !e || typeof e == "string" ? Qs(e) : !e.segments?.length && e.display && e.display !== "—" ? Qs(e.display) : e;
};
Lt = function() {
  const e = this._breadcrumbElement?.clientWidth ?? this.clientWidth;
  e !== this._containerWidthPx && (this._containerWidthPx = e);
};
Ge.styles = [
  C`
      :host {
        display: flex;
        align-items: center;
        min-width: 0;
        max-width: 100%;
        width: 100%;
        height: 100%;
        overflow: hidden;
      }

      .path-breadcrumb {
        display: block;
        min-width: 0;
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        line-height: 1.2;
        color: var(--uui-color-text-alt);
      }

      .path-segment,
      .path-separator,
      .path-ellipsis {
        white-space: nowrap;
      }

      .path-separator,
      .path-ellipsis {
        color: color-mix(in srgb, var(--uui-color-text-alt) 72%, transparent);
      }

      .path-text--muted {
        color: var(--uui-color-text-alt);
      }
    `
];
Ps([
  l({ attribute: !1 })
], Ge.prototype, "value", 2);
Ps([
  d()
], Ge.prototype, "_containerWidthPx", 2);
Ps([
  $r(".path-breadcrumb")
], Ge.prototype, "_breadcrumbElement", 2);
Ge = Ps([
  U("content-search-path-column")
], Ge);
var Md = Object.defineProperty, Rd = Object.getOwnPropertyDescriptor, ko = (e) => {
  throw TypeError(e);
}, Mo = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Rd(t, s) : t, a = e.length - 1, n; a >= 0; a--)
    (n = e[a]) && (r = (i ? n(t, s, r) : n(r)) || r);
  return i && r && Md(t, s, r), r;
}, Nd = (e, t, s) => t.has(e) || ko("Cannot " + s), Od = (e, t, s) => t.has(e) ? ko("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, s), Ld = (e, t, s) => (Nd(e, t, "access private method"), s), ii, Ro;
let ns = class extends B {
  constructor() {
    super(...arguments), Od(this, ii);
  }
  render() {
    const e = Ld(this, ii, Ro).call(this, this.value);
    return o`
      <span
        class="date-text ${e.isMuted ? "date-text--muted" : ""}"
        title=${e.tooltip}
        aria-label=${e.tooltip}
      >
        ${e.display}
      </span>
    `;
  }
};
ii = /* @__PURE__ */ new WeakSet();
Ro = function(e) {
  return !e || typeof e == "string" ? ei(e) : e;
};
ns.styles = [
  C`
      :host {
        display: flex;
        align-items: center;
        min-width: 0;
        max-width: 100%;
        height: 100%;
        overflow: hidden;
      }

      .date-text {
        display: block;
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        line-height: var(--cs-results-line-height, 1.3);
      }

      .date-text--muted {
        color: var(--uui-color-text-alt);
      }
    `
];
Mo([
  l({ attribute: !1 })
], ns.prototype, "value", 2);
ns = Mo([
  U("content-search-date-column")
], ns);
var Dd = Object.defineProperty, zd = Object.getOwnPropertyDescriptor, No = (e) => {
  throw TypeError(e);
}, q = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? zd(t, s) : t, a = e.length - 1, n; a >= 0; a--)
    (n = e[a]) && (r = (i ? n(t, s, r) : n(r)) || r);
  return i && r && Dd(t, s, r), r;
}, Hi = (e, t, s) => t.has(e) || No("Cannot " + s), ut = (e, t, s) => (Hi(e, t, "read from private field"), t.get(e)), Ze = (e, t, s) => t.has(e) ? No("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, s), os = (e, t, s, i) => (Hi(e, t, "write to private field"), t.set(e, s), s), v = (e, t, s) => (Hi(e, t, "access private method"), s), ls, ht, Gi, Qe, f, Oo, Lo, Fi, Vi, Do, ri, zo, Io, Uo, Bo, Wo, Ho, Go, Fo, et, Vo, qo, Ko, Yo, jo, Xo, yt, Jo, Zo, qi, Qo, el, Ki, tl, dt, sl, il;
let z = class extends B {
  constructor() {
    super(...arguments), Ze(this, f), this.resultsState = Tt(), this.searchCultureMode = "AllCultures", this.culture = "", this.languages = [], this.currentPage = 1, this.totalPages = 0, this.pageSize = Tr, this.sortColumn = Ie.column, this.sortDescending = Ie.descending, this.highlightTerms = [], this.resultsFocusToken = 0, this.exporting = !1, Ze(this, ls, `cs-export-popover-${crypto.randomUUID()}`), this._tableItems = ro([], {
      languages: [],
      contentTypeLookup: eo([])
    }), this._contentTypes = [], this._pageJumpValue = "1", this._displayPreferences = gr(), Ze(this, ht, ""), Ze(this, Gi, la()), Ze(this, Qe, !1);
  }
  connectedCallback() {
    super.connectedCallback(), this._displayPreferences = gr(), v(this, f, sl).call(this);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
  }
  willUpdate(e) {
    super.willUpdate(e), (e.has("currentPage") || e.has("totalPages")) && (this._pageJumpValue = String(this.currentPage)), (e.has("resultsState") || e.has("languages") || e.has("highlightTerms")) && v(this, f, dt).call(this), e.has("resultsFocusToken") && os(this, Qe, !0);
  }
  updated(e) {
    super.updated(e);
    const t = this.resultsState.loading;
    ut(this, Qe) && this.resultsState.hasSearched && !t && e.has("resultsState") && (os(this, Qe, !1), v(this, f, il).call(this));
  }
  render() {
    return v(this, f, Oo).call(this) ? v(this, f, Uo).call(this) : v(this, f, Bo).call(this);
  }
};
ls = /* @__PURE__ */ new WeakMap();
ht = /* @__PURE__ */ new WeakMap();
Gi = /* @__PURE__ */ new WeakMap();
Qe = /* @__PURE__ */ new WeakMap();
f = /* @__PURE__ */ new WeakSet();
Oo = function() {
  return !this.resultsState.hasSearched && this.resultsState.results.length === 0 && !this.resultsState.loading;
};
Lo = function() {
  return this.resultsState.hasSearched && this.resultsState.results.length === 0 && !this.resultsState.loading;
};
Fi = function() {
  return o`
      <div
        class="results-grid__focus-anchor"
        tabindex="-1"
        aria-label="Search results"
      ></div>
    `;
};
Vi = function() {
  const e = v(this, f, Io).call(this), t = this.resultsState.hasSearched && !this.resultsState.loading;
  return o`
      <header class="cs-section-header results-grid__header">
        <div class="cs-section-header__leading results-grid__header-copy">
          <h2 class="cs-section-header__title">${Ml}</h2>
        </div>
        <div class="results-grid__header-actions">
          ${v(this, f, Do).call(this)}
          ${t ? o`
                <uui-button
                  look="outline"
                  compact
                  label="Clear results"
                  @click=${v(this, f, zo)}
                >
                  Clear results
                </uui-button>
              ` : g}
          ${e ? o`<div class="results-grid__header-meta">${e}</div>` : g}
        </div>
      </header>
    `;
};
Do = function() {
  if (!this.resultsState.hasSearched)
    return g;
  const e = this.resultsState.totalCount > 0 && !this.resultsState.loading && !this.exporting;
  return o`
      <uui-button
        class="results-grid__export"
        look="secondary"
        compact
        popovertarget=${ut(this, ls)}
        label="Export results"
        ?disabled=${!e}
      >
        <uui-icon name="icon-document-spreadsheet"></uui-icon>
        Export
        <uui-symbol-expand class="results-grid__export-caret"></uui-symbol-expand>
      </uui-button>
      <uui-popover-container
        id=${ut(this, ls)}
        placement="bottom-end"
        margin="6"
      >
        <umb-popover-layout>
          <uui-menu-item
            label="Export CSV"
            @click-label=${() => v(this, f, ri).call(this, "Csv")}
          ></uui-menu-item>
          <uui-menu-item
            label="Export Excel"
            @click-label=${() => v(this, f, ri).call(this, "Excel")}
          ></uui-menu-item>
        </umb-popover-layout>
      </uui-popover-container>
    `;
};
ri = function(e) {
  this.resultsState.totalCount <= 0 || this.resultsState.loading || this.exporting || this.dispatchEvent(
    new CustomEvent(Bs, {
      detail: { format: e },
      bubbles: !0,
      composed: !0
    })
  );
};
zo = function() {
  this.dispatchEvent(
    new CustomEvent(Yt, {
      bubbles: !0,
      composed: !0
    })
  );
};
Io = function() {
  if (this.resultsState.loading)
    return;
  const e = this.resultsState.executionTimeMs;
  if (!(!this.resultsState.hasSearched || e === null || e === void 0))
    return o`
      <span class="results-grid__meta" aria-live="polite">
        ${Ph(this.resultsState.totalCount, e)}
      </span>
    `;
};
Uo = function() {
  return o`
      <div class="results-grid">
        ${v(this, f, Fi).call(this)}
        ${v(this, f, Vi).call(this)}
        <div class="results-grid__empty">
          <content-search-empty-state variant="initial" compact></content-search-empty-state>
        </div>
      </div>
    `;
};
Bo = function() {
  return o`
      <div class="results-grid">
        ${v(this, f, Fi).call(this)}
        ${v(this, f, Vi).call(this)}
        <div class="results-grid__content">
          ${v(this, f, Wo).call(this)}
        </div>
      </div>
    `;
};
Wo = function() {
  return this.resultsState.results.length > 0 ? v(this, f, Go).call(this) : v(this, f, Lo).call(this) ? v(this, f, Ho).call(this) : o`<div class="results-grid__placeholder" aria-hidden="true"></div>`;
};
Ho = function() {
  return o`
      <div class="results-grid__empty">
        <content-search-empty-state
          variant="no-results"
          compact
          show-clear-button
        ></content-search-empty-state>
      </div>
    `;
};
Go = function() {
  const e = Bu(
    this.searchCultureMode,
    this.resultsState.results
  ), t = qh(
    this._displayPreferences,
    e
  );
  return o`
      <div class="results-grid__table-shell">
        ${v(this, f, Fo).call(this)}

        <div class="results-grid__table-scroll">
          <content-search-results-table
            .config=${Gh}
            .columns=${t}
            .items=${this._tableItems}
            .orderingColumn=${this.sortColumn}
            .orderingDesc=${this.sortDescending}
            @ordered=${v(this, f, Qo)}
          ></content-search-results-table>
        </div>

        ${v(this, f, Yo).call(this)}
      </div>
    `;
};
Fo = function() {
  if (!this.resultsState.hasSearched)
    return;
  const e = Uu(
    this.searchCultureMode,
    this.culture,
    this.languages
  );
  return o`
      <content-search-expandable-panel
        label="Display options"
        triggerAlign="right"
        embedded
        ?defaultExpanded=${!1}
      >
        <div class="results-grid__options">
          <p class="results-grid__options-line">
            <span class="results-grid__options-label">Culture</span>
            ${e}
          </p>
          <div class="results-grid__options-checkboxes">
            ${v(this, f, et).call(this, "showPath", "Show Path")}
            ${v(this, f, et).call(this, "showUrl", "Show URL")}
            ${v(this, f, et).call(this, "showCreateDate", "Show Created Date")}
            ${v(this, f, et).call(this, "showUpdateDate", "Show Updated Date")}
          </div>
        </div>
      </content-search-expandable-panel>
    `;
};
et = function(e, t) {
  return o`
      <uui-checkbox
        label=${t}
        .checked=${this._displayPreferences[e]}
        ?disabled=${this.resultsState.loading}
        @change=${(s) => v(this, f, Vo).call(this, e, s)}
      ></uui-checkbox>
    `;
};
Vo = function(e, t) {
  const s = t.target.checked;
  this._displayPreferences = {
    ...this._displayPreferences,
    [e]: s
  }, Zh(this._displayPreferences), os(this, ht, ""), v(this, f, dt).call(this);
};
qo = function() {
  return o`
      <uui-select
        class="results-grid__page-size-select"
        label="Page size"
        .value=${String(this.pageSize)}
        .options=${Pr.map((e) => ({
    name: String(e),
    value: String(e),
    selected: e === this.pageSize
  }))}
        ?disabled=${this.resultsState.loading}
        @change=${v(this, f, Ko)}
      ></uui-select>
    `;
};
Ko = function(e) {
  const t = e.target, s = Number.parseInt(t.value ?? "", 10);
  Pr.includes(s) && v(this, f, tl).call(this, s);
};
Yo = function() {
  if (!this.resultsState.hasSearched || this.resultsState.totalCount <= 0)
    return;
  const e = v(this, f, yt).call(this), t = e > 1;
  return o`
      <footer
        class="results-grid__pagination ${this.resultsState.loading ? "results-grid__pagination--loading" : ""}"
        aria-label="Results pagination"
      >
        <p class="results-grid__pagination-summary">${v(this, f, Xo).call(this)}</p>

        <div class="results-grid__pagination-controls">
          ${v(this, f, qo).call(this)}

          ${t ? o`
                <uui-pagination
                  .current=${this.currentPage}
                  .total=${e}
                  firstlabel="First"
                  previouslabel="Previous"
                  nextlabel="Next"
                  lastlabel="Last"
                  @change=${v(this, f, el)}
                ></uui-pagination>
                ${v(this, f, jo).call(this, e)}
              ` : g}
        </div>
      </footer>
    `;
};
jo = function(e) {
  return o`
      <div class="results-grid__page-jump">
        <uui-input
          class="results-grid__page-jump-input"
          label="Go to page"
          type="number"
          min="1"
          max=${e}
          .value=${this._pageJumpValue}
          ?disabled=${this.resultsState.loading}
          @input=${v(this, f, Jo)}
          @keydown=${v(this, f, Zo)}
        ></uui-input>
        <uui-button
          look="secondary"
          label="Go to page"
          ?disabled=${this.resultsState.loading}
          @click=${v(this, f, qi)}
        >
          Go
        </uui-button>
      </div>
    `;
};
Xo = function() {
  const e = v(this, f, yt).call(this), t = e > 1 ? `Page ${this.currentPage} of ${e}` : "Page 1";
  if (this.resultsState.totalCount <= 0)
    return `${t} · No matches`;
  const s = (this.currentPage - 1) * this.pageSize + 1, i = Math.min(this.currentPage * this.pageSize, this.resultsState.totalCount);
  return `${t} · ${s}–${i} of ${this.resultsState.totalCount}`;
};
yt = function() {
  return this.totalPages > 0 ? this.totalPages : this.resultsState.totalCount <= 0 || this.pageSize <= 0 ? 0 : Math.ceil(this.resultsState.totalCount / this.pageSize);
};
Jo = function(e) {
  this._pageJumpValue = e.target.value;
};
Zo = function(e) {
  e.key === "Enter" && (e.preventDefault(), v(this, f, qi).call(this));
};
qi = function() {
  const e = v(this, f, yt).call(this), t = Number.parseInt(this._pageJumpValue, 10);
  if (!Number.isFinite(t) || t < 1 || t > e || t === this.currentPage || this.resultsState.loading) {
    this._pageJumpValue = String(this.currentPage);
    return;
  }
  v(this, f, Ki).call(this, t);
};
Qo = function(e) {
  if (this.resultsState.loading)
    return;
  const t = e.target, s = t.orderingColumn;
  !Kh(s) || !xh(s) || this.dispatchEvent(
    new CustomEvent(Rs, {
      detail: {
        column: s,
        descending: t.orderingDesc
      },
      bubbles: !0,
      composed: !0
    })
  );
};
el = function(e) {
  if (this.resultsState.loading)
    return;
  const s = e.currentTarget?.current;
  if (!s || s === this.currentPage)
    return;
  const i = v(this, f, yt).call(this), r = so(s, i);
  r !== this.currentPage && v(this, f, Ki).call(this, r);
};
Ki = function(e) {
  this.dispatchEvent(
    new CustomEvent(Ns, {
      detail: { page: e },
      bubbles: !0,
      composed: !0
    })
  );
};
tl = function(e) {
  e === this.pageSize || this.resultsState.loading || this.dispatchEvent(
    new CustomEvent(Os, {
      detail: { pageSize: e },
      bubbles: !0,
      composed: !0
    })
  );
};
dt = function() {
  const e = [
    this.resultsState.loading ? "loading" : "idle",
    Yh(this.resultsState.results, this.highlightTerms),
    this._displayPreferences.showUrl ? "url" : "no-url",
    this._contentTypes.map((t) => `${t.alias}:${t.icon ?? ""}`).join("")
  ].join("");
  e !== ut(this, ht) && (os(this, ht, e), this._tableItems = ro(this.resultsState.results, {
    languages: this.languages,
    contentTypeLookup: eo(this._contentTypes),
    highlightTerms: this.highlightTerms,
    showUrlColumn: this._displayPreferences.showUrl
  }));
};
sl = async function() {
  try {
    const e = await ut(this, Gi).getContentTypes();
    this._contentTypes = e, v(this, f, dt).call(this);
  } catch {
    this._contentTypes = [], v(this, f, dt).call(this);
  }
};
il = function() {
  requestAnimationFrame(() => {
    const e = this.renderRoot.querySelector(
      ".results-grid__focus-anchor"
    );
    e?.scrollIntoView({ behavior: "smooth", block: "start" }), e?.focus({ preventScroll: !0 });
  });
};
z.styles = [
  Fe,
  ce,
  Ve,
  Br,
  ...Jh
];
q([
  l({ attribute: !1 })
], z.prototype, "resultsState", 2);
q([
  l({ type: String })
], z.prototype, "searchCultureMode", 2);
q([
  l({ type: String })
], z.prototype, "culture", 2);
q([
  l({ type: Array })
], z.prototype, "languages", 2);
q([
  l({ type: Number })
], z.prototype, "currentPage", 2);
q([
  l({ type: Number })
], z.prototype, "totalPages", 2);
q([
  l({ type: Number })
], z.prototype, "pageSize", 2);
q([
  l({ type: String })
], z.prototype, "sortColumn", 2);
q([
  l({ type: Boolean })
], z.prototype, "sortDescending", 2);
q([
  l({ type: Array })
], z.prototype, "highlightTerms", 2);
q([
  l({ type: Number })
], z.prototype, "resultsFocusToken", 2);
q([
  l({ type: Boolean })
], z.prototype, "exporting", 2);
q([
  d()
], z.prototype, "_tableItems", 2);
q([
  d()
], z.prototype, "_contentTypes", 2);
q([
  d()
], z.prototype, "_pageJumpValue", 2);
q([
  d()
], z.prototype, "_displayPreferences", 2);
z = q([
  U("content-search-results")
], z);
const Id = [
  ce,
  lc,
  C`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }

    umb-body-layout {
      height: 100%;
    }

    .workspace {
      display: flex;
      flex-direction: column;
      min-height: 100%;
      padding: var(--cs-space-page);
      box-sizing: border-box;
      position: relative;
    }

    .workspace--busy .workspace__layout {
      pointer-events: none;
      user-select: none;
    }

    .workspace__busy-overlay {
      position: fixed;
      inset: 0;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--uui-size-space-4);
    }

    .workspace__busy-overlay::before {
      content: "";
      position: absolute;
      inset: 0;
      background: color-mix(in srgb, var(--uui-color-surface-emphasis, #1b264f) 28%, transparent);
      backdrop-filter: blur(2px);
    }

    .workspace__busy-overlay uui-loader {
      position: relative;
      width: 2.5rem;
      height: 2.5rem;
    }

    .workspace__busy-overlay-label {
      position: relative;
      margin: 0;
      color: var(--uui-color-text);
      font-size: var(--uui-type-default-size);
      font-weight: 600;
      line-height: 1.3;
    }

    .workspace__layout {
      display: flex;
      flex-direction: column;
      gap: var(--cs-space-section);
      width: 100%;
      max-width: 80rem;
      margin: 0 auto;
      flex: 1;
      min-height: 0;
    }

    .workspace__saved,
    .workspace__presets {
      flex: 0 0 auto;
    }

    .workspace__builder {
      flex: 1 1 auto;
      min-height: 22rem;
    }

    .workspace__results {
      flex: 0 1 auto;
      min-height: 0;
    }

    @media (max-width: 900px) {
      .workspace {
        padding: var(--cs-space-block);
      }

      .workspace__layout {
        gap: var(--cs-space-block);
      }

      .workspace__builder {
        min-height: 18rem;
      }
    }
  `
];
var Ud = Object.defineProperty, Bd = Object.getOwnPropertyDescriptor, rl = (e) => {
  throw TypeError(e);
}, R = (e, t, s, i) => {
  for (var r = i > 1 ? void 0 : i ? Bd(t, s) : t, a = e.length - 1, n; a >= 0; a--)
    (n = e[a]) && (r = (i ? n(t, s, r) : n(r)) || r);
  return i && r && Ud(t, s, r), r;
}, Yi = (e, t, s) => t.has(e) || rl("Cannot " + s), h = (e, t, s) => (Yi(e, t, "read from private field"), s ? s.call(e) : t.get(e)), w = (e, t, s) => t.has(e) ? rl("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, s), oe = (e, t, s, i) => (Yi(e, t, "write to private field"), t.set(e, s), s), S = (e, t, s) => (Yi(e, t, "access private method"), s), ji, Te, Xi, Ji, pe, Le, De, ze, pt, _t, k, b, al, nl, Dt, As, zt, It, Ut, Bt, Wt, Ht, Gt, Ft, Vt, qt, Kt, ol, je, ll, cl, ul, hl, dl, pl, _l, Zi, ml, fl, gl, ks, Ce, bt, vl;
let T = class extends B {
  constructor() {
    super(...arguments), w(this, b), this._resultsState = Tt(), this._searchCultureMode = "AllCultures", this._culture = "", this._languages = [], this._errorMessage = "", this._currentPage = 1, this._totalPages = 0, this._pageSize = Tr, this._sortColumn = Ie.column, this._sortDescending = Ie.descending, this._savedSearchItems = [], this._loadingSavedSearches = !1, this._savingSavedSearch = !1, this._searchPresets = [], this._loadingSearchPresets = !1, this._selectedSavedSearchId = "", this._nameHighlightTerms = [], this._resultsFocusToken = 0, this._exporting = !1, w(this, ji, Fl()), w(this, Te, ql()), w(this, Xi, Yl()), w(this, Ji, Ql()), w(this, pe), w(this, Le), w(this, De), w(this, ze), w(this, pt), w(this, _t), w(this, k), w(this, Dt, (e) => {
      const t = e.detail;
      this._searchCultureMode = t.searchCultureMode, this._culture = t.culture, this._languages = t.languages, this._errorMessage = "", this._currentPage = 1, this._selectedSavedSearchId = "", oe(this, k, {
        matchMode: t.matchMode,
        conditions: t.conditions,
        searchCultureMode: t.searchCultureMode,
        culture: t.culture
      }), S(this, b, As).call(this, t.conditions), S(this, b, ks).call(this), S(this, b, Ce).call(this);
    }), w(this, zt, (e) => {
      const t = e.detail.page;
      t !== this._currentPage && (this._currentPage = t, S(this, b, Ce).call(this));
    }), w(this, It, (e) => {
      const t = e.detail.pageSize;
      t !== this._pageSize && (this._pageSize = t, this._currentPage = 1, S(this, b, Ce).call(this));
    }), w(this, Ut, (e) => {
      const t = e.detail;
      this._sortColumn = t.column, this._sortDescending = t.descending, this._currentPage = 1, S(this, b, Ce).call(this);
    }), w(this, Bt, (e) => {
      const t = e.detail.savedSearchId;
      S(this, b, hl).call(this, t);
    }), w(this, Wt, (e) => {
      const t = e.detail;
      h(this, k) && S(this, b, dl).call(this, t.name, t.description);
    }), w(this, Ht, (e) => {
      const t = e.detail.savedSearchId;
      S(this, b, pl).call(this, t);
    }), w(this, Gt, (e) => {
      const t = e.detail;
      S(this, b, _l).call(this, t.savedSearchId, t.name, t.description);
    }), w(this, Ft, (e) => {
      const t = e.detail.presetId;
      S(this, b, cl).call(this, t);
    }), w(this, Vt, () => {
      h(this, pe)?.abort(), oe(this, k, void 0), this._resultsState = Tt(), this._currentPage = 1, this._totalPages = 0, this._nameHighlightTerms = [], this._selectedSavedSearchId = "", this._errorMessage = "", S(this, b, bt).call(this)?.resetBuilder();
    }), w(this, qt, () => {
      h(this, pe)?.abort(), this._resultsState = Tt(), this._currentPage = 1, this._totalPages = 0, this._nameHighlightTerms = [];
    }), w(this, Kt, (e) => {
      const t = e.detail;
      S(this, b, ol).call(this, t.format);
    });
  }
  connectedCallback() {
    super.connectedCallback(), this.addEventListener("content-search-submit", h(this, Dt)), this.addEventListener(Ns, h(this, zt)), this.addEventListener(
      Os,
      h(this, It)
    ), this.addEventListener(Rs, h(this, Ut)), this.addEventListener(Ls, h(this, Bt)), this.addEventListener(Ds, h(this, Wt)), this.addEventListener(zs, h(this, Ht)), this.addEventListener(Is, h(this, Gt)), this.addEventListener(Us, h(this, Ft)), this.addEventListener(er, h(this, Vt)), this.addEventListener(Yt, h(this, qt)), this.addEventListener(Bs, h(this, Kt)), this.consumeContext(Sl, (e) => {
      oe(this, pt, e);
    }), this.consumeContext(Ms, (e) => {
      oe(this, _t, e);
    }), S(this, b, je).call(this), S(this, b, ll).call(this);
  }
  disconnectedCallback() {
    this.removeEventListener("content-search-submit", h(this, Dt)), this.removeEventListener(Ns, h(this, zt)), this.removeEventListener(
      Os,
      h(this, It)
    ), this.removeEventListener(Rs, h(this, Ut)), this.removeEventListener(Ls, h(this, Bt)), this.removeEventListener(Ds, h(this, Wt)), this.removeEventListener(zs, h(this, Ht)), this.removeEventListener(Is, h(this, Gt)), this.removeEventListener(Us, h(this, Ft)), this.removeEventListener(er, h(this, Vt)), this.removeEventListener(Yt, h(this, qt)), this.removeEventListener(Bs, h(this, Kt)), h(this, pe)?.abort(), h(this, Le)?.abort(), h(this, De)?.abort(), h(this, ze)?.abort(), super.disconnectedCallback();
  }
  render() {
    const e = S(this, b, al).call(this);
    return o`
      <umb-body-layout main-no-padding>
        <div
          class="workspace ${e ? "workspace--busy" : ""}"
          aria-label=${Pl}
        >
          ${this._errorMessage ? o`<uui-alert-bar type="danger">${this._errorMessage}</uui-alert-bar>` : null}

          <div class="workspace__layout">
            <div class="cs-card cs-card--subtle workspace__saved">
              <content-search-saved-searches
                .items=${this._savedSearchItems}
                .selectedSavedSearchId=${this._selectedSavedSearchId}
                ?loading=${this._loadingSavedSearches}
                ?saving=${this._savingSavedSearch}
                ?saveDisabled=${!h(this, k)}
              ></content-search-saved-searches>
            </div>

            <div class="cs-card cs-card--subtle workspace__presets">
              <content-search-quick-presets
                .presets=${this._searchPresets}
                ?loading=${this._loadingSearchPresets}
              ></content-search-quick-presets>
            </div>

            <div class="cs-card cs-card--focus workspace__builder">
              <content-search-builder
                .searching=${this._resultsState.loading}
              ></content-search-builder>
            </div>

            <div class="cs-card cs-card--flat workspace__results">
              <content-search-results
                .resultsState=${this._resultsState}
                .searchCultureMode=${this._searchCultureMode}
                .culture=${this._culture}
                .languages=${this._languages}
                .currentPage=${this._currentPage}
                .totalPages=${this._totalPages}
                .pageSize=${this._pageSize}
                .sortColumn=${this._sortColumn}
                .sortDescending=${this._sortDescending}
                .highlightTerms=${this._nameHighlightTerms}
                .resultsFocusToken=${this._resultsFocusToken}
                .exporting=${this._exporting}
              ></content-search-results>
            </div>
          </div>
          ${e ? S(this, b, nl).call(this) : g}
        </div>
      </umb-body-layout>
    `;
  }
};
ji = /* @__PURE__ */ new WeakMap();
Te = /* @__PURE__ */ new WeakMap();
Xi = /* @__PURE__ */ new WeakMap();
Ji = /* @__PURE__ */ new WeakMap();
pe = /* @__PURE__ */ new WeakMap();
Le = /* @__PURE__ */ new WeakMap();
De = /* @__PURE__ */ new WeakMap();
ze = /* @__PURE__ */ new WeakMap();
pt = /* @__PURE__ */ new WeakMap();
_t = /* @__PURE__ */ new WeakMap();
k = /* @__PURE__ */ new WeakMap();
b = /* @__PURE__ */ new WeakSet();
al = function() {
  return this._resultsState.loading || this._exporting;
};
nl = function() {
  const e = this._exporting ? "Preparing export…" : "Searching content…";
  return o`
      <div class="workspace__busy-overlay" role="status" aria-live="polite" aria-busy="true">
        <uui-loader></uui-loader>
        <span class="workspace__busy-overlay-label">${e}</span>
      </div>
    `;
};
Dt = /* @__PURE__ */ new WeakMap();
As = function(e) {
  this._nameHighlightTerms = Bl(e);
};
zt = /* @__PURE__ */ new WeakMap();
It = /* @__PURE__ */ new WeakMap();
Ut = /* @__PURE__ */ new WeakMap();
Bt = /* @__PURE__ */ new WeakMap();
Wt = /* @__PURE__ */ new WeakMap();
Ht = /* @__PURE__ */ new WeakMap();
Gt = /* @__PURE__ */ new WeakMap();
Ft = /* @__PURE__ */ new WeakMap();
Vt = /* @__PURE__ */ new WeakMap();
qt = /* @__PURE__ */ new WeakMap();
Kt = /* @__PURE__ */ new WeakMap();
ol = async function(e) {
  if (!(!h(this, k) || this._exporting)) {
    if (!h(this, pt)) {
      this._errorMessage = "Export is unavailable because the session is not ready.";
      return;
    }
    h(this, ze)?.abort(), oe(this, ze, new AbortController()), this._exporting = !0, this._errorMessage = "";
    try {
      const t = Or({
        matchMode: h(this, k).matchMode,
        searchCultureMode: h(this, k).searchCultureMode,
        culture: h(this, k).culture,
        conditions: h(this, k).conditions,
        sortColumn: this._sortColumn,
        sortDescending: this._sortDescending
      }), s = h(this, pt).getOpenApiConfiguration(), i = await h(this, Ji).export(
        { format: e, search: t },
        {
          base: s.base,
          credentials: s.credentials,
          token: s.token
        },
        h(this, ze).signal
      );
      jl(i.blob, i.fileName), h(this, _t)?.peek("positive", {
        data: {
          headline: "Export ready",
          message: `Your download "${i.fileName}" has started.`
        }
      });
    } catch (t) {
      if (t instanceof DOMException && t.name === "AbortError")
        return;
      const s = t instanceof Error ? t.message : "Unable to export the results.";
      this._errorMessage = s, h(this, _t)?.peek("danger", {
        data: {
          headline: "Export failed",
          message: s
        }
      });
    } finally {
      this._exporting = !1;
    }
  }
};
je = async function() {
  h(this, Le)?.abort(), oe(this, Le, new AbortController()), this._loadingSavedSearches = !0;
  try {
    const e = await h(this, Te).getSavedSearches(
      h(this, Le).signal
    ), t = Dl(e);
    this._savedSearchItems = t.personal;
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError")
      return;
    this._errorMessage = e instanceof Error ? e.message : "Unable to load saved searches.";
  } finally {
    this._loadingSavedSearches = !1;
  }
};
ll = async function() {
  h(this, De)?.abort(), oe(this, De, new AbortController()), this._loadingSearchPresets = !0;
  try {
    const e = await h(this, Xi).getPresets(
      h(this, De).signal
    );
    this._searchPresets = sc(e);
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError")
      return;
    this._searchPresets = [], this._errorMessage = e instanceof Error ? e.message : "Unable to load quick presets.";
  } finally {
    this._loadingSearchPresets = !1;
  }
};
cl = async function(e) {
  const t = this._searchPresets.find((s) => s.id === e);
  if (!t) {
    this._errorMessage = "The selected quick preset could not be found.";
    return;
  }
  this._errorMessage = "", S(this, b, ks).call(this);
  try {
    await S(this, b, ul).call(this, t), await S(this, b, Ce).call(this);
  } catch (s) {
    this._errorMessage = s instanceof Error ? s.message : "Unable to run the quick preset.", this._resultsState = {
      ...this._resultsState,
      loading: !1
    };
  }
};
ul = async function(e) {
  await S(this, b, fl).call(this, e), this._selectedSavedSearchId = "", this._searchCultureMode = e.searchCultureMode, this._culture = "", this._pageSize = e.pageSize, this._sortColumn = e.sortColumn ?? Ie.column, this._sortDescending = e.sortDescending, this._currentPage = 1;
  const t = ic(e);
  oe(this, k, {
    matchMode: e.matchMode,
    conditions: t,
    searchCultureMode: e.searchCultureMode,
    culture: ""
  }), S(this, b, As).call(this, t), await S(this, b, Zi).call(this, {
    matchMode: e.matchMode,
    conditions: t,
    searchCultureMode: e.searchCultureMode,
    culture: ""
  });
};
hl = async function(e) {
  this._errorMessage = "", S(this, b, ks).call(this);
  try {
    const t = Ll(
      await h(this, Te).getSavedSearch(e)
    );
    await S(this, b, ml).call(this, t), this._selectedSavedSearchId = t.id, this._searchCultureMode = t.searchCultureMode, this._culture = t.culture ?? "", this._pageSize = t.pageSize, this._sortColumn = t.sortColumn ?? Ie.column, this._sortDescending = t.sortDescending, this._currentPage = 1;
    const s = kr(t.conditions);
    oe(this, k, {
      matchMode: t.matchMode,
      conditions: s,
      searchCultureMode: t.searchCultureMode,
      culture: t.culture ?? "",
      savedSearchId: e
    }), S(this, b, As).call(this, s), await S(this, b, Zi).call(this, {
      matchMode: t.matchMode,
      conditions: s,
      searchCultureMode: t.searchCultureMode,
      culture: t.culture ?? ""
    }), await S(this, b, Ce).call(this), await S(this, b, je).call(this);
  } catch (t) {
    this._errorMessage = t instanceof Error ? t.message : "Unable to load the saved search.", this._resultsState = {
      ...this._resultsState,
      loading: !1
    };
  }
};
dl = async function(e, t) {
  if (h(this, k)) {
    this._savingSavedSearch = !0, this._errorMessage = "";
    try {
      const s = Rl(
        e,
        t,
        !1,
        S(this, b, gl).call(this)
      ), i = await h(this, Te).saveSavedSearch(s);
      this._selectedSavedSearchId = i.id, S(this, b, vl).call(this)?.resetSaveForm(), await S(this, b, je).call(this);
    } catch (s) {
      this._errorMessage = s instanceof Error ? s.message : "Unable to save the search.";
    } finally {
      this._savingSavedSearch = !1;
    }
  }
};
pl = async function(e) {
  this._errorMessage = "";
  try {
    await h(this, Te).deleteSavedSearch(e), this._selectedSavedSearchId === e && (this._selectedSavedSearchId = ""), await S(this, b, je).call(this);
  } catch (t) {
    this._errorMessage = t instanceof Error ? t.message : "Unable to delete the saved search.";
  }
};
_l = async function(e, t, s) {
  this._errorMessage = "";
  try {
    await h(this, Te).updateSavedSearch(e, { name: t, description: s }), await S(this, b, je).call(this);
  } catch (i) {
    this._errorMessage = i instanceof Error ? i.message : "Unable to rename the saved search.";
  }
};
Zi = async function(e) {
  const t = S(this, b, bt).call(this);
  t && await t.applySearchDefinition(e);
};
ml = async function(e) {
  const t = Nl(e);
  if (t.length === 0)
    return;
  const s = S(this, b, bt).call(this);
  s && await s.ensurePropertiesForContentTypes(t);
};
fl = async function(e) {
  const t = rc(e);
  if (t.length === 0)
    return;
  const s = S(this, b, bt).call(this);
  s && await s.ensurePropertiesForContentTypes(t);
};
gl = function() {
  const e = h(this, k);
  return {
    matchMode: e.matchMode,
    conditions: e.conditions,
    searchCultureMode: e.searchCultureMode,
    culture: e.culture,
    pageSize: this._pageSize,
    sortColumn: this._sortColumn,
    sortDescending: this._sortDescending
  };
};
ks = function() {
  this._resultsFocusToken += 1, this._totalPages = 0, this._resultsState = {
    hasSearched: !0,
    loading: !0,
    results: [],
    totalCount: 0,
    executionTimeMs: null
  };
};
Ce = async function() {
  if (!h(this, k))
    return;
  h(this, pe)?.abort();
  const e = new AbortController();
  oe(this, pe, e), this._resultsState = {
    ...this._resultsState,
    hasSearched: !0,
    loading: !0
  };
  try {
    const t = await h(this, ji).search(
      Or({
        matchMode: h(this, k).matchMode,
        searchCultureMode: h(this, k).searchCultureMode,
        culture: h(this, k).culture,
        conditions: h(this, k).conditions,
        pageIndex: this._currentPage - 1,
        pageSize: this._pageSize,
        sortColumn: this._sortColumn,
        sortDescending: this._sortDescending
      }),
      e.signal
    );
    if (h(this, pe) !== e)
      return;
    this._pageSize = t.pageSize, this._totalPages = Eh(
      t.totalCount,
      t.pageSize,
      t.totalPages
    ), this._currentPage = so(t.pageIndex + 1, this._totalPages), this._resultsState = {
      hasSearched: !0,
      loading: !1,
      results: t.items.map(zl),
      totalCount: t.totalCount,
      executionTimeMs: t.executionTimeMs ?? null
    };
  } catch (t) {
    if (t instanceof DOMException && t.name === "AbortError" || h(this, pe) !== e)
      return;
    this._errorMessage = t instanceof Error ? t.message : "Search failed. Please try again.", this._resultsState = {
      hasSearched: !0,
      loading: !1,
      results: [],
      totalCount: 0,
      executionTimeMs: null
    }, this._totalPages = 0;
  }
};
bt = function() {
  return this.shadowRoot?.querySelector("content-search-builder") ?? null;
};
vl = function() {
  return this.shadowRoot?.querySelector("content-search-saved-searches") ?? null;
};
T.styles = [
  Fe,
  ...Id
];
R([
  d()
], T.prototype, "_resultsState", 2);
R([
  d()
], T.prototype, "_searchCultureMode", 2);
R([
  d()
], T.prototype, "_culture", 2);
R([
  d()
], T.prototype, "_languages", 2);
R([
  d()
], T.prototype, "_errorMessage", 2);
R([
  d()
], T.prototype, "_currentPage", 2);
R([
  d()
], T.prototype, "_totalPages", 2);
R([
  d()
], T.prototype, "_pageSize", 2);
R([
  d()
], T.prototype, "_sortColumn", 2);
R([
  d()
], T.prototype, "_sortDescending", 2);
R([
  d()
], T.prototype, "_savedSearchItems", 2);
R([
  d()
], T.prototype, "_loadingSavedSearches", 2);
R([
  d()
], T.prototype, "_savingSavedSearch", 2);
R([
  d()
], T.prototype, "_searchPresets", 2);
R([
  d()
], T.prototype, "_loadingSearchPresets", 2);
R([
  d()
], T.prototype, "_selectedSavedSearchId", 2);
R([
  d()
], T.prototype, "_nameHighlightTerms", 2);
R([
  d()
], T.prototype, "_resultsFocusToken", 2);
R([
  d()
], T.prototype, "_exporting", 2);
T = R([
  U("content-search-workspace")
], T);
export {
  T as ContentSearchWorkspaceElement,
  T as element
};
